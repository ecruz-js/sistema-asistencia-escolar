import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Grado = sequelize.define(
    "grados",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      nivel: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      seccion: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      año_escolar: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      // Campos para sincronización con SIGERD
      sigerd_servicio_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID del servicio en SIGERD (ej: 102108 para Primario)",
      },
      sigerd_grado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID del grado/tipo periodo en SIGERD",
      },
      sigerd_seccion_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de la sección en SIGERD",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "grados",
      indexes: [
        {
          unique: true,
          fields: [
            "sigerd_servicio_id",
            "sigerd_grado_id",
            "sigerd_seccion_id",
          ],
        },
      ],
    }
  );

  return Grado;
};
