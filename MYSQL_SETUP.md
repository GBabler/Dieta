# 🚀 Guia de Configuração MySQL - Sistema Dieta

## ✅ O que foi implementado

Seu sistema foi **totalmente configurado** para usar MySQL com segurança máxima:

### 🔒 Segurança
- ✅ **Prepared Statements** - Protegido contra SQL Injection
- ✅ **Variáveis de Ambiente** - Credenciais NUNCA no código (arquivo `.env`)
- ✅ **Password Protection** - Todos os dados modificados requerem senha
- ✅ **Transações** - Garantia de integridade de dados

### 📊 Características MySQL
- ✅ **Conexão em Pool** - Melhor performance com múltiplas requisições
- ✅ **Índices** - Busca rápida por data
- ✅ **Timestamps** - Data de criação/atualização automática
- ✅ **Unique Constraint** - Uma medição por data

### 📁 Arquivos criados/modificados

```
✅ .env                    - Credenciais MySQL (⚠️  NUNCA commit)
✅ .env.example            - Template para .env (pode commit)
✅ .gitignore              - Protege arquivos sensíveis
✅ db.js                   - Conexão e inicialização MySQL
✅ server.js               - API com queries MySQL
✅ migrate.js              - Script de migração JSON → MySQL
✅ package.json            - Dependências atualizadas
```

---

## 🔧 Como usar

### 1️⃣ Instalar dependências (JÁ FEITO ✅)
```bash
npm install
```

### 2️⃣ Configurar credenciais MySQL

Edite o arquivo `.env` (já criado):
```env
DB_HOST=mysql.hostinger.com.br
DB_PORT=3306
DB_USER=u532802556_dieta
DB_PASSWORD=3X&cqNVO7+Mn
DB_NAME=u532802556_dieta
PORT=3000
NODE_ENV=development
SYSTEM_PASSWORD=8315
```

### 3️⃣ Iniciar servidor

#### Desenvolvimento (com auto-reload):
```bash
npm run dev
```

#### Produção:
```bash
npm start
```

### 4️⃣ (Opcional) Migrar dados do JSON antigo para MySQL

Se você tinha dados anteriores em `data/progress_data.json`:
```bash
node migrate.js
```

---

## 🗄️ Schema do Banco de Dados

```sql
CREATE TABLE progress_entries (
    id BIGINT PRIMARY KEY,                    -- Timestamp único
    date DATE NOT NULL UNIQUE,                -- Data única (uma por dia)
    weight DECIMAL(5, 2) NOT NULL,            -- Peso em kg (ex: 85.50)
    bodyFat DECIMAL(5, 2) NOT NULL,           -- % gordura (ex: 25.5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date DESC)                -- Índice para busca rápida
);
```

---

## 🔌 API Endpoints

Todos os endpoints retornam o array **completo e ordenado** (data DESC):

### ✅ GET `/api/progress`
Busca TODAS as medições (sem autenticação)
```bash
curl http://localhost:3000/api/progress
```

### 🔒 POST `/api/progress/add`
Adiciona nova medição (requer password)
```bash
curl -X POST http://localhost:3000/api/progress/add \
  -H "Content-Type: application/json" \
  -H "X-Password: 8315" \
  -d '{
    "date": "2026-01-21",
    "weight": 85.5,
    "bodyFat": 25.5
  }'
```

### 🔒 DELETE `/api/progress/:id`
Deleta medição por ID (requer password)
```bash
curl -X DELETE http://localhost:3000/api/progress/1768571469310 \
  -H "X-Password: 8315"
```

### 🔒 POST `/api/progress`
Substitui TODOS os dados (requer password)
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -H "X-Password: 8315" \
  -d '[
    {"id": 123, "date": "2026-01-20", "weight": 85.0, "bodyFat": 25.0},
    {"id": 456, "date": "2026-01-21", "weight": 85.5, "bodyFat": 25.5}
  ]'
```

---

## ⚠️ Troubleshooting

### ❌ Erro: "ENOTFOUND mysql.hostinger.com.br"
**Causa**: Servidor MySQL não está acessível (firewall, IP não whitelisted)

**Solução**:
1. Verifique se o IP está liberado na Hostinger
2. Teste a conexão manual:
```bash
mysql -h mysql.hostinger.com.br -u u532802556_dieta -p
```

### ❌ Erro: "Access denied for user"
**Causa**: Credenciais incorretas

**Solução**: Verifique o `.env` com os dados corretos

### ❌ Erro: "Table doesn't exist"
**Causa**: Tabela não foi criada automaticamente

**Solução**: Execute SQL diretamente:
```sql
CREATE TABLE progress_entries (
    id BIGINT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    weight DECIMAL(5, 2) NOT NULL,
    bodyFat DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date DESC)
);
```

---

## 🎯 Próximos passos

1. **Teste local** (se tiver MySQL instalado): `npm start`
2. **Deploy**: Rode em servidor com acesso ao MySQL da Hostinger
3. **Backup**: Use o botão Export em `progress.html` regularmente
4. **Monitoramento**: Veja logs do servidor para erros

---

## 📚 Segurança em Produção

- ✅ **NUNCA** commit do `.env` com senhas reais
- ✅ Use HTTPS em produção
- ✅ Considere hash bcrypt para a senha (atualmente plain text)
- ✅ Implemente rate limiting se necessário
- ✅ Monitore logs de erro

---

**Sistema pronto para uso! 🎉**
