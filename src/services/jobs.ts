import { supabase, JOBS_TABLE } from '@/lib/supabase';
import { JobPostingData } from '@/types';

// Lista de campos que existen en la tabla de la base de datos
const VALID_DB_FIELDS = [
  'job_posting_id',
  'job_title',
  'company_name',
  'company_id',
  'job_location',
  'job_work_type',
  'job_base_pay_range',
  'job_posted_time_ago',
  'job_description_formatted',
  'job_summary',
  'job_requirements',
  'job_qualifications',
  'job_seniority_level',
  'job_function',
  'job_employment_type',
  'job_industries',
  'company_industry',
  'company_description',
  'company_url',
  'company_logo',
  'applicant_count',
  'job_posted_date',
  'apply_link',
  'country_code',
  'title_id',
  'application_availability',
  'created_at'
];

// Campos que son objetos anidados y necesitan ser convertidos a JSON
const JSON_FIELDS = [
  'discovery_input',
  'job_poster',
  'base_salary'
];

/**
 * Guarda los datos de una oferta de trabajo en la base de datos
 * @param jobData Datos de la oferta de trabajo
 * @returns Objeto con información sobre el resultado de la operación
 */
export async function saveJobData(jobData: JobPostingData) {
  try {
    console.log('Intentando guardar oferta de trabajo:', jobData.job_posting_id);
    
    // Filtrar solo los campos válidos que existen en la base de datos
    const filteredJobData: Record<string, unknown> = {};
    
    // Procesar campos directos
    for (const field of VALID_DB_FIELDS) {
      if (field in jobData) {
        filteredJobData[field] = jobData[field as keyof JobPostingData];
      }
    }
    
    // Procesar campos JSON anidados
    for (const jsonField of JSON_FIELDS) {
      if (jsonField in jobData && jobData[jsonField as keyof JobPostingData] !== undefined) {
        filteredJobData[jsonField] = JSON.stringify(jobData[jsonField as keyof JobPostingData]);
      }
    }
    
    // Asegurarse de que los campos requeridos estén presentes
    filteredJobData.job_posting_id = jobData.job_posting_id;
    filteredJobData.job_title = jobData.job_title || 'Sin título';
    filteredJobData.company_name = jobData.company_name || 'Empresa desconocida';
    filteredJobData.job_location = jobData.job_location || 'Ubicación desconocida';
    filteredJobData.created_at = jobData.created_at || new Date().toISOString();
    
    // Intentar convertir la fecha de publicación si existe
    if (jobData.job_posted_date) {
      try {
        filteredJobData.job_posted_date = new Date(jobData.job_posted_date).toISOString();
      } catch (e) {
        console.warn('Error al parsear job_posted_date:', e);
        // Mantener el valor original si falla la conversión
        filteredJobData.job_posted_date = jobData.job_posted_date;
      }
    }
    
    // Asegurarse de que los arrays sean realmente arrays o null
    if ('job_requirements' in filteredJobData && !Array.isArray(filteredJobData.job_requirements)) {
      filteredJobData.job_requirements = null;
    }
    
    if ('job_qualifications' in filteredJobData && !Array.isArray(filteredJobData.job_qualifications)) {
      filteredJobData.job_qualifications = null;
    }
    
    if ('job_industries' in filteredJobData && !Array.isArray(filteredJobData.job_industries)) {
      filteredJobData.job_industries = null;
    }
    
    console.log('Datos preparados para guardar:', JSON.stringify(filteredJobData, null, 2));
    
    // Verificar si la oferta ya existe en la base de datos
    const { data: existingJob, error: selectError } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .eq('job_posting_id', jobData.job_posting_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error al verificar si la oferta existe:', JSON.stringify(selectError));
      throw new Error(`Error al verificar si la oferta existe: ${selectError.message}, código: ${selectError.code}`);
    }

    if (existingJob) {
      console.log('Actualizando oferta existente:', jobData.job_posting_id);
      
      // Actualizar la oferta existente
      const { error: updateError } = await supabase
        .from(JOBS_TABLE)
        .update(filteredJobData)
        .eq('job_posting_id', jobData.job_posting_id);

      if (updateError) {
        console.error('Error al actualizar oferta:', JSON.stringify(updateError));
        throw new Error(`Error al actualizar oferta: ${updateError.message}, código: ${updateError.code}`);
      }

      console.log('Oferta actualizada correctamente:', jobData.job_posting_id);
      return {
        success: true,
        message: 'Datos de la oferta de trabajo actualizados correctamente',
        data: filteredJobData
      };
    }

    console.log('Creando nueva oferta:', jobData.job_posting_id);
    
    // Crear nueva oferta
    const { error: insertError } = await supabase
      .from(JOBS_TABLE)
      .insert([filteredJobData]);

    if (insertError) {
      console.error('Error al insertar nueva oferta:', JSON.stringify(insertError));
      throw new Error(`Error al insertar nueva oferta: ${insertError.message}, código: ${insertError.code}`);
    }

    console.log('Nueva oferta creada correctamente:', jobData.job_posting_id);
    return {
      success: true,
      message: 'Datos de la oferta de trabajo guardados correctamente',
      data: filteredJobData
    };
  } catch (error) {
    console.error('Error al guardar datos de la oferta de trabajo:', error);
    return {
      success: false,
      message: 'Error al guardar datos de la oferta de trabajo',
      error: error instanceof Error ? error.message : JSON.stringify(error)
    };
  }
}

/**
 * Obtiene todas las ofertas de trabajo almacenadas
 * @returns Lista de ofertas de trabajo
 */
export async function getAllJobs() {
  try {
    const { data, error } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Procesar campos JSON para devolverlos como objetos
    const processedData = data.map(job => {
      const processedJob = { ...job };
      
      // Convertir campos JSON almacenados como strings a objetos
      JSON_FIELDS.forEach(field => {
        if (job[field] && typeof job[field] === 'string') {
          try {
            processedJob[field] = JSON.parse(job[field]);
          } catch (e) {
            console.warn(`Error al parsear campo ${field}:`, e);
          }
        }
      });
      
      return processedJob;
    });

    return {
      success: true,
      message: 'Ofertas de trabajo recuperadas correctamente',
      data: processedData
    };
  } catch (error) {
    console.error('Error al obtener ofertas de trabajo:', error);
    return {
      success: false,
      message: 'Error al obtener ofertas de trabajo',
      data: []
    };
  }
}

/**
 * Obtiene una oferta de trabajo por su ID
 * @param jobId ID de la oferta de trabajo
 * @returns Datos de la oferta de trabajo
 */
export async function getJobById(jobId: string) {
  try {
    const { data, error } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .eq('job_posting_id', jobId)
      .single();

    if (error) throw error;

    // Procesar campos JSON para devolverlos como objetos
    if (data) {
      const processedJob = { ...data };
      
      // Convertir campos JSON almacenados como strings a objetos
      JSON_FIELDS.forEach(field => {
        if (data[field] && typeof data[field] === 'string') {
          try {
            processedJob[field] = JSON.parse(data[field]);
          } catch (e) {
            console.warn(`Error al parsear campo ${field}:`, e);
          }
        }
      });
      
      return {
        success: true,
        message: 'Oferta de trabajo recuperada correctamente',
        data: processedJob
      };
    }

    return {
      success: true,
      message: 'Oferta de trabajo recuperada correctamente',
      data
    };
  } catch (error) {
    console.error('Error al obtener la oferta de trabajo:', error);
    return {
      success: false,
      message: 'Error al obtener la oferta de trabajo',
      data: null
    };
  }
} 