import { DataTypes } from "sequelize";
import { ESTADOS_ASISTENCIA } from "../config/constants.js";

export default (sequelize) => {
  const AsistenciaPersonal = sequelize.define(
    "asistencia_personal",
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
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [Object.values(ESTADOS_ASISTENCIA)],
        },
      },
      hora_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      registrado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "asistencia_personal",
      indexes: [
        {
          unique: true,
          fields: ["usuario_id", "fecha"],
        },
        {
          fields: ["fecha"],
        },
      ],
    }
  );

  return AsistenciaPersonal;
};
