import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ConfiguracionSistema = sequelize.define(
    "configuracion_sistema",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clave: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        comment: "Clave única de la configuración (ej: hora_inicio_asistencia)",
      },
      valor: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Valor de la configuración",
      },
      tipo: {
        type: DataTypes.STRING(50),
        defaultValue: "string",
        validate: {
          isIn: [["string", "number", "boolean", "time", "json"]],
        },
        comment: "Tipo de dato del valor",
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción de qué hace esta configuración",
      },
      actualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuarios",
          key: "id",
        },
      },
      actualizado_en: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      underscored: true,
      tableName: "configuracion_sistema",
    }
  );

  // Método estático para obtener un valor de configuración
  ConfiguracionSistema.getValor = async function (clave) {
    const config = await this.findOne({ where: { clave } });
    if (!config) return null;

    // Parsear el valor según el tipo
    switch (config.tipo) {
      case "number":
        return parseFloat(config.valor);
      case "boolean":
        return config.valor === "true";
      case "json":
        return JSON.parse(config.valor);
      default:
        return config.valor;
    }
  };

  // Método estático para actualizar un valor de configuración
  ConfiguracionSistema.setValor = async function (
    clave,
    valor,
    usuarioId = null
  ) {
    const config = await this.findOne({ where: { clave } });
    if (!config) {
      throw new Error(`Configuración con clave "${clave}" no encontrada`);
    }

    // Convertir el valor a string según el tipo
    let valorString;
    switch (config.tipo) {
      case "json":
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = String(valor);
    }

    await config.update({
      valor: valorString,
      actualizado_por: usuarioId,
      actualizado_en: new Date(),
    });

    return config;
  };

  return ConfiguracionSistema;
};
