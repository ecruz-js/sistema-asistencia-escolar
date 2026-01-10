import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import notificacionService from "../services/notificacionService.js";
import logger from "../utils/logger.js";

// Obtener notificaciones del usuario actual
export const misNotificaciones = async (req, res, next) => {
  try {
    const { limit = 20, solo_no_leidas = "false" } = req.query;

    const notificaciones = await notificacionService.obtenerPorUsuario(
      req.usuario.id,
      parseInt(limit),
      solo_no_leidas === "true"
    );

    const noLeidas = await notificacionService.contarNoLeidas(req.usuario.id);

    return successResponse(res, {
      notificaciones,
      total_no_leidas: noLeidas,
    });
  } catch (error) {
    next(error);
  }
};

// Contar notificaciones no leídas
export const contarNoLeidas = async (req, res, next) => {
  try {
    const count = await notificacionService.contarNoLeidas(req.usuario.id);

    return successResponse(res, { count });
  } catch (error) {
    next(error);
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await notificacionService.marcarComoLeida(
      parseInt(id),
      req.usuario.id
    );

    return successResponse(
      res,
      notificacion,
      "Notificación marcada como leída"
    );
  } catch (error) {
    if (error.message === "Notificación no encontrada") {
      return errorResponse(res, error.message, 404);
    }
    next(error);
  }
};

// Marcar todas como leídas
export const marcarTodasComoLeidas = async (req, res, next) => {
  try {
    const count = await notificacionService.marcarTodasComoLeidas(
      req.usuario.id
    );

    return successResponse(
      res,
      { actualizadas: count },
      "Notificaciones marcadas como leídas"
    );
  } catch (error) {
    next(error);
  }
};

// Eliminar notificación
export const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await db.Notificacion.findOne({
      where: {
        id,
        usuario_id: req.usuario.id,
      },
    });

    if (!notificacion) {
      return errorResponse(res, "Notificación no encontrada", 404);
    }

    await notificacion.destroy();

    logger.info(`Usuario ${req.usuario.email} eliminó notificación ${id}`);

    return successResponse(res, null, "Notificación eliminada");
  } catch (error) {
    next(error);
  }
};

export default {
  misNotificaciones,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminar,
};
