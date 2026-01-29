import express from "express";
import * as direccionController from "../controllers/direccionController.js";
import { verificarToken } from "../middlewares/auth.js";
import { esAdminODireccion } from "../middlewares/roles.js";
import { body, param, query } from "express-validator";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin o dirección
router.use(verificarToken, esAdminODireccion);

// Dashboard principal
router.get(
  "/dashboard",
  query("fecha").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  direccionController.dashboard
);

// Detalle de un grado específico
router.get(
  "/grado/:gradoId",
  param("gradoId").isInt().withMessage("ID de grado inválido"),
  query("fecha").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  direccionController.detalleGrado
);

// Enviar recordatorio manual
router.post(
  "/recordatorio",
  body("docente_ids")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar IDs de docentes"),
  manejarErroresValidacion,
  direccionController.enviarRecordatorio
);

// Modificar asistencia de un estudiante
router.put(
  "/modificar-asistencia",
  body("estudiante_id").isInt().withMessage("ID de estudiante inválido"),
  body("fecha").isDate().withMessage("Fecha inválida"),
  body("estado").notEmpty().withMessage("Estado es requerido"),
  manejarErroresValidacion,
  direccionController.modificarAsistencia
);

// Lista de asistencia del personal
router.get(
  "/personal",
  query("fecha").optional().isDate().withMessage("Fecha inválida"),
  manejarErroresValidacion,
  direccionController.listaAsistenciaPersonal
);

export default router;
