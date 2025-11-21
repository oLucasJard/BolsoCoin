# 🤖 Guia Completo: OpenAI API para BolsoCoin

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Criando sua Conta OpenAI](#criando-sua-conta-openai)
3. [Obtendo a API Key](#obtendo-a-api-key)
4. [Configurando no BolsoCoin](#configurando-no-bolsocoin)
5. [Custos Detalhados](#custos-detalhados)
6. [Calculadora de Custos](#calculadora-de-custos)
7. [Otimizações para Reduzir Custos](#otimizações-para-reduzir-custos)
8. [Monitoramento de Uso](#monitoramento-de-uso)
9. [Limites e Quotas](#limites-e-quotas)
10. [Alternativas e Comparações](#alternativas-e-comparações)

---

## 🎯 Visão Geral

O BolsoCoin usa **3 APIs da OpenAI**:

| API | Uso | Custo Estimado/Mês |
|-----|-----|-------------------|
| **GPT-4o** | Extração de dados de texto | $5-15 |
| **GPT-4o Vision** | Leitura de recibos (OCR) | $3-10 |
| **Whisper** | Transcrição de áudio | $1-5 |
| **TOTAL** | | **$9-30/mês** |

> 💡 **Para uso pessoal** (1-2 transações/dia): ~$5-10/mês  
> 💼 **Para uso intensivo** (10+ transações/dia): ~$20-30/mês

---

## 🚀 Criando sua Conta OpenAI

### Passo 1: Cadastro

1. Acesse: [https://platform.openai.com/signup](https://platform.openai.com/signup)

2. **Opções de cadastro**:
   - Email + Senha
   - Google Account
   - Microsoft Account

3. **Confirme seu email** (se usar email/senha)

### Passo 2: Adicionar Método de Pagamento

⚠️ **IMPORTANTE**: A OpenAI **requer cartão de crédito** para usar a API.

1. Vá para: [https://platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)

2. Clique em **"Add payment method"**

3. **Opções aceitas**:
   - Cartão de Crédito (Visa, Mastercard, Amex)
   - Cartão de Débito Internacional
   - ❌ Não aceita: Boleto, PIX, PayPal

4. Preencha os dados do cartão

### Passo 3: Adicionar Créditos

Há duas opções de pagamento:

#### Opção A: Pay-as-you-go (Recomendado)

- Você é cobrado pelo que usar
- Mínimo: $5 USD
- Sem compromisso mensal
- **Melhor para**: Uso variável

#### Opção B: Créditos Pré-pagos

- Compra créditos antecipadamente
- Mínimo: $5 USD
- Não expiram
- **Melhor para**: Controle de gastos

**Como adicionar**:
1. Vá em **"Billing" → "Add credits"**
2. Escolha o valor (mínimo $5)
3. Confirme o pagamento

---

## 🔑 Obtendo a API Key

### Passo 1: Acessar API Keys

1. Vá para: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

2. Você verá a tela de gerenciamento de chaves

### Passo 2: Criar Nova Chave

1. Clique em **"Create new secret key"**

2. **Dê um nome descritivo**:
   ```
   Sugestão: "BolsoCoin - Produção"
   ```

3. **(Opcional) Defina permissões**:
   - All (Recomendado para começar)
   - Ou restrinja a apenas as APIs que vai usar

4. Clique em **"Create secret key"**

### Passo 3: COPIE e GUARDE a Chave

⚠️ **ATENÇÃO**: A chave aparece **APENAS UMA VEZ**!

```
Exemplo: sk-proj-abc123def456...
```

**Onde guardar**:
- ✅ Gerenciador de senhas (1Password, Bitwarden)
- ✅ Arquivo `.env.local` (não commitar!)
- ❌ **NUNCA** commitar no Git
- ❌ **NUNCA** compartilhar publicamente

### Passo 4: Configurar no Projeto

No arquivo `.env.local`:

```env
OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI
```

---

## ⚙️ Configurando no BolsoCoin

### Setup Completo

1. **Crie o arquivo `.env.local`** na raiz do projeto

2. **Adicione as variáveis**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-supabase

# OpenAI API
OPENAI_API_KEY=sk-proj-sua-chave-openai-aqui

# Telegram (Opcional)
TELEGRAM_BOT_TOKEN=seu-token-telegram
TELEGRAM_WEBHOOK_SECRET=seu-secret
```

3. **Reinicie o servidor**:

```bash
# Parar o servidor (Ctrl+C)
npm run dev
```

4. **Teste a integração**:

```bash
# Acesse a Página Mágica
http://localhost:3000/magica

# Tente processar um texto:
"Comprei café 15 reais"
```

Se funcionar, a API está configurada! ✅

---

## 💰 Custos Detalhados

### Tabela de Preços (Atualizado Nov 2024)

#### 1. GPT-4o (Processamento de Texto)

| Modelo | Input | Output | Uso no BolsoCoin |
|--------|-------|--------|------------------|
| **GPT-4o** | $2.50/1M tokens | $10.00/1M tokens | Extrair dados de transações |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | Alternativa mais barata |

**Estimativa de Uso**:
- 1 transação por texto = ~200 tokens
- 100 transações = ~20.000 tokens = **$0.05**

#### 2. GPT-4o Vision (Leitura de Imagens)

| Modelo | Custo por Imagem | Uso no BolsoCoin |
|--------|------------------|------------------|
| **GPT-4o** | $0.00425 por imagem (detalhe alto) | Ler recibos |
| GPT-4o | $0.00106 por imagem (detalhe baixo) | |

**Estimativa de Uso**:
- 1 recibo = ~$0.004
- 100 recibos = **$0.40**

#### 3. Whisper (Transcrição de Áudio)

| Modelo | Custo | Uso no BolsoCoin |
|--------|-------|------------------|
| **Whisper** | $0.006 por minuto | Transcrever áudio |

**Estimativa de Uso**:
- 1 áudio de 10 segundos = ~$0.001
- 100 áudios = **$0.10**

### Cenários de Uso Real

#### 🏠 Uso Pessoal (30 transações/mês)

| Método | Quantidade | Custo |
|--------|------------|-------|
| Texto | 20 transações | $0.01 |
| Imagem | 5 recibos | $0.02 |
| Áudio | 5 áudios | $0.01 |
| **TOTAL/MÊS** | | **$0.04** |

💡 **Custo anual**: ~$0.50

#### 👤 Uso Moderado (100 transações/mês)

| Método | Quantidade | Custo |
|--------|------------|-------|
| Texto | 60 transações | $0.03 |
| Imagem | 20 recibos | $0.08 |
| Áudio | 20 áudios | $0.02 |
| **TOTAL/MÊS** | | **$0.13** |

💡 **Custo anual**: ~$1.56

#### 💼 Uso Intensivo (500 transações/mês)

| Método | Quantidade | Custo |
|--------|------------|-------|
| Texto | 300 transações | $0.15 |
| Imagem | 100 recibos | $0.40 |
| Áudio | 100 áudios | $0.10 |
| **TOTAL/MÊS** | | **$0.65** |

💡 **Custo anual**: ~$8

#### 🏢 Uso Empresarial (2000 transações/mês)

| Método | Quantidade | Custo |
|--------|------------|-------|
| Texto | 1200 transações | $0.60 |
| Imagem | 500 recibos | $2.00 |
| Áudio | 300 áudios | $0.30 |
| **TOTAL/MÊS** | | **$2.90** |

💡 **Custo anual**: ~$35

---

## 🧮 Calculadora de Custos

### Fórmula Simples

```
Custo Mensal = (Textos × $0.0005) + (Imagens × $0.004) + (Áudios × $0.001)
```

### Exemplos Práticos

**Exemplo 1**: 50 textos, 10 imagens, 5 áudios/mês
```
= (50 × $0.0005) + (10 × $0.004) + (5 × $0.001)
= $0.025 + $0.04 + $0.005
= $0.07/mês
```

**Exemplo 2**: 200 textos, 50 imagens, 30 áudios/mês
```
= (200 × $0.0005) + (50 × $0.004) + (30 × $0.001)
= $0.10 + $0.20 + $0.03
= $0.33/mês
```

---

## 💡 Otimizações para Reduzir Custos

### 1. Use GPT-4o-mini para Textos Simples

**Economia**: 85-90%

```typescript
// lib/openai.ts
const model = isComplexQuery ? 'gpt-4o' : 'gpt-4o-mini';
```

**Quando usar cada um**:
- **GPT-4o**: Textos complexos, múltiplas transações
- **GPT-4o-mini**: Textos simples e diretos

### 2. Reduza o Tamanho das Imagens

**Economia**: 50-75%

```typescript
// Redimensionar antes de enviar
const maxWidth = 1024;
const maxHeight = 1024;
```

### 3. Cache de Respostas Comuns

**Economia**: 30-50%

```typescript
// Cache de categorias mais usadas
const categoryCache = new Map();
```

### 4. Batch Processing

Processe múltiplas transações de uma vez:

```typescript
// Em vez de 10 chamadas separadas:
"Transação 1, Transação 2, ..."
```

### 5. Limite de Áudio

**Economia**: 40%

```typescript
// Limite de 30 segundos de gravação
const MAX_AUDIO_DURATION = 30;
```

### Impacto das Otimizações

| Sem Otimização | Com Otimização | Economia |
|----------------|----------------|----------|
| $10/mês | $3-5/mês | **50-70%** |

---

## 📊 Monitoramento de Uso

### Dashboard da OpenAI

1. Acesse: [https://platform.openai.com/usage](https://platform.openai.com/usage)

2. **Métricas disponíveis**:
   - Uso diário/mensal
   - Custo por modelo
   - Número de requisições
   - Tokens consumidos

### Alertas de Gastos

1. Vá em **"Billing" → "Usage limits"**

2. **Configure alertas**:
   - Alerta em $5
   - Alerta em $10
   - Alerta em $20
   - Limite máximo (hard limit)

### Implementar Log Local

```typescript
// lib/openai-logger.ts
export function logAPICall(model: string, tokens: number, cost: number) {
  console.log({
    timestamp: new Date(),
    model,
    tokens,
    cost,
  });
  
  // Salvar em banco ou arquivo
}
```

---

## 🎯 Limites e Quotas

### Tier System da OpenAI

A OpenAI tem um sistema de níveis baseado em quanto você gastou:

| Tier | Gasto Acumulado | RPM* | TPM** | Limite Diário |
|------|-----------------|------|-------|---------------|
| **Free** | $0 | 3 | 200K | $100 |
| **Tier 1** | $5+ | 500 | 30M | $100 |
| **Tier 2** | $50+ | 5000 | 450M | $500 |
| **Tier 3** | $100+ | 5000 | 10B | $1000 |
| **Tier 4** | $250+ | 10000 | 80B | $5000 |

*RPM = Requests Per Minute  
**TPM = Tokens Per Minute

### Para o BolsoCoin

**Uso Normal**: Tier 1 ($5+) é suficiente
- 500 requisições/minuto
- 30M tokens/minuto
- Suporta milhares de transações/dia

---

## 🔄 Alternativas e Comparações

### 1. OpenAI GPT-4o (Recomendado ✅)

**Prós**:
- ✅ Melhor qualidade de extração
- ✅ Suporte a Vision e Audio
- ✅ Documentação excelente
- ✅ Confiável e estável

**Contras**:
- ❌ Mais caro que alternativas
- ❌ Requer cartão internacional

**Custo**: $2.50-10/1M tokens

### 2. GPT-4o-mini (Alternativa Econômica)

**Prós**:
- ✅ 85% mais barato
- ✅ Boa qualidade para textos simples
- ✅ Mais rápido

**Contras**:
- ❌ Menos preciso em textos complexos

**Custo**: $0.15-0.60/1M tokens

### 3. Claude 3 (Anthropic)

**Prós**:
- ✅ Qualidade similar ao GPT-4
- ✅ Bom suporte a português
- ✅ API similar

**Contras**:
- ❌ Sem Vision native
- ❌ Sem Whisper

**Custo**: $3-15/1M tokens

### 4. Gemini Pro (Google)

**Prós**:
- ✅ Free tier generoso
- ✅ Suporte a Vision
- ✅ Rápido

**Contras**:
- ❌ Qualidade inferior para português
- ❌ Sem áudio nativo

**Custo**: Grátis até limite, depois $0.5/1M tokens

### 5. Open Source (Llama, Mistral)

**Prós**:
- ✅ Grátis (self-hosted)
- ✅ Privacidade total

**Contras**:
- ❌ Requer infraestrutura própria
- ❌ Qualidade inferior
- ❌ Complexo de configurar

**Custo**: $0 + custo de servidor

### Comparação de Custos

| Modelo | 1000 Transações | Qualidade | Velocidade |
|--------|----------------|-----------|------------|
| GPT-4o | $0.50 | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ |
| GPT-4o-mini | $0.08 | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ |
| Claude 3 | $0.60 | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ |
| Gemini Pro | $0.10 | ⭐⭐⭐ | ⚡⚡⚡⚡ |
| Open Source | $0* | ⭐⭐ | ⚡⚡ |

*Não inclui custo de servidor

---

## 🎓 Dicas de Boas Práticas

### 1. Começe com Créditos Baixos

```
Primeira vez: $5-10
Depois de 1 mês: Ajuste conforme uso real
```

### 2. Monitore Semanalmente

Configure alertas e revise uso toda semana no início.

### 3. Use Variáveis de Ambiente

```env
# .env.local
OPENAI_API_KEY=sua-chave
OPENAI_ORG_ID=sua-org (opcional)
```

### 4. Implemente Rate Limiting

```typescript
// Limite de 10 requisições/minuto por usuário
const rateLimiter = new RateLimiter(10, '1m');
```

### 5. Tenha um Backup

Configure chaves de API de backup caso atinja limites.

---

## 🆘 Troubleshooting

### Erro: "Insufficient Quota"

**Solução**:
1. Adicione créditos em Billing
2. Verifique método de pagamento
3. Aguarde aprovação (pode levar horas)

### Erro: "Rate Limit Exceeded"

**Solução**:
1. Reduza frequência de requisições
2. Upgrade para tier superior
3. Implemente exponential backoff

### Erro: "Invalid API Key"

**Solução**:
1. Verifique se copiou a chave completa
2. Verifique se não tem espaços
3. Gere uma nova chave se necessário

### Custos Muito Altos

**Solução**:
1. Revise logs de uso
2. Implemente cache
3. Use GPT-4o-mini quando possível
4. Reduza tamanho de imagens

---

## 📋 Checklist Final

Antes de colocar em produção:

- [ ] Conta OpenAI criada
- [ ] Método de pagamento adicionado
- [ ] Créditos iniciais adicionados ($5-10)
- [ ] API Key gerada e salva com segurança
- [ ] `.env.local` configurado
- [ ] Teste realizado com sucesso
- [ ] Alertas de custo configurados
- [ ] Limite máximo definido
- [ ] Monitoramento implementado
- [ ] Otimizações aplicadas

---

## 💬 Suporte

### Documentação Oficial
- [OpenAI Platform](https://platform.openai.com/docs)
- [Pricing](https://openai.com/pricing)
- [API Reference](https://platform.openai.com/docs/api-reference)

### Comunidade
- [OpenAI Community Forum](https://community.openai.com/)
- [Discord Oficial](https://discord.gg/openai)

### Suporte BolsoCoin
- GitHub Issues: [seu-repo/issues](https://github.com/oLucasJard/BolsoCoin/issues)

---

## 📊 Resumo Executivo

### Para Uso Pessoal (Recomendado)

1. **Crie conta** em platform.openai.com
2. **Adicione $5-10** de créditos
3. **Gere API key**
4. **Configure no `.env.local`**
5. **Use normalmente**
6. **Custo esperado**: $0.50-2/mês

### Para Uso Profissional

1. Configure alertas de $20
2. Use GPT-4o-mini quando possível
3. Implemente cache
4. Monitore semanalmente
5. **Custo esperado**: $5-30/mês

---

**Última atualização**: 21/11/2024  
**Versão**: 1.0  
**Autor**: BRANDUP HUB 💚

