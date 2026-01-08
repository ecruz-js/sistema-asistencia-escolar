import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SigerdServicio = sequelize.define(
    "sigerd_servicios",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sigerd_servicio_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        comment: "ID del servicio en SIGERD (ej: 102107, 102108)",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Nombre del servicio (ej: Nivel Inicial, Nivel Primario)",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "sigerd_servicios",
      createdAt: "creado_en",
      updatedAt: false,
    }
  );

  return SigerdServicio;
};
