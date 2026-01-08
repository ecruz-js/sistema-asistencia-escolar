import { DataTypes } from "sequelize";
import { ESTADOS_ASISTENCIA } from "../config/constants.js";

export default (sequelize) => {
  const AsistenciaEstudiante = sequelize.define(
    "asistencia_estudiantes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      estudiante_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "estudiantes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      grado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "grados",
          key: "id",
        },
      },
      docente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
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
      modificado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      modificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      hora_modificacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "asistencia_estudiantes",
      indexes: [
        {
          unique: true,
          fields: ["estudiante_id", "fecha"],
        },
        {
          fields: ["fecha"],
        },
        {
          fields: ["grado_id", "fecha"],
        },
      ],
    }
  );

  return AsistenciaEstudiante;
};
