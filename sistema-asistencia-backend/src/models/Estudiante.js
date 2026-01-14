import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Estudiante = sequelize.define(
    "estudiantes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Datos básicos
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      nombre2: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      apellido2: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // Relación con grado
      grado_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "grados",
          key: "id",
        },
      },
      // Campos SIGERD
      sigerd_id_estudiante: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
        comment: "ID del estudiante en SIGERD",
      },
      sigerd_id_matricula: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de la matrícula en SIGERD",
      },
      sigerd_id_seccion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de la sección en SIGERD",
      },
      estado_matricula: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Estado de la matrícula (inscrito, transferido, retirado)",
      },
      sigerd_id_estado_matricula: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orden_en_seccion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sigerd_id_tanda: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tanda_nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      // Control
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      ultima_sincronizacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "estudiantes",
      indexes: [
        {
          fields: ["grado_id"],
        },
        {
          fields: ["sigerd_id_estudiante"],
        },
        {
          fields: ["estado_matricula"],
        },
      ],
    }
  );

  // Método para obtener nombre completo
  Estudiante.prototype.getNombreCompleto = function () {
    let nombre = this.nombre;
    if (this.nombre2) nombre += ` ${this.nombre2}`;
    nombre += ` ${this.apellido}`;
    if (this.apellido2) nombre += ` ${this.apellido2}`;
    return nombre;
  };

  return Estudiante;
};
