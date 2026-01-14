import { body, param, query } from "express-validator";
import { ESTADOS_ASISTENCIA } from "../config/constants.js";

export const tomarAsistenciaValidator = [
  param("gradoId").isInt().withMessage("ID de grado inválido"),

  body("asistencias")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos una asistencia"),

  body("asistencias.*.estudiante_id")
    .isInt()
    .withMessage("ID de estudiante inválido"),

  body("asistencias.*.estado")
    .isIn(Object.values(ESTADOS_ASISTENCIA))
    .withMessage("Estado de asistencia inválido"),

  // body('asistencias.*.observaciones')
  //   .optional()
  //   .isString()
  //   .withMessage('Observaciones deben ser texto'),

  body("fecha").optional().isDate().withMessage("Fecha inválida"),
];

export const modificarAsistenciaValidator = [
  param("gradoId").isInt().withMessage("ID de grado inválido"),

  body("asistencias")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos una asistencia"),

  body("asistencias.*.estudiante_id")
    .isInt()
    .withMessage("ID de estudiante inválido"),

  body("asistencias.*.estado")
    .isIn(Object.values(ESTADOS_ASISTENCIA))
    .withMessage("Estado de asistencia inválido"),

  body("fecha").optional().isDate().withMessage("Fecha inválida"),
];

export const registrarAsistenciaPersonalValidator = [
  body("fecha").optional().isDate().withMessage("Fecha inválida"),

  body("estado")
    .isIn(Object.values(ESTADOS_ASISTENCIA))
    .withMessage("Estado de asistencia inválido"),

  // body('observaciones')
  //   .optional()
  //   .isString()
  //   .withMessage('Observaciones deben ser texto')
];

export const fechaValidator = [
  query("fecha").optional().isDate().withMessage("Fecha inválida"),
];

export default {
  tomarAsistenciaValidator,
  modificarAsistenciaValidator,
  registrarAsistenciaPersonalValidator,
  fechaValidator,
};
