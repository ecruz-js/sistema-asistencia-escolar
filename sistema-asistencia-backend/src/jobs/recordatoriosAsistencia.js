import cron from "node-cron";
import db from "../models/index.js";
import notificacionService from "../services/notificacionService.js";
import logger from "../utils/logger.js";
import {
  getTodayDate,
  getCurrentTime,
  getDayOfWeek,
} from "../utils/dateHelper.js";
import { PRIORIDADES_NOTIFICACION } from "../config/constants.js";

/**
 * Verificar si es día hábil
 */
const esDiaHabil = async () => {
  const diasHabiles = await db.ConfiguracionSistema.getValor("dias_habiles");
  const hoy = getDayOfWeek(new Date());
  return diasHabiles.includes(hoy);
};

/**
 * Obtener docentes con grados pendientes de asistencia
 */
const obtenerDocentesPendientes = async (fecha) => {
  const añoEscolar = await db.ConfiguracionSistema.getValor(
    "año_escolar_actual"
  );

  // Obtener todos los docentes activos
  const docentes = await db.Usuario.findAll({
    where: {
      rol: "docente_aula",
      activo: true,
    },
    attributes: ["id", "nombre", "apellido", "email"],
  });

  // Obtener todos los grados activos
  const grados = await db.Grado.findAll({
    where: {
      activo: true,
      año_escolar: añoEscolar,
    },
    attributes: ["id", "nombre", "nivel", "seccion"],
  });

  // Agrupar por docente
  const docentesMap = new Map();

  for (const docente of docentes) {
    docentesMap.set(docente.id, {
      docente,
      grados: [],
    });

    // Verificar qué grados tienen asistencia pendiente
    for (const grado of grados) {
      const registro = await db.RegistroAsistenciaGrado.findOne({
        where: {
          grado_id: grado.id,
          fecha,
          completada: true,
        },
      });

      // Si no ha completado, agregar a la lista de pendientes
      if (!registro) {
        docentesMap.get(docente.id).grados.push(grado);
      }
    }
  }

  // Filtrar solo docentes que tienen grados pendientes
  const docentesPendientes = Array.from(docentesMap.values()).filter(
    (item) => item.grados.length > 0
  );

  return docentesPendientes;
};

/**
 * Enviar recordatorios a docentes
 */
const enviarRecordatorios = async (prioridad, titulo) => {
  try {
    const fecha = getTodayDate();

    // Verificar si es día hábil
    if (!(await esDiaHabil())) {
      logger.info("Hoy no es día hábil, no se envían recordatorios");
      return;
    }

    logger.info(`📢 Enviando recordatorios de asistencia (${prioridad})...`);

    const docentesPendientes = await obtenerDocentesPendientes(fecha);

    if (docentesPendientes.length === 0) {
      logger.info("✅ Todos los docentes han completado la asistencia");
      return;
    }

    logger.info(
      `⚠️ ${docentesPendientes.length} docentes con grados pendientes`
    );

    // Enviar notificación a cada docente
    for (const { docente, grados } of docentesPendientes) {
      await notificacionService.notificarTomarAsistencia(
        docente.id,
        grados,
        prioridad
      );

      logger.info(
        `  → Recordatorio enviado a ${docente.nombre} ${docente.apellido} (${grados.length} grados pendientes)`
      );
    }

    // Si es el recordatorio urgente (11:00 AM), también notificar a dirección
    if (prioridad === PRIORIDADES_NOTIFICACION.CRITICA) {
      const gradosPendientes = docentesPendientes.flatMap(
        ({ docente, grados }) =>
          grados.map((grado) => ({
            id: grado.id,
            nombre: grado.nombre,
            docente: `${docente.nombre} ${docente.apellido}`,
          }))
      );

      await notificacionService.notificarDireccionGradosPendientes(
        gradosPendientes
      );
      logger.info(
        `  → Notificación enviada a Dirección sobre ${gradosPendientes.length} grados pendientes`
      );
    }
  } catch (error) {
    logger.error("❌ Error al enviar recordatorios:", error);
  }
};

/**
 * Configurar tareas programadas
 */
export const configurarTareasProgramadas = async () => {
  logger.info("🕐 Configurando tareas programadas de recordatorios...");

  // Obtener horarios de configuración
  const recordatorio1 = await db.ConfiguracionSistema.getValor(
    "recordatorio_1"
  ); // 09:30
  const recordatorio2 = await db.ConfiguracionSistema.getValor(
    "recordatorio_2"
  ); // 10:30
  const recordatorio3 = await db.ConfiguracionSistema.getValor(
    "recordatorio_3"
  ); // 11:00
  const recordatorio4 = await db.ConfiguracionSistema.getValor(
    "recordatorio_4"
  ); // 11:15

  // Convertir horarios a formato cron (HH:mm -> mm HH * * *)
  const convertirACron = (hora) => {
    const [hh, mm] = hora.split(":");
    return `${mm} ${hh} * * *`; // mm hh * * * (todos los días)
  };

  // Recordatorio 1: Suave (09:30)
  cron.schedule(convertirACron(recordatorio1), async () => {
    logger.info(`⏰ Ejecutando Recordatorio 1 (${recordatorio1})`);
    await enviarRecordatorios(
      PRIORIDADES_NOTIFICACION.MEDIA,
      "⏰ Recordatorio: Toma de asistencia"
    );
  });

  // Recordatorio 2: Moderado (10:30)
  cron.schedule(convertirACron(recordatorio2), async () => {
    logger.info(`⏰ Ejecutando Recordatorio 2 (${recordatorio2})`);
    await enviarRecordatorios(
      PRIORIDADES_NOTIFICACION.ALTA,
      "⚠️ Atención: Tiempo límite próximo"
    );
  });

  // Recordatorio 3: Urgente (11:00 - hora límite)
  cron.schedule(convertirACron(recordatorio3), async () => {
    logger.info(`⏰ Ejecutando Recordatorio 3 (${recordatorio3})`);
    await enviarRecordatorios(
      PRIORIDADES_NOTIFICACION.CRITICA,
      "🚨 URGENTE: Hora límite de asistencia"
    );
  });

  // Recordatorio 4: Crítico (11:15 - pasada hora límite)
  cron.schedule(convertirACron(recordatorio4), async () => {
    logger.info(`⏰ Ejecutando Recordatorio 4 (${recordatorio4})`);
    await enviarRecordatorios(
      PRIORIDADES_NOTIFICACION.CRITICA,
      "🔴 CRÍTICO: No has tomado asistencia"
    );
  });

  logger.info("✅ Tareas programadas configuradas:");
  logger.info(`   - Recordatorio 1 (Suave): ${recordatorio1}`);
  logger.info(`   - Recordatorio 2 (Moderado): ${recordatorio2}`);
  logger.info(`   - Recordatorio 3 (Urgente): ${recordatorio3}`);
  logger.info(`   - Recordatorio 4 (Crítico): ${recordatorio4}`);
};

export default {
  configurarTareasProgramadas,
  enviarRecordatorios,
};
