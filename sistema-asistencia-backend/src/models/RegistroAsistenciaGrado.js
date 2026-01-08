import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RegistroAsistenciaGrado = sequelize.define(
    "registro_asistencia_grado",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      grado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "grados",
          key: "id",
        },
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      docente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      completada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hora_completada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      validada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      validada_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      hora_validacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "registro_asistencia_grado",
      indexes: [
        {
          unique: true,
          fields: ["grado_id", "fecha"],
        },
        {
          fields: ["fecha"],
        },
      ],
    }
  );

  return RegistroAsistenciaGrado;
};
