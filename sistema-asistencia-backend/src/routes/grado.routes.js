import express from "express";
import * as gradoController from "../controllers/gradoController.js";
import { verificarToken } from "../middlewares/auth.js";
import { puedeGestionarUsuarios } from "../middlewares/roles.js";
import {
  crearGradoValidator,
  actualizarGradoValidator,
  idValidator,
} from "../validators/gradoValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Listar grados (todos pueden ver)
router.get("/", gradoController.listar);

// Obtener grado por ID (todos pueden ver)
router.get(
  "/:id",
  idValidator,
  manejarErroresValidacion,
  gradoController.obtenerPorId
);

// Obtener estudiantes de un grado (todos pueden ver)
router.get(
  "/:id/estudiantes",
  idValidator,
  manejarErroresValidacion,
  gradoController.obtenerEstudiantes
);

// Crear grado (solo admin y dirección)
router.post(
  "/",
  puedeGestionarUsuarios,
  crearGradoValidator,
  manejarErroresValidacion,
  gradoController.crear
);

// Actualizar grado (solo admin y dirección)
router.put(
  "/:id",
  puedeGestionarUsuarios,
  actualizarGradoValidator,
  manejarErroresValidacion,
  gradoController.actualizar
);

// Desactivar grado (solo admin y dirección)
router.delete(
  "/:id",
  puedeGestionarUsuarios,
  idValidator,
  manejarErroresValidacion,
  gradoController.desactivar
);

export default router;
