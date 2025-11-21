# 💰 BolsoCoin

> Plataforma de gerenciamento financeiro pessoal de forma simples e eficiente

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Next.js 15](https://nextjs.org/) - Framework React para produção
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Supabase](https://supabase.com/) - Backend as a Service (BaaS)
- [React](https://react.dev/) - Biblioteca JavaScript para interfaces

## 📋 Funcionalidades

- ✅ Dashboard com visão geral das finanças
- ✅ Cadastro de receitas e despesas
- ✅ Categorização de transações
- ✅ Relatórios e gráficos financeiros
- ✅ Interface moderna e responsiva
- ✅ Tema claro e escuro

## 🔧 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma conta no [Supabase](https://supabase.com/)

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

Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Você pode encontrar essas informações no dashboard do Supabase em:
**Project Settings → API**

### 4. Configure o banco de dados Supabase

Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Tabela de transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_date_idx ON transactions(date);
CREATE INDEX categories_user_id_idx ON categories(user_id);

-- Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);
```

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
├── app/                    # App Router do Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes React reutilizáveis
│   └── Header.tsx         # Componente de cabeçalho
├── lib/                   # Bibliotecas e utilitários
│   ├── supabase.ts        # Configuração do Supabase
│   └── types/             # Definições de tipos TypeScript
│       └── database.types.ts
├── public/                # Arquivos estáticos
├── .gitignore            # Arquivos ignorados pelo Git
├── next.config.js        # Configuração do Next.js
├── package.json          # Dependências e scripts
├── tailwind.config.ts    # Configuração do Tailwind
├── tsconfig.json         # Configuração do TypeScript
└── README.md             # Este arquivo
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📝 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com 💚 por BRANDUP HUB

