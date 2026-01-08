import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AsignacionDocenteGrado = sequelize.define(
    "asignaciones_docente_grado",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      docente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      grado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "grados",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      año_escolar: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "asignaciones_docente_grado",
      indexes: [
        {
          unique: true,
          fields: ["docente_id", "grado_id", "año_escolar"],
        },
      ],
    }
  );

  return AsignacionDocenteGrado;
};
