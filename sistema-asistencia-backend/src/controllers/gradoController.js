import db from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

// Listar grados
export const listar = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      search = '', 
      nivel = '',
      activo = '',
      año_escolar = ''
    } = req.query;

    const offset = (page - 1) * pageSize;
    const whereClause = {};

    // Filtro de búsqueda
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { nivel: { [Op.iLike]: `%${search}%` } },
        { seccion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por nivel
    if (nivel) {
      whereClause.nivel = { [Op.iLike]: `%${nivel}%` };
    }

    // Filtro por activo
    if (activo !== '') {
      whereClause.activo = activo === 'true';
    }

    // Filtro por año escolar
    if (año_escolar) {
      whereClause.año_escolar = año_escolar;
    } else {
      // Por defecto, mostrar solo del año escolar actual
      const añoActual = await db.ConfiguracionSistema.getValor('año_escolar_actual');
      whereClause.año_escolar = añoActual;
    }

    const { count, rows } = await db.Grado.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Estudiante,
          as: 'estudiantes',
          attributes: ['id'],
          where: { activo: true },
          required: false
        }
      ],
      limit: parseInt(pageSize),
      offset,
      order: [['nombre', 'ASC']]
    });

    // Agregar conteo de estudiantes a cada grado
    const gradosConConteo = rows.map(grado => {
      const gradoJSON = grado.toJSON();
      gradoJSON.total_estudiantes = grado.estudiantes ? grado.estudiantes.length : 0;
      delete gradoJSON.estudiantes;
      return gradoJSON;
    });

    return paginatedResponse(
      res,
      gradosConConteo,
      parseInt(page),
      parseInt(pageSize),
      count,
      'Grados obtenidos'
    );
  } catch (error) {
    next(error);
  }
};

// Obtener grado por ID
export const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grado = await db.Grado.findByPk(id, {
      include: [
        {
          model: db.Estudiante,
          as: 'estudiantes',
          where: { activo: true },
          required: false,
          attributes: ['id', 'nombre', 'nombre2', 'apellido', 'apellido2', 'fecha_nacimiento']
        },
        // {
        //   model: db.Usuario,
        //   as: 'docentes',
        //   through: { 
        //     attributes: [],
        //     where: { activo: true }
        //   },
        //   attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
        // }
      ]
    });

    if (!grado) {
      return errorResponse(res, 'Grado no encontrado', 404);
    }

    const gradoJSON = grado.toJSON();
    gradoJSON.total_estudiantes = grado.estudiantes ? grado.estudiantes.length : 0;

    return successResponse(res, gradoJSON, 'Grado obtenido');
  } catch (error) {
    next(error);
  }
};

// Crear grado (manual)
export const crear = async (req, res, next) => {
  try {
    const { nombre, nivel, seccion, año_escolar } = req.body;

    // Verificar si ya existe un grado similar
    const gradoExistente = await db.Grado.findOne({
      where: {
        nombre,
        año_escolar,
        activo: true
      }
    });

    if (gradoExistente) {
      return errorResponse(res, 'Ya existe un grado con ese nombre para este año escolar', 409);
    }

    // Crear grado
    const grado = await db.Grado.create({
      nombre,
      nivel,
      seccion,
      año_escolar,
      activo: true
    });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'crear_grado',
      tablaAfectada: 'grados',
      registroId: grado.id,
      datosNuevos: grado.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.info(`Usuario ${req.usuario.email} creó grado ${grado.nombre}`);

    return successResponse(res, grado, 'Grado creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

// Actualizar grado
export const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    const grado = await db.Grado.findByPk(id);

    if (!grado) {
      return errorResponse(res, 'Grado no encontrado', 404);
    }

    // No permitir actualizar si es de SIGERD (tiene sigerd_grado_id)
    if (grado.sigerd_grado_id) {
      return errorResponse(
        res, 
        'No se puede actualizar un grado sincronizado con SIGERD. Los cambios deben hacerse en SIGERD.',
        400
      );
    }

    const datosAnteriores = grado.toJSON();

    await grado.update(datosActualizacion);

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'actualizar_grado',
      tablaAfectada: 'grados',
      registroId: grado.id,
      datosAnteriores,
      datosNuevos: grado.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.info(`Usuario ${req.usuario.email} actualizó grado ${grado.nombre}`);

    return successResponse(res, grado, 'Grado actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

// Desactivar grado
export const desactivar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grado = await db.Grado.findByPk(id);

    if (!grado) {
      return errorResponse(res, 'Grado no encontrado', 404);
    }

    const datosAnteriores = grado.toJSON();

    await grado.update({ activo: false });

    // Log de auditoría
    await db.LogAuditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'desactivar_grado',
      tablaAfectada: 'grados',
      registroId: grado.id,
      datosAnteriores,
      datosNuevos: grado.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.info(`Usuario ${req.usuario.email} desactivó grado ${grado.nombre}`);

    return successResponse(res, grado, 'Grado desactivado exitosamente');
  } catch (error) {
    next(error);
  }
};

// Obtener estudiantes de un grado
export const obtenerEstudiantes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo = 'true' } = req.query;

    const grado = await db.Grado.findByPk(id);

    if (!grado) {
      return errorResponse(res, 'Grado no encontrado', 404);
    }

    const whereClause = { grado_id: id };
    
    if (activo !== '') {
      whereClause.activo = activo === 'true';
    }

    const estudiantes = await db.Estudiante.findAll({
      where: whereClause,
      attributes: [
        'id',
        'nombre',
        'nombre2',
        'apellido',
        'apellido2',
        'fecha_nacimiento',
        'estado_matricula',
        'activo',
        'sigerd_id_estudiante'
      ],
      order: [['apellido', 'ASC'], ['nombre', 'ASC']]
    });

    return successResponse(res, {
      grado: {
        id: grado.id,
        nombre: grado.nombre,
        nivel: grado.nivel,
        seccion: grado.seccion
      },
      total_estudiantes: estudiantes.length,
      estudiantes
    }, 'Estudiantes obtenidos');
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
  obtenerEstudiantes
};