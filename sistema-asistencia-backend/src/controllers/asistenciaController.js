import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";
import { getTodayDate } from "../utils/dateHelper.js";
import {
  estaDentroHorarioAsistencia,
  estaDentroHorarioModificacion,
  obtenerMensajeHorario,
} from "../utils/horarioHelper.js";
import notificacionService from "../services/notificacionService.js";
import { ROLES } from "../config/constants.js";

// Obtener grados asignados al docente actual
export const misGrados = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    // Obtener grados asignados
    const asignaciones = await db.AsignacionDocenteGrado.findAll({
      where: {
        docente_id: req.usuario.id,
        año_escolar: añoEscolar,
        activo: true,
      },
      include: [
        {
          model: db.Grado,
          as: "grado",
          where: { activo: true },
          include: [
            {
              model: db.Estudiante,
              as: "estudiantes",
              where: { activo: true },
              required: false,
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    // Verificar si cada grado tiene asistencia completada para la fecha
    const gradosConEstado = await Promise.all(
      asignaciones.map(async (asignacion) => {
        const registro = await db.RegistroAsistenciaGrado.findOne({
          where: {
            grado_id: asignacion.grado.id,
            fecha,
          },
        });

        return {
          id: asignacion.grado.id,
          nombre: asignacion.grado.nombre,
          nivel: asignacion.grado.nivel,
          seccion: asignacion.grado.seccion,
          total_estudiantes: asignacion.grado.estudiantes
            ? asignacion.grado.estudiantes.length
            : 0,
          asistencia_completada: registro ? registro.completada : false,
          hora_completada: registro ? registro.hora_completada : null,
          puede_modificar: await estaDentroHorarioModificacion(),
        };
      })
    );

    // Obtener horarios
    const horarios = await obtenerMensajeHorario();

    return successResponse(res, {
      fecha,
      grados: gradosConEstado,
      horarios,
      dentro_horario_asistencia: await estaDentroHorarioAsistencia(),
      dentro_horario_modificacion: await estaDentroHorarioModificacion(),
    });
  } catch (error) {
    next(error);
  }
};

// Obtener lista de estudiantes del grado para tomar asistencia
export const obtenerListaEstudiantes = async (req, res, next) => {
  try {
    const { gradoId } = req.params;
    const fecha = req.query.fecha || getTodayDate();

    // Verificar que el grado existe y el docente tiene acceso
    const grado = await db.Grado.findByPk(gradoId, {
      include: [
        {
          model: db.Usuario,
          as: "docentes",
          through: {
            where: { activo: true },
          },
          attributes: ["id"],
        },
      ],
    });

    if (!grado) {
      return errorResponse(res, "Grado no encontrado", 404);
    }

    // Verificar permiso (admin, dirección, o docente asignado)
    const esAdmin = req.usuario.rol === ROLES.ADMIN;
    const esDireccion = req.usuario.rol === ROLES.DIRECCION;
    const esDocenteAsignado = grado.docentes.some(
      (d) => d.id === req.usuario.id
    );

    if (!esAdmin && !esDireccion && !esDocenteAsignado) {
      return errorResponse(
        res,
        "No tienes permiso para tomar asistencia en este grado",
        403
      );
    }

    // Obtener estudiantes del grado
    const estudiantes = await db.Estudiante.findAll({
      where: {
        grado_id: gradoId,
        activo: true,
      },
      attributes: [
        "id",
        "nombre",
        "nombre2",
        "apellido",
        "apellido2",
        "fecha_nacimiento",
      ],
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });

    // Obtener asistencias ya registradas para esta fecha
    const asistenciasRegistradas = await db.AsistenciaEstudiante.findAll({
      where: {
        grado_id: gradoId,
        fecha,
      },
    });

    // Mapear asistencias a los estudiantes
    const estudiantesConAsistencia = estudiantes.map((estudiante) => {
      const asistencia = asistenciasRegistradas.find(
        (a) => a.estudiante_id === estudiante.id
      );

      return {
        id: estudiante.id,
        nombre_completo: estudiante.getNombreCompleto(),
        nombre: estudiante.nombre,
        nombre2: estudiante.nombre2,
        apellido: estudiante.apellido,
        apellido2: estudiante.apellido2,
        fecha_nacimiento: estudiante.fecha_nacimiento,
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

    // Verificar si la asistencia ya fue completada
    const registro = await db.RegistroAsistenciaGrado.findOne({
      where: {
        grado_id: gradoId,
        fecha,
      },
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
      total_estudiantes: estudiantes.length,
      asistencia_completada: registro ? registro.completada : false,
      hora_completada: registro ? registro.hora_completada : null,
      puede_modificar: await estaDentroHorarioModificacion(),
      dentro_horario_asistencia: await estaDentroHorarioAsistencia(),
    });
  } catch (error) {
    next(error);
  }
};

// Tomar/Guardar asistencia de un grado
export const tomarAsistencia = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { gradoId } = req.params;
    const { asistencias, fecha: fechaParam } = req.body;
    const fecha = fechaParam || getTodayDate();

    // Verificar que el grado existe
    const grado = await db.Grado.findByPk(gradoId);

    if (!grado) {
      await transaction.rollback();
      return errorResponse(res, "Grado no encontrado", 404);
    }

    // Verificar permisos
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );
    const asignacion = await db.AsignacionDocenteGrado.findOne({
      where: {
        docente_id: req.usuario.id,
        grado_id: gradoId,
        año_escolar: añoEscolar,
        activo: true,
      },
    });

    const esAdmin = req.usuario.rol === ROLES.ADMIN;
    const esDireccion = req.usuario.rol === ROLES.DIRECCION;

    if (!esAdmin && !esDireccion && !asignacion) {
      await transaction.rollback();
      return errorResponse(
        res,
        "No tienes permiso para tomar asistencia en este grado",
        403
      );
    }

    // Verificar horario (solo para docentes, admin y dirección pueden siempre)
    if (!esAdmin && !esDireccion) {
      const dentroHorario = await estaDentroHorarioAsistencia();
      if (!dentroHorario) {
        await transaction.rollback();
        const horarios = await obtenerMensajeHorario();
        return errorResponse(
          res,
          `Fuera del horario de toma de asistencia. Horario permitido: ${horarios.inicio} - ${horarios.limite}`,
          400
        );
      }
    }

    // Procesar cada asistencia
    const asistenciasGuardadas = [];

    for (const asistenciaData of asistencias) {
      const { estudiante_id, estado, observaciones } = asistenciaData;

      // Verificar que el estudiante existe y pertenece al grado
      const estudiante = await db.Estudiante.findOne({
        where: {
          id: estudiante_id,
          grado_id: gradoId,
          activo: true,
        },
      });

      if (!estudiante) {
        await transaction.rollback();
        return errorResponse(
          res,
          `Estudiante con ID ${estudiante_id} no encontrado en este grado`,
          404
        );
      }

      // Buscar si ya existe un registro de asistencia
      let asistencia = await db.AsistenciaEstudiante.findOne({
        where: {
          estudiante_id,
          fecha,
        },
        transaction,
      });

      if (asistencia) {
        // Actualizar asistencia existente
        await asistencia.update(
          {
            estado,
            grado_id: gradoId,
            docente_id: req.usuario.id,
            modificado: true,
            modificado_por: req.usuario.id,
            hora_modificacion: new Date(),
            observaciones: observaciones || asistencia.observaciones,
          },
          { transaction }
        );
      } else {
        // Crear nueva asistencia
        asistencia = await db.AsistenciaEstudiante.create(
          {
            estudiante_id,
            grado_id: gradoId,
            docente_id: req.usuario.id,
            fecha,
            estado,
            observaciones,
            modificado: false,
          },
          { transaction }
        );
      }

      asistenciasGuardadas.push(asistencia);
    }

    // Marcar el grado como completado
    const [registro] = await db.RegistroAsistenciaGrado.findOrCreate({
      where: {
        grado_id: gradoId,
        fecha,
      },
      defaults: {
        docente_id: req.usuario.id,
        completada: true,
        hora_completada: new Date(),
      },
      transaction,
    });

    if (!registro.completada) {
      await registro.update(
        {
          docente_id: req.usuario.id,
          completada: true,
          hora_completada: new Date(),
        },
        { transaction }
      );
    }

    // Commit transaction
    await transaction.commit();

    // Notificar a dirección (asíncrono, no bloqueante)
    notificacionService
      .notificarDireccionGradoCompletado(
        grado.id,
        grado.nombre,
        `${req.usuario.nombre} ${req.usuario.apellido}`
      )
      .catch((err) => logger.error("Error al notificar dirección:", err));

    // Verificar si todos los grados completaron asistencia
    verificarTodosGradosCompletados(fecha).catch((err) =>
      logger.error("Error al verificar grados completados:", err)
    );

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "tomar_asistencia",
      tablaAfectada: "asistencia_estudiantes",
      datosNuevos: {
        grado_id: gradoId,
        fecha,
        total_asistencias: asistenciasGuardadas.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} tomó asistencia del grado ${grado.nombre} - ${asistenciasGuardadas.length} estudiantes`
    );

    return successResponse(
      res,
      {
        grado: {
          id: grado.id,
          nombre: grado.nombre,
        },
        fecha,
        total_asistencias: asistenciasGuardadas.length,
        completada: true,
        hora_completada: registro.hora_completada,
      },
      "Asistencia guardada exitosamente"
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Función auxiliar para verificar si todos los grados completaron
const verificarTodosGradosCompletados = async (fecha) => {
  const añoEscolar = await db.ConfiguracionSistema.getValor(
    "año_escolar_actual"
  );

  // Total de grados activos
  const totalGrados = await db.Grado.count({
    where: {
      activo: true,
      año_escolar: añoEscolar,
    },
  });

  // Grados con asistencia completada
  const gradosCompletados = await db.RegistroAsistenciaGrado.count({
    where: {
      fecha,
      completada: true,
    },
  });

  // Si todos completaron, notificar
  if (totalGrados > 0 && gradosCompletados === totalGrados) {
    await notificacionService.notificarDireccionTodosCompletados(fecha);
  }
};

// Registrar asistencia personal
export const registrarAsistenciaPersonal = async (req, res, next) => {
  try {
    const { fecha: fechaParam, estado, observaciones } = req.body;
    const fecha = fechaParam || getTodayDate();

    // Buscar si ya existe registro
    let asistencia = await db.AsistenciaPersonal.findOne({
      where: {
        usuario_id: req.usuario.id,
        fecha,
      },
    });

    if (asistencia) {
      // Actualizar existente
      await asistencia.update({ estado, observaciones });
    } else {
      // Crear nuevo
      asistencia = await db.AsistenciaPersonal.create({
        usuario_id: req.usuario.id,
        fecha,
        estado,
        registrado_por: req.usuario.id,
        observaciones,
      });
    }

    logger.info(
      `Usuario ${req.usuario.email} registró su asistencia personal: ${estado}`
    );

    return successResponse(res, asistencia, "Asistencia personal registrada");
  } catch (error) {
    next(error);
  }
};

// Obtener asistencia personal del día
export const miAsistenciaPersonal = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();

    const asistencia = await db.AsistenciaPersonal.findOne({
      where: {
        usuario_id: req.usuario.id,
        fecha,
      },
    });

    return successResponse(res, {
      fecha,
      asistencia: asistencia || null,
      registrada: !!asistencia,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener historial de asistencias tomadas por el docente
export const miHistorial = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;

    const registros = await db.RegistroAsistenciaGrado.findAll({
      where: {
        docente_id: req.usuario.id,
        completada: true,
      },
      include: [
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
      limit: parseInt(limit),
      order: [["fecha", "DESC"]],
    });

    return successResponse(res, registros, "Historial obtenido");
  } catch (error) {
    next(error);
  }
};

export default {
  misGrados,
  obtenerListaEstudiantes,
  tomarAsistencia,
  registrarAsistenciaPersonal,
  miAsistenciaPersonal,
  miHistorial,
};
