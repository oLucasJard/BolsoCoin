# 💰 BolsoCoin

> Central de Gerenciamento de Carteira com IA - Zero Fricção para Entrada de Dados

## 🎯 Visão Geral

O BolsoCoin não é "apenas mais um app de finanças". É um **centro de comando financeiro pessoal** com foco em **zero fricção de entrada de dados**. Ele usa **IA** para entender linguagem natural (texto e áudio) e imagens (recibos) para automatizar completamente o rastreamento de despesas e receitas.

### O Problema que Resolvemos

- **A Preguiça de Inserir Dados**: Abrir um app, navegar até "Nova Despesa", preencher múltiplos campos é chato e demorado
- **Falta de Centralização**: Finanças espalhadas em múltiplos lugares
- **Análise Superficial**: Ferramentas atuais mostram "o quê", mas não "por quê" ou "como melhorar"

## 🚀 Stack Tecnológico

Este projeto foi desenvolvido com tecnologias modernas e eficientes:

### Backend & Database
- [Next.js 15](https://nextjs.org/) - Framework Full-Stack com App Router e Server Actions
- [Neon](https://neon.tech/) - PostgreSQL Serverless com scaling automático
- [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript-first, leve e performático

### Autenticação
- [Clerk](https://clerk.com/) - Autenticação moderna com login social, 2FA e mais

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
- Conta no [Neon](https://neon.tech/) (PostgreSQL Serverless - Grátis)
- Conta no [Clerk](https://clerk.com/) (Autenticação - Grátis)
- Chave da [OpenAI API](https://platform.openai.com/) (Necessário créditos)
- (Opcional) Bot do [Telegram](https://t.me/BotFather) para integração

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/BolsoCoin.git
cd BolsoCoin
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto baseado no `.env.example`:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI API
OPENAI_API_KEY=sk-...

# Telegram Bot (Opcional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
```

#### Como obter as credenciais:

**Neon (Database):**
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a `DATABASE_URL` das configurações

**Clerk (Auth):**
1. Crie uma conta em [clerk.com](https://clerk.com)
2. Crie uma nova aplicação
3. Copie as chaves da aba "API Keys"

**OpenAI:**
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Vá em "API Keys"
3. Crie uma nova chave

**Telegram (Opcional):**
1. Fale com [@BotFather](https://t.me/BotFather)
2. Use `/newbot` e siga as instruções
3. Copie o token fornecido

### 4. Configure o banco de dados

Execute o push do schema para o Neon:

```bash
npm run db:push
```

Isso irá criar automaticamente todas as tabelas necessárias no seu banco de dados Neon.

## 🎮 Executando o projeto

### Modo de desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build para produção

```bash
npm run build
npm run start
# ou
yarn build
yarn start
```

## 📁 Estrutura do Projeto

```
BolsoCoin/
├── app/
│   ├── (auth)/                    # Grupo de rotas de autenticação
│   │   ├── sign-in/               # Página de login (Clerk)
│   │   └── sign-up/               # Página de cadastro (Clerk)
│   ├── (dashboard)/               # Grupo de rotas protegidas
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── transacoes/            # Gerenciamento de transações
│   │   ├── magica/                # Página Mágica (IA)
│   │   ├── relatorios/            # Relatórios e análises
│   │   └── layout.tsx             # Layout do dashboard
│   ├── api/
│   │   └── telegram-webhook/      # Webhook do bot do Telegram
│   ├── layout.tsx                 # Layout raiz (Clerk Provider)
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Estilos globais
├── components/                    # Componentes reutilizáveis
│   ├── Navbar.tsx                 # Barra de navegação
│   ├── StatCard.tsx               # Card de estatísticas
│   └── TransactionList.tsx        # Lista de transações
├── lib/
│   ├── db/
│   │   ├── schema.ts              # Schema Drizzle (tabelas)
│   │   └── index.ts               # Cliente Drizzle
│   ├── actions/
│   │   ├── user.actions.ts        # Server Actions de usuário
│   │   └── transaction.actions.ts # Server Actions de transações
│   ├── openai.ts                  # Integração OpenAI (GPT-4o, Whisper)
│   └── telegram-bot.ts            # Lógica do bot do Telegram
├── drizzle/                       # Migrações do Drizzle (auto-gerado)
├── middleware.ts                  # Middleware do Clerk
├── drizzle.config.ts              # Configuração do Drizzle
├── next.config.js                 # Configuração do Next.js
├── package.json                   # Dependências
├── tailwind.config.ts             # Configuração do Tailwind
├── tsconfig.json                  # Configuração do TypeScript
└── README.md                      # Este arquivo
```

## 🎯 Roadmap

### MVP (Atual)
- [x] Autenticação com Clerk
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

- Autenticação robusta com Clerk
- Todas as requisições validadas com middleware
- Dados isolados por usuário (Row Level Security conceitual)
- Variáveis de ambiente para credenciais
- HTTPS obrigatório em produção

## 🐛 Troubleshooting

### Erro ao conectar no Neon
- Verifique se a `DATABASE_URL` está correta
- Certifique-se que o IP está liberado nas configurações do Neon

### Erro na OpenAI API
- Verifique se tem créditos na conta
- Confirme se a chave API está ativa
- Limite de requisições pode ter sido atingido

### Bot do Telegram não responde
- Verifique se o webhook está configurado corretamente
- Teste o endpoint `/api/telegram-webhook` manualmente
- Confirme o `TELEGRAM_BOT_TOKEN`

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! 

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

BRANDUP HUB - [@BrandUpHub](https://github.com/oLucasJard)

Link do Projeto: [https://github.com/oLucasJard/BolsoCoin](https://github.com/oLucasJard/BolsoCoin)

---

Desenvolvido com 💚 e ☕ por **BRANDUP HUB**

**BolsoCoin** - Suas finanças, sem fricção. 🚀

