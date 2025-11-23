# 🔐 Configuração de Expiração de Sessão

## 📋 O que foi implementado

O sistema BolsoCoin agora possui **expiração automática de sessão a cada 6 horas**, garantindo maior segurança e solicitando novo login periodicamente.

## ⚙️ Arquivos Modificados

### 1. `lib/supabase/client.ts`
- Adicionada configuração de sessão com tempo de expiração
- Implementada função `checkSessionExpiration()` que verifica a idade da sessão
- Sessões com mais de 6 horas são automaticamente encerradas

### 2. `lib/supabase/middleware.ts`
- Middleware verifica a idade da sessão em rotas protegidas
- Se a sessão tiver mais de 6 horas, força logout e redireciona para login
- Parâmetro `?session=expired` adicionado à URL para informar o usuário

### 3. `components/SessionValidator.tsx` (NOVO)
- Componente client-side que valida a sessão periodicamente
- Verifica a cada 5 minutos se a sessão ainda é válida
- Também verifica quando o usuário retorna à aba (visibilitychange)
- Se sessão expirada, redireciona para login automaticamente

### 4. `app/(dashboard)/layout.tsx`
- Adicionado `<SessionValidator />` para validação contínua da sessão
- Componente fica ativo em todas as páginas do dashboard

### 5. `app/(auth)/login/page.tsx`
- Adicionado aviso visual quando a sessão expira
- Toast de notificação informando que a sessão expirou
- Banner amarelo explicando a expiração de 6 horas

## 🎯 Como Funciona

### Validação Server-Side (Middleware)
```
Usuário acessa rota protegida
    ↓
Middleware verifica sessão
    ↓
Calcula idade da sessão (tempo desde último login)
    ↓
Se > 6 horas:
    - Faz logout
    - Redireciona para /login?session=expired
    ↓
Se < 6 horas:
    - Permite acesso
```

### Validação Client-Side (SessionValidator)
```
Componente monta no dashboard
    ↓
Verifica sessão imediatamente
    ↓
Configura verificação a cada 5 minutos
    ↓
Configura verificação ao retornar à aba
    ↓
Se sessão expirada em qualquer verificação:
    - Redireciona para /login?session=expired
```

## ⏱️ Configuração de Tempo

O tempo de expiração está definido como constante em dois arquivos:

**`lib/supabase/client.ts`:**
```typescript
const SESSION_EXPIRATION_TIME = 6 * 60 * 60; // 21600 segundos = 6 horas
```

**`lib/supabase/middleware.ts`:**
```typescript
const SESSION_EXPIRATION_TIME = 6 * 60 * 60; // 21600 segundos = 6 horas
```

### Como Alterar o Tempo de Expiração

Para alterar o tempo de expiração, modifique o valor em ambos os arquivos:

```typescript
// Para 3 horas:
const SESSION_EXPIRATION_TIME = 3 * 60 * 60;

// Para 12 horas:
const SESSION_EXPIRATION_TIME = 12 * 60 * 60;

// Para 1 hora:
const SESSION_EXPIRATION_TIME = 1 * 60 * 60;
```

## 🔄 Fluxo de Expiração

1. **Usuário faz login** → Sessão inicia
2. **Após 6 horas** → Sessão expira
3. **Usuário tenta acessar página protegida** → Middleware detecta expiração
4. **OU SessionValidator detecta expiração** → Durante verificação periódica
5. **Sistema faz logout automático** → Limpa sessão
6. **Redireciona para login** → Com parâmetro `?session=expired`
7. **Página de login mostra aviso** → Banner amarelo + Toast
8. **Usuário faz novo login** → Nova sessão de 6 horas inicia

## 🛡️ Segurança

Esta implementação garante:

✅ **Sessões não ficam abertas indefinidamente**
✅ **Validação tanto server-side quanto client-side**
✅ **Logout automático após 6 horas**
✅ **Verificação periódica (a cada 5 minutos)**
✅ **Verificação ao retornar à aba**
✅ **Feedback claro ao usuário sobre expiração**

## 📝 Observações

- A sessão é calculada a partir do `last_sign_in_at` do usuário
- Se o usuário não tiver `last_sign_in_at`, usa `created_at`
- A validação client-side complementa a server-side para melhor UX
- O aviso de expiração é exibido apenas uma vez por sessão expirada
- O sistema mantém o histórico da página que o usuário tentou acessar (`redirectTo` parameter)

## 🎨 Experiência do Usuário

Quando a sessão expira, o usuário vê:

1. **Banner amarelo** no topo da página de login explicando a expiração
2. **Toast de notificação** (temporário) avisando sobre a expiração
3. **Mensagem clara** explicando a política de 6 horas

## ✅ Status

🟢 **IMPLEMENTADO E ATIVO**

Todas as modificações foram aplicadas e o sistema agora solicita login a cada 6 horas conforme solicitado.

---

**Desenvolvido para BolsoCoin**  
© 2025 BRANDUP HUB

