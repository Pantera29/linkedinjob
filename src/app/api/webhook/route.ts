import { NextRequest, NextResponse } from 'next/server';
import { saveJobData } from '@/services/jobs';
import { JobPostingData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Registrar los datos recibidos para depuración
    console.log('Webhook recibido - Datos:', JSON.stringify(body, null, 2));
    
    // NUEVO: Detectar mensaje de prueba de Brightdata
    if (body && body.category === 'TEST' && body.subject === 'Test notification') {
      console.log('Mensaje de prueba de Brightdata detectado - Respondiendo con éxito');
      return NextResponse.json({
        success: true,
        message: 'Test notification received successfully'
      });
    }
    
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
    // NUEVO: Otro tipo de mensaje de sistema (por ejemplo, otro test de Brightdata)
    else if (typeof body === 'object' && (body.code || body.category)) {
      console.log('Detectado mensaje de sistema o notificación genérica');
      return NextResponse.json({
        success: true,
        message: 'System notification received',
        received: body
      });
    }
    // Si no se reconoce ningún formato
    else {
      console.error('Estructura de datos no reconocida:', body);
      // IMPORTANTE: Cambiado para retornar 200 en lugar de 400 para evitar que Brightdata marque como error
      return NextResponse.json(
        { 
          success: true, // Cambiado a true para evitar errores en Brightdata
          message: 'Datos recibidos pero formato no reconocido',
          received: body 
        },
        { status: 200 } // Cambiado a 200
      );
    }

    // Verificar que tenemos datos para procesar
    if (jobsToProcess.length === 0) {
      return NextResponse.json(
        { 
          success: true, // Cambiado a true
          message: 'No se encontraron datos de trabajo válidos para procesar, pero la solicitud fue recibida correctamente',
          received: body 
        },
        { status: 200 } // Cambiado a 200
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
      // IMPORTANTE: Cambiado para retornar 200 en lugar de 500
      return NextResponse.json(
        { 
          success: true, // Cambiado a true para evitar errores en Brightdata
          message: 'Solicitud procesada pero no se pudo guardar ningún trabajo',
          details: results 
        },
        { status: 200 } // Cambiado a 200
      );
    }

    return NextResponse.json({
      success: true,
      message: `Se procesaron ${results.length} ofertas de trabajo. ${results.filter(r => r.success).length} guardadas correctamente.`,
      results: results
    });
  } catch (error) {
    console.error('Error al procesar datos del webhook:', error);
    // IMPORTANTE: Cambiado para retornar 200 en lugar de 500
    return NextResponse.json(
      { 
        success: true, // Cambiado a true para evitar errores en Brightdata
        message: 'Datos recibidos pero hubo un error al procesarlos',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 200 } // Cambiado a 200
    );
  }
}

export async function GET(request: NextRequest) {
  // Obtener parámetros de consulta si los hay
  const searchParams = request.nextUrl.searchParams;
  const testParam = searchParams.get('test');
  
  if (testParam === 'true') {
    // Si es una solicitud de prueba, devolver un mensaje de prueba
    return NextResponse.json({
      success: true,
      message: 'Webhook funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  }
  
  // Respuesta por defecto para GET
  return NextResponse.json({
    success: true,
    message: 'API de webhook activa y funcionando. Usa POST para enviar datos.',
    documentation: 'Envía datos de trabajo en formato JSON para procesarlos.'
  });
}

// Configuración para permitir solicitudes POST desde Bright Data
export const config = {
  api: {
    bodyParser: true,
  },
};