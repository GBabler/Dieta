const fs = require('fs');
const path = require('path');

// Caminho do arquivo de dados
const dataPath = path.join(__dirname, 'data', 'progress_data.json');

// Garantir que a pasta data existe
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar arquivo se não existir
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
    console.log('✅ Arquivo de dados criado:', dataPath);
} else {
    console.log('✅ Arquivo de dados encontrado:', dataPath);
}

// Funções para manipular dados
const db = {
    // Ler todos os dados
    getAll() {
        try {
            const data = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Erro ao ler dados:', error);
            return [];
        }
    },

    // Salvar todos os dados
    saveAll(data) {
        try {
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },

    // Adicionar nova entrada
    add(entry) {
        const data = this.getAll();

        // Verificar se já existe entrada para esta data
        const exists = data.some(item => item.date === entry.date);
        if (exists) {
            throw new Error('DUPLICATE_DATE');
        }

        data.push(entry);
        this.saveAll(data);
        return this.getAll(); // Retornar dados ordenados
    },

    // Deletar entrada por ID
    delete(id) {
        const data = this.getAll();
        const filtered = data.filter(item => item.id !== id);

        if (filtered.length === data.length) {
            return null; // Não encontrou
        }

        this.saveAll(filtered);
        return this.getAll();
    },

    // Substituir todos os dados
    replaceAll(newData) {
        this.saveAll(newData);
        return this.getAll();
    }
};

module.exports = db;
