# Recolector de Ofertas de LinkedIn

Esta aplicación permite recolectar datos de ofertas de trabajo de LinkedIn utilizando la API de Bright Data. Los usuarios pueden ingresar una URL de oferta de trabajo de LinkedIn y la aplicación extraerá y almacenará los detalles de la oferta.

## Características

- Interfaz de usuario limpia y responsiva con Tailwind CSS
- Integración con la API de Bright Data para extraer datos de ofertas de trabajo
- Almacenamiento de datos en Supabase
- Validación de formularios con React Hook Form y Zod
- Notificaciones en tiempo real
- Visualización detallada de ofertas de trabajo

## Tecnologías utilizadas

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase
- **Despliegue**: Preparado para Vercel

## Requisitos previos

- Node.js 18.x o superior
- Cuenta en Supabase
- Cuenta en Bright Data (ya configurada con las credenciales proporcionadas)

## Configuración del proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd linkedin-job-collector
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y actualiza las variables:

```bash
cp .env.local.example .env.local
```

Edita el archivo `.env.local` con tus credenciales:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase

# Bright Data API (ya configurado)
BRIGHTDATA_API_TOKEN=9ff5cab742b378f058e9f9c34b0c47d0255cb680abd1624b015aa90e7d451c14
BRIGHTDATA_DATASET_ID=gd_lpfll7v5hcqtkxl6l
BRIGHTDATA_API_ENDPOINT=https://api.brightdata.com/datasets/v3/trigger
```

### 4. Configuración de Supabase

1. Crea una nueva base de datos en Supabase
2. Crea una tabla llamada `linkedin_jobs` con la siguiente estructura:

```sql
CREATE TABLE linkedin_jobs (
  id SERIAL PRIMARY KEY,
  job_posting_id TEXT UNIQUE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_location TEXT NOT NULL,
  job_work_type TEXT,
  job_base_pay_range TEXT,
  job_posted_time_ago TEXT,
  job_description_formatted TEXT,
  job_requirements TEXT[],
  job_qualifications TEXT[],
  company_industry TEXT,
  company_description TEXT,
  applicant_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Actualiza las variables de entorno con las credenciales de Supabase

## Ejecución del proyecto

### Desarrollo local

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Construcción para producción

```bash
npm run build
```

### Iniciar versión de producción

```bash
npm start
```

## Despliegue en Vercel

Esta aplicación está lista para ser desplegada en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. Despliega la aplicación

## Estructura del proyecto

```
linkedin-job-collector/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── api/                # API Routes
│   │   │   ├── jobs/           # Endpoint para gestionar ofertas
│   │   │   └── webhook/        # Endpoint para recibir datos de Bright Data
│   │   ├── jobs/               # Páginas de detalles de ofertas
│   │   └── page.tsx            # Página principal
│   ├── components/             # Componentes React
│   ├── lib/                    # Utilidades y configuraciones
│   ├── services/               # Servicios para APIs externas
│   └── types/                  # Definiciones de tipos TypeScript
├── public/                     # Archivos estáticos
├── .env.local.example          # Ejemplo de variables de entorno
└── README.md                   # Documentación
```

## Uso de la aplicación

1. Accede a la página principal
2. Ingresa una URL de oferta de trabajo de LinkedIn en el formulario
3. Haz clic en "Extraer datos"
4. La aplicación enviará la solicitud a Bright Data y mostrará una notificación
5. Cuando Bright Data procese la solicitud, enviará los datos al webhook
6. Los datos se almacenarán en Supabase y estarán disponibles en la lista de ofertas

## Licencia

MIT
