import db from './src/models/index.js';

async function testModels() {
  try {
    console.log('🔄 Probando conexión...');
    await db.sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    console.log('\n📦 Modelos cargados:');
    console.log('  - Usuario:', db.Usuario ? '✅' : '❌');
    console.log('  - Grado:', db.Grado ? '✅' : '❌');
    console.log('  - Estudiante:', db.Estudiante ? '✅' : '❌');
    console.log('  - AsignacionDocenteGrado:', db.AsignacionDocenteGrado ? '✅' : '❌');
    console.log('  - AsistenciaEstudiante:', db.AsistenciaEstudiante ? '✅' : '❌');
    console.log('  - AsistenciaPersonal:', db.AsistenciaPersonal ? '✅' : '❌');
    console.log('  - RegistroAsistenciaGrado:', db.RegistroAsistenciaGrado ? '✅' : '❌');
    console.log('  - EnvioMinerd:', db.EnvioMinerd ? '✅' : '❌');
    console.log('  - Notificacion:', db.Notificacion ? '✅' : '❌');
    console.log('  - SigerdServicio:', db.SigerdServicio ? '✅' : '❌');
    console.log('  - SincronizacionSIGERD:', db.SincronizacionSIGERD ? '✅' : '❌');
    console.log('  - ConfiguracionSistema:', db.ConfiguracionSistema ? '✅' : '❌');
    console.log('  - LogAuditoria:', db.LogAuditoria ? '✅' : '❌');

    console.log('\n🔄 Intentando sincronizar (crear tablas)...');
    await db.sequelize.sync({ force: false, alter: true });
    console.log('✅ Sincronización exitosa');

    console.log('\n📋 Tablas creadas:');
    const [tables] = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    tables.forEach(table => console.log('  -', table.table_name));

    await db.sequelize.close();
    console.log('\n🎉 Todo funciona correctamente');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📍 Stack trace:', error.stack);
  }
}

testModels();