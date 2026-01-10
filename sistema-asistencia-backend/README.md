# Sistema de Asistencia Escolar

Sistema completo de gestión de asistencia para centros educativos de República Dominicana, con integración a SIGERD y MINERD.

## 🚀 Características

### ✅ Gestión Completa

- **Usuarios**: CRUD completo con roles (Admin, Dirección, Docentes, Personal)
- **Grados**: Gestión de grados y secciones
- **Estudiantes**: Sincronización automática con SIGERD
- **Asistencia**: Toma de asistencia de estudiantes y personal

### 🔄 Sincronización SIGERD

- Sincronización automática programada
- Sincronización manual bajo demanda
- Actualización de estudiantes, grados y secciones
- Detección de cambios (nuevos, actualizados, transferidos)

### ⏰ Recordatorios Automáticos

- 4 niveles de recordatorios programados
- Notificaciones in-app
- Alertas a dirección sobre grados pendientes

### 📊 Dashboard de Dirección

- Monitoreo en tiempo real
- Vista de progreso por grado
- Resumen de estudiantes y personal
- Validación de asistencias

### 📤 Envío al MINERD

- Doble confirmación de seguridad
- Vista previa de datos antes de enviar
- Historial de envíos
- Registro completo de auditoría

### 📈 Reportes y Estadísticas

- Reporte diario de asistencia
- Reportes por rango de fechas
- Estadísticas por estudiante
- Estadísticas por grado
- Promedios y tendencias

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **ORM**: Sequelize
- **Autenticación**: JWT
- **Tareas programadas**: node-cron
- **Logs**: Winston
- **Validación**: express-validator

## 📋 Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd sistema-asistencia-backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Crear base de datos**

```bash
npm run db:init
```

5. **Iniciar servidor en desarrollo**

```bash
npm run dev
```

## 🔑 Variables de Entorno Importantes

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_asistencia
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRE=24h

# SIGERD
SIGERD_USERNAME=tu_usuario
SIGERD_PASSWORD=tu_password
SIGERD_SERVICIO_INICIAL=102107
SIGERD_SERVICIO_PRIMARIO=102108

# Horarios
HORA_INICIO_ASISTENCIA=08:15
HORA_LIMITE_ASISTENCIA=11:00
HORA_LIMITE_MODIFICACION=13:00
```

## 📍 Endpoints Principales

### Autenticación

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/perfil
PUT    /api/auth/cambiar-password
```

### Asistencia

```
GET    /api/asistencia/mis-grados
GET    /api/asistencia/grado/:gradoId
POST   /api/asistencia/grado/:gradoId
POST   /api/asistencia/personal
GET    /api/asistencia/personal/hoy
```

### Dirección

```
GET    /api/direccion/dashboard
GET    /api/direccion/grado/:gradoId
POST   /api/direccion/validar
POST   /api/direccion/recordatorio
PUT    /api/direccion/modificar-asistencia
GET    /api/direccion/personal
```

### MINERD

```
GET    /api/minerd/resumen
POST   /api/minerd/preparar
POST   /api/minerd/confirmar
GET    /api/minerd/historial
GET    /api/minerd/envio/:id
```

### SIGERD

```
POST   /api/sigerd/sincronizar
GET    /api/sigerd/historial
GET    /api/sigerd/ultima
GET    /api/sigerd/estado
```

## 👥 Roles y Permisos

### Admin

- Acceso completo a todo el sistema
- Gestión de usuarios, grados, estudiantes
- Configuración del sistema

### Dirección

- Dashboard completo
- Validación de asistencias
- Envío al MINERD
- Gestión de usuarios y grados

### Docente de Aula

- Toma de asistencia de sus grados
- Vista de sus estudiantes
- Registro de asistencia personal

### Personal Administrativo

- Registro de asistencia personal
- Vista limitada

## ⏰ Tareas Programadas

### Recordatorios de Asistencia

- **09:30 AM**: Recordatorio suave
- **10:30 AM**: Recordatorio moderado
- **11:00 AM**: Recordatorio urgente (+ notificación a dirección)
- **11:15 AM**: Recordatorio crítico

### Sincronización SIGERD

- **02:00 AM**: Sincronización automática diaria (configurable)

## 🔒 Seguridad

- Autenticación JWT
- Bcrypt para passwords
- Helmet para headers de seguridad
- Rate limiting
- Validación de inputs
- SQL injection prevention (Sequelize ORM)
- XSS protection
- CORS configurado

## 📝 Logs y Auditoría

- Todos los cambios importantes se registran
- Logs de errores en archivo separado
- Logs de auditoría en base de datos
- Registro de IP y user agent

## 🧪 Testing

```bash
# Ejecutar tests (por implementar)
npm test
```

## 📦 Despliegue en Producción

1. Configurar variables de entorno de producción
2. Configurar base de datos PostgreSQL
3. Ejecutar migraciones: `npm run db:init`
4. Iniciar con PM2:

```bash
pm2 start src/server.js --name sistema-asistencia
```

## 📄 Licencia

MIT

## 👨‍💻 Autor

Emmanuel - Sistema de Asistencia Escolar RD
