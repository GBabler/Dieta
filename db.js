const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Verificar conexão e criar tabela se não existir
pool.getConnection().then(async (connection) => {
    try {
        // Criar tabela progress_entries
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS progress_entries (
                id BIGINT PRIMARY KEY,
                date DATE NOT NULL UNIQUE,
                weight DECIMAL(5, 2) NOT NULL,
                bodyFat DECIMAL(5, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_date (date DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Tabela progress_entries criada/verificada com sucesso');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao verificar/criar tabela:', error);
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
});

module.exports = pool;
