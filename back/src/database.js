const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  // CONFIGURAÇÃO CRÍTICA PARA AZURE:
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // 10 segundos de timeout
});

// Teste de conexão imediato ao subir o servidor
pool.getConnection()
  .then(conn => {
    console.log("✅ CONECTADO AO MYSQL DA AZURE!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ ERRO CRÍTICO NO BANCO:", err.message);
  });

module.exports = pool;