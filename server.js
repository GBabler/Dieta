const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const pool = require('./db');
const PORT = process.env.PORT || 3000;
const SYSTEM_PASSWORD = process.env.SYSTEM_PASSWORD || '8315';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Validate password middleware
const validatePassword = (req, res, next) => {
    const password = req.headers['x-password'] || req.body.password;

    if (password !== SYSTEM_PASSWORD) {
        return res.status(401).json({ error: 'Senha incorreta', code: 'INVALID_PASSWORD' });
    }

    next();
};

// Verify password endpoint
app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;

    if (password === SYSTEM_PASSWORD) {
        res.json({ success: true, message: 'Senha correta' });
    } else {
        res.status(401).json({ success: false, error: 'Senha incorreta' });
    }
});

// Get all progress data (sorted by date, newest first)
app.get('/api/progress', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, date, weight, bodyFat FROM progress_entries ORDER BY date DESC, id DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Falha ao carregar dados' });
    }
});

// Save/Replace all progress data (PROTECTED)
app.post('/api/progress', validatePassword, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const data = req.body;

        // Validar dados
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Dados devem ser um array' });
        }

        await connection.beginTransaction();

        // Limpar tabela
        await connection.execute('DELETE FROM progress_entries');

        // Inserir novos dados com prepared statements
        for (const entry of data) {
            if (!entry.date || entry.weight === undefined || entry.bodyFat === undefined) {
                throw new Error('Dados incompletos na entrada');
            }

            const id = entry.id || Date.now();
            await connection.execute(
                'INSERT INTO progress_entries (id, date, weight, bodyFat) VALUES (?, ?, ?, ?)',
                [id, entry.date, parseFloat(entry.weight), parseFloat(entry.bodyFat)]
            );
        }

        await connection.commit();
        
        // Retornar dados inseridos
        const [rows] = await connection.execute(
            'SELECT id, date, weight, bodyFat FROM progress_entries ORDER BY date DESC, id DESC'
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Erro ao salvar dados:', error);
        res.status(500).json({ error: 'Falha ao salvar dados' });
    } finally {
        connection.release();
    }
});

// Add new entry (PROTECTED)
app.post('/api/progress/add', validatePassword, async (req, res) => {
    try {
        const { date, weight, bodyFat } = req.body;

        // Validar dados
        if (!date || weight === undefined || bodyFat === undefined) {
            return res.status(400).json({ error: 'Data, peso e % de gordura são obrigatórios' });
        }

        // Validar formato de data (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Data deve estar no formato YYYY-MM-DD' });
        }

        const id = Date.now();
        const weightNum = parseFloat(weight);
        const bodyFatNum = parseFloat(bodyFat);

        // Usar prepared statement para prevenir SQL injection
        await pool.execute(
            'INSERT INTO progress_entries (id, date, weight, bodyFat) VALUES (?, ?, ?, ?)',
            [id, date, weightNum, bodyFatNum]
        );

        // Retornar todos os dados atualizados
        const [rows] = await pool.execute(
            'SELECT id, date, weight, bodyFat FROM progress_entries ORDER BY date DESC, id DESC'
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Erro ao adicionar entrada:', error);
        
        // Erro de chave duplicada (mesma data)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Já existe medição para esta data' });
        }

        res.status(500).json({ error: 'Falha ao adicionar medição' });
    }
});

// Delete entry (PROTECTED)
app.delete('/api/progress/:id', validatePassword, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        // Usar prepared statement
        const [result] = await pool.execute(
            'DELETE FROM progress_entries WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medição não encontrada' });
        }

        // Retornar dados atualizados
        const [rows] = await pool.execute(
            'SELECT id, date, weight, bodyFat FROM progress_entries ORDER BY date DESC, id DESC'
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Erro ao excluir entrada:', error);
        res.status(500).json({ error: 'Falha ao excluir medição' });
    }
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🍽️  Sistema de Dieta - Servidor Rodando!               ║
║                                                            ║
║   🗄️  Banco de Dados: MySQL ✅                            ║
║                                                            ║
║   📊 Acesse: http://localhost:${PORT}                        ║
║   📋 Dieta: http://localhost:${PORT}/index.html             ║
║   📈 Progresso: http://localhost:${PORT}/progress.html      ║
║                                                            ║
║   💾 Dados: ${process.env.DB_NAME}@${process.env.DB_HOST}   ║
║                                                            ║
║   Pressione Ctrl+C para parar o servidor                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
