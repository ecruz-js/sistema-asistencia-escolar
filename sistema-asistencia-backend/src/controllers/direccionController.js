import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";
import { getTodayDate } from "../utils/dateHelper.js";
import notificacionService from "../services/notificacionService.js";
import { ESTADOS_ASISTENCIA } from "../config/constants.js";

// Dashboard principal de dirección
export const dashboard = async (req, res, next) => {
  try {
    logger.info(
      `Usuario ${req.usuario.email} accediendo al dashboard de dirección`
    );
    const fecha = req.query.fecha || getTodayDate();
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    // ============================================
    // RESUMEN DE ESTUDIANTES
    // ============================================
    const totalEstudiantes = await db.Estudiante.count({
      where: { activo: true },
    });

    const asistenciasEstudiantes = await db.AsistenciaEstudiante.findAll({
      where: { fecha },
      attributes: [
        "estado",
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      group: ["estado"],
      raw: true,
    });

    const resumenEstudiantes = {
      total: totalEstudiantes,
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificados: 0,
      sin_registrar: totalEstudiantes,
    };

    asistenciasEstudiantes.forEach((item) => {
      resumenEstudiantes[item.estado + "s"] = parseInt(item.count);
      resumenEstudiantes.sin_registrar -= parseInt(item.count);
    });

    // ============================================
    // RESUMEN DE PERSONAL
    // ============================================
    const personalActivo = await db.Usuario.findAll({
      where: { activo: true },
      attributes: ["id", "categoria_personal"],
    });

    const asistenciasPersonal = await db.AsistenciaPersonal.findAll({
      where: { fecha },
      include: [
        {
          model: db.Usuario,
          as: "usuario",
          attributes: ["categoria_personal"],
        },
      ],
    });

    const resumenPersonal = {
      docente_aula: {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
      },
      directivo: {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
      },
      administrativo: {
        total: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
      },
    };

    // Contar totales por categoría
    personalActivo.forEach((usuario) => {
      if (
        usuario.categoria_personal &&
        resumenPersonal[usuario.categoria_personal]
      ) {
        resumenPersonal[usuario.categoria_personal].total++;
      }
    });

    // Contar asistencias por categoría y estado
    asistenciasPersonal.forEach((asistencia) => {
      const categoria = asistencia.usuario.categoria_personal;
      if (categoria && resumenPersonal[categoria]) {
        resumenPersonal[categoria][asistencia.estado + "s"]++;
      }
    });

    // ============================================
    // PROGRESO DE GRADOS
    // ============================================
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

    const progresoGrados = {
      total: totalGrados,
      completados: gradosCompletados,
      pendientes: totalGrados - gradosCompletados,
      porcentaje:
        totalGrados > 0
          ? Math.round((gradosCompletados / totalGrados) * 100)
          : 0,
    };

    // ============================================
    // GRADOS PENDIENTES (detalle)
    // ============================================
    // const gradosPendientes = await db.Grado.findAll({
    //   where: {
    //     activo: true,
    //     año_escolar: añoEscolar,
    //   },
    //   include: [
    //     {
    //       model: db.Usuario,
    //       as: "docentes",
    //       through: {
    //         where: { activo: true },
    //       },
    //       attributes: ["id", "nombre", "apellido", "email"],
    //     },
    //     {
    //       model: db.RegistroAsistenciaGrado,
    //       as: "registrosAsistencia",
    //       where: {
    //         fecha,
    //         completada: false,
    //       },
    //       required: false,
    //     },
    //   ],
    // });

    // const gradosPendientesDetalle = gradosPendientes
    //   .filter((grado) => {
    //     // Verificar si NO tiene registro completado
    //     const registro =
    //       grado.registrosAsistencia && grado.registrosAsistencia.length > 0;
    //     return !registro;
    //   })
    //   .map((grado) => ({
    //     id: grado.id,
    //     nombre: grado.nombre,
    //     nivel: grado.nivel,
    //     seccion: grado.seccion,
    //     docentes: grado.docentes.map((d) => ({
    //       id: d.id,
    //       nombre: `${d.nombre} ${d.apellido}`,
    //       email: d.email,
    //     })),
    //   }));

    // ============================================
    // GRADOS COMPLETADOS (últimos 5)
    // ============================================
    // const gradosCompletadosRecientes = await db.RegistroAsistenciaGrado.findAll(
    //   {
    //     where: {
    //       fecha,
    //       completada: true,
    //     },
    //     include: [
    //       {
    //         model: db.Grado,
    //         as: "grado",
    //         attributes: ["id", "nombre", "nivel", "seccion"],
    //       },
    //       {
    //         model: db.Usuario,
    //         as: "docente",
    //         attributes: ["id", "nombre", "apellido"],
    //       },
    //     ],
    //     order: [["hora_completada", "DESC"]],
    //     limit: 5,
    //   }
    // );

    // ============================================
    // VERIFICAR SI SE PUEDE ENVIAR AL MINERD
    // ============================================
    const puedeEnviarMinerd =
      gradosCompletados === totalGrados && totalGrados > 0;

    // Verificar si ya se envió
    const envioExistente = await db.EnvioMinerd.findOne({
      where: {
        fecha,
        estado: "enviado",
      },
    });

    const yaEnviado = !!envioExistente;

    return successResponse(
      res,
      {
        fecha,
        estudiantes: resumenEstudiantes,
        personal: resumenPersonal,
        progreso_grados: progresoGrados,
        // grados_pendientes: gradosPendientesDetalle,
        // grados_completados_recientes: gradosCompletadosRecientes,
        puede_enviar_minerd: puedeEnviarMinerd && !yaEnviado,
        ya_enviado_minerd: yaEnviado,
        envio_minerd: envioExistente,
      },
      "Dashboard obtenido"
    );
  } catch (error) {
    next(error);
  }
};

// Obtener detalle de un grado específico
export const detalleGrado = async (req, res, next) => {
  try {
    const { gradoId } = req.params;
    const fecha = req.query.fecha || getTodayDate();

    const grado = await db.Grado.findByPk(gradoId);

    if (!grado) {
      return errorResponse(res, "Grado no encontrado", 404);
    }

    // Obtener estudiantes y sus asistencias
    const estudiantes = await db.Estudiante.findAll({
      where: {
        grado_id: gradoId,
        activo: true,
      },
      attributes: ["id", "nombre", "nombre2", "apellido", "apellido2"],
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: {
        grado_id: gradoId,
        fecha,
      },
    });

    const estudiantesConAsistencia = estudiantes.map((estudiante) => {
      const asistencia = asistencias.find(
        (a) => a.estudiante_id === estudiante.id
      );
      return {
        id: estudiante.id,
        nombre_completo: estudiante.getNombreCompleto(),
        asistencia: asistencia
          ? {
              estado: asistencia.estado,
              hora_registro: asistencia.hora_registro,
              modificado: asistencia.modificado,
              observaciones: asistencia.observaciones,
            }
          : null,
      };
    });

    // Registro de asistencia del grado
    const registro = await db.RegistroAsistenciaGrado.findOne({
      where: {
        grado_id: gradoId,
        fecha,
      },
      include: [
        {
          model: db.Usuario,
          as: "docente",
          attributes: ["id", "nombre", "apellido"],
        },
        {
          model: db.Usuario,
          as: "validadoPor",
          attributes: ["id", "nombre", "apellido"],
        },
      ],
    });

    return successResponse(res, {
      grado: {
        id: grado.id,
        nombre: grado.nombre,
        nivel: grado.nivel,
        seccion: grado.seccion,
      },
      fecha,
      estudiantes: estudiantesConAsistencia,
      registro,
      total_estudiantes: estudiantes.length,
      total_con_asistencia: asistencias.length,
    });
  } catch (error) {
    next(error);
  }
};

// Validar asistencia del día
export const validarAsistencia = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();

    // Obtener todos los registros de asistencia del día
    const registros = await db.RegistroAsistenciaGrado.findAll({
      where: { fecha },
    });

    // Marcar todos como validados
    for (const registro of registros) {
      await registro.update({
        validada: true,
        validada_por: req.usuario.id,
        hora_validacion: new Date(),
      });
    }

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "validar_asistencia_dia",
      datosNuevos: {
        fecha,
        registros_validados: registros.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} validó asistencia del día ${fecha}`
    );

    return successResponse(
      res,
      {
        fecha,
        registros_validados: registros.length,
      },
      "Asistencia validada exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

// Enviar recordatorio manual a docentes pendientes
export const enviarRecordatorio = async (req, res, next) => {
  try {
    const { docente_ids } = req.body;
    const fecha = getTodayDate();

    if (
      !docente_ids ||
      !Array.isArray(docente_ids) ||
      docente_ids.length === 0
    ) {
      return errorResponse(res, "Debe proporcionar IDs de docentes", 400);
    }

    // Obtener docentes
    const docentes = await db.Usuario.findAll({
      where: {
        id: { [Op.in]: docente_ids },
        rol: "docente_aula",
        activo: true,
      },
    });

    if (docentes.length === 0) {
      return errorResponse(res, "No se encontraron docentes válidos", 404);
    }

    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    // Obtener todos los grados activos
    const todosLosGrados = await db.Grado.findAll({
      where: {
        activo: true,
        año_escolar: añoEscolar,
      },
    });

    // Para cada docente, obtener todos los grados pendientes
    for (const docente of docentes) {
      const gradosPendientes = [];

      for (const grado of todosLosGrados) {
        const registro = await db.RegistroAsistenciaGrado.findOne({
          where: {
            grado_id: grado.id,
            fecha,
            completada: true,
          },
        });

        if (!registro) {
          gradosPendientes.push(grado);
        }
      }

      if (gradosPendientes.length > 0) {
        await notificacionService.notificarTomarAsistencia(
          docente.id,
          gradosPendientes,
          "alta"
        );
      }
    }

    logger.info(
      `Usuario ${req.usuario.email} envió recordatorios manuales a ${docentes.length} docentes`
    );

    return successResponse(
      res,
      {
        docentes_notificados: docentes.length,
      },
      "Recordatorios enviados exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

// Modificar asistencia (solo dirección y admin)
export const modificarAsistencia = async (req, res, next) => {
  try {
    const { estudiante_id, fecha, estado, observaciones } = req.body;

    if (!estudiante_id || !fecha || !estado) {
      return errorResponse(
        res,
        "estudiante_id, fecha y estado son requeridos",
        400
      );
    }

    // Buscar asistencia
    const asistencia = await db.AsistenciaEstudiante.findOne({
      where: {
        estudiante_id,
        fecha,
      },
    });

    if (!asistencia) {
      return errorResponse(res, "Registro de asistencia no encontrado", 404);
    }

    const datosAnteriores = asistencia.toJSON();

    // Actualizar
    await asistencia.update({
      estado,
      modificado: true,
      modificado_por: req.usuario.id,
      hora_modificacion: new Date(),
      observaciones: observaciones || asistencia.observaciones,
    });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "modificar_asistencia_estudiante",
      tablaAfectada: "asistencia_estudiantes",
      registroId: asistencia.id,
      datosAnteriores,
      datosNuevos: asistencia.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} modificó asistencia - Estudiante ID: ${estudiante_id}`
    );

    return successResponse(
      res,
      asistencia,
      "Asistencia modificada exitosamente"
    );
  } catch (error) {
    next(error);
  }
};

// Obtener lista de personal con asistencia
export const listaAsistenciaPersonal = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();

    const personal = await db.Usuario.findAll({
      where: { activo: true },
      attributes: [
        "id",
        "nombre",
        "apellido",
        "email",
        "rol",
        "categoria_personal",
      ],
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    const asistencias = await db.AsistenciaPersonal.findAll({
      where: { fecha },
    });

    const personalConAsistencia = personal.map((usuario) => {
      const asistencia = asistencias.find((a) => a.usuario_id === usuario.id);
      return {
        id: usuario.id,
        nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
        email: usuario.email,
        rol: usuario.rol,
        categoria_personal: usuario.categoria_personal,
        asistencia: asistencia
          ? {
              estado: asistencia.estado,
              hora_registro: asistencia.hora_registro,
              observaciones: asistencia.observaciones,
            }
          : null,
      };
    });

    return successResponse(res, {
      fecha,
      personal: personalConAsistencia,
      total: personal.length,
      con_asistencia: asistencias.length,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  dashboard,
  detalleGrado,
  validarAsistencia,
  enviarRecordatorio,
  modificarAsistencia,
  listaAsistenciaPersonal,
};
