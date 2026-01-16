# 🍽️ Sistema de Dieta e Acompanhamento - Gabriel Babler

Sistema completo para gerenciamento de dieta e acompanhamento de progresso corporal.

## 📋 Funcionalidades

### Página de Dieta (`index.html`)
- ✅ Visualização completa do plano alimentar diário
- ✅ 5 refeições programadas com horários
- ✅ Macros detalhados: 200g proteína, 200g carboidratos, ~94g gordura
- ✅ Lista de compras (mensal e semanal)
- ✅ Design responsivo para mobile

### Página de Progresso (`progress.html`)
- ✅ Formulário para adicionar medições (peso e % gordura)
- ✅ Cards com estatísticas atuais
- ✅ Gráficos interativos de evolução
- ✅ Histórico completo de medições
- ✅ **Sistema de Backup e Restauração**

## 🔒 Sistema de Backup

### Por que fazer backup?

Os dados são salvos no **LocalStorage** do navegador, que pode ser perdido se:
- Você limpar o cache do navegador
- Reinstalar o navegador
- Usar modo anônimo
- Trocar de computador

### Como fazer backup:

1. **Exportar dados** (recomendado semanalmente):
   - Acesse a página `progress.html`
   - Clique em **"📥 Exportar Dados (Backup)"**
   - Salve o arquivo `diet_progress_backup.json` em um local seguro

2. **Onde salvar o backup**:
   - ☁️ Google Drive
   - ☁️ Dropbox
   - ☁️ OneDrive
   - 📁 Pasta local com backup automático
   - 📧 Envie por email para você mesmo

### Como restaurar backup:

1. Acesse `progress.html`
2. Clique em **"📤 Importar Backup"**
3. Selecione o arquivo `.json` salvo anteriormente
4. Seus dados serão restaurados automaticamente

## 📊 Dados Atuais

**Data inicial:** 16/01/2026
- **Peso:** 100.2 kg
- **% Gordura:** 32.0%
- **Massa Magra:** ~68.1 kg
- **Massa Gorda:** ~32.1 kg
- **Meta:** 85.0 kg

## 🚀 Como usar

1. Abra `index.html` para ver sua dieta
2. Abra `progress.html` para:
   - Adicionar novas medições semanais
   - Ver gráficos de evolução
   - Fazer backup dos dados

## 📁 Estrutura de Arquivos

```
Dieta/
├── index.html              # Página principal da dieta
├── progress.html           # Página de acompanhamento
├── progress.js             # Lógica de gerenciamento de dados
├── data/
│   └── progress_data.json  # Dados iniciais (referência)
└── README.md              # Este arquivo
```

## 💡 Dicas

1. **Faça backup semanalmente** após adicionar novas medições
2. **Pese-se sempre no mesmo horário** (preferencialmente pela manhã, em jejum)
3. **Mantenha consistência** nas medições (mesmo dia da semana)
4. **Use bioimpedância** para medir % de gordura com mais precisão

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (Design GitHub Dark Theme)
- JavaScript (Vanilla)
- Chart.js (Gráficos)
- LocalStorage (Armazenamento local)

## 📝 Notas

- Os dados são salvos **apenas no seu navegador**
- **Não há sincronização automática** entre dispositivos
- **Faça backup regularmente** para não perder seus dados
- O arquivo de backup é um JSON simples e pode ser editado manualmente se necessário

---

**Desenvolvido para Gabriel Babler** | Última atualização: 16/01/2026