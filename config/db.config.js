const mysql = require('mysql2/promise');
const environment = require('./environment');

const dbConfig = {
  host: environment.database.host,
  user: environment.database.user,
  password: environment.database.password,
  port: environment.database.port,
  database: environment.database.name,
  connectionLimit: environment.database.connectionLimit
};

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    connectTimeout: 60000
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
  await connection.query(`USE ${dbConfig.database}`);


  await connection.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.end();
  console.log('Database initialized successfully');
}

const pool = mysql.createPool(dbConfig);

module.exports = {
  pool,
  initializeDatabase
};
