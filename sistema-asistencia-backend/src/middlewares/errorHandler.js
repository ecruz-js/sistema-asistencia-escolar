import logger from '../utils/logger.js';
import { errorResponse } from '../utils/responseHelper.js';

// Middleware para errores 404
export const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para manejo de errores
export const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.usuario ? req.usuario.id : 'No autenticado'
  });

  // Determinar código de estado
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Error de validación', 400, errors);
  }

  // Errores de unique constraint de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return errorResponse(res, `El ${field} ya existe`, 409);
  }

  // Errores de foreign key de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Referencia inválida a otro registro', 400);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expirado', 401);
  }

  // Error genérico
  return errorResponse(
    res,
    err.message || 'Error del servidor',
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

export default {
  notFound,
  errorHandler
};