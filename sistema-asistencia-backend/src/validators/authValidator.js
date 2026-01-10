import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password es requerido")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres"),
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
