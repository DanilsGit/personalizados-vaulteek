import express from "express";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors());
app.use(express.json());

// Inicializar Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE, // Ruta al archivo JSON de credenciales
});

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend funcionando correctamente" });
});

// Endpoint para listar todos los animes (carpetas del bucket)
app.get("/api/animes", async (req, res) => {
  try {
    // Solo buscar carpetas bajo el prefijo 'estampados/'
    const [files] = await bucket.getFiles({ prefix: "estampados/" });

    // Extraer nombres únicos de subcarpetas dentro de 'estampados/'
    const folders = new Set();
    files.forEach((file) => {
      const parts = file.name.replace("estampados/", "").split("/");
      if (parts.length > 1 && parts[0]) {
        folders.add(parts[0]);
      }
    });

    const animes = Array.from(folders).map((folder) => ({
      id: folder,
      name: folder,
    }));

    res.json({
      success: true,
      data: animes,
    });
  } catch (error) {
    console.error("Error al listar animes:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener la lista de animes",
      details: error.message,
    });
  }
});

// Endpoint para listar diseños de un anime específico
app.get("/api/designs/:anime", async (req, res) => {
  try {
    const { anime } = req.params;
    const prefix = `estampados/${anime}/`;

    const [files] = await bucket.getFiles({ prefix });

    // Filtrar solo archivos PNG dentro de la carpeta
    const designs = files
      .filter((file) => {
        const fileName = file.name.split("/").pop();
        return fileName && fileName.endsWith(".png");
      })
      .map((file) => {
        const fileName = file.name.split("/").pop();
        return {
          id: file.name,
          filename: fileName, // Nombre completo con .png
          name: fileName.replace(".png", ""), // Nombre sin extensión
        };
      });

    res.json({
      success: true,
      anime: anime,
      count: designs.length,
      data: designs,
    });
  } catch (error) {
    console.error("Error al listar diseños:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener diseños",
      details: error.message,
    });
  }
});

// Endpoint para obtener una imagen específica por su path completo
app.get("/api/image/:anime/:filename", async (req, res) => {
  try {
    const { anime, filename } = req.params;
    const filePath = `estampados/${anime}/${filename}`;
    const file = bucket.file(filePath);

    // Verificar si el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: "Imagen no encontrada",
      });
    }

    // Obtener el stream de la imagen
    const readStream = file.createReadStream();

    // Configurar headers
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // Enviar la imagen
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Error al leer imagen:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error al obtener la imagen",
        });
      }
    });
  } catch (error) {
    console.error("Error al obtener imagen:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener la imagen",
      details: error.message,
    });
  }
});

// Endpoint para obtener preview del saco personalizado (flexible)
app.get("/api/saco-preview", async (req, res) => {
  try {
    const { anime, espalda, pecho, manga1, manga2 } = req.query;

    if (!anime) {
      return res.status(400).json({
        success: false,
        error: "El parámetro anime es requerido",
      });
    }

    const result = {
      success: true,
      anime: anime,
      images: {},
    };

    // Función helper para construir URL de imagen
    const buildImageUrl = (filename) => {
      if (!filename) return null;
      return `/api/image/${anime}/${filename}`;
    };

    // Construir URLs solo para las partes enviadas
    if (espalda) result.images.espalda = buildImageUrl(espalda);
    if (pecho) result.images.pecho = buildImageUrl(pecho);
    if (manga1) result.images.manga1 = buildImageUrl(manga1);
    if (manga2) result.images.manga2 = buildImageUrl(manga2);

    res.json(result);
  } catch (error) {
    console.error("Error al generar preview:", error);
    res.status(500).json({
      success: false,
      error: "Error al generar preview",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Bucket configurado: ${bucketName}`);
});
