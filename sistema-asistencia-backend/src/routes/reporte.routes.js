import express from "express";
import * as reporteController from "../controllers/reporteController.js";
import { verificarToken } from "../middlewares/auth.js";
import { param, query } from "express-validator";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Reporte de asistencia diaria
router.get(
  "/asistencia-diaria",
  query("fecha").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  reporteController.asistenciaDiaria
);

// Reporte por rango de fechas
router.get(
  "/asistencia-rango",
  query("fecha_inicio")
    .isDate()
    .withMessage("fecha_inicio es requerida y debe ser válida"),
  query("fecha_fin")
    .isDate()
    .withMessage("fecha_fin es requerida y debe ser válida"),
  query("grado_id")
    .optional()
    .isInt()
    .withMessage("grado_id debe ser un número"),
  query("estudiante_id")
    .optional()
    .isInt()
    .withMessage("estudiante_id debe ser un número"),
  manejarErroresValidacion,
  reporteController.asistenciaPorRango
);

// Estadísticas generales
router.get(
  "/estadisticas-generales",
  query("fecha_inicio").optional().isDate().withMessage("Fecha inválida"),
  query("fecha_fin").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  reporteController.estadisticasGenerales
);

// Reporte de estudiante específico
router.get(
  "/estudiante/:estudianteId",
  param("estudianteId").isInt().withMessage("ID de estudiante inválido"),
  query("fecha_inicio").optional().isDate().withMessage("Fecha inválida"),
  query("fecha_fin").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  reporteController.reporteEstudiante
);

// Reporte de grado específico
router.get(
  "/grado/:gradoId",
  param("gradoId").isInt().withMessage("ID de grado inválido"),
  query("fecha_inicio").optional().isDate().withMessage("Fecha inválida"),
  query("fecha_fin").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  reporteController.reporteGrado
);

export default router;
