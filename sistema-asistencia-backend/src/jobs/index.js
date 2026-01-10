import { configurarTareasProgramadas } from "./recordatoriosAsistencia.js";
import { configurarSincronizacionAutomatica } from "./sincronizacionSIGERD.js";
import logger from "../utils/logger.js";

/**
 * Inicializar todas las tareas programadas
 */
export const inicializarTareas = async () => {
  try {
    logger.info("🚀 Inicializando tareas programadas...");

    // Recordatorios de asistencia
    await configurarTareasProgramadas();

    // Sincronización automática con SIGERD
    await configurarSincronizacionAutomatica();

    logger.info("✅ Todas las tareas programadas iniciadas correctamente");
  } catch (error) {
    logger.error("❌ Error al inicializar tareas programadas:", error);
    throw error;
  }
};

export default inicializarTareas;
