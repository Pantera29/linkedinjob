import { NextRequest, NextResponse } from 'next/server';
import { saveJobData } from '@/services/jobs';
import { JobPostingData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Registrar los datos recibidos para depuración
    console.log('Webhook recibido - Datos:', JSON.stringify(body, null, 2));
    
    // Manejar diferentes formatos de datos
    let jobsToProcess: JobPostingData[] = [];
    
    // Caso 1: Si es un array de objetos (como en el error reportado)
    if (Array.isArray(body)) {
      console.log('Detectado formato de array de objetos');
      jobsToProcess = body.map(item => ({
        ...item,
        created_at: new Date().toISOString()
      }));
    } 
    // Caso 2: Si es un objeto con job_data (formato original esperado)
    else if (body.job_data) {
      console.log('Detectado formato con job_data');
      jobsToProcess = [{
        ...body.job_data,
        created_at: new Date().toISOString()
      }];
    } 
    // Caso 3: Si es un objeto con data.job
    else if (body.data && body.data.job) {
      console.log('Detectado formato con data.job');
      jobsToProcess = [{
        ...body.data.job,
        created_at: new Date().toISOString()
      }];
    } 
    // Caso 4: Si es un objeto con result.data
    else if (body.result && body.result.data) {
      console.log('Detectado formato con result.data');
      jobsToProcess = [{
        ...body.result.data,
        created_at: new Date().toISOString()
      }];
    } 
    // Caso 5: Si los datos están directamente en el objeto raíz
    else if (typeof body === 'object' && body.job_posting_id) {
      console.log('Detectado formato con datos directamente en el objeto raíz');
      jobsToProcess = [{
        ...body,
        created_at: new Date().toISOString()
      }];
    } 
    // Si no se reconoce ningún formato
    else {
      console.error('Estructura de datos no reconocida:', body);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Datos de webhook inválidos. Formato no reconocido.',
          received: body 
        },
        { status: 400 }
      );
    }

    // Verificar que tenemos datos para procesar
    if (jobsToProcess.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No se encontraron datos de trabajo válidos para procesar',
          received: body 
        },
        { status: 400 }
      );
    }

    console.log(`Procesando ${jobsToProcess.length} ofertas de trabajo`);

    // Procesar todos los trabajos
    const results = [];
    for (const jobData of jobsToProcess) {
      // Validar que jobData tenga al menos los campos requeridos
      if (!jobData.job_posting_id || !jobData.job_title || !jobData.company_name || !jobData.job_location) {
        console.warn('Datos de trabajo incompletos, omitiendo:', jobData);
        results.push({
          success: false,
          message: 'Datos de trabajo incompletos',
          data: jobData
        });
        continue;
      }

      try {
        // Guardar los datos en la base de datos
        console.log(`Guardando oferta: ${jobData.job_title} - ${jobData.company_name}`);
        const result = await saveJobData(jobData);
        results.push(result);
      } catch (error) {
        console.error(`Error al guardar oferta ${jobData.job_posting_id}:`, error);
        results.push({
          success: false,
          message: 'Error al guardar oferta',
          error: error instanceof Error ? error.message : String(error),
          data: jobData
        });
      }
    }

    // Verificar si al menos un trabajo se guardó correctamente
    const anySuccess = results.some(result => result.success);
    if (!anySuccess) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No se pudo guardar ningún trabajo',
          details: results 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${results.length} ofertas de trabajo. ${results.filter(r => r.success).length} guardadas correctamente.`,
      results: results
    });
  } catch (error) {
    console.error('Error al procesar datos del webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al procesar datos del webhook',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Configuración para permitir solicitudes POST desde Bright Data
export const config = {
  api: {
    bodyParser: true,
  },
}; 