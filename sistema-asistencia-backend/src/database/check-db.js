import db from "../models/index.js";

const checkDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Verificar si la columna passcode existe
    const [columns] = await db.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'passcode'
    `);

    console.log("\n📊 Estado de la columna passcode:");
    console.log("Existe:", columns.length > 0);

    // Verificar conexiones activas
    const [connections] = await db.sequelize.query(`
      SELECT pid, state, query, query_start
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid != pg_backend_pid()
      ORDER BY query_start DESC
    `);

    console.log(`\n🔌 Conexiones activas: ${connections.length}`);
    connections.forEach((conn, i) => {
      console.log(`${i + 1}. PID: ${conn.pid}, Estado: ${conn.state}`);
      if (conn.query) {
        console.log(`   Query: ${conn.query.substring(0, 80)}...`);
      }
    });

    await db.sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkDatabase();
