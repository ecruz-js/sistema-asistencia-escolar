import { DataTypes } from "sequelize";
import {
  PRIORIDADES_NOTIFICACION,
  TIPOS_NOTIFICACION,
} from "../config/constants.js";

export default (sequelize) => {
  const Notificacion = sequelize.define(
    "notificaciones",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [Object.values(TIPOS_NOTIFICACION)],
        },
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      leida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      prioridad: {
        type: DataTypes.STRING(20),
        defaultValue: PRIORIDADES_NOTIFICACION.MEDIA,
        validate: {
          isIn: [Object.values(PRIORIDADES_NOTIFICACION)],
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Datos adicionales de la notificación (IDs, enlaces, etc.)",
      },
      creada_en: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      leida_en: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "notificaciones",
      indexes: [
        {
          fields: ["usuario_id", "leida"],
        },
        {
          fields: ["creada_en"],
        },
      ],
    }
  );

  return Notificacion;
};
