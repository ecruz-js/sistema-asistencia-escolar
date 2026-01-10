import { body, param } from "express-validator";

export const crearGradoValidator = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("Nombre es requerido")
    .isLength({ min: 2, max: 50 })
    .withMessage("Nombre debe tener entre 2 y 50 caracteres"),

  body("nivel")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Nivel no puede exceder 50 caracteres"),

  body("seccion")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Sección no puede exceder 10 caracteres"),

  body("año_escolar")
    .notEmpty()
    .withMessage("Año escolar es requerido")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Año escolar debe tener formato YYYY-YYYY (ej: 2025-2026)"),
];

export const actualizarGradoValidator = [
  param("id").isInt().withMessage("ID inválido"),

  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Nombre debe tener entre 2 y 50 caracteres"),

  body("nivel")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Nivel no puede exceder 50 caracteres"),

  body("seccion")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Sección no puede exceder 10 caracteres"),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser verdadero o falso"),
];

export const idValidator = [param("id").isInt().withMessage("ID inválido")];

export default {
  crearGradoValidator,
  actualizarGradoValidator,
  idValidator,
};
