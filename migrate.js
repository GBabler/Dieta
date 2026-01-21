/**
 * Script para migrar dados do arquivo JSON para o banco de dados MySQL
 * Use: node migrate.js
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const pool = require('./db');

const DATA_FILE = path.join(__dirname, 'data', 'progress_data.json');

async function migrateData() {
    const connection = await pool.getConnection();

    try {
        console.log('📋 Iniciando migração de dados...');

        // Tentar ler arquivo JSON antigo
        let existingData = [];
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            existingData = JSON.parse(data);
            console.log(`✅ Encontrado ${existingData.length} registros no arquivo JSON`);
        } catch (error) {
            console.log('⚠️  Nenhum arquivo JSON anterior encontrado - começando com banco vazio');
        }

        if (existingData.length === 0) {
            console.log('✅ Nada para migrar');
            return;
        }

        await connection.beginTransaction();

        // Limpar tabela existente
        await connection.execute('DELETE FROM progress_entries');
        console.log('🗑️  Tabela limpa');

        // Inserir dados do JSON
        let insertedCount = 0;
        for (const entry of existingData) {
            try {
                const id = entry.id || Date.now();
                await connection.execute(
                    'INSERT INTO progress_entries (id, date, weight, bodyFat) VALUES (?, ?, ?, ?)',
                    [id, entry.date, parseFloat(entry.weight), parseFloat(entry.bodyFat)]
                );
                insertedCount++;
            } catch (error) {
                console.warn(`⚠️  Erro ao inserir registro ${entry.date}:`, error.message);
            }
        }

        await connection.commit();
        console.log(`✅ ${insertedCount} registros inseridos com sucesso`);
        console.log('✅ Migração concluída!');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Erro durante migração:', error);
        process.exit(1);
    } finally {
        connection.release();
        pool.end();
    }
}

migrateData();
