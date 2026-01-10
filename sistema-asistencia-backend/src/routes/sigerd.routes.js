import express from "express";
import * as sigerdController from "../controllers/sigerdController.js";
import { verificarToken } from "../middlewares/auth.js";
import { esAdmin } from "../middlewares/roles.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken, esAdmin);

// Sincronizar manualmente
router.post("/sincronizar", sigerdController.sincronizar);

// Obtener historial de sincronizaciones
router.get("/historial", sigerdController.obtenerHistorial);

// Obtener última sincronización
router.get("/ultima", sigerdController.obtenerUltima);

// Verificar estado de conexión
router.get("/estado", sigerdController.verificarEstado);

export default router;
