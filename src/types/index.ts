// Tipos para la API de Bright Data
export interface BrightDataRequest {
  url: string;
}

export interface JobPostingData {
  job_posting_id: string;
  job_title: string;
  company_name: string;
  company_id?: string;
  job_location: string;
  job_work_type?: string;
  job_base_pay_range?: string;
  job_posted_time_ago?: string;
  job_description_formatted?: string;
  job_summary?: string;
  job_requirements?: string[];
  job_qualifications?: string[];
  job_seniority_level?: string;
  job_function?: string;
  job_employment_type?: string;
  job_industries?: string[];
  company_industry?: string;
  company_description?: string;
  company_url?: string;
  company_logo?: string;
  applicant_count?: number;
  job_posted_date?: string;
  job_posted_date_timestamp?: string;
  apply_link?: string;
  country_code?: string;
  title_id?: string;
  application_availability?: boolean;
  discovery_input?: {
    time_range?: string | null;
    job_type?: string | null;
    experience_level?: string | null;
    remote?: string | null;
    selective_search?: string | null;
  };
  job_poster?: {
    name?: string | null;
    title?: string | null;
    url?: string | null;
  };
  base_salary?: {
    min_amount?: number | null;
    max_amount?: number | null;
    currency?: string | null;
    payment_period?: string | null;
  };
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
  data?: JobPostingData | JobPostingData[] | Record<string, unknown>;
}

// Tipos para manejo de errores
export interface ApiError {
  status: number;
  message: string;
} 