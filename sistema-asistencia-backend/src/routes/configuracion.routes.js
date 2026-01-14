import express from "express";
import * as configuracionController from "../controllers/configuracionController.js";
import { verificarToken } from "../middlewares/auth.js";
import { esAdmin } from "../middlewares/roles.js";
import {
  crearConfiguracionValidator,
  actualizarConfiguracionValidator,
  obtenerPorClaveValidator,
  eliminarConfiguracionValidator,
} from "../validators/configuracionValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.use(verificarToken);
router.use(esAdmin);

// Obtener todas las configuraciones
router.get(
  "/",
  configuracionController.obtenerTodas
);

// Obtener una configuración por clave
router.get(
  "/:clave",
  obtenerPorClaveValidator,
  manejarErroresValidacion,
  configuracionController.obtenerPorClave
);

// Crear una nueva configuración
router.post(
  "/",
  crearConfiguracionValidator,
  manejarErroresValidacion,
  configuracionController.crear
);

// Actualizar una configuración
router.put(
  "/:clave",
  actualizarConfiguracionValidator,
  manejarErroresValidacion,
  configuracionController.actualizar
);

// Eliminar una configuración
router.delete(
  "/:clave",
  eliminarConfiguracionValidator,
  manejarErroresValidacion,
  configuracionController.eliminar
);

export default router;
