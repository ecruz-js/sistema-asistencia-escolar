export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/perfil",
  CHANGE_PASSWORD: "/auth/cambiar-password",

  // Usuarios
  USERS: "/usuarios",
  USER_BY_ID: (id) => `/usuarios/${id}`,
  ASSIGN_GRADES: (id) => `/usuarios/${id}/asignar-grados`,

  // Grados
  GRADES: "/grados",
  GRADE_BY_ID: (id) => `/grados/${id}`,
  GRADE_STUDENTS: (id) => `/grados/${id}/estudiantes`,

  // Estudiantes
  STUDENTS: "/estudiantes",
  STUDENT_BY_ID: (id) => `/estudiantes/${id}`,
  STUDENT_ATTENDANCE: (id) => `/estudiantes/${id}/asistencia`,

  // Asistencia
  MY_GRADES: "/asistencia/mis-grados",
  GRADE_ATTENDANCE_LIST: (id) => `/asistencia/grado/${id}`,
  TAKE_ATTENDANCE: (id) => `/asistencia/grado/${id}`,
  MY_PERSONAL_ATTENDANCE: "/asistencia/personal/hoy",
  REGISTER_PERSONAL_ATTENDANCE: "/asistencia/personal",
  MY_ATTENDANCE_HISTORY: "/asistencia/mi-historial",

  // Notificaciones
  NOTIFICATIONS: "/notificaciones",
  NOTIFICATIONS_UNREAD: "/notificaciones/no-leidas",
  MARK_NOTIFICATION_READ: (id) => `/notificaciones/${id}/leer`,
  MARK_ALL_READ: "/notificaciones/marcar-todas-leidas",

  // Dirección
  DIRECTION_DASHBOARD: "/direccion/dashboard",
  DIRECTION_GRADE_DETAIL: (id) => `/direccion/grado/${id}`,
  VALIDATE_ATTENDANCE: "/direccion/validar",
  SEND_REMINDER: "/direccion/recordatorio",
  MODIFY_ATTENDANCE: "/direccion/modificar-asistencia",
  STAFF_ATTENDANCE: "/direccion/personal",

  // MINERD
  MINERD_SUMMARY: "/minerd/resumen",
  MINERD_PREPARE: "/minerd/preparar",
  MINERD_CONFIRM: "/minerd/confirmar",
  MINERD_HISTORY: "/minerd/historial",
  MINERD_DETAIL: (id) => `/minerd/envio/${id}`,

  // SIGERD
  SIGERD_SYNC: "/sigerd/sincronizar",
  SIGERD_HISTORY: "/sigerd/historial",
  SIGERD_LAST: "/sigerd/ultima",
  SIGERD_STATUS: "/sigerd/estado",

  // Reportes
  DAILY_REPORT: "/reportes/asistencia-diaria",
  RANGE_REPORT: "/reportes/asistencia-rango",
  GENERAL_STATS: "/reportes/estadisticas-generales",
  STUDENT_REPORT: (id) => `/reportes/estudiante/${id}`,
  GRADE_REPORT: (id) => `/reportes/grado/${id}`,
};
