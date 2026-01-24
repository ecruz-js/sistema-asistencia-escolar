import app from "./app.js";
import env from "./config/environment.js";
import db from "./models/index.js";
import logger from "./utils/logger.js";
import inicializarTareas from "./jobs/index.js";
import { Server } from "socket.io";
import { createServer } from "http";

const PORT = env.port;
const httpServer = createServer(app);

// Función para iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    logger.info("🔄 Conectando a la base de datos...");
    await db.sequelize.authenticate();
    logger.info("✅ Conexión a base de datos exitosa");

    // Inicializar tareas programadas
    await inicializarTareas();

    //Initialize Socket IO
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client Connected: ", socket.id);
    });

    // Iniciar servidor
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      logger.info(`🌍 Entorno: ${env.nodeEnv}`);
      logger.info(
        `📡 API disponible en: http://localhost:${PORT}${env.apiPrefix}`,
      );
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ Error al iniciar servidor:", error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  logger.error("❌ Unhandled Rejection:", err);
  // Cerrar servidor gracefully
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Iniciar servidor
iniciarServidor();
