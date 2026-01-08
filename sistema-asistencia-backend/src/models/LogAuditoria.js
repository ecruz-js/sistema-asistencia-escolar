import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LogAuditoria = sequelize.define(
    "logs_auditoria",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      accion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment:
          "Acción realizada (ej: crear_usuario, tomar_asistencia, enviar_minerd)",
      },
      tabla_afectada: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Tabla de la base de datos afectada",
      },
      registro_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID del registro afectado",
      },
      datos_anteriores: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Estado anterior del registro",
      },
      datos_nuevos: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Estado nuevo del registro",
      },
      ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      creado_en: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "logs_auditoria",
      indexes: [
        {
          fields: ["usuario_id"],
        },
        {
          fields: ["creado_en"],
        },
        {
          fields: ["accion"],
        },
        {
          fields: ["tabla_afectada", "registro_id"],
        },
      ],
    }
  );

  // Método estático para registrar una acción
  LogAuditoria.registrar = async function (data) {
    return await this.create({
      usuario_id: data.usuarioId,
      accion: data.accion,
      tabla_afectada: data.tablaAfectada,
      registro_id: data.registroId,
      datos_anteriores: data.datosAnteriores,
      datos_nuevos: data.datosNuevos,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    });
  };

  return LogAuditoria;
};
