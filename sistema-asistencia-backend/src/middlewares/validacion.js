import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responseHelper.js";

// Middleware para manejar errores de validación
export const manejarErroresValidacion = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const erroresFormateados = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(res, "Errores de validación", 400, erroresFormateados);
  }

  next();
};

export default manejarErroresValidacion;
