import db from "../models/index.js";
import { parseTime, getCurrentTime, isTimeInRange } from "./dateHelper.js";

/**
 * Verificar si está dentro del horario de toma de asistencia
 */
export const estaDentroHorarioAsistencia = async () => {
  const horaInicio = await db.ConfiguracionSistema.getValor(
    "hora_inicio_asistencia"
  );
  const horaLimite = await db.ConfiguracionSistema.getValor(
    "hora_limite_asistencia"
  );
  const horaActual = getCurrentTime();

  return isTimeInRange(horaActual, horaInicio, horaLimite);
};

/**
 * Verificar si está dentro del horario de modificación
 */
export const estaDentroHorarioModificacion = async () => {
  const horaInicio = await db.ConfiguracionSistema.getValor(
    "hora_inicio_asistencia"
  );
  const horaLimite = await db.ConfiguracionSistema.getValor(
    "hora_limite_modificacion"
  );
  const horaActual = getCurrentTime();

  return isTimeInRange(horaActual, horaInicio, horaLimite);
};

/**
 * Obtener mensaje de horario para el usuario
 */
export const obtenerMensajeHorario = async () => {
  const horaInicio = await db.ConfiguracionSistema.getValor(
    "hora_inicio_asistencia"
  );
  const horaLimite = await db.ConfiguracionSistema.getValor(
    "hora_limite_asistencia"
  );
  const horaLimiteModificacion = await db.ConfiguracionSistema.getValor(
    "hora_limite_modificacion"
  );

  return {
    inicio: horaInicio,
    limite: horaLimite,
    limiteModificacion: horaLimiteModificacion,
  };
};

export default {
  estaDentroHorarioAsistencia,
  estaDentroHorarioModificacion,
  obtenerMensajeHorario,
};
