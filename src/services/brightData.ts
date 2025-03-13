import axios from 'axios';
import { BrightDataRequest, JobPostingData } from '@/types';
import { saveJobData } from './jobs';

const API_ENDPOINT = process.env.BRIGHTDATA_API_ENDPOINT || 'https://api.brightdata.com/datasets/v3/trigger';
const API_TOKEN = process.env.BRIGHTDATA_API_TOKEN || '9ff5cab742b378f058e9f9c34b0c47d0255cb680abd1624b015aa90e7d451c14';
const DATASET_ID = process.env.BRIGHTDATA_DATASET_ID || 'gd_lpfll7v5hcqtkxl6l';
const MAX_POLLING_ATTEMPTS = 30; // Máximo número de intentos para verificar el estado del snapshot
const POLLING_INTERVAL = 5000; // Intervalo entre consultas en milisegundos (5 segundos)

/**
 * Envía una solicitud a la API de Bright Data para extraer datos de una oferta de trabajo de LinkedIn
 * @param url URL de la oferta de trabajo de LinkedIn
 * @returns Promesa con la respuesta de la API
 */
export async function requestJobData(url: string) {
  try {
    // Validar que la URL sea de LinkedIn y una oferta de trabajo
    if (!url.includes('linkedin.com') || !url.includes('/jobs/')) {
      throw new Error('La URL debe ser una oferta de trabajo válida de LinkedIn');
    }

    console.log(`Iniciando solicitud para extraer datos de: ${url}`);
    const payload: BrightDataRequest[] = [{ url }];
    
    // 1. Enviar solicitud inicial para obtener el snapshot_id
    const response = await axios.post(API_ENDPOINT, payload, {
      params: {
        dataset_id: DATASET_ID,
        format: 'json',
      },
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // Verificar si la respuesta contiene el snapshot_id
    const snapshotId = response.data.snapshot_id;
    if (!snapshotId) {
      throw new Error('No se recibió snapshot_id en la respuesta de BrightData');
    }

    console.log(`Snapshot ID recibido: ${snapshotId}. Iniciando proceso de polling...`);

    // 2. Iniciar el proceso de polling para verificar cuando el snapshot esté listo
    const jobData = await pollForSnapshotData(snapshotId);
    
    // 3. Una vez que los datos están disponibles, procesarlos y guardarlos en la base de datos
    const results = await processAndSaveJobData(jobData);

    return {
      success: true,
      message: 'Datos de la oferta de trabajo obtenidos y procesados exitosamente',
      data: results
    };
  } catch (error) {
    console.error('Error al solicitar datos de la oferta de trabajo:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Error al solicitar datos: ${error.response?.data?.message || error.message}`,
      };
    }
    return {
      success: false,
      message: 'Error al solicitar datos de la oferta de trabajo',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Realiza polling para verificar cuando el snapshot está listo y obtener los datos
 * @param snapshotId ID del snapshot a consultar
 * @returns Datos del snapshot cuando están disponibles
 */
async function pollForSnapshotData(snapshotId: string) {
  const snapshotUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`
  };

  let attempts = 0;
  
  while (attempts < MAX_POLLING_ATTEMPTS) {
    attempts++;
    console.log(`Verificando estado del snapshot. Intento ${attempts}/${MAX_POLLING_ATTEMPTS}`);
    
    try {
      const response = await axios.get(snapshotUrl, { headers });
      
      // Si la respuesta es 200, el snapshot está listo
      if (response.status === 200) {
        console.log('Snapshot listo. Descargando datos...');
        return response.data;
      }
      // Si la respuesta es 202, el snapshot aún no está listo
      else if (response.status === 202) {
        console.log('Snapshot aún no está listo. Esperando...');
      } 
      // Cualquier otro código de estado es un error
      else {
        console.error(`Error al verificar el snapshot: ${response.status}`);
        console.error(response.data);
        throw new Error(`Error al verificar el snapshot: ${response.status}`);
      }
    } catch (error) {
      console.error('Error durante el polling:', error);
      // Si es un error 404, el snapshot podría no existir
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Snapshot no encontrado. El ID podría ser inválido o haber expirado.');
      }
      // Para otros errores, continuamos intentando
      console.log('Reintentando después del error...');
    }
    
    // Esperar antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }
  
  throw new Error(`Tiempo de espera agotado después de ${MAX_POLLING_ATTEMPTS} intentos. El snapshot no está listo.`);
}

/**
 * Mapea los campos del JSON de BrightData a los nombres esperados en nuestra base de datos
 * @param item Datos originales de BrightData
 * @returns Objeto con los campos mapeados correctamente
 */
function mapFieldNames(item: any): Partial<JobPostingData> {
  const mappedData: Partial<JobPostingData> = {
    ...item,
    created_at: new Date().toISOString()
  };

  // Mapear campos con nombres diferentes
  if ('job_num_applicants' in item) {
    mappedData.applicant_count = item.job_num_applicants;
  }

  if ('job_industries' in item) {
    mappedData.company_industry = item.job_industries;
    // Si el campo es un string, también lo guardamos en job_industries como array
    if (typeof item.job_industries === 'string') {
      mappedData.job_industries = [item.job_industries];
    }
  }

  if ('job_employment_type' in item) {
    mappedData.job_work_type = item.job_employment_type;
  }

  if ('job_posted_time' in item) {
    mappedData.job_posted_time_ago = item.job_posted_time;
  }

  // Asegurarse de que los objetos complejos se mantengan
  if (item.discovery_input) mappedData.discovery_input = item.discovery_input;
  if (item.job_poster) mappedData.job_poster = item.job_poster;
  if (item.base_salary) mappedData.base_salary = item.base_salary;

  return mappedData;
}

/**
 * Procesa y guarda los datos de las ofertas de trabajo en la base de datos
 * @param data Datos recibidos del snapshot
 * @returns Resultado del procesamiento
 */
async function processAndSaveJobData(data: any) {
  console.log('Procesando datos recibidos de BrightData:', JSON.stringify(data, null, 2));
  
  // Extraer los datos de trabajo dependiendo de la estructura
  let jobsToProcess: JobPostingData[] = [];
  
  // Intentar identificar la estructura de los datos
  if (Array.isArray(data)) {
    console.log('Datos en formato de array');
    jobsToProcess = data.map(item => {
      // Mapear los campos para corregir las discrepancias
      const jobData = mapFieldNames(item);
      return jobData as JobPostingData;
    });
  } else if (data.result && data.result.data) {
    console.log('Datos en formato result.data');
    const jobData = mapFieldNames(data.result.data);
    jobsToProcess = [jobData as JobPostingData];
  } else if (data.job_data) {
    console.log('Datos en formato job_data');
    const jobData = mapFieldNames(data.job_data);
    jobsToProcess = [jobData as JobPostingData];
  } else if (data.job_posting_id) {
    console.log('Datos directamente en el objeto raíz');
    const jobData = mapFieldNames(data);
    jobsToProcess = [jobData as JobPostingData];
  } else {
    console.error('Estructura de datos no reconocida:', data);
    throw new Error('Estructura de datos no reconocida en la respuesta de BrightData');
  }
  
  console.log(`Procesando ${jobsToProcess.length} ofertas de trabajo`);
  console.log('Primer objeto de trabajo a procesar:', JSON.stringify(jobsToProcess[0], null, 2));
  
  // Guardar cada oferta en la base de datos
  const results = [];
  for (const jobData of jobsToProcess) {
    if (!jobData.job_posting_id) {
      console.warn('Datos de trabajo sin ID, omitiendo:', jobData);
      continue;
    }
    
    try {
      console.log(`Guardando oferta: ${jobData.job_title || 'Sin título'} - ${jobData.company_name || 'Empresa desconocida'}`);
      // Establecer valores por defecto para campos obligatorios si no existen
      const enrichedJobData: JobPostingData = {
        ...jobData,
        job_title: jobData.job_title || 'Sin título',
        company_name: jobData.company_name || 'Empresa desconocida',
        job_location: jobData.job_location || 'Ubicación desconocida',
        created_at: jobData.created_at || new Date().toISOString()
      };
      
      const result = await saveJobData(enrichedJobData);
      results.push(result);
    } catch (error) {
      console.error(`Error al guardar oferta:`, error);
      results.push({
        success: false,
        message: 'Error al guardar oferta',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return results;
} 