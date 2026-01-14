import { body, param } from "express-validator";
import { ROLES, CATEGORIAS_PERSONAL } from "../config/constants.js";

export const crearUsuarioValidator = [
  // Datos de Identidad
  body("cedula")
    .trim()
    .notEmpty()
    .withMessage("La cédula es requerida")
    .matches(/^[0-9]{11}$/)
    .withMessage("La cédula debe tener 11 dígitos"),

  body("primer_apellido")
    .trim()
    .notEmpty()
    .withMessage("El primer apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El primer apellido debe tener entre 2 y 100 caracteres"),

  body("segundo_apellido")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El segundo apellido no puede exceder 100 caracteres"),

  body("nombres")
    .trim()
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ min: 2, max: 150 })
    .withMessage("Los nombres deben tener entre 2 y 150 caracteres"),

  body("fecha_nacimiento")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Debe ser una fecha válida (formato ISO 8601)")
    .custom((value) => {
      const fechaNacimiento = new Date(value);
      const hoy = new Date();

      if (fechaNacimiento > hoy) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }

      return true;
    }),

  // Datos Laborales
  body("puesto")
    .trim()
    .notEmpty()
    .withMessage("El puesto es requerido")
    .isLength({ max: 100 })
    .withMessage("El puesto no puede exceder 100 caracteres"),

  body("condicion_laboral")
    .notEmpty()
    .withMessage("La condición laboral es requerida")
    .isIn(["contratado", "fijo", "interino", "eventual", "otro"])
    .withMessage(
      "Condición laboral inválida. Debe ser: contratado, fijo, interino, eventual u otro"
    ),

  body("categoria_personal")
    .optional({ checkFalsy: true })
    .isIn(Object.values(CATEGORIAS_PERSONAL))
    .withMessage(
      `Categoría de personal inválida. Valores permitidos: ${Object.values(
        CATEGORIAS_PERSONAL
      ).join(", ")}`
    ),

  // Datos de Acceso
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .custom((value) => {
      // Validaciones adicionales de fortaleza
      if (!/[A-Z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra mayúscula"
        );
      }
      if (!/[a-z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra minúscula"
        );
      }
      if (!/[0-9]/.test(value)) {
        throw new Error("La contraseña debe contener al menos un número");
      }
      return true;
    }),

  body("rol")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(Object.values(ROLES))
    .withMessage(
      `Rol inválido. Valores permitidos: ${Object.values(ROLES).join(", ")}`
    ),

  // Datos Opcionales
  body("foto_url")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("La URL de la foto no es válida"),
];

export const updateUserValidator = [
  // Datos de Identidad
  body("cedula")
    .trim()
    .notEmpty()
    .withMessage("La cédula es requerida")
    .matches(/^[0-9]{11}$/)
    .withMessage("La cédula debe tener 11 dígitos"),

  body("primer_apellido")
    .trim()
    .notEmpty()
    .withMessage("El primer apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El primer apellido debe tener entre 2 y 100 caracteres"),

  body("segundo_apellido")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El segundo apellido no puede exceder 100 caracteres"),

  body("nombres")
    .trim()
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ min: 2, max: 150 })
    .withMessage("Los nombres deben tener entre 2 y 150 caracteres"),

  body("fecha_nacimiento")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Debe ser una fecha válida (formato ISO 8601)")
    .custom((value) => {
      const fechaNacimiento = new Date(value);
      const hoy = new Date();

      if (fechaNacimiento > hoy) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }

      return true;
    }),

  // Datos Laborales
  body("puesto")
    .trim()
    .notEmpty()
    .withMessage("El puesto es requerido")
    .isLength({ max: 100 })
    .withMessage("El puesto no puede exceder 100 caracteres"),

  body("condicion_laboral")
    .notEmpty()
    .withMessage("La condición laboral es requerida")
    .isIn(["contratado", "fijo", "interino", "eventual", "otro"])
    .withMessage(
      "Condición laboral inválida. Debe ser: contratado, fijo, interino, eventual u otro"
    ),

  body("categoria_personal")
    .optional({ checkFalsy: true })
    .isIn(Object.values(CATEGORIAS_PERSONAL))
    .withMessage(
      `Categoría de personal inválida. Valores permitidos: ${Object.values(
        CATEGORIAS_PERSONAL
      ).join(", ")}`
    ),

  // Datos de Acceso
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .custom((value) => {
      // Validaciones adicionales de fortaleza
      if (!/[A-Z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra mayúscula"
        );
      }
      if (!/[a-z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra minúscula"
        );
      }
      if (!/[0-9]/.test(value)) {
        throw new Error("La contraseña debe contener al menos un número");
      }
      return true;
    }),

  body("rol")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(Object.values(ROLES))
    .withMessage(
      `Rol inválido. Valores permitidos: ${Object.values(ROLES).join(", ")}`
    ),

  // Datos Opcionales
  body("foto_url")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("La URL de la foto no es válida"),
];

// Validador para creación de múltiples usuarios
export const crearMultiplesUsuariosValidator = [
  body("usuarios")
    .isArray({ min: 1 })
    .withMessage("Se debe enviar un array de usuarios con al menos un elemento"),

  // Validaciones para cada usuario en el array
  body("usuarios.*.cedula")
    .trim()
    .notEmpty()
    .withMessage("La cédula es requerida")
    .matches(/^[0-9]{11}$/)
    .withMessage("La cédula debe tener 11 dígitos"),

  body("usuarios.*.primer_apellido")
    .trim()
    .notEmpty()
    .withMessage("El primer apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El primer apellido debe tener entre 2 y 100 caracteres"),

  body("usuarios.*.segundo_apellido")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El segundo apellido no puede exceder 100 caracteres"),

  body("usuarios.*.nombres")
    .trim()
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ min: 2, max: 150 })
    .withMessage("Los nombres deben tener entre 2 y 150 caracteres"),

  body("usuarios.*.fecha_nacimiento")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Debe ser una fecha válida (formato ISO 8601)")
    .custom((value) => {
      if (value) {
        const fechaNacimiento = new Date(value);
        const hoy = new Date();
        if (fechaNacimiento > hoy) {
          throw new Error("La fecha de nacimiento no puede ser futura");
        }
      }
      return true;
    }),

  body("usuarios.*.puesto")
    .trim()
    .notEmpty()
    .withMessage("El puesto es requerido")
    .isLength({ max: 100 })
    .withMessage("El puesto no puede exceder 100 caracteres"),

  body("usuarios.*.condicion_laboral")
    .notEmpty()
    .withMessage("La condición laboral es requerida")
    .isIn(["contratado", "fijo", "interino", "eventual", "otro"])
    .withMessage(
      "Condición laboral inválida. Debe ser: contratado, fijo, interino, eventual u otro"
    ),

  body("usuarios.*.categoria_personal")
    .optional({ checkFalsy: true })
    .isIn(Object.values(CATEGORIAS_PERSONAL))
    .withMessage(
      `Categoría de personal inválida. Valores permitidos: ${Object.values(
        CATEGORIAS_PERSONAL
      ).join(", ")}`
    ),

  body("usuarios.*.email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("usuarios.*.password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .custom((value) => {
      if (!/[A-Z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra mayúscula"
        );
      }
      if (!/[a-z]/.test(value)) {
        throw new Error(
          "La contraseña debe contener al menos una letra minúscula"
        );
      }
      if (!/[0-9]/.test(value)) {
        throw new Error("La contraseña debe contener al menos un número");
      }
      return true;
    }),

  body("usuarios.*.rol")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(Object.values(ROLES))
    .withMessage(
      `Rol inválido. Valores permitidos: ${Object.values(ROLES).join(", ")}`
    ),

  body("usuarios.*.foto_url")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("La URL de la foto no es válida"),
];

export const idValidator = [param("id").isInt().withMessage("ID inválido")];

export default {
  crearUsuarioValidator,
  crearMultiplesUsuariosValidator,
  updateUserValidator,
  idValidator,
};
