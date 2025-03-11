import { JobPostingData } from '@/types';

interface JobDetailsProps {
  job: JobPostingData;
}

export default function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{job.job_title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
          <div className="text-lg text-gray-700 font-medium">{job.company_name}</div>
          <div className="text-gray-500 mt-1 sm:mt-0">{job.job_location}</div>
        </div>
        {job.job_work_type && (
          <div className="mt-1 text-gray-500">{job.job_work_type}</div>
        )}
        {job.job_base_pay_range && (
          <div className="mt-2 text-gray-700 font-medium">{job.job_base_pay_range}</div>
        )}
        {job.job_posted_time_ago && (
          <div className="mt-2 text-sm text-gray-500">
            Publicado: {job.job_posted_time_ago}
          </div>
        )}
        {job.applicant_count !== undefined && (
          <div className="mt-1 text-sm text-gray-500">
            {job.applicant_count} solicitantes
          </div>
        )}
      </div>

      {job.job_description_formatted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Descripción</h2>
          <div 
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: job.job_description_formatted }}
          />
        </div>
      )}

      {job.job_requirements && job.job_requirements.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Requisitos</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {job.job_requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {job.job_qualifications && job.job_qualifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Cualificaciones</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {job.job_qualifications.map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>
        </div>
      )}

      {job.company_industry && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Industria</h2>
          <p className="text-gray-700">{job.company_industry}</p>
        </div>
      )}

      {job.company_description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Acerca de la empresa</h2>
          <p className="text-gray-700">{job.company_description}</p>
        </div>
      )}
    </div>
  );
} 