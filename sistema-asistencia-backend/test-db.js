import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('👤 Usuario:', process.env.DB_USER);
    console.log('🖥️  Host:', process.env.DB_HOST);
    
    // Intentar crear una tabla de prueba
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_tabla (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100)
      );
    `);
    console.log('✅ Tabla de prueba creada');
    
    // Eliminar tabla de prueba
    await sequelize.query('DROP TABLE IF EXISTS test_tabla;');
    console.log('✅ Tabla de prueba eliminada');
    
    await sequelize.close();
    console.log('🎉 Todo funciona correctamente');
    
  } catch (error) {
    console.error('❌ Error al conectar:', error.message);
    console.error('Detalles:', error);
  }
}

testConnection();