import express from "express";
import * as asistenciaController from "../controllers/asistenciaController.js";
import { verificarToken } from "../middlewares/auth.js";
import { puedeTomarAsistencia } from "../middlewares/roles.js";
import {
  tomarAsistenciaValidator,
  registrarAsistenciaPersonalValidator,
  fechaValidator,
} from "../validators/asistenciaValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ============================================
// ASISTENCIA DE ESTUDIANTES
// ============================================

// Obtener grados asignados al docente actual
router.get(
  "/mis-grados",
  puedeTomarAsistencia,
  fechaValidator,
  manejarErroresValidacion,
  asistenciaController.misGrados
);

// Obtener lista de estudiantes del grado para tomar asistencia
router.get(
  "/grado/:gradoId",
  puedeTomarAsistencia,
  asistenciaController.obtenerListaEstudiantes
);

// Tomar/Guardar asistencia de un grado
router.post(
  "/grado/:gradoId",
  puedeTomarAsistencia,
  tomarAsistenciaValidator,
  manejarErroresValidacion,
  asistenciaController.tomarAsistencia
);

// Obtener historial de asistencias tomadas por el docente
router.get(
  "/mi-historial",
  puedeTomarAsistencia,
  asistenciaController.miHistorial
);

// ============================================
// ASISTENCIA PERSONAL
// ============================================

// Registrar asistencia personal
router.post(
  "/personal",
  registrarAsistenciaPersonalValidator,
  manejarErroresValidacion,
  asistenciaController.registrarAsistenciaPersonal
);

// Obtener mi asistencia personal del día
router.get(
  "/personal/hoy",
  fechaValidator,
  manejarErroresValidacion,
  asistenciaController.miAsistenciaPersonal
);

export default router;
