import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";
import { getTodayDate, formatDate } from "../utils/dateHelper.js";

// Reporte de asistencia diaria
export const asistenciaDiaria = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || getTodayDate();

    // Asistencias de estudiantes
    const asistenciasEstudiantes = await db.AsistenciaEstudiante.findAll({
      where: { fecha },
      include: [
        {
          model: db.Estudiante,
          as: "estudiante",
          attributes: ["id", "nombre", "nombre2", "apellido", "apellido2"],
        },
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
      order: [
        [{ model: db.Grado, as: "grado" }, "nombre", "ASC"],
        [{ model: db.Estudiante, as: "estudiante" }, "apellido", "ASC"],
      ],
    });

    // Resumen
    const resumen = {
      total: asistenciasEstudiantes.length,
      presentes: asistenciasEstudiantes.filter((a) => a.estado === "presente")
        .length,
      ausentes: asistenciasEstudiantes.filter((a) => a.estado === "ausente")
        .length,
      tardanzas: asistenciasEstudiantes.filter((a) => a.estado === "tardanza")
        .length,
      justificados: asistenciasEstudiantes.filter(
        (a) => a.estado === "justificado"
      ).length,
    };

    return successResponse(res, {
      fecha,
      resumen,
      asistencias: asistenciasEstudiantes,
    });
  } catch (error) {
    next(error);
  }
};

// Reporte por rango de fechas
export const asistenciaPorRango = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin, grado_id, estudiante_id } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return errorResponse(res, "fecha_inicio y fecha_fin son requeridas", 400);
    }

    const whereClause = {
      fecha: {
        [Op.between]: [fecha_inicio, fecha_fin],
      },
    };

    if (grado_id) {
      whereClause.grado_id = grado_id;
    }

    if (estudiante_id) {
      whereClause.estudiante_id = estudiante_id;
    }

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: whereClause,
      include: [
        {
          model: db.Estudiante,
          as: "estudiante",
          attributes: ["id", "nombre", "nombre2", "apellido", "apellido2"],
        },
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
      order: [
        ["fecha", "DESC"],
        [{ model: db.Grado, as: "grado" }, "nombre", "ASC"],
      ],
    });

    // Estadísticas
    const estadisticas = {
      total_registros: asistencias.length,
      presentes: asistencias.filter((a) => a.estado === "presente").length,
      ausentes: asistencias.filter((a) => a.estado === "ausente").length,
      tardanzas: asistencias.filter((a) => a.estado === "tardanza").length,
      justificados: asistencias.filter((a) => a.estado === "justificado")
        .length,
    };

    return successResponse(res, {
      fecha_inicio,
      fecha_fin,
      estadisticas,
      asistencias,
    });
  } catch (error) {
    next(error);
  }
};

// Estadísticas generales
export const estadisticasGenerales = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    // Totales
    const totalEstudiantes = await db.Estudiante.count({
      where: { activo: true },
    });
    const totalGrados = await db.Grado.count({
      where: { activo: true, año_escolar: añoEscolar },
    });
    const totalDocentes = await db.Usuario.count({
      where: { rol: "docente_aula", activo: true },
    });

    // Asistencias en el rango
    const whereAsistencia = {};
    if (fecha_inicio && fecha_fin) {
      whereAsistencia.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    }

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: whereAsistencia,
      attributes: [
        "fecha",
        "estado",
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      group: ["fecha", "estado"],
      order: [["fecha", "DESC"]],
      raw: true,
    });

    // Agrupar por fecha
    const asistenciasPorFecha = {};
    asistencias.forEach((item) => {
      if (!asistenciasPorFecha[item.fecha]) {
        asistenciasPorFecha[item.fecha] = {
          fecha: item.fecha,
          presentes: 0,
          ausentes: 0,
          tardanzas: 0,
          justificados: 0,
        };
      }
      asistenciasPorFecha[item.fecha][item.estado + "s"] = parseInt(item.count);
    });

    // Promedio de asistencia
    const fechas = Object.values(asistenciasPorFecha);
    const promedioPresentes =
      fechas.length > 0
        ? Math.round(
            fechas.reduce((sum, f) => sum + f.presentes, 0) / fechas.length
          )
        : 0;

    return successResponse(res, {
      totales: {
        estudiantes: totalEstudiantes,
        grados: totalGrados,
        docentes: totalDocentes,
      },
      periodo: {
        fecha_inicio: fecha_inicio || "N/A",
        fecha_fin: fecha_fin || "N/A",
      },
      promedio_presentes: promedioPresentes,
      asistencias_por_fecha: Object.values(asistenciasPorFecha),
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de un estudiante específico
export const reporteEstudiante = async (req, res, next) => {
  try {
    const { estudianteId } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    const estudiante = await db.Estudiante.findByPk(estudianteId, {
      include: [
        {
          model: db.Grado,
          as: "grado",
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
    });

    if (!estudiante) {
      return errorResponse(res, "Estudiante no encontrado", 404);
    }

    const whereAsistencia = { estudiante_id: estudianteId };
    if (fecha_inicio && fecha_fin) {
      whereAsistencia.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    }

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: whereAsistencia,
      order: [["fecha", "DESC"]],
      limit: 100,
    });

    const estadisticas = {
      total_dias: asistencias.length,
      presentes: asistencias.filter((a) => a.estado === "presente").length,
      ausentes: asistencias.filter((a) => a.estado === "ausente").length,
      tardanzas: asistencias.filter((a) => a.estado === "tardanza").length,
      justificados: asistencias.filter((a) => a.estado === "justificado")
        .length,
    };

    if (asistencias.length > 0) {
      estadisticas.porcentaje_asistencia = Math.round(
        ((estadisticas.presentes + estadisticas.tardanzas) /
          asistencias.length) *
          100
      );
    } else {
      estadisticas.porcentaje_asistencia = 0;
    }

    return successResponse(res, {
      estudiante: {
        id: estudiante.id,
        nombre_completo: estudiante.getNombreCompleto(),
        grado: estudiante.grado,
      },
      periodo: {
        fecha_inicio: fecha_inicio || "N/A",
        fecha_fin: fecha_fin || "N/A",
      },
      estadisticas,
      asistencias,
    });
  } catch (error) {
    next(error);
  }
};

// Reporte de un grado específico
export const reporteGrado = async (req, res, next) => {
  try {
    const { gradoId } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    const grado = await db.Grado.findByPk(gradoId);

    if (!grado) {
      return errorResponse(res, "Grado no encontrado", 404);
    }

    const whereAsistencia = { grado_id: gradoId };
    if (fecha_inicio && fecha_fin) {
      whereAsistencia.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    }

    const asistencias = await db.AsistenciaEstudiante.findAll({
      where: whereAsistencia,
      include: [
        {
          model: db.Estudiante,
          as: "estudiante",
          attributes: ["id", "nombre", "nombre2", "apellido", "apellido2"],
        },
      ],
      order: [["fecha", "DESC"]],
    });

    // Estadísticas por estudiante
    const estudianteStats = {};
    asistencias.forEach((a) => {
      const estudianteId = a.estudiante_id;
      if (!estudianteStats[estudianteId]) {
        estudianteStats[estudianteId] = {
          estudiante: a.estudiante,
          total: 0,
          presentes: 0,
          ausentes: 0,
          tardanzas: 0,
          justificados: 0,
        };
      }
      estudianteStats[estudianteId].total++;
      estudianteStats[estudianteId][a.estado + "s"]++;
    });

    // Calcular porcentajes
    Object.values(estudianteStats).forEach((stat) => {
      stat.porcentaje_asistencia =
        stat.total > 0
          ? Math.round(((stat.presentes + stat.tardanzas) / stat.total) * 100)
          : 0;
    });

    return successResponse(res, {
      grado: {
        id: grado.id,
        nombre: grado.nombre,
        nivel: grado.nivel,
        seccion: grado.seccion,
      },
      periodo: {
        fecha_inicio: fecha_inicio || "N/A",
        fecha_fin: fecha_fin || "N/A",
      },
      estadisticas_por_estudiante: Object.values(estudianteStats),
      total_registros: asistencias.length,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  asistenciaDiaria,
  asistenciaPorRango,
  estadisticasGenerales,
  reporteEstudiante,
  reporteGrado,
};
