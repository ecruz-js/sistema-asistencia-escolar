import jwt from "jsonwebtoken";
import env from "../config/environment.js";
import db from "../models/index.js";
import { errorResponse } from "../utils/responseHelper.js";

// Middleware para verificar JWT
export const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(
        res,
        "No se proporcionó token de autenticación",
        401
      );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Buscar usuario
    const usuario = await db.Usuario.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 401);
    }

    if (!usuario.activo) {
      return errorResponse(res, "Usuario inactivo", 403);
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Token inválido", 401);
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token expirado", 401);
    }
    next(error);
  }
};

// Middleware opcional - no falla si no hay token
export const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.jwt.secret);
      const usuario = await db.Usuario.findByPk(decoded.id, {
        attributes: { exclude: ["password_hash"] },
      });

      if (usuario && usuario.activo) {
        req.usuario = usuario;
      }
    }

    next();
  } catch (error) {
    // Ignorar errores de token en modo opcional
    next();
  }
};

// Generar token JWT
export const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expire,
    }
  );
};

// Generar refresh token
export const generarRefreshToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpire,
    }
  );
};

export default {
  verificarToken,
  verificarTokenOpcional,
  generarToken,
  generarRefreshToken,
};
