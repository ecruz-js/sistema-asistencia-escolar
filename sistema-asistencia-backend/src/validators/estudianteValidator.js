import { body, param } from "express-validator";

export const crearEstudianteValidator = [
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

  body("fecha_nacimiento")
    .optional()
    .isDate()
    .withMessage("Fecha de nacimiento inválida"),

  body("grado_id")
    .notEmpty()
    .withMessage("Grado es requerido")
    .isInt()
    .withMessage("Grado inválido"),
];

export const actualizarEstudianteValidator = [
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

  body("fecha_nacimiento")
    .optional()
    .isDate()
    .withMessage("Fecha de nacimiento inválida"),

  body("grado_id").optional().isInt().withMessage("Grado inválido"),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser verdadero o falso"),
];

export const idValidator = [param("id").isInt().withMessage("ID inválido")];

export default {
  crearEstudianteValidator,
  actualizarEstudianteValidator,
  idValidator,
};
