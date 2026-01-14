import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import logger from "../utils/logger.js";

// Obtener todas las configuraciones
export const obtenerTodas = async (req, res, next) => {
  try {
    logger.info(
      `Usuario ${req.usuario.id} (${req.usuario.email}) solicitó todas las configuraciones`
    );

    const configuraciones = await db.ConfiguracionSistema.findAll({
      order: [["clave", "ASC"]],
      include: [
        {
          model: db.Usuario,
          as: "actualizadoPor",
          attributes: ["id", "nombres", "primer_apellido", "email"],
          required: false,
        },
      ],
    });

    // Parsear valores según su tipo
    const configuracionesParseadas = configuraciones.map((config) => {
      let valorParseado = config.valor;
      switch (config.tipo) {
        case "number":
          valorParseado = parseFloat(config.valor);
          break;
        case "boolean":
          valorParseado = config.valor === "true";
          break;
        case "json":
          try {
            valorParseado = JSON.parse(config.valor);
          } catch (e) {
            logger.warn(
              `Error al parsear JSON de configuración ${config.clave}: ${e.message}`
            );
            valorParseado = config.valor;
          }
          break;
        default:
          valorParseado = config.valor;
      }

      return {
        id: config.id,
        clave: config.clave,
        valor: valorParseado,
        tipo: config.tipo,
        descripcion: config.descripcion,
        actualizado_por: config.actualizado_por,
        actualizado_en: config.actualizado_en,
        actualizadoPor: config.actualizadoPor,
      };
    });

    logger.info(
      `Usuario ${req.usuario.id} obtuvo ${configuracionesParseadas.length} configuraciones`
    );

    return successResponse(
      res,
      configuracionesParseadas,
      "Configuraciones obtenidas correctamente"
    );
  } catch (error) {
    logger.error(
      `Error al obtener configuraciones: ${error.message}`,
      { error: error.stack, usuarioId: req.usuario?.id }
    );
    next(error);
  }
};

// Obtener una configuración por clave
export const obtenerPorClave = async (req, res, next) => {
  try {
    const { clave } = req.params;

    logger.info(
      `Usuario ${req.usuario.id} (${req.usuario.email}) solicitó configuración: ${clave}`
    );

    const configuracion = await db.ConfiguracionSistema.findOne({
      where: { clave },
      include: [
        {
          model: db.Usuario,
          as: "actualizadoPor",
          attributes: ["id", "nombres", "primer_apellido", "email"],
          required: false,
        },
      ],
    });

    if (!configuracion) {
      logger.warn(
        `Usuario ${req.usuario.id} intentó obtener configuración inexistente: ${clave}`
      );
      return errorResponse(res, "Configuración no encontrada", 404);
    }

    // Parsear valor según su tipo
    let valorParseado = configuracion.valor;
    switch (configuracion.tipo) {
      case "number":
        valorParseado = parseFloat(configuracion.valor);
        break;
      case "boolean":
        valorParseado = configuracion.valor === "true";
        break;
      case "json":
        try {
          valorParseado = JSON.parse(configuracion.valor);
        } catch (e) {
          logger.warn(
            `Error al parsear JSON de configuración ${configuracion.clave}: ${e.message}`
          );
          valorParseado = configuracion.valor;
        }
        break;
      default:
        valorParseado = configuracion.valor;
    }

    const respuesta = {
      id: configuracion.id,
      clave: configuracion.clave,
      valor: valorParseado,
      tipo: configuracion.tipo,
      descripcion: configuracion.descripcion,
      actualizado_por: configuracion.actualizado_por,
      actualizado_en: configuracion.actualizado_en,
      actualizadoPor: configuracion.actualizadoPor,
    };

    return successResponse(res, respuesta, "Configuración obtenida correctamente");
  } catch (error) {
    logger.error(
      `Error al obtener configuración ${req.params.clave}: ${error.message}`,
      { error: error.stack, usuarioId: req.usuario?.id }
    );
    next(error);
  }
};

// Crear una nueva configuración
export const crear = async (req, res, next) => {
  try {
    const { clave, valor, tipo, descripcion } = req.body;

    logger.info(
      `Usuario ${req.usuario.id} (${req.usuario.email}) intenta crear configuración: ${clave}`
    );

    // Verificar si ya existe una configuración con esa clave
    const existe = await db.ConfiguracionSistema.findOne({
      where: { clave },
    });

    if (existe) {
      logger.warn(
        `Usuario ${req.usuario.id} intentó crear configuración duplicada: ${clave}`
      );
      return errorResponse(
        res,
        "Ya existe una configuración con esa clave",
        409
      );
    }

    // Convertir valor a string según el tipo
    let valorString;
    switch (tipo) {
      case "json":
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = String(valor);
    }

    const nuevaConfiguracion = await db.ConfiguracionSistema.create({
      clave,
      valor: valorString,
      tipo: tipo || "string",
      descripcion: descripcion || null,
      actualizado_por: req.usuario.id,
      actualizado_en: new Date(),
    });

    logger.info(
      `Usuario ${req.usuario.id} creó configuración: ${clave} (ID: ${nuevaConfiguracion.id})`
    );

    return successResponse(
      res,
      nuevaConfiguracion,
      "Configuración creada correctamente",
      201
    );
  } catch (error) {
    logger.error(
      `Error al crear configuración: ${error.message}`,
      { error: error.stack, usuarioId: req.usuario?.id, body: req.body }
    );
    next(error);
  }
};

// Actualizar una configuración
export const actualizar = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { valor, descripcion } = req.body;

    logger.info(
      `Usuario ${req.usuario.id} (${req.usuario.email}) intenta actualizar configuración: ${clave}`
    );

    const configuracion = await db.ConfiguracionSistema.findOne({
      where: { clave },
    });

    if (!configuracion) {
      logger.warn(
        `Usuario ${req.usuario.id} intentó actualizar configuración inexistente: ${clave}`
      );
      return errorResponse(res, "Configuración no encontrada", 404);
    }

    // Convertir valor a string según el tipo de la configuración
    let valorString = configuracion.valor;
    if (valor !== undefined) {
      switch (configuracion.tipo) {
        case "json":
          valorString = JSON.stringify(valor);
          break;
        default:
          valorString = String(valor);
      }
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      actualizado_por: req.usuario.id,
      actualizado_en: new Date(),
    };

    if (valor !== undefined) {
      datosActualizacion.valor = valorString;
    }

    if (descripcion !== undefined) {
      datosActualizacion.descripcion = descripcion;
    }

    await configuracion.update(datosActualizacion);

    logger.info(
      `Usuario ${req.usuario.id} actualizó configuración: ${clave} (ID: ${configuracion.id})`
    );

    // Obtener la configuración actualizada con el usuario que la actualizó
    const configuracionActualizada = await db.ConfiguracionSistema.findByPk(
      configuracion.id,
      {
        include: [
          {
            model: db.Usuario,
            as: "actualizadoPor",
            attributes: ["id", "nombres", "primer_apellido", "email"],
            required: false,
          },
        ],
      }
    );

    // Parsear valor para la respuesta
    let valorParseado = configuracionActualizada.valor;
    switch (configuracionActualizada.tipo) {
      case "number":
        valorParseado = parseFloat(configuracionActualizada.valor);
        break;
      case "boolean":
        valorParseado = configuracionActualizada.valor === "true";
        break;
      case "json":
        try {
          valorParseado = JSON.parse(configuracionActualizada.valor);
        } catch (e) {
          logger.warn(
            `Error al parsear JSON de configuración ${configuracionActualizada.clave}: ${e.message}`
          );
          valorParseado = configuracionActualizada.valor;
        }
        break;
      default:
        valorParseado = configuracionActualizada.valor;
    }

    const respuesta = {
      id: configuracionActualizada.id,
      clave: configuracionActualizada.clave,
      valor: valorParseado,
      tipo: configuracionActualizada.tipo,
      descripcion: configuracionActualizada.descripcion,
      actualizado_por: configuracionActualizada.actualizado_por,
      actualizado_en: configuracionActualizada.actualizado_en,
      actualizadoPor: configuracionActualizada.actualizadoPor,
    };

    return successResponse(
      res,
      respuesta,
      "Configuración actualizada correctamente"
    );
  } catch (error) {
    logger.error(
      `Error al actualizar configuración ${req.params.clave}: ${error.message}`,
      { error: error.stack, usuarioId: req.usuario?.id, body: req.body }
    );
    next(error);
  }
};

// Eliminar una configuración
export const eliminar = async (req, res, next) => {
  try {
    const { clave } = req.params;

    logger.info(
      `Usuario ${req.usuario.id} (${req.usuario.email}) intenta eliminar configuración: ${clave}`
    );

    const configuracion = await db.ConfiguracionSistema.findOne({
      where: { clave },
    });

    if (!configuracion) {
      logger.warn(
        `Usuario ${req.usuario.id} intentó eliminar configuración inexistente: ${clave}`
      );
      return errorResponse(res, "Configuración no encontrada", 404);
    }

    await configuracion.destroy();

    logger.info(
      `Usuario ${req.usuario.id} eliminó configuración: ${clave} (ID: ${configuracion.id})`
    );

    return successResponse(res, null, "Configuración eliminada correctamente");
  } catch (error) {
    logger.error(
      `Error al eliminar configuración ${req.params.clave}: ${error.message}`,
      { error: error.stack, usuarioId: req.usuario?.id }
    );
    next(error);
  }
};
