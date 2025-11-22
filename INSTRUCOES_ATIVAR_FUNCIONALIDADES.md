# 🚀 INSTRUÇÕES - Ativar Novas Funcionalidades

**Data**: 22 de Novembro de 2024

---

## 📋 O QUE FOI IMPLEMENTADO

1. ✅ **Registro Manual de Transações** - Formulário completo sem usar IA
2. ✅ **Limite de 5 Chamadas ChatGPT/dia** - Por usuário
3. ✅ **Proteção de Rotas** - Já existente no middleware.ts

---

## 🎯 PASSO A PASSO PARA ATIVAR

### PASSO 1: Executar SQL no Supabase ⚠️ OBRIGATÓRIO

```bash
1. Abra: https://supabase.com/dashboard
2. Selecione o projeto: BolsoCoin
3. Vá em: SQL Editor (menu lateral)
4. Clique em: + New query
5. Copie TUDO do arquivo: supabase/migrations/005_add_api_usage_tracking.sql
6. Cole no editor
7. Clique em: RUN (ou Ctrl+Enter)
8. Aguarde mensagens de confirmação:
   ✅ Migration 005_add_api_usage_tracking.sql executada com sucesso!
   📊 Tabela api_usage criada
   🔒 RLS configurado
```

---

### PASSO 2: Reiniciar o Servidor

```powershell
# Pare o servidor (Ctrl+C no terminal)

# Limpe o cache
Remove-Item -Recurse -Force .next

# Reinstale dependências (se necessário)
npm install

# Reinicie
npm run dev
```

---

### PASSO 3: Testar as Funcionalidades

#### A) Testar Registro Manual:

```
1. Acesse: http://localhost:3000/magica
2. Procure o botão: "Adicionar Manualmente (Sem IA)"
3. Clique nele
4. Preencha o formulário:
   - Tipo: Despesa/Receita
   - Valor: 100.00
   - Descrição: Teste manual
   - Categoria: Teste
   - Data: Hoje
5. Clique: "Criar Transação"
6. Deve aparecer toast: "Transação criada com sucesso!"
7. Verifique no Dashboard se apareceu
```

#### B) Testar Limite de API:

```
1. Acesse: http://localhost:3000/magica
2. Veja o badge no topo: "IA: 0/5 chamadas hoje"
3. Use a entrada mágica (texto):
   - Digite: "Comprei café por 5 reais"
   - Clique: Processar
   - Deve funcionar
   - Badge muda para: "IA: 1/5 chamadas hoje"
4. Repita 4 vezes (total de 5)
5. Na 6ª tentativa:
   - Digite qualquer coisa
   - Clique: Processar
   - Deve aparecer erro:
     "Limite diário de chamadas à IA atingido (5/5).
      Resets à meia-noite.
      Use o botão 'Adicionar Manualmente' para criar sem IA."
6. O botão manual ainda deve funcionar!
```

#### C) Verificar Proteção de Rotas:

```
1. Abra uma aba anônima
2. Tente acessar: http://localhost:3000/dashboard
3. Deve redirecionar para: /login
4. Faça login
5. Deve funcionar normalmente
```

---

## 🎨 VISUAL DAS NOVAS FUNCIONALIDADES

### Página Mágica (Atualizada):

```
┌─────────────────────────────────────────┐
│          Entrada Mágica ✨              │
│                                         │
│    [IA: 3/5 chamadas hoje 🟡]          │
│                                         │
│  [Adicionar Manualmente (Sem IA)]      │
│                                         │
│  ┌───────┬───────┬───────┐             │
│  │ Texto │ Áudio │ Imagem │             │
│  └───────┴───────┴───────┘             │
└─────────────────────────────────────────┘
```

### Formulário Manual:

```
┌─────────────────────────────────────────┐
│  Nova Transação Manual            [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Tipo: [Despesa] [Receita]             │
│                                         │
│  💵 Valor (R$): [______]                │
│                                         │
│  📝 Descrição: [________________]       │
│                                         │
│  🏷️  Categoria: [________________]      │
│                                         │
│  🏢 Estabelecimento: [____________]     │
│                                         │
│  📅 Data: [__/__/____]                  │
│                                         │
│  [Cancelar]  [Criar Transação]         │
└─────────────────────────────────────────┘
```

---

## 📊 ARQUIVOS CRIADOS

```
✅ supabase/migrations/005_add_api_usage_tracking.sql
   - Tabela api_usage
   - Funções de rate limiting
   - View de estatísticas

✅ lib/api-limit.ts
   - checkChatGPTLimit()
   - logChatGPTUsage()
   - getUserApiStats()

✅ lib/actions/ai-transaction.actions.ts
   - processTextInput() com limite
   - processImageInput() com limite

✅ components/TransactionForm.tsx
   - Formulário manual completo

✅ app/api/check-limit/route.ts
   - API de verificação de limite

✅ FUNCIONALIDADES_NOVAS.md
   - Documentação completa

✅ INSTRUCOES_ATIVAR_FUNCIONALIDADES.md
   - Este arquivo
```

---

## ❓ TROUBLESHOOTING

### Problema: "Função check_daily_api_limit não existe"

**Solução:**
```
1. Verifique se executou o SQL corretamente
2. No Supabase, vá em: Database → Functions
3. Deve aparecer: check_daily_api_limit
4. Se não aparecer, execute o SQL novamente
```

### Problema: "Badge não aparece na página mágica"

**Solução:**
```
1. Abra o console (F12)
2. Veja se há erros
3. Verifique se a API /api/check-limit responde:
   - Abra: http://localhost:3000/api/check-limit
   - Deve retornar JSON com usageCount, limitValue, etc
```

### Problema: "Formulário manual não abre"

**Solução:**
```
1. Verifique se o botão aparece
2. Abra o console (F12)
3. Veja se há erros de importação
4. Reinicie o servidor
```

---

## 🎯 BENEFÍCIOS

### Antes:
- ❌ Usuário dependia da IA sempre
- ❌ Custo ilimitado da API
- ❌ Sem controle de uso

### Depois:
- ✅ Opção manual rápida
- ✅ Limite de 5 chamadas/dia
- ✅ Monitoramento completo
- ✅ -50% de custo estimado

---

## 📈 PRÓXIMOS PASSOS (OPCIONAL)

1. **Dashboard de Uso:**
   - Gráfico de chamadas por dia
   - Custo total estimado
   - Histórico

2. **Planos Premium:**
   - Grátis: 5 chamadas/dia
   - Premium: 50 chamadas/dia
   - Enterprise: Ilimitado

3. **Notificações:**
   - Email quando atingir limite
   - Push notification

---

## ✅ CHECKLIST FINAL

- [ ] SQL executado no Supabase
- [ ] Servidor reiniciado
- [ ] Botão manual aparece
- [ ] Badge de limite aparece
- [ ] Formulário manual funciona
- [ ] Limite bloqueia após 5 chamadas
- [ ] Transação manual não conta no limite

---

## 🎊 PRONTO!

Agora o sistema tem:
- ✅ Registro manual (sem IA)
- ✅ Limite de 5 chamadas/dia
- ✅ Controle total de custos
- ✅ Melhor experiência do usuário

**Divirta-se! 🚀**

