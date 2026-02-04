import express from "express";
import * as authController from "../controllers/authController.js";
import { verificarToken } from "../middlewares/auth.js";
import {
  loginValidator,
  refreshTokenValidator,
  cambiarPasswordValidator,
} from "../validators/authValidator.js";
import manejarErroresValidacion from "../middlewares/validacion.js";

const router = express.Router();

// Rutas públicas
router.post(
  "/login",
  loginValidator,
  manejarErroresValidacion,
  authController.login 
);
router.post(
  "/refresh",
  refreshTokenValidator,
  manejarErroresValidacion,
  authController.refreshToken
);

// Rutas protegidas (requieren autenticación)
router.post("/logout", verificarToken, authController.logout);
router.get("/perfil", verificarToken, authController.obtenerPerfil);
router.put(
  "/cambiar-password",
  verificarToken,
  cambiarPasswordValidator,
  manejarErroresValidacion,
  authController.cambiarPassword
);

export default router;
