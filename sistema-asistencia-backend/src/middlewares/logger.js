import morgan from "morgan";
import logger from "../utils/logger.js";
import env from "../config/environment.js";

// Stream personalizado para Winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Formato de logs según el entorno
const getLogFormat = () => {
  if (env.nodeEnv === "development") {
    return "dev"; // Colorido y detallado
  }
  // Producción: formato combinado
  return "combined";
};

// Middleware de Morgan
export const requestLogger = morgan(getLogFormat(), { stream });

export default requestLogger;
