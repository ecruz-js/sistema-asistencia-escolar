import { Sequelize } from "sequelize";
import env from "../config/environment.js";

// Importar modelos
import UsuarioModel from "./Usuario.js";
import GradoModel from "./Grado.js";
import EstudianteModel from "./Estudiante.js";
import AsignacionDocenteGradoModel from "./AsignacionDocenteGrado.js";
import AsistenciaEstudianteModel from "./AsistenciaEstudiante.js";
import AsistenciaPersonalModel from "./AsistenciaPersonal.js";
import RegistroAsistenciaGradoModel from "./RegistroAsistenciaGrado.js";
import EnvioMinerdModel from "./EnvioMinerd.js";
import NotificacionModel from "./Notificacion.js";
import SigerdServicioModel from "./SigerdServicio.js";
import SincronizacionSIGERDModel from "./SincronizacionSIGERD.js";
import ConfiguracionSistemaModel from "./ConfiguracionSistema.js";
import LogAuditoriaModel from "./LogAuditoria.js";

// Configuración de la base de datos según el entorno
const dbConfig = env.database;

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: {
      timestamps: true,
      underscored: true, // Usa snake_case en BD
      freezeTableName: true, // No pluraliza nombres de tablas
    },
  }
);

// Inicializar modelos
const Usuario = UsuarioModel(sequelize);
const Grado = GradoModel(sequelize);
const Estudiante = EstudianteModel(sequelize);
const AsignacionDocenteGrado = AsignacionDocenteGradoModel(sequelize);
const AsistenciaEstudiante = AsistenciaEstudianteModel(sequelize);
const AsistenciaPersonal = AsistenciaPersonalModel(sequelize);
const RegistroAsistenciaGrado = RegistroAsistenciaGradoModel(sequelize);
const EnvioMinerd = EnvioMinerdModel(sequelize);
const Notificacion = NotificacionModel(sequelize);
const SigerdServicio = SigerdServicioModel(sequelize);
const SincronizacionSIGERD = SincronizacionSIGERDModel(sequelize);
const ConfiguracionSistema = ConfiguracionSistemaModel(sequelize);
const LogAuditoria = LogAuditoriaModel(sequelize);

// Definir relaciones entre modelos
const setupAssociations = () => {
  // Usuario -> Grado (Docente tiene muchos grados asignados)
  Usuario.belongsToMany(Grado, {
    through: AsignacionDocenteGrado,
    foreignKey: "docente_id",
    as: "gradosAsignados",
  });

  Grado.belongsToMany(Usuario, {
    through: AsignacionDocenteGrado,
    foreignKey: "grado_id",
    as: "docentes",
  });

  // Grado -> Estudiante
  Grado.hasMany(Estudiante, {
    foreignKey: "grado_id",
    as: "estudiantes",
  });

  Estudiante.belongsTo(Grado, {
    foreignKey: "grado_id",
    as: "grado",
  });

  // Estudiante -> AsistenciaEstudiante
  Estudiante.hasMany(AsistenciaEstudiante, {
    foreignKey: "estudiante_id",
    as: "asistencias",
  });

  AsistenciaEstudiante.belongsTo(Estudiante, {
    foreignKey: "estudiante_id",
    as: "estudiante",
  });

  // Grado -> AsistenciaEstudiante
  Grado.hasMany(AsistenciaEstudiante, {
    foreignKey: "grado_id",
    as: "asistencias",
  });

  AsistenciaEstudiante.belongsTo(Grado, {
    foreignKey: "grado_id",
    as: "grado",
  });

  // Docente -> AsistenciaEstudiante (quien tomó la asistencia)
  Usuario.hasMany(AsistenciaEstudiante, {
    foreignKey: "docente_id",
    as: "asistenciasTomadas",
  });

  AsistenciaEstudiante.belongsTo(Usuario, {
    foreignKey: "docente_id",
    as: "docente",
  });

  // Usuario modificador -> AsistenciaEstudiante
  AsistenciaEstudiante.belongsTo(Usuario, {
    foreignKey: "modificado_por",
    as: "modificadoPor",
  });

  // Usuario -> AsistenciaPersonal
  Usuario.hasMany(AsistenciaPersonal, {
    foreignKey: "usuario_id",
    as: "asistenciasPersonales",
  });

  AsistenciaPersonal.belongsTo(Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
  });

  // Quien registró la asistencia del personal
  AsistenciaPersonal.belongsTo(Usuario, {
    foreignKey: "registrado_por",
    as: "registradoPor",
  });

  // Grado -> RegistroAsistenciaGrado
  Grado.hasMany(RegistroAsistenciaGrado, {
    foreignKey: "grado_id",
    as: "registrosAsistencia",
  });

  RegistroAsistenciaGrado.belongsTo(Grado, {
    foreignKey: "grado_id",
    as: "grado",
  });

  // Docente -> RegistroAsistenciaGrado
  Usuario.hasMany(RegistroAsistenciaGrado, {
    foreignKey: "docente_id",
    as: "registrosAsistenciaGrado",
  });

  RegistroAsistenciaGrado.belongsTo(Usuario, {
    foreignKey: "docente_id",
    as: "docente",
  });

  // Validador -> RegistroAsistenciaGrado
  RegistroAsistenciaGrado.belongsTo(Usuario, {
    foreignKey: "validada_por",
    as: "validadoPor",
  });

  // Usuario -> EnvioMinerd
  Usuario.hasMany(EnvioMinerd, {
    foreignKey: "usuario_envio_id",
    as: "enviosMinerd",
  });

  EnvioMinerd.belongsTo(Usuario, {
    foreignKey: "usuario_envio_id",
    as: "usuarioEnvio",
  });

  // Confirmador -> EnvioMinerd
  EnvioMinerd.belongsTo(Usuario, {
    foreignKey: "confirmado_por_id",
    as: "confirmadoPor",
  });

  // Usuario -> Notificacion
  Usuario.hasMany(Notificacion, {
    foreignKey: "usuario_id",
    as: "notificaciones",
  });

  Notificacion.belongsTo(Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
  });

  // Usuario -> LogAuditoria
  Usuario.hasMany(LogAuditoria, {
    foreignKey: "usuario_id",
    as: "logs",
  });

  LogAuditoria.belongsTo(Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
  });
};

// Ejecutar asociaciones
setupAssociations();

// Objeto db con todos los modelos y la instancia de sequelize
const db = {
  sequelize,
  Sequelize,
  Usuario,
  Grado,
  Estudiante,
  AsignacionDocenteGrado,
  AsistenciaEstudiante,
  AsistenciaPersonal,
  RegistroAsistenciaGrado,
  EnvioMinerd,
  Notificacion,
  SigerdServicio,
  SincronizacionSIGERD,
  ConfiguracionSistema,
  LogAuditoria,
};

export default db;
