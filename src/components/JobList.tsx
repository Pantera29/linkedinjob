import Link from 'next/link';
import { JobPostingData } from '@/types';

interface JobListProps {
  jobs: JobPostingData[];
  isLoading: boolean;
}

export default function JobList({ jobs, isLoading }: JobListProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center py-8">
          No hay ofertas de trabajo guardadas. Utiliza el formulario para extraer datos de una oferta.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Ofertas de trabajo guardadas</h2>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link 
            href={`/jobs/${job.job_posting_id}`}
            key={job.job_posting_id}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-blue-600">{job.job_title}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1">
                <div className="text-gray-700">{job.company_name}</div>
                <div className="text-gray-500 text-sm mt-1 sm:mt-0">{job.job_location}</div>
              </div>
              {job.job_work_type && (
                <div className="mt-1 text-sm text-gray-500">{job.job_work_type}</div>
              )}
              {job.job_base_pay_range && (
                <div className="mt-2 text-sm font-medium">{job.job_base_pay_range}</div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                ID: {job.job_posting_id}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 