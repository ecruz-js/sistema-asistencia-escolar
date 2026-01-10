import sigerdService from "../services/sigerdService.js";
import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import logger from "../utils/logger.js";

// Sincronizar manualmente
export const sincronizar = async (req, res, next) => {
  try {
    logger.info(
      `Usuario ${req.usuario.email} inició sincronización manual con SIGERD`
    );

    // Ejecutar sincronización
    const resultado = await sigerdService.sincronizarCompleto();

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "sincronizar_sigerd",
      datosNuevos: resultado,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return successResponse(res, resultado, "Sincronización completada");
  } catch (error) {
    next(error);
  }
};

// Obtener historial de sincronizaciones
export const obtenerHistorial = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await db.SincronizacionSIGERD.findAndCountAll({
      limit: parseInt(pageSize),
      offset,
      order: [["fecha", "DESC"]],
    });

    return successResponse(res, {
      sincronizaciones: rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obtener última sincronización
export const obtenerUltima = async (req, res, next) => {
  try {
    const ultima = await db.SincronizacionSIGERD.findOne({
      order: [["fecha", "DESC"]],
    });

    if (!ultima) {
      return successResponse(res, null, "No hay sincronizaciones registradas");
    }

    return successResponse(res, ultima);
  } catch (error) {
    next(error);
  }
};

// Verificar estado de conexión
export const verificarEstado = async (req, res, next) => {
  try {
    // Intentar autenticar
    await sigerdService.autenticar();

    return successResponse(res, {
      conectado: sigerdService.autenticado,
      mensaje: "Conexión con SIGERD exitosa",
    });
  } catch (error) {
    return errorResponse(res, "No se pudo conectar con SIGERD", 500);
  }
};

export default {
  sincronizar,
  obtenerHistorial,
  obtenerUltima,
  verificarEstado,
};
