import db from "../models/index.js";
import {
  TIPOS_NOTIFICACION,
  PRIORIDADES_NOTIFICACION,
} from "../config/constants.js";
import logger from "../utils/logger.js";

class NotificacionService {
  /**
   * Crear notificación
   */
  async crear({
    usuarioId,
    tipo,
    titulo,
    mensaje,
    prioridad = PRIORIDADES_NOTIFICACION.MEDIA,
    metadata = null,
  }) {
    try {
      const notificacion = await db.Notificacion.create({
        usuario_id: usuarioId,
        tipo,
        titulo,
        mensaje,
        prioridad,
        metadata,
        leida: false,
      });

      logger.info(`Notificación creada para usuario ${usuarioId}: ${titulo}`);
      return notificacion;
    } catch (error) {
      logger.error("Error al crear notificación:", error);
      throw error;
    }
  }

  /**
   * Crear notificaciones en masa
   */
  async crearMasivo(notificaciones) {
    try {
      const notificacionesCreadas = await db.Notificacion.bulkCreate(
        notificaciones.map((n) => ({
          usuario_id: n.usuarioId,
          tipo: n.tipo,
          titulo: n.titulo,
          mensaje: n.mensaje,
          prioridad: n.prioridad || PRIORIDADES_NOTIFICACION.MEDIA,
          metadata: n.metadata || null,
          leida: false,
        }))
      );

      logger.info(
        `${notificacionesCreadas.length} notificaciones creadas en masa`
      );
      return notificacionesCreadas;
    } catch (error) {
      logger.error("Error al crear notificaciones en masa:", error);
      throw error;
    }
  }

  /**
   * Notificar a docente para tomar asistencia
   */
  async notificarTomarAsistencia(
    docenteId,
    grados,
    prioridad = PRIORIDADES_NOTIFICACION.MEDIA
  ) {
    const gradosTexto = grados.map((g) => g.nombre).join(", ");

    return await this.crear({
      usuarioId: docenteId,
      tipo: TIPOS_NOTIFICACION.RECORDATORIO,
      titulo: "⏰ Recordatorio: Toma de asistencia",
      mensaje: `Es hora de tomar la asistencia de tus grados: ${gradosTexto}`,
      prioridad,
      metadata: {
        grados: grados.map((g) => g.id),
        accion: "tomar_asistencia",
      },
    });
  }

  /**
   * Notificar a dirección sobre grado completado
   */
  async notificarDireccionGradoCompletado(gradoId, gradoNombre, docenteNombre) {
    // Obtener usuarios de dirección
    const usuariosDireccion = await db.Usuario.findAll({
      where: {
        rol: ["direccion", "admin"],
        activo: true,
      },
      attributes: ["id"],
    });

    const notificaciones = usuariosDireccion.map((usuario) => ({
      usuarioId: usuario.id,
      tipo: TIPOS_NOTIFICACION.INFO,
      titulo: "✅ Asistencia completada",
      mensaje: `El usuario ${docenteNombre} completó la asistencia del grado ${gradoNombre}`,
      prioridad: PRIORIDADES_NOTIFICACION.BAJA,
      metadata: {
        grado_id: gradoId,
        accion: "grado_completado",
      },
    }));

    return await this.crearMasivo(notificaciones);
  }

  /**
   * Notificar a dirección sobre todos los grados completados
   */
  async notificarDireccionTodosCompletados(fecha) {
    const usuariosDireccion = await db.Usuario.findAll({
      where: {
        rol: ["direccion", "admin"],
        activo: true,
      },
      attributes: ["id"],
    });

    const notificaciones = usuariosDireccion.map((usuario) => ({
      usuarioId: usuario.id,
      tipo: TIPOS_NOTIFICACION.INFO,
      titulo: "🎉 ¡Todos los grados completados!",
      mensaje: `Se ha completado la toma de asistencia en todos los grados para el día ${fecha}`,
      prioridad: PRIORIDADES_NOTIFICACION.ALTA,
      metadata: {
        fecha,
        accion: "todos_completados",
      },
    }));

    return await this.crearMasivo(notificaciones);
  }

  /**
   * Notificar a dirección sobre grados pendientes
   */
  async notificarDireccionGradosPendientes(gradosPendientes) {
    const usuariosDireccion = await db.Usuario.findAll({
      where: {
        rol: ["direccion", "admin"],
        activo: true,
      },
      attributes: ["id"],
    });

    const gradosTexto = gradosPendientes
      .map((g) => `${g.nombre} (${g.docente})`)
      .join(", ");

    const notificaciones = usuariosDireccion.map((usuario) => ({
      usuarioId: usuario.id,
      tipo: TIPOS_NOTIFICACION.ALERTA,
      titulo: "⚠️ Grados pendientes de asistencia",
      mensaje: `Los siguientes grados aún no han tomado asistencia: ${gradosTexto}`,
      prioridad: PRIORIDADES_NOTIFICACION.ALTA,
      metadata: {
        grados_pendientes: gradosPendientes.map((g) => g.id),
        accion: "grados_pendientes",
      },
    }));

    return await this.crearMasivo(notificaciones);
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(notificacionId, usuarioId) {
    const notificacion = await db.Notificacion.findOne({
      where: {
        id: notificacionId,
        usuario_id: usuarioId,
      },
    });

    if (!notificacion) {
      throw new Error("Notificación no encontrada");
    }

    await notificacion.update({
      leida: true,
      leida_en: new Date(),
    });

    return notificacion;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(usuarioId) {
    const resultado = await db.Notificacion.update(
      {
        leida: true,
        leida_en: new Date(),
      },
      {
        where: {
          usuario_id: usuarioId,
          leida: false,
        },
      }
    );

    return resultado[0]; // Número de filas actualizadas
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async obtenerPorUsuario(usuarioId, limit = 20, soloNoLeidas = false) {
    const whereClause = { usuario_id: usuarioId };

    if (soloNoLeidas) {
      whereClause.leida = false;
    }

    const notificaciones = await db.Notificacion.findAll({
      where: whereClause,
      limit,
      order: [["creada_en", "DESC"]],
    });

    return notificaciones;
  }

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuarioId) {
    return await db.Notificacion.count({
      where: {
        usuario_id: usuarioId,
        leida: false,
      },
    });
  }
}

// Exportar instancia singleton
const notificacionService = new NotificacionService();
export default notificacionService;
