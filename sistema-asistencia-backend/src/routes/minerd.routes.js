import express from 'express';
import * as minerdController from '../controllers/minerdController.js';
import { verificarToken } from '../middlewares/auth.js';
import { puedeEnviarMinerd } from '../middlewares/roles.js';
import { body, param, query } from 'express-validator';
import manejarErroresValidacion from '../middlewares/validacion.js';

const router = express.Router();

// Todas las rutas requieren autenticación y permisos (admin o dirección)
router.use(verificarToken, puedeEnviarMinerd);

// Obtener resumen para envío (vista previa)
router.get(
  '/resumen',
  query('fecha').optional().isDate().withMessage('Fecha inválida'),
  manejarErroresValidacion,
  minerdController.obtenerResumen
);

// Primera confirmación - Preparar envío
router.post(
  '/preparar',
  body('fecha').optional().isDate().withMessage('Fecha inválida'),
  manejarErroresValidacion,
  minerdController.prepararEnvio
);

// Segunda confirmación - Enviar al Minerd
router.post(
  '/confirmar',
  body('envio_id').isInt().withMessage('ID de envío inválido'),
  manejarErroresValidacion,
  minerdController.confirmarYEnviar
);

// Obtener historial de envíos
router.get('/historial', minerdController.obtenerHistorial);

// Obtener detalle de un envío
router.get(
  '/envio/:id',
  param('id').isInt().withMessage('ID inválido'),
  manejarErroresValidacion,
  minerdController.obtenerDetalle
);

export default router;