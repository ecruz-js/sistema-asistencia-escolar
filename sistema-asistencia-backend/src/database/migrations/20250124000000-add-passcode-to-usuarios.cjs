module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log("🔄 Iniciando migración de passcode...");
    
    // 1. Verificar y agregar columna passcode si no existe
    console.log("1️⃣ Verificando columna passcode...");
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'passcode'
    `);

    if (columns.length === 0) {
      console.log("   Agregando columna passcode...");
      await queryInterface.addColumn("usuarios", "passcode", {
        type: Sequelize.STRING(6),
        allowNull: true,
      });
    } else {
      console.log("   ✓ Columna passcode ya existe");
    }

    // 2. Generar passcodes únicos usando SQL directo
    console.log("2️⃣ Generando passcodes únicos...");
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET passcode = LPAD((100000 + (id * 7919) % 900000)::TEXT, 6, '0')
      WHERE passcode IS NULL
    `);

    // 3. Verificar y agregar índice único si no existe
    console.log("3️⃣ Verificando índice único...");
    const [indexes] = await queryInterface.sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'usuarios' AND indexname = 'usuarios_passcode_unique'
    `);

    if (indexes.length === 0) {
      console.log("   Agregando índice único...");
      await queryInterface.addIndex("usuarios", ["passcode"], {
        unique: true,
        name: "usuarios_passcode_unique",
      });
    } else {
      console.log("   ✓ Índice único ya existe");
    }

    console.log("✅ Migración de passcode completada exitosamente");
  },

  down: async (queryInterface, Sequelize) => {
    console.log("🔄 Revirtiendo migración de passcode...");
    
    // Revertir en orden inverso
    await queryInterface.removeIndex("usuarios", "usuarios_passcode_unique");
    await queryInterface.removeColumn("usuarios", "passcode");
    
    console.log("✅ Rollback completado");
  },
};
