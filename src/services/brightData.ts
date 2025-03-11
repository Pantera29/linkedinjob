import axios from 'axios';
import { BrightDataRequest } from '@/types';

const API_ENDPOINT = process.env.BRIGHTDATA_API_ENDPOINT || 'https://api.brightdata.com/datasets/v3/trigger';
const API_TOKEN = process.env.BRIGHTDATA_API_TOKEN || '9ff5cab742b378f058e9f9c34b0c47d0255cb680abd1624b015aa90e7d451c14';
const DATASET_ID = process.env.BRIGHTDATA_DATASET_ID || 'gd_lpfll7v5hcqtkxl6l';

/**
 * Envía una solicitud a la API de Bright Data para extraer datos de una oferta de trabajo de LinkedIn
 * @param url URL de la oferta de trabajo de LinkedIn
 * @returns Promesa con la respuesta de la API
 */
export async function requestJobData(url: string) {
  try {
    // Validar que la URL sea de LinkedIn y una oferta de trabajo
    if (!url.includes('linkedin.com') || !url.includes('/jobs/')) {
      throw new Error('La URL debe ser una oferta de trabajo válida de LinkedIn');
    }

    const payload: BrightDataRequest[] = [{ url }];
    
    const response = await axios.post(API_ENDPOINT, payload, {
      params: {
        dataset_id: DATASET_ID,
        format: 'json',
        uncompressed_webhook: true,
        include_errors: true
      },
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: 'Solicitud enviada exitosamente. Esperando datos de la oferta de trabajo.',
      data: response.data
    };
  } catch (error) {
    console.error('Error al solicitar datos de la oferta de trabajo:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Error al solicitar datos: ${error.response?.data?.message || error.message}`,
      };
    }
    return {
      success: false,
      message: 'Error al solicitar datos de la oferta de trabajo',
    };
  }
} 