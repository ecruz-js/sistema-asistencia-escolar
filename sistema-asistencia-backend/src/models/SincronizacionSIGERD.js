import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SincronizacionSIGERD = sequelize.define(
    "sincronizaciones_sigerd",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      exitosa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      estudiantes_nuevos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      estudiantes_actualizados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      estudiantes_desactivados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      detalles: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment:
          "Detalles de la sincronización (cambios por servicio, errores, etc.)",
      },
      error_mensaje: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "sincronizaciones_sigerd",
      indexes: [
        {
          fields: ["fecha"],
        },
        {
          fields: ["exitosa"],
        },
      ],
    }
  );

  return SincronizacionSIGERD;
};
