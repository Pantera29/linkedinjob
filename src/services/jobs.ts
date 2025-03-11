import { supabase, JOBS_TABLE } from '@/lib/supabase';
import { JobPostingData } from '@/types';

/**
 * Guarda los datos de una oferta de trabajo en la base de datos
 * @param jobData Datos de la oferta de trabajo
 * @returns Objeto con información sobre el resultado de la operación
 */
export async function saveJobData(jobData: JobPostingData) {
  try {
    // Verificar si la oferta ya existe en la base de datos
    const { data: existingJob } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .eq('job_posting_id', jobData.job_posting_id)
      .single();

    if (existingJob) {
      // Actualizar la oferta existente
      const { error } = await supabase
        .from(JOBS_TABLE)
        .update(jobData)
        .eq('job_posting_id', jobData.job_posting_id);

      if (error) throw error;

      return {
        success: true,
        message: 'Datos de la oferta de trabajo actualizados correctamente',
        data: jobData
      };
    }

    // Crear nueva oferta
    const { error } = await supabase
      .from(JOBS_TABLE)
      .insert([jobData]);

    if (error) throw error;

    return {
      success: true,
      message: 'Datos de la oferta de trabajo guardados correctamente',
      data: jobData
    };
  } catch (error) {
    console.error('Error al guardar datos de la oferta de trabajo:', error);
    return {
      success: false,
      message: 'Error al guardar datos de la oferta de trabajo',
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

    return {
      success: true,
      message: 'Ofertas de trabajo recuperadas correctamente',
      data
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