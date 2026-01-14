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
      // Datos de Identidad
      cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          name: "unique_cedula",
          msg: "Esta cédula ya está registrada",
        },
        validate: {
          notEmpty: {
            msg: "La cédula es requerida",
          },
          is: {
            args: /^[0-9]{11}$/,
            msg: "La cédula debe tener 11 dígitos",
          },
        },
      },
      primer_apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "El primer apellido es requerido",
          },
          len: {
            args: [2, 100],
            msg: "El primer apellido debe tener entre 2 y 100 caracteres",
          },
        },
      },
      segundo_apellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "El segundo apellido no puede exceder 100 caracteres",
          },
        },
      },
      nombres: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Los nombres son requeridos",
          },
          len: {
            args: [2, 150],
            msg: "Los nombres deben tener entre 2 y 150 caracteres",
          },
        },
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: {
            msg: "Debe ser una fecha válida",
          },
          isBefore: {
            args: new Date().toISOString().split("T")[0],
            msg: "La fecha de nacimiento no puede ser futura",
          },
        },
      },

      // Datos Laborales
      puesto: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Puesto o cargo que desempeña el usuario",
      },
      condicion_laboral: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: {
            args: [["contratado", "fijo", "interino", "eventual", "otro"]],
            msg: "Condición laboral inválida",
          },
        },
        comment: "Tipo de contrato o condición laboral",
      },
      categoria_personal: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          isIn: {
            args: [Object.values(CATEGORIAS_PERSONAL)],
            msg: "Categoría de personal inválida",
          },
        },
      },

      // Datos de Acceso
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: {
          name: "unique_email",
          msg: "Este email ya está registrado",
        },
        validate: {
          isEmail: {
            msg: "Debe ser un email válido",
          },
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
          isIn: {
            args: [Object.values(ROLES)],
            msg: "Rol inválido",
          },
        },
      },

      // Foto de Perfil
      foto_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: {
            msg: "La URL de la foto no es válida",
          },
        },
        comment: "URL de la foto de perfil del usuario",
      },

      // Estado y Control
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Indica si el usuario está activo en el sistema",
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Última fecha y hora de acceso al sistema",
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "usuarios",
      indexes: [
        {
          unique: true,
          fields: ["cedula"],
        },
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["rol"],
        },
        {
          fields: ["activo"],
        },
        {
          fields: ["categoria_personal"],
        },
      ],
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

  // Método para obtener nombre completo
  Usuario.prototype.getNombreCompleto = function () {
    const partes = [
      this.nombres,
      this.primer_apellido,
      this.segundo_apellido,
    ].filter(Boolean);

    return partes.join(" ");
  };

  // Método para calcular edad
  Usuario.prototype.getEdad = function () {
    if (!this.fecha_nacimiento) return null;

    const hoy = new Date();
    const nacimiento = new Date(this.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  // Método para obtener datos públicos (sin password)
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;

    // Agregar campos calculados
    values.nombre_completo = this.getNombreCompleto();
    if (this.fecha_nacimiento) {
      values.edad = this.getEdad();
    }

    return values;
  };

  return Usuario;
};
