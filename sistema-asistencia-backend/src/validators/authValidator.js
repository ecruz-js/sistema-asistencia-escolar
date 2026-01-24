import { body } from "express-validator";

export const loginValidator = [
  // Validación condicional: passcode O (email + password)
  body("passcode")
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage("El passcode debe tener exactamente 6 dígitos")
    .custom((value, { req }) => {
      // Si se proporciona passcode, no se requiere email ni password
      if (value && (req.body.email || req.body.password)) {
        throw new Error(
          "No puedes usar passcode y email/password al mismo tiempo"
        );
      }
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .custom((value, { req }) => {
      // Si no hay passcode, entonces email es obligatorio
      if (!req.body.passcode && !value) {
        throw new Error("Email es requerido si no usas passcode");
      }
      return true;
    }),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres")
    .custom((value, { req }) => {
      // Si no hay passcode y hay email, entonces password es obligatorio
      if (!req.body.passcode && req.body.email && !value) {
        throw new Error("Password es requerido si usas email para login");
      }
      return true;
    }),
  // Validación general: al menos uno de los métodos debe estar presente
  body().custom((value, { req }) => {
    if (!req.body.passcode && !(req.body.email && req.body.password)) {
      throw new Error("Debe proporcionar passcode o email y password");
    }
    return true;
  }),
];

export const refreshTokenValidator = [
  body("refreshToken").notEmpty().withMessage("Refresh token es requerido"),
];

export const cambiarPasswordValidator = [
  body("passwordActual").notEmpty().withMessage("Password actual es requerido"),
  body("passwordNuevo")
    .notEmpty()
    .withMessage("Password nuevo es requerido")
    .isLength({ min: 6 })
    .withMessage("Password nuevo debe tener al menos 6 caracteres")
    .custom((value, { req }) => {
      if (value === req.body.passwordActual) {
        throw new Error("El password nuevo debe ser diferente al actual");
      }
      return true;
    }),
  body("confirmarPassword")
    .notEmpty()
    .withMessage("Confirmar password es requerido")
    .custom((value, { req }) => {
      if (value !== req.body.passwordNuevo) {
        throw new Error("Los passwords no coinciden");
      }
      return true;
    }),
];

export default {
  loginValidator,
  refreshTokenValidator,
  cambiarPasswordValidator,
};
