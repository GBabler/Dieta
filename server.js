const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./db');
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
app.get('/api/progress', (req, res) => {
    try {
        const data = db.getAll();
        // Ordenar por data decrescente
        const sorted = data.sort((a, b) => {
            if (b.date === a.date) return b.id - a.id;
            return b.date.localeCompare(a.date);
        });
        res.json(sorted);
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Falha ao carregar dados' });
    }
});

// Save/Replace all progress data (PROTECTED)
app.post('/api/progress', validatePassword, (req, res) => {
    try {
        const data = req.body;

        // Validar dados
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Dados devem ser um array' });
        }

        // Validar cada entrada
        for (const entry of data) {
            if (!entry.date || entry.weight === undefined || entry.bodyFat === undefined) {
                return res.status(400).json({ error: 'Dados incompletos na entrada' });
            }
        }

        const result = db.replaceAll(data);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        res.status(500).json({ error: 'Falha ao salvar dados' });
    }
});

// Add new entry (PROTECTED)
app.post('/api/progress/add', validatePassword, (req, res) => {
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
        const entry = {
            id,
            date,
            weight: parseFloat(weight),
            bodyFat: parseFloat(bodyFat)
        };

        const result = db.add(entry);

        // Ordenar resultado
        const sorted = result.sort((a, b) => {
            if (b.date === a.date) return b.id - a.id;
            return b.date.localeCompare(a.date);
        });

        res.json({ success: true, data: sorted });
    } catch (error) {
        console.error('❌ Erro ao adicionar entrada:', error);

        // Erro de data duplicada
        if (error.message === 'DUPLICATE_DATE') {
            return res.status(400).json({ error: 'Já existe medição para esta data' });
        }

        res.status(500).json({ error: 'Falha ao adicionar medição' });
    }
});

// Delete entry (PROTECTED)
app.delete('/api/progress/:id', validatePassword, (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const result = db.delete(id);

        if (result === null) {
            return res.status(404).json({ error: 'Medição não encontrada' });
        }

        // Ordenar resultado
        const sorted = result.sort((a, b) => {
            if (b.date === a.date) return b.id - a.id;
            return b.date.localeCompare(a.date);
        });

        res.json({ success: true, data: sorted });
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
║   🗄️  Banco de Dados: JSON (Arquivo Local) ✅             ║
║                                                            ║
║   📊 Acesse: http://localhost:${PORT}                        ║
║   📋 Dieta: http://localhost:${PORT}/index.html             ║
║   📈 Progresso: http://localhost:${PORT}/progress.html      ║
║                                                            ║
║   💾 Arquivo: data/progress_data.json                      ║
║                                                            ║
║   Pressione Ctrl+C para parar o servidor                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
