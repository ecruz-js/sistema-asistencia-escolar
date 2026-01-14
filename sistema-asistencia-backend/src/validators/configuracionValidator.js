import { body, param } from "express-validator";

const TIPOS_VALIDOS = ["string", "number", "boolean", "time", "json"];

export const crearConfiguracionValidator = [
  body("clave")
    .trim()
    .notEmpty()
    .withMessage("La clave es requerida")
    .isLength({ min: 1, max: 100 })
    .withMessage("La clave debe tener entre 1 y 100 caracteres")
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      "La clave solo puede contener letras minúsculas, números y guiones bajos"
    ),

  body("valor")
    .notEmpty()
    .withMessage("El valor es requerido")
    .custom((value, { req }) => {
      const tipo = req.body.tipo || "string";

      // Validar según el tipo
      switch (tipo) {
        case "number":
          if (isNaN(value)) {
            throw new Error("El valor debe ser un número válido");
          }
          break;
        case "boolean":
          if (typeof value !== "boolean" && value !== "true" && value !== "false") {
            throw new Error("El valor debe ser un booleano (true/false)");
          }
          break;
        case "json":
          try {
            JSON.parse(JSON.stringify(value));
          } catch (e) {
            throw new Error("El valor debe ser un JSON válido");
          }
          break;
        case "time":
          // Validar formato de hora HH:mm o HH:mm:ss
          if (
            typeof value !== "string" ||
            !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value)
          ) {
            throw new Error(
              "El valor debe ser una hora válida en formato HH:mm o HH:mm:ss"
            );
          }
          break;
        default:
          // string - cualquier valor es válido
          break;
      }
      return true;
    }),

  body("tipo")
    .optional()
    .isIn(TIPOS_VALIDOS)
    .withMessage(
      `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(", ")}`
    ),

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 500 })
    .withMessage("La descripción no puede exceder 500 caracteres"),
];

export const actualizarConfiguracionValidator = [
  param("clave")
    .trim()
    .notEmpty()
    .withMessage("La clave es requerida"),

  body("valor")
    .optional()
    .custom((value, { req }) => {
      // Si se proporciona valor, necesitamos obtener el tipo de la configuración
      // Por ahora validamos según el tipo común
      if (value === null || value === undefined) {
        return true; // Es opcional
      }
      return true; // La validación específica se hará en el controlador
    }),

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 500 })
    .withMessage("La descripción no puede exceder 500 caracteres"),
];

export const obtenerPorClaveValidator = [
  param("clave")
    .trim()
    .notEmpty()
    .withMessage("La clave es requerida"),
];

export const eliminarConfiguracionValidator = [
  param("clave")
    .trim()
    .notEmpty()
    .withMessage("La clave es requerida"),
];

export default {
  crearConfiguracionValidator,
  actualizarConfiguracionValidator,
  obtenerPorClaveValidator,
  eliminarConfiguracionValidator,
};
