import { DataTypes } from "sequelize";
import { ESTADOS_ENVIO_MINERD } from "../config/constants.js";

export default (sequelize) => {
  const EnvioMinerd = sequelize.define(
    "envios_minerd",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      datos_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: "Datos enviados al Minerd en formato JSON",
      },
      usuario_envio_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      hora_envio: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      confirmado_por_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      hora_confirmacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(50),
        defaultValue: ESTADOS_ENVIO_MINERD.PENDIENTE,
        validate: {
          isIn: [Object.values(ESTADOS_ENVIO_MINERD)],
        },
      },
      respuesta_minerd: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Respuesta del API del Minerd",
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "envios_minerd",
      indexes: [
        {
          fields: ["fecha"],
        },
        {
          fields: ["estado"],
        },
      ],
    }
  );

  return EnvioMinerd;
};
