import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import env from "./config/environment.js";
import { requestLogger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// TODO: Importar rutas (las crearemos después)
// import authRoutes from './routes/auth.routes.js';
// import usuarioRoutes from './routes/usuario.routes.js';
// etc...

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      env.nodeEnv === "development"
        ? ["http://localhost:3000", "http://localhost:5173"] // React/Vite común
        : process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Comprimir respuestas
app.use(compression());

// Parser de JSON y URL encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Parser de cookies
app.use(cookieParser());

// Logging de requests
app.use(requestLogger);

// Rate limiting (limitar peticiones)
const limiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  max: env.security.rateLimitMaxRequests,
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde",
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting solo en producción
if (env.nodeEnv === "production") {
  app.use("/api/", limiter);
}

// ============================================
// RUTAS
// ============================================

// Ruta de salud (health check)
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// Rutas de la API
const API_PREFIX = env.apiPrefix;

// TODO: Descomentar cuando creemos las rutas
// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/usuarios`, usuarioRoutes);
// app.use(`${API_PREFIX}/grados`, gradoRoutes);
// app.use(`${API_PREFIX}/estudiantes`, estudianteRoutes);
// app.use(`${API_PREFIX}/asistencia`, asistenciaRoutes);
// app.use(`${API_PREFIX}/direccion`, direccionRoutes);
// app.use(`${API_PREFIX}/minerd`, minerdRoutes);
// app.use(`${API_PREFIX}/notificaciones`, notificacionRoutes);
// app.use(`${API_PREFIX}/sigerd`, sigerdRoutes);
// app.use(`${API_PREFIX}/configuracion`, configuracionRoutes);
// app.use(`${API_PREFIX}/reportes`, reporteRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

export default app;
