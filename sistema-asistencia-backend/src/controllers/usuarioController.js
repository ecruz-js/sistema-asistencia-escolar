import db from "../models/index.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/responseHelper.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

// Listar usuarios
export const listar = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      rol = "",
      activo = "",
    } = req.query;

    const offset = (page - 1) * pageSize;
    const whereClause = {};

    // Filtro de búsqueda
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { apellido: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro por rol
    if (rol) {
      whereClause.rol = rol;
    }

    // Filtro por activo
    if (activo !== "") {
      whereClause.activo = activo === "true";
    }

    const { count, rows } = await db.Usuario.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password_hash"] },
      limit: parseInt(pageSize),
      offset,
      order: [["created_at", "DESC"]],
    });

    return paginatedResponse(
      res,
      rows,
      parseInt(page),
      parseInt(pageSize),
      count,
      "Usuarios obtenidos"
    );
  } catch (error) {
    next(error);
  }
};

// Obtener usuario por ID
export const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await db.Usuario.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: db.Grado,
          as: "gradosAsignados",
          through: { attributes: [] },
          attributes: ["id", "nombre", "nivel", "seccion"],
        },
      ],
    });

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    return successResponse(res, usuario, "Usuario obtenido");
  } catch (error) {
    next(error);
  }
};

// Crear usuario
export const crear = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, rol, categoria_personal } =
      req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await db.Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      return errorResponse(res, "El email ya está registrado", 409);
    }

    // Crear usuario
    const usuario = await db.Usuario.create({
      nombre,
      apellido,
      email,
      password_hash: password, // El hook beforeCreate lo hasheará
      rol,
      categoria_personal,
      activo: true,
    });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "crear_usuario",
      tablaAfectada: "usuarios",
      registroId: usuario.id,
      datosNuevos: usuario.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Usuario ${req.usuario.email} creó usuario ${usuario.email}`);

    return successResponse(res, usuario, "Usuario creado exitosamente", 201);
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
export const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // Guardar datos anteriores para auditoría
    const datosAnteriores = usuario.toJSON();

    // Si se está actualizando el email, verificar que no exista
    if (
      datosActualizacion.email &&
      datosActualizacion.email !== usuario.email
    ) {
      const emailExistente = await db.Usuario.findOne({
        where: {
          email: datosActualizacion.email,
          id: { [Op.ne]: id },
        },
      });

      if (emailExistente) {
        return errorResponse(res, "El email ya está registrado", 409);
      }
    }

    // No permitir actualizar password por esta ruta
    delete datosActualizacion.password;
    delete datosActualizacion.password_hash;

    // Actualizar
    await usuario.update(datosActualizacion);

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "actualizar_usuario",
      tablaAfectada: "usuarios",
      registroId: usuario.id,
      datosAnteriores,
      datosNuevos: usuario.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} actualizó usuario ${usuario.email}`
    );

    return successResponse(res, usuario, "Usuario actualizado exitosamente");
  } catch (error) {
    next(error);
  }
};

// Desactivar usuario (soft delete)
export const desactivar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // No permitir desactivar al propio usuario
    if (usuario.id === req.usuario.id) {
      return errorResponse(res, "No puedes desactivar tu propia cuenta", 400);
    }

    const datosAnteriores = usuario.toJSON();

    await usuario.update({ activo: false });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "desactivar_usuario",
      tablaAfectada: "usuarios",
      registroId: usuario.id,
      datosAnteriores,
      datosNuevos: usuario.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} desactivó usuario ${usuario.email}`
    );

    return successResponse(res, usuario, "Usuario desactivado exitosamente");
  } catch (error) {
    next(error);
  }
};

// Reactivar usuario
export const reactivar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const datosAnteriores = usuario.toJSON();

    await usuario.update({ activo: true });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "reactivar_usuario",
      tablaAfectada: "usuarios",
      registroId: usuario.id,
      datosAnteriores,
      datosNuevos: usuario.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} reactivó usuario ${usuario.email}`
    );

    return successResponse(res, usuario, "Usuario reactivado exitosamente");
  } catch (error) {
    next(error);
  }
};

// Asignar grados a un docente
export const asignarGrados = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { grados } = req.body; // Array de IDs de grados

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // Verificar que sea docente
    if (usuario.rol !== "docente_aula" && usuario.rol !== "admin") {
      return errorResponse(
        res,
        "Solo se pueden asignar grados a docentes",
        400
      );
    }

    // Obtener año escolar actual
    const añoEscolar = await db.ConfiguracionSistema.getValor(
      "año_escolar_actual"
    );

    // Eliminar asignaciones anteriores del año actual
    await db.AsignacionDocenteGrado.destroy({
      where: {
        docente_id: id,
        año_escolar: añoEscolar,
      },
    });

    // Crear nuevas asignaciones
    const asignaciones = grados.map((gradoId) => ({
      docente_id: id,
      grado_id: gradoId,
      año_escolar: añoEscolar,
      activo: true,
    }));

    await db.AsignacionDocenteGrado.bulkCreate(asignaciones);

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "asignar_grados",
      tablaAfectada: "asignaciones_docente_grado",
      datosNuevos: { docente_id: id, grados },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} asignó ${grados.length} grados al docente ${usuario.email}`
    );

    return successResponse(res, asignaciones, "Grados asignados exitosamente");
  } catch (error) {
    next(error);
  }
};

export default {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  desactivar,
  reactivar,
  asignarGrados,
};
