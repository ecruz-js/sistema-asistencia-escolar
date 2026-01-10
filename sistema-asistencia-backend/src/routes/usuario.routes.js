import express from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/auth.js";
import { puedeGestionarUsuarios } from "../middlewares/roles.js";
import {
  crearUsuarioValidator,
  actualizarUsuarioValidator,
  idValidator,
} from "../validators/usuarioValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación y permisos
router.use(verificarToken, puedeGestionarUsuarios);

// Listar usuarios
router.get("/", usuarioController.listar);

// Obtener usuario por ID
router.get(
  "/:id",
  idValidator,
  manejarErroresValidacion,
  usuarioController.obtenerPorId
);

// Crear usuario
router.post(
  "/",
  crearUsuarioValidator,
  manejarErroresValidacion,
  usuarioController.crear
);

// Actualizar usuario
router.put(
  "/:id",
  actualizarUsuarioValidator,
  manejarErroresValidacion,
  usuarioController.actualizar
);

// Desactivar usuario
router.delete(
  "/:id",
  idValidator,
  manejarErroresValidacion,
  usuarioController.desactivar
);

// Reactivar usuario
router.patch(
  "/:id/reactivar",
  idValidator,
  manejarErroresValidacion,
  usuarioController.reactivar
);

// Asignar grados a docente
router.post(
  "/:id/asignar-grados",
  idValidator,
  manejarErroresValidacion,
  usuarioController.asignarGrados
);

export default router;
