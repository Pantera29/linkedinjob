// Tipos para la API de Bright Data
export interface BrightDataRequest {
  url: string;
}

export interface JobPostingData {
  job_posting_id: string;
  job_title: string;
  company_name: string;
  job_location: string;
  job_work_type?: string;
  job_base_pay_range?: string;
  job_posted_time_ago?: string;
  job_description_formatted?: string;
  job_requirements?: string[];
  job_qualifications?: string[];
  company_industry?: string;
  company_description?: string;
  applicant_count?: number;
  created_at: string;
}

export interface WebhookResponse {
  status: string;
  job_data: JobPostingData;
}

// Tipos para la respuesta de la API
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Tipos para manejo de errores
export interface ApiError {
  status: number;
  message: string;
} 