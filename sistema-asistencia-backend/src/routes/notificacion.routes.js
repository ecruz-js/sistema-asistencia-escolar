import express from "express";
import * as notificacionController from "../controllers/notificacionController.js";
import { verificarToken } from "../middlewares/auth.js";
import { param } from "express-validator";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener mis notificaciones
router.get("/", notificacionController.misNotificaciones);

// Contar notificaciones no leídas
router.get("/no-leidas", notificacionController.contarNoLeidas);

// Marcar todas como leídas
router.put(
  "/marcar-todas-leidas",
  notificacionController.marcarTodasComoLeidas
);

// Marcar notificación como leída
router.put(
  "/:id/leer",
  param("id").isInt().withMessage("ID inválido"),
  manejarErroresValidacion,
  notificacionController.marcarComoLeida
);

// Eliminar notificación
router.delete(
  "/:id",
  param("id").isInt().withMessage("ID inválido"),
  manejarErroresValidacion,
  notificacionController.eliminar
);

export default router;
