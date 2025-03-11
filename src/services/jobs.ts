import { supabase, JOBS_TABLE } from '@/lib/supabase';
import { JobPostingData } from '@/types';

/**
 * Guarda los datos de una oferta de trabajo en la base de datos
 * @param jobData Datos de la oferta de trabajo
 * @returns Objeto con información sobre el resultado de la operación
 */
export async function saveJobData(jobData: JobPostingData) {
  try {
    console.log('Intentando guardar oferta de trabajo:', jobData.job_posting_id);
    
    // Verificar si la oferta ya existe en la base de datos
    const { data: existingJob, error: selectError } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .eq('job_posting_id', jobData.job_posting_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error al verificar si la oferta existe:', selectError);
      throw selectError;
    }

    if (existingJob) {
      console.log('Actualizando oferta existente:', jobData.job_posting_id);
      // Actualizar la oferta existente
      const { error: updateError } = await supabase
        .from(JOBS_TABLE)
        .update(jobData)
        .eq('job_posting_id', jobData.job_posting_id);

      if (updateError) {
        console.error('Error al actualizar oferta:', updateError);
        throw updateError;
      }

      console.log('Oferta actualizada correctamente:', jobData.job_posting_id);
      return {
        success: true,
        message: 'Datos de la oferta de trabajo actualizados correctamente',
        data: jobData
      };
    }

    console.log('Creando nueva oferta:', jobData.job_posting_id);
    
    // Preparar los datos para inserción, asegurando que todos los campos sean válidos
    const cleanedJobData = {
      job_posting_id: jobData.job_posting_id,
      job_title: jobData.job_title,
      company_name: jobData.company_name,
      job_location: jobData.job_location,
      created_at: jobData.created_at,
      // Campos opcionales
      job_work_type: jobData.job_work_type || null,
      job_base_pay_range: jobData.job_base_pay_range || null,
      job_posted_time_ago: jobData.job_posted_time_ago || null,
      job_description_formatted: jobData.job_description_formatted || null,
      job_requirements: jobData.job_requirements || null,
      job_qualifications: jobData.job_qualifications || null,
      company_industry: jobData.company_industry || null,
      company_description: jobData.company_description || null,
      applicant_count: jobData.applicant_count || null
    };
    
    // Crear nueva oferta
    const { error: insertError } = await supabase
      .from(JOBS_TABLE)
      .insert([cleanedJobData]);

    if (insertError) {
      console.error('Error al insertar nueva oferta:', insertError);
      throw insertError;
    }

    console.log('Nueva oferta creada correctamente:', jobData.job_posting_id);
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
      error: error instanceof Error ? error.message : String(error)
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