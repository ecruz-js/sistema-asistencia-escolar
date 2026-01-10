import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import minerdService from "../services/minerdService.js";
import logger from "../utils/logger.js";
import { getTodayDate } from "../utils/dateHelper.js";

// Obtener resumen para envío (vista previa)
export const obtenerResumen = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();

    // Verificar que todos los grados hayan completado
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    const totalGrados = await db.Grado.count({
      where: {
        activo: true,
        año_escolar: añoEscolar,
      },
    });

    const gradosCompletados = await db.RegistroAsistenciaGrado.count({
      where: {
        fecha,
        completada: true,
      },
    });

    if (gradosCompletados < totalGrados) {
      return errorResponse(
        res,
        `No se puede preparar el envío. ${
          totalGrados - gradosCompletados
        } grados aún no han completado la asistencia`,
        400
      );
    }

    // Verificar si ya se envió
    const envioExistente = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "enviado",
      },
    });

    if (envioExistente) {
      return errorResponse(
        res,
        "Los datos de este día ya fueron enviados al Minerd",
        400
      );
    }

    // Preparar datos
    const datos = await minerdService.prepararDatos(fecha);

    return successResponse(
      res,
      {
        fecha,
        datos,
        advertencia: "Este es un resumen. Aún no se ha enviado al Minerd.",
      },
      "Resumen preparado"
    );
  } catch (error) {
    next(error);
  }
};

// Primera confirmación (preparar envío)
export const prepararEnvio = async (req, res, next) => {
  try {
    const { fecha: fechaParam } = req.body;
    const fecha = fechaParam || getTodayDate();

    // Verificar que todos los grados hayan completado
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    const totalGrados = await db.Grado.count({
      where: {
        activo: true,
        año_escolar: añoEscolar,
      },
    });

    const gradosCompletados = await db.RegistroAsistenciaGrado.count({
      where: {
        fecha,
        completada: true,
      },
    });

    if (gradosCompletados < totalGrados) {
      return errorResponse(
        res,
        `No todos los grados han completado la asistencia. Completados: ${gradosCompletados}/${totalGrados}`,
        400
      );
    }

    // Verificar si ya se envió
    const envioExistente = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "enviado",
      },
    });

    if (envioExistente) {
      return errorResponse(
        res,
        "Los datos de este día ya fueron enviados al Minerd",
        400
      );
    }

    // Preparar datos
    const datos = await minerdService.prepararDatos(fecha);

    // Crear registro en estado pendiente
    const envio = await db.EnvioMinerd.create({
      fecha,
      datos_json: datos,
      usuario_envio_id: req.usuario.id,
      estado: "pendiente",
    });

    logger.info(
      `Usuario ${req.usuario.email} preparó envío al Minerd para ${fecha}`
    );

    return successResponse(
      res,
      {
        envio_id: envio.id,
        fecha,
        datos,
        mensaje: "Envío preparado. Requiere segunda confirmación para enviar.",
      },
      "Envío preparado - Primera confirmación completada"
    );
  } catch (error) {
    next(error);
  }
};

// Segunda confirmación (enviar al Minerd)
export const confirmarYEnviar = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { envio_id } = req.body;

    if (!envio_id) {
      await transaction.rollback();
      return errorResponse(res, "envio_id es requerido", 400);
    }

    // Buscar el envío pendiente
    const envio = await db.EnvioMinerd.findByPk(envio_id, { transaction });

    if (!envio) {
      await transaction.rollback();
      return errorResponse(res, "Envío no encontrado", 404);
    }

    if (envio.estado === "enviado") {
      await transaction.rollback();
      return errorResponse(res, "Este envío ya fue enviado al Minerd", 400);
    }

    // Enviar al Minerd
    logger.info(
      `📤 Enviando al Minerd - Usuario: ${req.usuario.email}, Fecha: ${envio.fecha}`
    );

    const resultado = await minerdService.enviar(envio.datos_json);

    // Actualizar registro
    await envio.update(
      {
        confirmado_por_id: req.usuario.id,
        hora_confirmacion: new Date(),
        estado: resultado.exitoso ? "enviado" : "error",
        respuesta_minerd: resultado,
      },
      { transaction }
    );

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "enviar_minerd",
      tablaAfectada: "envios_minerd",
      registroId: envio.id,
      datosNuevos: {
        fecha: envio.fecha,
        exitoso: resultado.exitoso,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    await transaction.commit();

    if (resultado.exitoso) {
      logger.info(`✅ Envío al Minerd exitoso - Fecha: ${envio.fecha}`);
      return successResponse(
        res,
        {
          envio,
          resultado,
        },
        "Datos enviados exitosamente al Minerd"
      );
    } else {
      logger.error(
        `❌ Error al enviar al Minerd - Fecha: ${envio.fecha}`,
        resultado.error
      );
      return errorResponse(
        res,
        `Error al enviar al Minerd: ${resultado.error}`,
        500
      );
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Obtener historial de envíos
export const obtenerHistorial = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await db.EnvioMinerd.findAndCountAll({
      include: [
        {
          model: db.Usuario,
          as: "usuarioEnvio",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: db.Usuario,
          as: "confirmadoPor",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
      limit: parseInt(pageSize),
      offset,
      order: [["fecha", "DESC"]],
    });

    return successResponse(res, {
      envios: rows,
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

// Obtener detalle de un envío
export const obtenerDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const envio = await db.EnvioMinerd.findByPk(id, {
      include: [
        {
          model: db.Usuario,
          as: "usuarioEnvio",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: db.Usuario,
          as: "confirmadoPor",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
    });

    if (!envio) {
      return errorResponse(res, "Envío no encontrado", 404);
    }

    return successResponse(res, envio);
  } catch (error) {
    next(error);
  }
};

export default {
  obtenerResumen,
  prepararEnvio,
  confirmarYEnviar,
  obtenerHistorial,
  obtenerDetalle,
};
