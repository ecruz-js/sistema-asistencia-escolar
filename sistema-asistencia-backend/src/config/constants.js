export const ROLES = {
  ADMIN: 'admin',
  DIRECCION: 'direccion',
  DOCENTE_AULA: 'docente_aula',
  PERSONAL_ADMIN: 'personal_administrativo'
};

export const CATEGORIAS_PERSONAL = {
  DOCENTE_AULA: 'docente_aula',
  DIRECTIVO: 'directivo',
  ADMINISTRATIVO: 'administrativo'
};

export const ESTADOS_ASISTENCIA = {
  PRESENTE: 'presente',
  AUSENTE: 'ausente',
  TARDANZA: 'tardanza',
  JUSTIFICADO: 'justificado'
};

export const ESTADOS_MATRICULA = {
  INSCRITO: 'inscrito',
  TRANSFERIDO: 'transferido',
  RETIRADO: 'retirado'
};

export const ESTADOS_ENVIO_MINERD = {
  PENDIENTE: 'pendiente',
  ENVIADO: 'enviado',
  ERROR: 'error'
};

export const PRIORIDADES_NOTIFICACION = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica'
};

export const TIPOS_NOTIFICACION = {
  RECORDATORIO: 'recordatorio',
  CONFIRMACION: 'confirmacion',
  ALERTA: 'alerta',
  INFO: 'info'
};

export const DIAS_HABILES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

export const CONFIG_DEFAULTS = {
  año_escolar: '2025-2026',
  sincronizacion_automatica: true,
  frecuencia_sincronizacion: 24 // horas
};

// Export default con todo
export default {
  ROLES,
  CATEGORIAS_PERSONAL,
  ESTADOS_ASISTENCIA,
  ESTADOS_MATRICULA,
  ESTADOS_ENVIO_MINERD,
  PRIORIDADES_NOTIFICACION,
  TIPOS_NOTIFICACION,
  DIAS_HABILES,
  CONFIG_DEFAULTS
};