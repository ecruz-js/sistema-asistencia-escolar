import db from "../models/index.js";
import bcrypt from "bcryptjs";
import env from "../config/environment.js";
import { ROLES, CATEGORIAS_PERSONAL } from "../config/constants.js";

const inicializarBaseDatos = async () => {
  try {
    console.log("🔄 Iniciando sincronización de base de datos...");
    console.log("📊 Base de datos:", env.database.name);
    console.log("🖥️  Host:", env.database.host);
    console.log("👤 Usuario:", env.database.user);

    // Probar conexión primero
    await db.sequelize.authenticate();
    console.log("✅ Conexión a base de datos exitosa");

    // Sincronizar modelos (crear tablas)
    console.log("🔄 Sincronizando modelos...");
    // Usar alter solo en desarrollo y con cuidado
    const syncOptions = { force: false };
    // alter: true puede causar problemas con algunos constraints, usar con precaución
    if (env.nodeEnv === "development") {
      console.log(
        "⚠️  Modo desarrollo: se crearán las tablas sin ALTER (usa migraciones para cambios)"
      );
    }
    await db.sequelize.sync(syncOptions);

    console.log("✅ Tablas sincronizadas correctamente");

    // Listar tablas creadas
    const [tables] = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\n📋 Tablas en la base de datos:");
    tables.forEach((table) => console.log("  -", table.table_name));

    // Verificar si ya existen datos
    const usuariosCount = await db.Usuario.count();
    console.log(`\n👥 Usuarios existentes: ${usuariosCount}`);

    if (usuariosCount === 0) {
      console.log("🌱 Insertando datos iniciales...\n");

      // Crear usuario administrador por defecto
      // El hook beforeCreate del modelo se encarga de hashear la contraseña
      const admin = await db.Usuario.create({
        nombre: "Administrador",
        apellido: "Sistema",
        email: "admin@sistema.edu.do",
        password_hash: "Admin123!",
        rol: ROLES.ADMIN,
        categoria_personal: CATEGORIAS_PERSONAL.DIRECTIVO,
        activo: true,
      });

      console.log("✅ Usuario administrador creado");
      console.log("   Email:", admin.email);
      console.log("   Password: Admin123!");

      // Insertar servicios SIGERD
      const servicios = await db.SigerdServicio.bulkCreate([
        {
          sigerd_servicio_id: env.sigerd.servicioInicial,
          nombre: "Nivel Inicial",
          activo: true,
        },
        {
          sigerd_servicio_id: env.sigerd.servicioPrimario,
          nombre: "Nivel Primario",
          activo: true,
        },
      ]);

      console.log(`\n✅ ${servicios.length} Servicios SIGERD creados`);

      // Insertar configuraciones del sistema
      const configs = await db.ConfiguracionSistema.bulkCreate([
        {
          clave: "hora_inicio_asistencia",
          valor: env.horarios.inicioAsistencia,
          tipo: "time",
          descripcion: "Hora de inicio para toma de asistencia",
        },
        {
          clave: "hora_limite_asistencia",
          valor: env.horarios.limiteAsistencia,
          tipo: "time",
          descripcion: "Hora límite para toma de asistencia",
        },
        {
          clave: "hora_limite_modificacion",
          valor: env.horarios.limiteModificacion,
          tipo: "time",
          descripcion: "Hora límite para modificar asistencia",
        },
        {
          clave: "recordatorio_1",
          valor: env.horarios.recordatorio1,
          tipo: "time",
          descripcion: "Primera notificación de recordatorio",
        },
        {
          clave: "recordatorio_2",
          valor: env.horarios.recordatorio2,
          tipo: "time",
          descripcion: "Segunda notificación de recordatorio",
        },
        {
          clave: "recordatorio_3",
          valor: env.horarios.recordatorio3,
          tipo: "time",
          descripcion: "Tercera notificación de recordatorio",
        },
        {
          clave: "recordatorio_4",
          valor: env.horarios.recordatorio4,
          tipo: "time",
          descripcion: "Cuarta notificación de recordatorio",
        },
        {
          clave: "dias_habiles",
          valor: '["lunes","martes","miercoles","jueves","viernes"]',
          tipo: "json",
          descripcion: "Días de la semana hábiles",
        },
        {
          clave: "año_escolar_actual",
          valor: "2025-2026",
          tipo: "string",
          descripcion: "Año escolar actual",
        },
        {
          clave: "sincronizacion_sigerd_automatica",
          valor: "true",
          tipo: "boolean",
          descripcion: "Activar sincronización automática con SIGERD",
        },
        {
          clave: "sincronizacion_sigerd_frecuencia",
          valor: "24",
          tipo: "number",
          descripcion: "Frecuencia de sincronización en horas",
        },
      ]);

      console.log(`✅ ${configs.length} Configuraciones del sistema creadas`);
    } else {
      console.log("ℹ️  La base de datos ya contiene datos");
    }

    console.log("\n🎉 Base de datos inicializada correctamente\n");

    // IMPORTANTE: Cerrar la conexión
    await db.sequelize.close();
  } catch (error) {
    console.error("\n❌ Error al inicializar base de datos:", error.message);
    console.error("Stack trace:", error.stack);

    // Cerrar conexión en caso de error
    try {
      await db.sequelize.close();
    } catch (closeError) {
      // Ignorar errores al cerrar
    }

    throw error;
  }
};

// Ejecutar si se llama directamente
import { fileURLToPath } from "url";
import { resolve } from "path";

const currentFile = fileURLToPath(import.meta.url);
const scriptFile = resolve(process.argv[1]);

if (currentFile === scriptFile) {
  inicializarBaseDatos()
    .then(() => {
      console.log("✅ Proceso completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error fatal:", error.message);
      process.exit(1);
    });
}

export default inicializarBaseDatos;
