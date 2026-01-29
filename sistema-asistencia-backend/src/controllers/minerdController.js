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

    // Verificar si ya se envió
    const envioExistente = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "enviado",
      },
    });

    // Verificar si ya existe un envío preparado (pendiente)
    const envioPreparado = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "pendiente",
      },
      include: [
        {
          model: db.Usuario,
          as: "usuarioEnvio",
          attributes: ["id", "nombres", "primer_apellido", "segundo_apellido", "email"],
        },
      ],
    });

    // 🔹 FLAGS DE CONTROL
    const puede_enviar = gradosCompletados >= totalGrados && !envioExistente;
    const ya_enviado = !!envioExistente;
    const tiene_envio_preparado = !!envioPreparado;
    let mensaje = "";

    if (ya_enviado) {
      mensaje = "Los datos de este día ya fueron enviados al MINERD";
    } else if (tiene_envio_preparado) {
      mensaje = "Ya existe un envío preparado para esta fecha. Puede confirmarlo o cancelarlo.";
    } else if (gradosCompletados < totalGrados) {
      mensaje = `No se puede enviar. ${totalGrados - gradosCompletados} grado(s) aún no han completado la asistencia`;
    } else if (puede_enviar) {
      mensaje = "Todos los grados completados. Listo para enviar al MINERD";
    }

    // Preparar datos (solo si no hay envío preparado, para ahorrar recursos)
    const datos = tiene_envio_preparado
      ? envioPreparado.datos_json
      : await minerdService.prepararDatos(fecha);

    return successResponse(
      res,
      {
        fecha,
        datos,
        puede_enviar,
        ya_enviado,
        tiene_envio_preparado,
        envio_preparado: envioPreparado ? {
          id: envioPreparado.id,
          fecha: envioPreparado.fecha,
          creado_en: envioPreparado.createdAt,
          usuario: envioPreparado.usuarioEnvio,
        } : null,
        mensaje,
        // INFO ADICIONAL
        grados_completados: gradosCompletados,
        total_grados: totalGrados,
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

    // Verificar si ya existe un envío preparado (pendiente) para esta fecha
    const envioPreparado = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "pendiente",
      },
    });

    if (envioPreparado) {
      return errorResponse(
        res,
        "Ya existe un envío preparado para esta fecha. Debe confirmarlo o eliminarlo antes de crear uno nuevo.",
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
    logger.info(
      `Usuario ${req.usuario.email} confirmó envío al Minerd para ${envio_id}`
    );

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

// Cancelar un envío pendiente
export const cancelarEnvio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const envio = await db.EnvioMinerd.findByPk(id);

    if (!envio) {
      return errorResponse(res, "Envío no encontrado", 404);
    }

    if (envio.estado !== "pendiente") {
      return errorResponse(
        res,
        `No se puede cancelar un envío en estado "${envio.estado}". Solo se pueden cancelar envíos pendientes.`,
        400
      );
    }

    await envio.destroy();

    logger.info(
      `Usuario ${req.usuario.email} canceló envío pendiente ID: ${id} para fecha ${envio.fecha}`
    );

    return successResponse(
      res,
      { fecha: envio.fecha },
      "Envío pendiente cancelado exitosamente"
    );
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
  cancelarEnvio,
};
