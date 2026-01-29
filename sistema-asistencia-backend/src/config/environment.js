import dotenv from 'dotenv';
dotenv.config();

export default {
  // Servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  apiPrefix: process.env.API_PREFIX || '/api',

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'sistema_asistencia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },

  // SIGERD
  sigerd: {
    baseUrl: process.env.SIGERD_BASE_URL || 'https://sigerd.minerd.gob.do',
    loginEndpoint: process.env.SIGERD_LOGIN_ENDPOINT || '/Account/CargarInformacion',
    username: process.env.SIGERD_USERNAME,
    password: process.env.SIGERD_PASSWORD,
    centroId: process.env.SIGERD_CENTRO_ID,
    servicioInicial: parseInt(process.env.SIGERD_SERVICIO_INICIAL) || 102107,
    servicioPrimario: parseInt(process.env.SIGERD_SERVICIO_PRIMARIO) || 102108,
    syncEnabled: process.env.SIGERD_SYNC_ENABLED === 'true',
    syncCron: process.env.SIGERD_SYNC_CRON || '0 2 * * *'
  },

  // MINERD
  minerd: {
    loginEndpoint: process.env.MINERD_LOGIN_ENDPOINT,
    username: process.env.MINERD_USERNAME,
    password: process.env.MINERD_PASSWORD,
    attendanceId: parseInt(process.env.MINERD_ATTENDANCE_ID) || 0,
    regionalId: parseInt(process.env.MINERD_REGIONAL_ID),
    districtId: parseInt(process.env.MINERD_DISTRICT_ID),
    centerId: process.env.MINERD_CENTER_ID,
    directorIdCard: process.env.MINERD_DIRECTOR_ID_CARD,
    directorName: process.env.MINERD_DIRECTOR_NAME,
    directorPhone: process.env.MINERD_DIRECTOR_PHONE
  },

  // Horarios
  horarios: {
    inicioAsistencia: process.env.HORA_INICIO_ASISTENCIA || '08:15',
    limiteAsistencia: process.env.HORA_LIMITE_ASISTENCIA || '11:00',
    limiteModificacion: process.env.HORA_LIMITE_MODIFICACION || '13:00',
    recordatorio1: process.env.RECORDATORIO_1 || '09:30',
    recordatorio2: process.env.RECORDATORIO_2 || '10:30',
    recordatorio3: process.env.RECORDATORIO_3 || '11:00',
    recordatorio4: process.env.RECORDATORIO_4 || '11:15'
  },

  // Seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs'
  }
};