# 🎯 INSTRUÇÕES: Como Executar o SQL no Supabase

**ATENÇÃO:** Esta é a correção DEFINITIVA para o erro de recursão infinita!

---

## 📋 PASSO A PASSO

### 1️⃣ Abrir o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto **BolsoCoin**

---

### 2️⃣ Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone </> )
2. Clique em **+ New query** (botão superior direito)

---

### 3️⃣ Copiar o SQL

1. Abra o arquivo: `supabase/FIX_ALL_RLS_RECURSION.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

---

### 4️⃣ Colar e Executar

1. **Cole** o SQL no editor (Ctrl+V)
2. Clique no botão **RUN** (canto inferior direito) ou pressione **Ctrl+Enter**
3. **AGUARDE** a execução (pode levar 5-10 segundos)

---

### 5️⃣ Verificar Sucesso

Você deve ver mensagens como:

```
✅ TODAS AS POLÍTICAS RECURSIVAS FORAM REMOVIDAS!
✅ NOVAS POLÍTICAS SIMPLES CRIADAS (apenas owner_id)
✅ workspace_members RLS DESABILITADO
✅ TRIGGER de criação automática DESABILITADO

🎯 SISTEMA AGORA FUNCIONA APENAS COM OWNERS
📝 Para reimplementar multi-usuário, use PostgreSQL Functions
```

---

### 6️⃣ Verificar Políticas

Para confirmar que funcionou:

1. Ainda no Supabase, clique em **Database** no menu lateral
2. Clique em **Policies** (ou **RLS**)
3. Procure por **workspace_members**
4. Deve aparecer: **"RLS is disabled"** ou sem políticas

---

### 7️⃣ Reiniciar o Servidor

Após executar o SQL com sucesso:

```bash
# Parar servidor
Ctrl+C (ou fechar terminal)

# Limpar cache
Remove-Item -Recurse -Force .next

# Reiniciar
npm run dev
```

---

## ⚠️ SE DER ERRO

### Erro: "policy already exists"
**Solução:** O SQL já foi executado antes. Está tudo OK!

### Erro: "permission denied"
**Solução:** Você precisa ser **owner** do projeto Supabase ou ter permissões de admin.

### Erro: "relation does not exist"
**Solução:** Execute primeiro as migrations anteriores:
1. `supabase/schema.sql`
2. `supabase/migrations/002_add_budgets_goals.sql`
3. `supabase/migrations/003_add_multi_workspace.sql`
4. Depois execute `FIX_ALL_RLS_RECURSION.sql`

---

## 🎯 RESULTADO ESPERADO

Após executar o SQL + reiniciar servidor:

- ✅ Dashboard carrega normalmente
- ✅ Sem erro `infinite recursion` no console
- ✅ Transações aparecem
- ✅ Metas funcionam
- ✅ Workspace criado automaticamente

---

## 📝 O QUE O SQL FAZ

1. **Remove** 9 políticas RLS recursivas
2. **Desabilita** RLS em `workspace_members`
3. **Desabilita** trigger automático de criação
4. **Cria** políticas simples (apenas owner_id)
5. **Garante** zero recursão

---

## 🔄 APÓS EXECUTAR

1. **Feche** todas as abas do navegador com localhost:3000
2. **Reinicie** o servidor Next.js
3. **Limpe** o cache do navegador (Ctrl+Shift+Del)
4. **Abra** http://localhost:3000 novamente
5. **Faça login**

---

## ✅ CHECKLIST

- [ ] SQL executado no Supabase com sucesso
- [ ] Mensagens de confirmação apareceram
- [ ] RLS desabilitado em workspace_members verificado
- [ ] Servidor Next.js reiniciado
- [ ] Cache limpo (.next deletado)
- [ ] Dashboard carrega sem "Carregando..." infinito
- [ ] Console sem erro de recursão

---

**Se tudo isso estiver ✅, o problema está RESOLVIDO!** 🎉

