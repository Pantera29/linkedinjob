/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Configuración para el webhook
  async headers() {
    return [
      {
        // Permitir solicitudes desde Bright Data
        source: '/api/webhook',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig; 