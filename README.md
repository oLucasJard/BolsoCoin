# 💰 BolsoCoin

> Central de Gerenciamento de Carteira com IA - Zero Fricção para Entrada de Dados

## 🎯 Visão Geral

O BolsoCoin não é "apenas mais um app de finanças". É um **centro de comando financeiro pessoal** com foco em **zero fricção de entrada de dados**. Ele usa **IA** para entender linguagem natural (texto e áudio) e imagens (recibos) para automatizar completamente o rastreamento de despesas e receitas.

### O Problema que Resolvemos

- **A Preguiça de Inserir Dados**: Abrir um app, navegar até "Nova Despesa", preencher múltiplos campos é chato e demorado
- **Falta de Centralização**: Finanças espalhadas em múltiplos lugares
- **Análise Superficial**: Ferramentas atuais mostram "o quê", mas não "por quê" ou "como melhorar"

## 🚀 Stack Tecnológico

### Backend & Database
- [Next.js 15](https://nextjs.org/) - Framework Full-Stack com App Router e Server Actions
- [Supabase](https://supabase.com/) - Backend as a Service (Database + Auth)
- PostgreSQL - Banco de dados relacional com Row Level Security

### Autenticação
- [Supabase Auth](https://supabase.com/auth) - Autenticação completa com login social, 2FA e mais

### Inteligência Artificial
- [OpenAI GPT-4o](https://openai.com/) - Interpretação de texto e imagem (Vision/OCR)
- [OpenAI Whisper](https://openai.com/research/whisper) - Transcrição de áudio para texto
- **Function Calling** - Extração estruturada de dados de linguagem natural

### Frontend & UI
- [React 18](https://react.dev/) - Biblioteca JavaScript para interfaces
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Lucide React](https://lucide.dev/) - Ícones modernos
- [Recharts](https://recharts.org/) - Gráficos e visualizações

### Integrations
- [Telegraf](https://telegraf.js.org/) - Framework para Bot do Telegram
- [Vercel](https://vercel.com/) - Hospedagem e deployment

## 📋 Funcionalidades

### ✨ Página Mágica (MVP Core Feature)

**1. Input por Texto**
- Digite em linguagem natural: "Café 15 reais" ou "Recebi 5000 do cliente X"
- IA extrai automaticamente: valor, tipo, categoria, fornecedor
- Cartão de confirmação antes de salvar

**2. Input por Áudio** (Em desenvolvimento)
- Grave um áudio falando a transação
- Whisper transcreve para texto
- Processamento automático igual ao texto

**3. Input por Imagem**
- Tire foto de cupom fiscal ou recibo
- GPT-4o Vision extrai: valor, estabelecimento, data
- Confirmação visual com a imagem

### 🤖 Bot do Telegram

- **/start** - Vincular conta
- **/saldo** - Ver saldo atual
- **/gastos_hoje** - Total gasto no dia
- **Mensagem de texto** - Adicionar transação por texto
- **Áudio** - Adicionar por voz (em breve)
- **Foto** - Enviar foto do recibo (em breve)

### 📊 Dashboard

- **Saldo Atual** - Receitas - Despesas
- **Balanço Mensal** - Comparação entrada vs saída
- **Top 5 Categorias** - Principais gastos
- **Últimas Transações** - Histórico recente

### 💼 Gerenciamento de Transações

- Listagem completa de transações
- Filtros por tipo, categoria e data
- Edição e exclusão
- Adição manual (quando IA não for usada)

### 🎨 Interface

- Design moderno e responsivo
- Tema claro e escuro automático
- Animações suaves
- UX otimizada para velocidade

## 🔧 Pré-requisitos

Antes de começar, você vai precisar:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/) (Grátis)
- Chave da [OpenAI API](https://platform.openai.com/) (Necessário créditos)
- (Opcional) Bot do [Telegram](https://t.me/BotFather) para integração

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/oLucasJard/BolsoCoin.git
cd BolsoCoin
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui

# OpenAI
OPENAI_API_KEY=sk-...

# Telegram (Opcional)
TELEGRAM_BOT_TOKEN=seu_token
TELEGRAM_WEBHOOK_SECRET=sua_secret
```

### 4. Configure o banco de dados Supabase

1. Crie um projeto no Supabase
2. Vá em "SQL Editor"
3. Execute o conteúdo de `supabase/schema.sql`

Isso criará todas as tabelas, políticas de segurança (RLS) e triggers necessários.

## 🎮 Executando o projeto

### Modo de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build para produção

```bash
npm run build
npm run start
```

## 📁 Estrutura do Projeto

```
BolsoCoin/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Página de login
│   │   └── signup/             # Página de cadastro
│   ├── (dashboard)/
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── transacoes/         # Lista de transações
│   │   ├── magica/             # Página Mágica (IA)
│   │   ├── relatorios/         # Relatórios
│   │   └── layout.tsx
│   ├── auth/callback/          # Callback OAuth
│   ├── api/telegram-webhook/   # Webhook Telegram
│   └── page.tsx                # Landing page
├── components/
│   ├── Navbar.tsx
│   ├── UserButton.tsx
│   ├── StatCard.tsx
│   └── TransactionList.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente browser
│   │   ├── server.ts           # Cliente server
│   │   ├── middleware.ts       # Middleware auth
│   │   └── types.ts            # Types do DB
│   ├── actions/
│   │   ├── user.actions.ts
│   │   └── transaction.actions.ts
│   ├── openai.ts               # Integração OpenAI
│   └── telegram-bot.ts         # Bot Telegram
├── supabase/
│   └── schema.sql              # Schema do banco
└── middleware.ts               # Middleware Next.js
```

## 🎯 Roadmap

### MVP (Atual)
- [x] Autenticação com Supabase
- [x] Dashboard com estatísticas
- [x] Página Mágica - Input por texto
- [x] Página Mágica - Input por imagem
- [x] Gerenciamento de transações
- [x] Bot do Telegram (estrutura básica)
- [ ] Página Mágica - Input por áudio
- [ ] Bot do Telegram - Processamento de imagem

### Futuro
- [ ] Gráficos avançados (Recharts)
- [ ] Exportação de dados (CSV, PDF)
- [ ] Metas e orçamentos
- [ ] Notificações inteligentes
- [ ] Análise preditiva com IA
- [ ] App mobile (React Native)
- [ ] Sincronização bancária (Open Finance)

## 🔒 Segurança

- Autenticação robusta com Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Variáveis de ambiente para credenciais
- HTTPS obrigatório em produção
- Validação de inputs

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

BRANDUP HUB - [@oLucasJard](https://github.com/oLucasJard)

Link do Projeto: [https://github.com/oLucasJard/BolsoCoin](https://github.com/oLucasJard/BolsoCoin)

---

Desenvolvido com 💚 e ☕ por **BRANDUP HUB**

**BolsoCoin** - Suas finanças, sem fricção. 🚀
