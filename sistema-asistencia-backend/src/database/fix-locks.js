import db from "../models/index.js";

const fixLocks = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Obtener conexiones bloqueadas
    const [blocked] = await db.sequelize.query(`
      SELECT pid, state, query, NOW() - query_start AS duration
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid != pg_backend_pid()
        AND state != 'idle'
      ORDER BY query_start
    `);

    console.log(`\n🔍 Conexiones activas no idle: ${blocked.length}`);
    
    if (blocked.length > 0) {
      console.log("\n⚠️  Terminando conexiones bloqueadas...");
      for (const conn of blocked) {
        console.log(`   Terminando PID ${conn.pid}...`);
        try {
          await db.sequelize.query(`SELECT pg_terminate_backend(${conn.pid})`);
          console.log(`   ✅ PID ${conn.pid} terminado`);
        } catch (err) {
          console.log(`   ⚠️  No se pudo terminar PID ${conn.pid}: ${err.message}`);
        }
      }
    }

    console.log("\n✅ Proceso completado");
    await db.sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixLocks();
