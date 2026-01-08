import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { ROLES, CATEGORIAS_PERSONAL } from "../config/constants.js";

export default (sequelize) => {
  const Usuario = sequelize.define(
    "usuarios",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [Object.values(ROLES)],
        },
      },
      categoria_personal: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: [Object.values(CATEGORIAS_PERSONAL)],
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "usuarios",
      hooks: {
        beforeCreate: async (usuario) => {
          if (usuario.password_hash) {
            const salt = await bcrypt.genSalt(10);
            usuario.password_hash = await bcrypt.hash(
              usuario.password_hash,
              salt
            );
          }
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed("password_hash")) {
            const salt = await bcrypt.genSalt(10);
            usuario.password_hash = await bcrypt.hash(
              usuario.password_hash,
              salt
            );
          }
        },
      },
    }
  );

  // Método de instancia para verificar password
  Usuario.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Método para obtener datos públicos (sin password)
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return Usuario;
};
