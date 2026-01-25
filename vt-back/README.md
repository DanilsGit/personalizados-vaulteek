# Vaulteek Backend

Backend para el personalizador de sacos con diseños de anime.

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar credenciales de GCP

Descarga el archivo JSON de credenciales desde la consola de GCP:
- Ve a: IAM & Admin > Service Accounts
- Crea una cuenta de servicio con permisos de Storage
- Descarga el JSON y guárdalo como `gcp-key.json` en la raíz del proyecto

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:
```bash
cp .env.example .env
```

Edita `.env`:
```
PORT=3000
GCP_PROJECT_ID=tu-project-id
GCP_KEY_FILE=./gcp-key.json
BUCKET_NAME=vaulteek-designs
```

### 4. Subir diseños al bucket

Usa la consola de GCP o gsutil:
```bash
gsutil -m cp -r ./naruto gs://vaulteek-designs/
gsutil -m cp -r ./one-piece gs://vaulteek-designs/
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

### 6. Ejecutar en producción
```bash
npm start
```

## Endpoints

### `GET /health`
Health check del servidor

### `GET /api/animes`
Lista todos los animes disponibles (carpetas del bucket)

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "naruto",
      "name": "naruto",
      "thumbnail": "https://storage.googleapis.com/..."
    }
  ]
}
```

### `GET /api/designs/:anime`
Lista todos los diseños de un anime específico

Ejemplo: `/api/designs/naruto`

Respuesta:
```json
{
  "success": true,
  "anime": "naruto",
  "count": 5,
  "data": [
    {
      "id": "naruto/design1.png",
      "name": "design1",
      "url": "https://storage.googleapis.com/...",
      "publicUrl": "..."
    }
  ]
}
```

## Docker

### Construir imagen
```bash
docker build -t vaulteek-backend .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 --env-file .env vaulteek-backend
```

## Estructura del Bucket

```
vaulteek-designs/
  naruto/
    design1.png
    design2.png
  one-piece/
    design1.png
    design2.png
```
