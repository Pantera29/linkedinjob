import { NextRequest, NextResponse } from 'next/server';
import { saveJobData } from '@/services/jobs';
import { JobPostingData, WebhookResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar la estructura de la respuesta del webhook
    if (!body || !body.job_data) {
      return NextResponse.json(
        { success: false, message: 'Datos de webhook inválidos' },
        { status: 400 }
      );
    }

    // Extraer los datos de la oferta de trabajo
    const jobData: JobPostingData = {
      ...body.job_data,
      created_at: new Date().toISOString()
    };

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
      { success: false, message: 'Error al procesar datos del webhook' },
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