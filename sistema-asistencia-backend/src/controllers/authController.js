import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { generarToken, generarRefreshToken } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
import env from "../config/environment.js";
import logger from "../utils/logger.js";

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await db.Usuario.findOne({
      where: { email },
      attributes: [
        "id",
        "nombre",
        "apellido",
        "email",
        "password_hash",
        "rol",
        "categoria_personal",
        "activo",
      ],
    });

    if (!usuario) {
      return errorResponse(res, "Credenciales inválidas", 401);
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return errorResponse(
        res,
        "Usuario inactivo. Contacta al administrador",
        403
      );
    }

    // Verificar password
    const passwordValido = await usuario.validarPassword(password);

    if (!passwordValido) {
      return errorResponse(res, "Credenciales inválidas", 401);
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar tokens
    const token = generarToken(usuario);
    const refreshToken = generarRefreshToken(usuario);

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: usuario.id,
      accion: "login",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Usuario ${usuario.email} inició sesión`);

    // Preparar respuesta (sin password)
    const usuarioResponse = usuario.toJSON();

    return successResponse(
      res,
      {
        usuario: usuarioResponse,
        token,
        refreshToken,
      },
      "Inicio de sesión exitoso"
    );
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token requerido", 400);
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);

    // Buscar usuario
    const usuario = await db.Usuario.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    if (!usuario.activo) {
      return errorResponse(res, "Usuario inactivo", 403);
    }

    // Generar nuevo token
    const nuevoToken = generarToken(usuario);

    return successResponse(
      res,
      {
        token: nuevoToken,
      },
      "Token actualizado"
    );
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return errorResponse(res, "Refresh token inválido o expirado", 401);
    }
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "logout",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Usuario ${req.usuario.email} cerró sesión`);

    return successResponse(res, null, "Sesión cerrada exitosamente");
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario actual
export const obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await db.Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ["password_hash"] },
    });

    return successResponse(res, usuario, "Perfil obtenido");
  } catch (error) {
    next(error);
  }
};

// Cambiar password
export const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    // Buscar usuario con password
    const usuario = await db.Usuario.findByPk(req.usuario.id);

    // Verificar password actual
    const passwordValido = await usuario.validarPassword(passwordActual);

    if (!passwordValido) {
      return errorResponse(res, "Password actual incorrecto", 400);
    }

    // Actualizar password (el hook beforeUpdate se encarga de hashearlo)
    await usuario.update({ password_hash: passwordNuevo });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: usuario.id,
      accion: "cambiar_password",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Usuario ${usuario.email} cambió su password`);

    return successResponse(res, null, "Password actualizado exitosamente");
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  refreshToken,
  logout,
  obtenerPerfil,
  cambiarPassword,
};
