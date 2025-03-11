'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import JobDetails from '@/components/JobDetails';
import Notification from '@/components/Notification';
import { JobPostingData } from '@/types';

export default function JobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobPostingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const jobId = params.id as string;

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jobs?id=${jobId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setJob(data.data);
        } else {
          setNotification({
            message: 'No se pudo encontrar la oferta de trabajo',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error al cargar los detalles de la oferta:', error);
        setNotification({
          message: 'Error al cargar los detalles de la oferta',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen p-4 sm:p-8 md:p-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Oferta no encontrada</h1>
          <p className="text-gray-600 mb-6">
            No se pudo encontrar la oferta de trabajo con ID: {jobId}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>

        <JobDetails job={job} />
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 