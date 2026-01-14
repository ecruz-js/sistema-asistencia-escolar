import express from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/auth.js";
import { puedeGestionarUsuarios } from "../middlewares/roles.js";
import {
  crearUsuarioValidator,
  crearMultiplesUsuariosValidator,
  idValidator,
  updateUserValidator,
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

// Crear usuario (único o múltiple)
router.post(
  "/",
  (req, res, next) => {
    // Selecciona el validator apropiado según si viene array o objeto
    const validator = Array.isArray(req.body.usuarios)
      ? crearMultiplesUsuariosValidator
      : crearUsuarioValidator;
    
    // Ejecuta todas las reglas del validator
    Promise.all(validator.map(v => v.run(req)))
      .then(() => next())
      .catch(next);
  },
  manejarErroresValidacion,
  usuarioController.crear
);

// Actualizar usuario
router.put(
  "/:id",
  updateUserValidator,
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

export default router;
