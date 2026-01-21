-- ====================================================
-- Script SQL para criar tabela progress_entries
-- Banco: u532802556_dieta
-- ====================================================

USE u532802556_dieta;

CREATE TABLE IF NOT EXISTS progress_entries (
    id BIGINT PRIMARY KEY COMMENT 'ID único baseado em timestamp',
    date DATE NOT NULL UNIQUE COMMENT 'Data da medição (YYYY-MM-DD)',
    weight DECIMAL(5, 2) NOT NULL COMMENT 'Peso em kg',
    bodyFat DECIMAL(5, 2) NOT NULL COMMENT 'Percentual de gordura corporal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data/hora de atualização',
    INDEX idx_date (date DESC) COMMENT 'Índice para busca rápida por data'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de medições de progresso corporal';

-- ====================================================
-- Verificar se a tabela foi criada
-- ====================================================
SHOW TABLES;
DESCRIBE progress_entries;

-- ====================================================
-- (Opcional) Inserir dados de teste
-- ====================================================
-- INSERT INTO progress_entries (id, date, weight, bodyFat) VALUES
-- (1768571469310, '2026-01-21', 85.50, 25.50),
-- (1768573186556, '2026-01-20', 86.00, 26.00),
-- (1768659600000, '2026-01-19', 85.75, 25.80);

-- ====================================================
-- (Opcional) Verificar dados
-- ====================================================
-- SELECT * FROM progress_entries ORDER BY date DESC;
