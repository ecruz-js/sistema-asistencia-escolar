import express from "express";
import * as estudianteController from "../controllers/estudianteController.js";
import { verificarToken } from "../middlewares/auth.js";
import { puedeGestionarUsuarios } from "../middlewares/roles.js";
import {
  crearEstudianteValidator,
  actualizarEstudianteValidator,
  idValidator,
} from "../validators/estudianteValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Listar estudiantes (todos pueden ver)
router.get("/", estudianteController.listar);

// Obtener estudiante por ID (todos pueden ver)
router.get(
  "/:id",
  idValidator,
  manejarErroresValidacion,
  estudianteController.obtenerPorId
);

// Obtener historial de asistencia de un estudiante (todos pueden ver)
router.get(
  "/:id/asistencia",
  idValidator,
  manejarErroresValidacion,
  estudianteController.obtenerHistorialAsistencia
);

// Crear estudiante manual (solo admin y dirección)
router.post(
  "/",
  puedeGestionarUsuarios,
  crearEstudianteValidator,
  manejarErroresValidacion,
  estudianteController.crear
);

// Actualizar estudiante (solo admin y dirección)
router.put(
  "/:id",
  puedeGestionarUsuarios,
  actualizarEstudianteValidator,
  manejarErroresValidacion,
  estudianteController.actualizar
);

// Desactivar estudiante (solo admin y dirección)
router.delete(
  "/:id",
  puedeGestionarUsuarios,
  idValidator,
  manejarErroresValidacion,
  estudianteController.desactivar
);

export default router;
