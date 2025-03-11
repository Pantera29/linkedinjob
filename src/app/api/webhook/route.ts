import { NextRequest, NextResponse } from 'next/server';
import { saveJobData } from '@/services/jobs';
import { JobPostingData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Registrar los datos recibidos para depuración
    console.log('Webhook recibido - Datos:', JSON.stringify(body, null, 2));
    
    // Intentar extraer job_data de diferentes posibles estructuras
    let jobData: JobPostingData;
    
    if (body.job_data) {
      // Formato esperado: { job_data: {...} }
      jobData = {
        ...body.job_data,
        created_at: new Date().toISOString()
      };
    } else if (body.data && body.data.job) {
      // Posible formato alternativo: { data: { job: {...} } }
      jobData = {
        ...body.data.job,
        created_at: new Date().toISOString()
      };
    } else if (body.result && body.result.data) {
      // Otro posible formato: { result: { data: {...} } }
      jobData = {
        ...body.result.data,
        created_at: new Date().toISOString()
      };
    } else if (typeof body === 'object' && body.job_posting_id) {
      // Si los datos de trabajo están directamente en el objeto raíz
      jobData = {
        ...body,
        created_at: new Date().toISOString()
      };
    } else {
      // Si no podemos identificar la estructura, registramos el error y devolvemos un mensaje detallado
      console.error('Estructura de datos no reconocida:', body);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Datos de webhook inválidos. Se esperaba un objeto con job_data o datos de trabajo directamente.',
          received: body 
        },
        { status: 400 }
      );
    }

    // Validar que jobData tenga al menos los campos requeridos
    if (!jobData.job_posting_id || !jobData.job_title || !jobData.company_name) {
      console.error('Datos de trabajo incompletos:', jobData);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Datos de trabajo incompletos. Se requieren job_posting_id, job_title y company_name.',
          received: jobData 
        },
        { status: 400 }
      );
    }

    // Guardar los datos en la base de datos
    const result = await saveJobData(jobData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Datos de la oferta de trabajo recibidos y guardados correctamente',
      data: result.data
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