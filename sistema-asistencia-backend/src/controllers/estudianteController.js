import db from "../models/index.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseHelper.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

// Listar estudiantes
export const listar = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      grado_id = "",
      activo = "true",
    } = req.query;

    const offset = (page - 1) * pageSize;
    const whereClause = {};

    // Filtro de búsqueda
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { nombre2: { [Op.iLike]: `%${search}%` } },
        { apellido: { [Op.iLike]: `%${search}%` } },
        { apellido2: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por grado
    if (grado_id) {
      whereClause.grado_id = grado_id;
    }

    // Filtro por activo
    if (activo !== "") {
      whereClause.activo = activo === "true";
    }

    const { count, rows } = await db.Estudiante.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
      limit: parseInt(pageSize),
      offset,
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    return paginatedResponse(
      res,
      rows,
      parseInt(page),
      parseInt(pageSize),
      count,
      "Estudiantes obtenidos"
    );
  } catch (error) {
    next(error);
  }
};

// Obtener estudiante por ID
export const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const estudiante = await db.Estudiante.findByPk(id, {
      include: [
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion", "año_escolar"],
        },
      ],
    });

    if (!estudiante) {
      return errorResponse(res, "Estudiante no encontrado", 404);
    }

    return successResponse(res, estudiante, "Estudiante obtenido");
  } catch (error) {
    next(error);
  }
};

// Crear estudiante (manual - no común, normalmente vienen de SIGERD)
export const crear = async (req, res, next) => {
  try {
    const { nombre, nombre2, apellido, apellido2, fecha_nacimiento, grado_id } =
      req.body;

    // Verificar que el grado existe
    const grado = await db.Grado.findByPk(grado_id);

    if (!grado) {
      return errorResponse(res, "Grado no encontrado", 404);
    }

    // Crear estudiante
    const estudiante = await db.Estudiante.create({
      nombre,
      nombre2,
      apellido,
      apellido2,
      fecha_nacimiento,
      grado_id,
      activo: true,
    });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "crear_estudiante",
      tablaAfectada: "estudiantes",
      registroId: estudiante.id,
      datosNuevos: estudiante.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${
        req.usuario.email
      } creó estudiante ${estudiante.getNombreCompleto()}`
    );

    return successResponse(
      res,
      estudiante,
      "Estudiante creado exitosamente",
      201
    );
  } catch (error) {
    next(error);
  }
};

// Actualizar estudiante
export const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const estudiante = await db.Estudiante.findByPk(id);

    if (!estudiante) {
      return errorResponse(res, "Estudiante no encontrado", 404);
    }

    // Advertencia si es de SIGERD
    if (estudiante.sigerd_id_estudiante) {
      logger.warn(
        `Se está actualizando estudiante de SIGERD: ${estudiante.getNombreCompleto()}`
      );
    }

    const datosAnteriores = estudiante.toJSON();

    // Si se está cambiando de grado, verificar que exista
    if (datosActualizacion.grado_id) {
      const grado = await db.Grado.findByPk(datosActualizacion.grado_id);
      if (!grado) {
        return errorResponse(res, "Grado no encontrado", 404);
      }
    }

    await estudiante.update(datosActualizacion);

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "actualizar_estudiante",
      tablaAfectada: "estudiantes",
      registroId: estudiante.id,
      datosAnteriores,
      datosNuevos: estudiante.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${
        req.usuario.email
      } actualizó estudiante ${estudiante.getNombreCompleto()}`
    );

    return successResponse(
      res,
      estudiante,
      "Estudiante actualizado exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

// Desactivar estudiante
export const desactivar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const estudiante = await db.Estudiante.findByPk(id);

    if (!estudiante) {
      return errorResponse(res, "Estudiante no encontrado", 404);
    }

    const datosAnteriores = estudiante.toJSON();

    await estudiante.update({ activo: false });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "desactivar_estudiante",
      tablaAfectada: "estudiantes",
      registroId: estudiante.id,
      datosAnteriores,
      datosNuevos: estudiante.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${
        req.usuario.email
      } desactivó estudiante ${estudiante.getNombreCompleto()}`
    );

    return successResponse(
      res,
      estudiante,
      "Estudiante desactivado exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

// Obtener historial de asistencia de un estudiante
export const obtenerHistorialAsistencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, limit = 30 } = req.query;

    const estudiante = await db.Estudiante.findByPk(id);

    if (!estudiante) {
      return errorResponse(res, "Estudiante no encontrado", 404);
    }

    const whereClause = { estudiante_id: id };

    // Filtrar por rango de fechas
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin],
      };
    } else if (fecha_inicio) {
      whereClause.fecha = {
        [Op.gte]: fecha_inicio,
      };
    } else if (fecha_fin) {
      whereClause.fecha = {
        [Op.lte]: fecha_fin,
      };
    }

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: whereClause,
      include: [
        {
          model: db.Usuario,
          as: "docente",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre"],
        },
      ],
      limit: parseInt(limit),
      order: [["fecha", "DESC"]],
    });

    // Calcular estadísticas
    const estadisticas = {
      total: asistencias.length,
      presentes: asistencias.filter((a) => a.estado === "presente").length,
      ausentes: asistencias.filter((a) => a.estado === "ausente").length,
      tardanzas: asistencias.filter((a) => a.estado === "tardanza").length,
      justificados: asistencias.filter((a) => a.estado === "justificado")
        .length,
    };

    return successResponse(
      res,
      {
        estudiante: {
          id: estudiante.id,
          nombre_completo: estudiante.getNombreCompleto(),
          grado_id: estudiante.grado_id,
        },
        estadisticas,
        asistencias,
      },
      "Historial de asistencia obtenido"
    );
  } catch (error) {
    next(error);
  }
};

export default {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  desactivar,
  obtenerHistorialAsistencia,
};
