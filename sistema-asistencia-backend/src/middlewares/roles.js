import { ROLES } from "../config/constants.js";
import { errorResponse } from "../utils/responseHelper.js";

// Middleware para verificar rol
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return errorResponse(res, "No autenticado", 401);
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return errorResponse(
        res,
        "No tienes permisos para realizar esta acción",
        403
      );
    }

    next();
  };
};

// Verificar si es admin
export const esAdmin = verificarRol(ROLES.ADMIN);

// Verificar si es admin o dirección
export const esAdminODireccion = verificarRol(ROLES.ADMIN, ROLES.DIRECCION);

// Verificar si es docente
export const esDocente = verificarRol(ROLES.DOCENTE_AULA);

// Verificar si puede gestionar usuarios
export const puedeGestionarUsuarios = verificarRol(
  ROLES.ADMIN,
  ROLES.DIRECCION
);

// Verificar si puede tomar asistencia
export const puedeTomarAsistencia = verificarRol(
  ROLES.ADMIN,
  ROLES.DIRECCION,
  ROLES.DOCENTE_AULA
);

// Verificar si puede enviar al Minerd
export const puedeEnviarMinerd = verificarRol(ROLES.ADMIN, ROLES.DIRECCION);

export default {
  verificarRol,
  esAdmin,
  esAdminODireccion,
  esDocente,
  puedeGestionarUsuarios,
  puedeTomarAsistencia,
  puedeEnviarMinerd,
};
