'use client';

import { useState, useEffect } from 'react';
import JobUrlForm from '@/components/JobUrlForm';
import JobList from '@/components/JobList';
import Notification from '@/components/Notification';
import { JobPostingData } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Cargar trabajos al iniciar
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        if (data.success && data.data) {
          setJobs(data.data);
        }
      } catch (error) {
        console.error('Error al cargar ofertas de trabajo:', error);
        setNotification({
          message: 'Error al cargar las ofertas de trabajo guardadas',
          type: 'error'
        });
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setNotification({
      message: 'Procesando solicitud... Esto puede tardar hasta 2-3 minutos mientras se extraen los datos de LinkedIn.',
      type: 'info'
    });
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          message: 'Datos de la oferta de trabajo procesados y guardados correctamente.',
          type: 'success'
        });
        
        // Actualizar la lista de trabajos con los datos nuevos
        const updatedJobsResponse = await fetch('/api/jobs');
        const updatedJobsData = await updatedJobsResponse.json();
        
        if (updatedJobsData.success && updatedJobsData.data) {
          setJobs(updatedJobsData.data);
        }
      } else {
        setNotification({
          message: data.message || 'Error al procesar la solicitud',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      setNotification({
        message: 'Error al conectar con el servidor',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Recolector de Ofertas de LinkedIn</h1>
          <p className="text-gray-600">
            Extrae y almacena datos de ofertas de trabajo de LinkedIn utilizando la API de Bright Data
          </p>
        </div>

        <JobUrlForm onSubmit={handleSubmit} isLoading={isLoading} />

        <div className="mt-12">
          <JobList jobs={jobs} isLoading={isLoadingJobs} />
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
}
