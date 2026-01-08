import env from './environment.js';

export default {
  development: {
    username: env.database.user,
    password: env.database.password,
    database: env.database.name,
    host: env.database.host,
    port: env.database.port,
    dialect: env.database.dialect,
    logging: env.database.logging,
    pool: env.database.pool
  },
  test: {
    username: env.database.user,
    password: env.database.password,
    database: `${env.database.name}_test`,
    host: env.database.host,
    port: env.database.port,
    dialect: env.database.dialect,
    logging: false
  },
  production: {
    username: env.database.user,
    password: env.database.password,
    database: env.database.name,
    host: env.database.host,
    port: env.database.port,
    dialect: env.database.dialect,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};