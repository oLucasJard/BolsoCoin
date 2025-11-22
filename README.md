# 💰 BolsoCoin

> Central de Gerenciamento de Carteira com IA - Zero Fricção para Entrada de Dados

**🎉 Novidade: MVP v2.0 com Multi-Workspace e PWA!** - [Ver documentação completa](docs/MVP_V2_COMPLETO.md)

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

### Deployment

- [Vercel](https://vercel.com/) - Hospedagem e deployment

## 📋 Funcionalidades

### ✨ Página Mágica (MVP Core Feature)

**1. Input por Texto**

- Digite em linguagem natural: "Café 15 reais" ou "Recebi 5000 do cliente X"
- IA extrai automaticamente: valor, tipo, categoria, fornecedor
- Cartão de confirmação antes de salvar

**2. Input por Áudio** ✅

- Grave um áudio falando a transação
- Whisper transcreve para texto automaticamente
- Processamento automático igual ao texto
- Interface otimizada para mobile

**3. Input por Imagem**

- Tire foto de cupom fiscal ou recibo
- GPT-4o Vision extrai: valor, estabelecimento, data
- Confirmação visual com a imagem

### 🎯 Metas e Orçamentos

- **Orçamentos por Categoria** - Defina limites mensais
- **Metas Financeiras** - Acompanhe progresso de economias
- **Alertas Inteligentes** - Notificação quando ultrapassar limite
- **Progresso Visual** - Gráficos de barras e porcentagens

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

- **Design System C6 Bank** - Visual moderno inspirado no C6 Bank
- **Mobile-First** - Totalmente otimizado para dispositivos móveis
- **Cores**: Preto (#000000) + Amarelo (#FFD100)
- **Fontes**: Inter (UI) + Sora (Display)
- **Bottom Navigation** - Navegação intuitiva no mobile
- **Safe Areas** - Suporte para notch e home indicator
- **Touch Optimized** - Área de toque ≥ 44px
- **Animações suaves** - 60fps garantido

## 🔧 Pré-requisitos

Antes de começar, você vai precisar:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Conta no [Supabase](https://supabase.com/) (Grátis) - [Ver guia](./docs/GUIA_LOGIN_REAL.md)
- Chave da [OpenAI API](https://platform.openai.com/) - [Ver guia](./docs/GUIA_OPENAI_API.md)

> 📖 **Documentação completa**: Consulte a pasta [`docs/`](./docs/) para guias detalhados

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
4. Execute as migrations em `supabase/migrations/`

Isso criará todas as tabelas, políticas de segurança (RLS) e triggers necessários.

> 💡 **Dica**: Veja o [Guia de Setup](./docs/SETUP.md) para instruções detalhadas.

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
│   │   ├── signup/             # Página de cadastro
│   │   └── dev-login/          # Login de teste (dev)
│   ├── (dashboard)/
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── transacoes/         # Lista de transações
│   │   ├── magica/             # Página Mágica (IA)
│   │   ├── orcamentos/         # Metas e orçamentos
│   │   ├── relatorios/         # Relatórios
│   │   └── layout.tsx
│   ├── auth/callback/          # Callback OAuth
│   ├── api/
│   │   └── transcribe/         # API transcrição Whisper
│   └── page.tsx                # Landing page
├── components/
│   ├── Navbar.tsx              # Nav desktop + mobile
│   ├── UserButton.tsx          # Dropdown do usuário
│   ├── StatCard.tsx            # Cards de estatística
│   ├── TransactionList.tsx     # Lista responsiva
│   ├── AudioRecorder.tsx       # Gravador de áudio
│   ├── BalanceChart.tsx        # Gráfico de balanço
│   └── CategoryPieChart.tsx    # Gráfico de categorias
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente browser
│   │   ├── server.ts           # Cliente server
│   │   ├── middleware.ts       # Middleware auth
│   │   └── types.ts            # Types do DB
│   ├── actions/
│   │   ├── user.actions.ts
│   │   ├── transaction.actions.ts
│   │   └── budget.actions.ts   # Orçamentos e metas
│   └── openai.ts               # Integração OpenAI
├── supabase/
│   ├── schema.sql              # Schema principal
│   └── migrations/
│       └── 002_add_budgets_goals.sql
├── docs/                       # 📚 Documentação
│   ├── SETUP.md                # Configuração inicial
│   ├── DESIGN_SYSTEM.md        # Guia do design C6
│   ├── TESTES_MOBILE.md        # Guia de testes mobile
│   ├── GUIA_LOGIN_REAL.md      # Como testar login
│   ├── GUIA_OPENAI_API.md      # Configurar OpenAI
│   ├── IMPLEMENTACAO.md        # Detalhes técnicos
│   ├── MIGRACAO_SUPABASE.md    # Migração do Clerk
│   └── NOVAS_FEATURES.md       # Features recentes
└── middleware.ts               # Middleware Next.js
```

## 📚 Documentação

Toda a documentação foi organizada na pasta [`docs/`](./docs/):

- **[Setup Guide](./docs/SETUP.md)** - Configuração inicial passo a passo
- **[Design System](./docs/DESIGN_SYSTEM.md)** - Guia completo do design C6 Bank
- **[Testes Mobile](./docs/TESTES_MOBILE.md)** - Como testar no mobile
- **[Login Real](./docs/GUIA_LOGIN_REAL.md)** - Testar autenticação Supabase
- **[OpenAI API](./docs/GUIA_OPENAI_API.md)** - Configurar e otimizar custos
- **[Implementação](./docs/IMPLEMENTACAO.md)** - Detalhes técnicos
- **[Migração Supabase](./docs/MIGRACAO_SUPABASE.md)** - Histórico da migração
- **[Novas Features](./docs/NOVAS_FEATURES.md)** - Últimas funcionalidades

## 🎯 Roadmap

### ✅ MVP (Concluído)

- [x] Autenticação com Supabase
- [x] Dashboard com estatísticas
- [x] Página Mágica - Input por texto
- [x] Página Mágica - Input por áudio (Whisper)
- [x] Página Mágica - Input por imagem (GPT-4o Vision)
- [x] Gerenciamento de transações
- [x] Gráficos com Recharts (Balanço + Categorias)
- [x] Metas e Orçamentos
- [x] Design System C6 Bank
- [x] Mobile-First completo
- [x] Validação Zod completa
- [x] Rate Limiting implementado

### 🔜 Próximas Melhorias

- [ ] Exportação de dados (CSV, PDF)
- [ ] Notificações inteligentes
- [ ] Análise preditiva com IA
- [ ] PWA (Progressive Web App)
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
