import { body, param } from "express-validator";
import { ROLES, CATEGORIAS_PERSONAL } from "../config/constants.js";

export const crearUsuarioValidator = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("Nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nombre debe tener entre 2 y 100 caracteres"),

  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("Apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("Apellido debe tener entre 2 y 100 caracteres"),

  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password es requerido")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres"),

  body("rol")
    .notEmpty()
    .withMessage("Rol es requerido")
    .isIn(Object.values(ROLES))
    .withMessage("Rol inválido"),

  body("categoria_personal")
    .optional()
    .isIn(Object.values(CATEGORIAS_PERSONAL))
    .withMessage("Categoría de personal inválida"),
];

export const actualizarUsuarioValidator = [
  param("id").isInt().withMessage("ID inválido"),

  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nombre debe tener entre 2 y 100 caracteres"),

  body("apellido")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Apellido debe tener entre 2 y 100 caracteres"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),

  body("rol").optional().isIn(Object.values(ROLES)).withMessage("Rol inválido"),

  body("categoria_personal")
    .optional()
    .isIn(Object.values(CATEGORIAS_PERSONAL))
    .withMessage("Categoría de personal inválida"),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser verdadero o falso"),
];

export const idValidator = [param("id").isInt().withMessage("ID inválido")];

export default {
  crearUsuarioValidator,
  actualizarUsuarioValidator,
  idValidator,
};
