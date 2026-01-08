import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import env from "../config/environment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de logs si no existe
import fs from "fs";
const logsDir = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: env.logs.level,
  format: customFormat,
  transports: [
    // Archivo para errores
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // Archivo para todo
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

// Si estamos en desarrollo, también mostrar en consola
if (env.nodeEnv === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
