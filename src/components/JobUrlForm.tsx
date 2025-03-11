import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validación para el formulario
const formSchema = z.object({
  url: z
    .string()
    .url('Debe ser una URL válida')
    .includes('linkedin.com', { message: 'Debe ser una URL de LinkedIn' })
    .includes('/jobs/', { message: 'Debe ser una URL de oferta de trabajo de LinkedIn' })
});

type FormValues = z.infer<typeof formSchema>;

interface JobUrlFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export default function JobUrlForm({ onSubmit, isLoading }: JobUrlFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const processSubmit = async (data: FormValues) => {
    try {
      setError(null);
      await onSubmit(data.url);
      reset(); // Limpiar el formulario después de enviar
    } catch (err) {
      setError('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Extraer datos de oferta de trabajo</h2>
      
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL de la oferta de trabajo de LinkedIn
          </label>
          <input
            id="url"
            type="text"
            placeholder="https://www.linkedin.com/jobs/view/..."
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('url')}
            disabled={isLoading}
          />
          {errors.url && (
            <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Procesando...' : 'Extraer datos'}
        </button>
      </form>
    </div>
  );
} 