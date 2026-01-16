const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'progress_data.json');

// Senha de proteção (hash simples para comparação)
const SYSTEM_PASSWORD = '8315';

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

// Get all progress data
app.get('/api/progress', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// Save progress data (PROTECTED)
app.post('/api/progress', validatePassword, async (req, res) => {
    try {
        const data = req.body;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Add new entry (PROTECTED)
app.post('/api/progress/add', validatePassword, async (req, res) => {
    try {
        const { date, weight, bodyFat } = req.body;

        // Read current data
        const fileData = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(fileData);

        // Add new entry with unique ID
        const newEntry = {
            id: Date.now(),
            date,
            weight: parseFloat(weight),
            bodyFat: parseFloat(bodyFat)
        };

        data.push(newEntry);

        // Sort by date (newest first)
        data.sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare === 0) {
                return (b.id || 0) - (a.id || 0);
            }
            return dateCompare;
        });

        // Save to file
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error adding entry:', error);
        res.status(500).json({ error: 'Failed to add entry' });
    }
});

// Delete entry (PROTECTED)
app.delete('/api/progress/:id', validatePassword, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Read current data
        const fileData = await fs.readFile(DATA_FILE, 'utf8');
        let data = JSON.parse(fileData);

        // Filter out the entry
        data = data.filter(entry => entry.id !== id);

        // Save to file
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🍽️  Sistema de Dieta - Servidor Rodando!               ║
║                                                            ║
║   📊 Acesse: http://localhost:${PORT}                        ║
║   📋 Dieta: http://localhost:${PORT}/index.html             ║
║   📈 Progresso: http://localhost:${PORT}/progress.html      ║
║                                                            ║
║   💾 Dados salvos em: data/progress_data.json             ║
║                                                            ║
║   Pressione Ctrl+C para parar o servidor                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
