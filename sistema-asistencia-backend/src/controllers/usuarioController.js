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
    });

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    return successResponse(res, usuario, "Usuario obtenido");
  } catch (error) {
    next(error);
  }
};

// Crear usuario (único o múltiple)
export const crear = async (req, res, next) => {
  try {
    // Detectar si es creación simple o múltiple
    const esCreacionMultiple = Array.isArray(req.body.usuarios);

    if (esCreacionMultiple) {
      // Creación múltiple
      const { usuarios } = req.body;

      // Verificar emails duplicados en el array
      const emails = usuarios.map((u) => u.email);
      const emailsDuplicados = emails.filter(
        (email, index) => emails.indexOf(email) !== index
      );

      if (emailsDuplicados.length > 0) {
        return errorResponse(
          res,
          `Emails duplicados en el array: ${emailsDuplicados.join(", ")}`,
          400
        );
      }

      // Verificar cédulas duplicadas en el array
      const cedulas = usuarios.map((u) => u.cedula);
      const cedulasDuplicadas = cedulas.filter(
        (cedula, index) => cedulas.indexOf(cedula) !== index
      );

      if (cedulasDuplicadas.length > 0) {
        return errorResponse(
          res,
          `Cédulas duplicadas en el array: ${cedulasDuplicadas.join(", ")}`,
          400
        );
      }

      // Verificar si algún email ya existe en la BD
      const usuariosExistentes = await db.Usuario.findAll({
        where: {
          [Op.or]: [{ email: { [Op.in]: emails } }, { cedula: { [Op.in]: cedulas } }],
        },
      });

      if (usuariosExistentes.length > 0) {
        const emailsExistentes = usuariosExistentes.map((u) => u.email);
        const cedulasExistentes = usuariosExistentes.map((u) => u.cedula);
        return errorResponse(
          res,
          `Los siguientes datos ya están registrados - Emails: ${emailsExistentes.join(
            ", "
          )} - Cédulas: ${cedulasExistentes.join(", ")}`,
          409
        );
      }

      // Preparar usuarios para inserción
      const usuariosParaCrear = usuarios.map((u) => ({
        cedula: u.cedula,
        primer_apellido: u.primer_apellido,
        segundo_apellido: u.segundo_apellido || null,
        nombres: u.nombres,
        fecha_nacimiento: u.fecha_nacimiento || null,
        puesto: u.puesto,
        condicion_laboral: u.condicion_laboral,
        categoria_personal: u.categoria_personal || null,
        email: u.email,
        password_hash: u.password, // El hook beforeCreate lo hasheará
        rol: u.rol,
        foto_url: u.foto_url || null,
        activo: true,
      }));

      // Crear usuarios
      const usuariosCreados = await db.Usuario.bulkCreate(usuariosParaCrear, {
        validate: true,
        individualHooks: true, // Para que se ejecute el hook beforeCreate de cada uno
      });

      // Log de auditoría para cada usuario creado
      for (const usuario of usuariosCreados) {
        await db.LogAuditoria.registrar({
          usuarioId: req.usuario.id,
          accion: "crear_usuario_masivo",
          tablaAfectada: "usuarios",
          registroId: usuario.id,
          datosNuevos: usuario.toJSON(),
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });
      }

      logger.info(
        `Usuario ${req.usuario.email} creó ${usuariosCreados.length} usuarios`
      );

      return successResponse(
        res,
        usuariosCreados,
        `${usuariosCreados.length} usuarios creados exitosamente`,
        201
      );
    } else {
      // Creación simple (un solo usuario)
      const {
        cedula,
        primer_apellido,
        segundo_apellido,
        nombres,
        fecha_nacimiento,
        puesto,
        condicion_laboral,
        categoria_personal,
        email,
        password,
        rol,
        foto_url,
      } = req.body;

      // Verificar si el email o cédula ya existe
      const usuarioExistente = await db.Usuario.findOne({
        where: {
          [Op.or]: [{ email }, { cedula }],
        },
      });

      if (usuarioExistente) {
        if (usuarioExistente.email === email) {
          return errorResponse(res, "El email ya está registrado", 409);
        }
        if (usuarioExistente.cedula === cedula) {
          return errorResponse(res, "La cédula ya está registrada", 409);
        }
      }

      // Crear usuario
      const usuario = await db.Usuario.create({
        cedula,
        primer_apellido,
        segundo_apellido,
        nombres,
        fecha_nacimiento,
        puesto,
        condicion_laboral,
        categoria_personal,
        email,
        password_hash: password, // El hook beforeCreate lo hasheará
        rol,
        foto_url,
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
    }
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

// Regenerar passcode de un usuario
export const regenerarPasscode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const datosAnteriores = usuario.toJSON();

    // Generar nuevo passcode único
    const nuevoPasscode = await db.Usuario.generarPasscodeUnico();

    // Actualizar usuario con el nuevo passcode
    await usuario.update({ passcode: nuevoPasscode });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: "regenerar_passcode",
      tablaAfectada: "usuarios",
      registroId: usuario.id,
      datosAnteriores,
      datosNuevos: usuario.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(
      `Usuario ${req.usuario.email} regeneró el passcode de ${usuario.email}`
    );

    return successResponse(
      res,
      {
        usuario: usuario.toJSON(),
        passcode: nuevoPasscode,
      },
      "Passcode regenerado exitosamente"
    );
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
  regenerarPasscode,
};
