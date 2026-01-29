import axios from "axios";
import env from "../config/environment.js";
import db from "../models/index.js";
import logger from "../utils/logger.js";
import { getTodayDate } from "../utils/dateHelper.js";

class MinerdService {
  constructor() {
    this.apiUrl = env.minerd.apiUrl;
    this.apiKey = env.minerd.apiKey;
    this.centroId = env.minerd.centroId;
  }

  /**
   * Preparar datos para enviar al Minerd
   */
  async prepararDatos(fecha = null) {
    try {
      fecha = fecha || getTodayDate();

      logger.info(`📊 Preparando datos del Minerd para ${fecha}...`);

      // ============================================
      // ESTUDIANTES
      // ============================================
      const asistenciasEstudiantes = await db.AsistenciaEstudiante.findAll({
        where: { fecha },
        attributes: [
          "estado",
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
        ],
        group: ["estado"],
        raw: true,
      });

      const totalEstudiantes = await db.Estudiante.count({
        where: { activo: true },
      });

      const estudiantes = {
        total: totalEstudiantes,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
      };

      asistenciasEstudiantes.forEach((item) => {
        estudiantes[item.estado + "s"] = parseInt(item.count);
      });

      // ============================================
      // PERSONAL POR CATEGORÍA
      // ============================================
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

      const personalPorCategoria = {
        docente_aula: { total: 0, presentes: 0, ausentes: 0 },
        directivo: { total: 0, presentes: 0, ausentes: 0 },
        administrativo: { total: 0, presentes: 0, ausentes: 0 },
      };

      // Contar totales por categoría
      const personalActivo = await db.Usuario.findAll({
        where: { activo: true },
        attributes: ["categoria_personal"],
      });

      personalActivo.forEach((usuario) => {
        if (
          usuario.categoria_personal &&
          personalPorCategoria[usuario.categoria_personal]
        ) {
          personalPorCategoria[usuario.categoria_personal].total++;
        }
      });

      // Contar presentes y ausentes
      asistenciasPersonal.forEach((asistencia) => {
        const categoria = asistencia.usuario.categoria_personal;
        if (categoria && personalPorCategoria[categoria]) {
          if (
            asistencia.estado === "presente" ||
            asistencia.estado === "tardanza"
          ) {
            personalPorCategoria[categoria].presentes++;
          } else {
            personalPorCategoria[categoria].ausentes++;
          }
        }
      });

      // Formato final para Minerd
      const datosMinerd = {
        centro_id: this.centroId,
        fecha,
        estudiantes: {
          total: estudiantes.total,
          presentes: estudiantes.presentes,
          ausentes: estudiantes.ausentes,
          tardanzas: estudiantes.tardanzas,
          justificados: estudiantes.justificados,
        },
        personal: {
          docente_aula: {
            total: personalPorCategoria.docente_aula.total,
            presentes: personalPorCategoria.docente_aula.presentes,
            ausentes: personalPorCategoria.docente_aula.ausentes,
          },
          personal_directivo: {
            total: personalPorCategoria.directivo.total,
            presentes: personalPorCategoria.directivo.presentes,
            ausentes: personalPorCategoria.directivo.ausentes,
          },
          personal_administrativo: {
            total: personalPorCategoria.administrativo.total,
            presentes: personalPorCategoria.administrativo.presentes,
            ausentes: personalPorCategoria.administrativo.ausentes,
          },
        },
      };

      logger.info("✅ Datos preparados para Minerd");

      return datosMinerd;
    } catch (error) {
      logger.error("❌ Error al preparar datos del Minerd:", error);
      throw error;
    }
  }

  /**
   * Enviar datos al Minerd
   */
  async enviar(datos) {
    try {
      logger.info("📤 Enviando datos al Minerd...");

      // TODO: Implementar la llamada real a la API del Minerd
      // Por ahora, simulamos el envío

      const response = await axios.post(`${this.apiUrl}/asistencia`, datos, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 30000,
      });

      logger.info("✅ Datos enviados exitosamente al Minerd");

      return {
        exitoso: true,
        respuesta: response.data,
        codigo_estado: response.status,
      };
    } catch (error) {
      logger.error("❌ Error al enviar datos al Minerd:", error.message);

      return {
        exitoso: false,
        error: error.message,
        codigo_estado: error.response?.status || 500,
      };
    }
  }

  /**
   * Proceso completo: preparar y enviar
   */
  async prepararYEnviar(fecha = null) {
    const datos = await this.prepararDatos(fecha);
    const resultado = await this.enviar(datos);

    return {
      datos,
      ...resultado,
    };
  }
}

// Exportar instancia singleton
const minerdService = new MinerdService();
export default minerdService;
