import { NextRequest, NextResponse } from 'next/server';
import { requestJobData } from '@/services/brightData';
import { getAllJobs, getJobById } from '@/services/jobs';

// GET /api/jobs - Obtener todas las ofertas de trabajo
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('id');

  // Si se proporciona un ID, obtener una oferta específica
  if (jobId) {
    const result = await getJobById(jobId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  }

  // Obtener todas las ofertas
  const result = await getAllJobs();
  
  return NextResponse.json(result);
}

// POST /api/jobs - Solicitar datos de una oferta de trabajo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Se requiere una URL de LinkedIn' },
        { status: 400 }
      );
    }

    // Nota: Ahora requestJobData realiza todo el proceso de obtener y guardar los datos
    // ya no es necesario esperar a un webhook
    const result = await requestJobData(url);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Error al procesar la solicitud',
          error: result.error
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Datos de la oferta de trabajo procesados exitosamente',
      data: result.data
    });
  } catch (error) {
    console.error('Error en la solicitud de datos de la oferta:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al procesar la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 