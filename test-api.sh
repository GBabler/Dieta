#!/usr/bin/env bash

# 🧪 Script de Teste da API - Sistema Dieta
# Use este script para testar os endpoints da API

BASE_URL="http://localhost:3000/api"
PASSWORD="8315"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🧪 Teste de API - Sistema Dieta${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 1. Teste de Conexão
echo -e "${BLUE}1. Testando conexão com servidor...${NC}"
if curl -s -f "$BASE_URL/progress" > /dev/null; then
    echo -e "${GREEN}✅ Servidor online${NC}"
else
    echo -e "${RED}❌ Servidor offline - inicie com: npm start${NC}"
    exit 1
fi
echo ""

# 2. GET - Buscar dados existentes
echo -e "${BLUE}2. GET /api/progress (Buscar todas medições)${NC}"
curl -s -X GET "$BASE_URL/progress" | jq '.' || echo "Nenhum dado ainda"
echo -e "\n${GREEN}✅ OK${NC}\n"

# 3. POST - Adicionar medição
echo -e "${BLUE}3. POST /api/progress/add (Adicionar nova medição)${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/progress/add" \
  -H "Content-Type: application/json" \
  -H "X-Password: $PASSWORD" \
  -d '{
    "date": "2026-01-21",
    "weight": 85.5,
    "bodyFat": 25.5
  }')

echo "$RESPONSE" | jq '.'

# Extrair ID para teste de delete
ID=$(echo "$RESPONSE" | jq -r '.data[0].id')
echo -e "${GREEN}✅ Medição adicionada com ID: $ID${NC}\n"

# 4. GET - Verificar dado adicionado
echo -e "${BLUE}4. GET /api/progress (Verificar dados)${NC}"
curl -s -X GET "$BASE_URL/progress" | jq '.'
echo -e "${GREEN}✅ OK${NC}\n"

# 5. DELETE - Deletar medição
echo -e "${BLUE}5. DELETE /api/progress/:id (Deletar medição)${NC}"
if [ -n "$ID" ] && [ "$ID" != "null" ]; then
    curl -s -X DELETE "$BASE_URL/progress/$ID" \
      -H "X-Password: $PASSWORD" | jq '.'
    echo -e "${GREEN}✅ Medição deletada${NC}\n"
else
    echo -e "${RED}⚠️  Não conseguiu obter ID para delete${NC}\n"
fi

# 6. POST - Verificar validação de password
echo -e "${BLUE}6. Teste de Segurança - Password incorreta${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/progress/add" \
  -H "Content-Type: application/json" \
  -H "X-Password: 9999" \
  -d '{
    "date": "2026-01-22",
    "weight": 86.0,
    "bodyFat": 26.0
  }')

if echo "$RESPONSE" | jq . | grep -q "INVALID_PASSWORD"; then
    echo -e "${GREEN}✅ Validação de password funcionando!${NC}"
    echo "$RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Validação falhou${NC}"
    echo "$RESPONSE" | jq '.'
fi
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo -e "${BLUE}================================${NC}"
