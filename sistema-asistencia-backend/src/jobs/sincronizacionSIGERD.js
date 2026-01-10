import cron from "node-cron";
import sigerdService from "../services/sigerdService.js";
import db from "../models/index.js";
import logger from "../utils/logger.js";

/**
 * Configurar sincronización automática con SIGERD
 */
export const configurarSincronizacionAutomatica = async () => {
  // Verificar si está habilitada
  const habilitada = await db.ConfiguracionSistema.getValor(
    "sincronizacion_sigerd_automatica"
  );

  if (!habilitada) {
    logger.info("ℹ️  Sincronización automática con SIGERD deshabilitada");
    return;
  }

  // Obtener horario de sincronización del .env
  const cronExpression = process.env.SIGERD_SYNC_CRON || "0 2 * * *"; // Default: 2 AM diario

  logger.info("🕐 Configurando sincronización automática con SIGERD...");
  logger.info(`   Horario: ${cronExpression}`);

  // Programar tarea
  cron.schedule(cronExpression, async () => {
    logger.info("🔄 Iniciando sincronización automática con SIGERD...");

    try {
      const resultado = await sigerdService.sincronizarCompleto();

      logger.info("✅ Sincronización automática completada exitosamente");
      logger.info(`   Nuevos: ${resultado.estudiantes_nuevos}`);
      logger.info(`   Actualizados: ${resultado.estudiantes_actualizados}`);
      logger.info(`   Desactivados: ${resultado.estudiantes_desactivados}`);
    } catch (error) {
      logger.error("❌ Error en sincronización automática con SIGERD:", error);
    }
  });

  logger.info("✅ Sincronización automática con SIGERD configurada");
};

export default {
  configurarSincronizacionAutomatica,
};
