# 🎨 BolsoCoin - Design System

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Inspiração e Filosofia](#inspiração-e-filosofia)
3. [Paleta de Cores](#paleta-de-cores)
4. [Tipografia](#tipografia)
5. [Espaçamento](#espaçamento)
6. [Componentes](#componentes)
7. [Mobile-First](#mobile-first)
8. [Acessibilidade](#acessibilidade)
9. [Otimizações de Performance](#otimizações-de-performance)

---

## 🎯 Visão Geral

O BolsoCoin utiliza um design system inspirado no **C6 Bank**, focando em:
- **Minimalismo**: Design limpo e moderno
- **Contraste**: Preto predominante com amarelo vibrante
- **Mobile-First**: Otimizado para dispositivos móveis
- **Acessibilidade**: Alto contraste e interações táteis aprimoradas

---

## 🎨 Inspiração e Filosofia

### C6 Bank Design
O C6 Bank é conhecido por seu design ousado e minimalista:
- Background preto (#000000)
- Amarelo vibrante (#FFD100) como cor de destaque
- Tipografia moderna e legível
- Interações suaves e intuitivas

### Nossa Implementação
Adaptamos o design do C6 Bank para:
- **Finanças Pessoais**: Interface clara para visualização de dados
- **IA-First**: Destacar funcionalidades de inteligência artificial
- **Rapidez**: Interações instantâneas e responsivas

---

## 🌈 Paleta de Cores

### Cores Principais

#### C6 Black
```css
--c6-black: #000000
```
- **Uso**: Background principal, texto em fundos claros
- **Contraste**: Alto com todas as cores de destaque

#### C6 Yellow (Cor de Destaque)
```css
--c6-yellow: #FFD100
--c6-yellow-light: #FFE066
--c6-yellow-dark: #E6BB00
```
- **Uso**: Botões primários, ícones, destaques
- **Contraste**: Excelente com preto
- **Variações**: 
  - `light`: Hover states
  - `dark`: Active states

### Escala de Cinza

```css
--c6-gray-50: #F7F7F7   /* Fundos super claros */
--c6-gray-100: #E8E8E8  /* Bordas suaves */
--c6-gray-200: #D1D1D1  /* Separadores */
--c6-gray-300: #B0B0B0  /* Texto secundário claro */
--c6-gray-400: #888888  /* Texto terciário */
--c6-gray-500: #6D6D6D  /* Texto desabilitado */
--c6-gray-600: #5D5D5D  /* Bordas médias */
--c6-gray-700: #4F4F4F  /* Fundos de input */
--c6-gray-800: #2D2D2D  /* Cards escuros */
--c6-gray-900: #1A1A1A  /* Cards principais */
```

### Cores Funcionais

#### Verde (Receitas/Sucesso)
```css
--green-500: #10B981
```
- **Uso**: Receitas, confirmações, estados positivos

#### Vermelho (Despesas/Erro)
```css
--red-500: #EF4444
```
- **Uso**: Despesas, erros, alertas

#### Azul (Informação)
```css
--blue-500: #3B82F6
```
- **Uso**: Dicas, informações secundárias

---

## 📝 Tipografia

### Fontes

#### Família de Fontes

1. **Inter** (Sans-Serif Principal)
   - **Uso**: Corpo de texto, UI geral
   - **Peso**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
   - **Variável CSS**: `--font-inter`

2. **Sora** (Display/Títulos)
   - **Uso**: Títulos principais, números grandes
   - **Peso**: 600 (Semibold), 700 (Bold)
   - **Variável CSS**: `--font-sora`

### Escala de Tamanho

```css
text-xs:   0.75rem / 12px  (line-height: 1rem)
text-sm:   0.875rem / 14px (line-height: 1.25rem)
text-base: 1rem / 16px     (line-height: 1.5rem)
text-lg:   1.125rem / 18px (line-height: 1.75rem)
text-xl:   1.25rem / 20px  (line-height: 1.75rem)
text-2xl:  1.5rem / 24px   (line-height: 2rem)
text-3xl:  1.875rem / 30px (line-height: 2.25rem)
text-4xl:  2.25rem / 36px  (line-height: 2.5rem)
text-5xl:  3rem / 48px     (line-height: 1)
```

### Aplicação

```tsx
// Títulos de página
<h1 className="font-display text-3xl sm:text-4xl font-bold">

// Subtítulos
<h2 className="font-display text-xl font-semibold">

// Corpo de texto
<p className="text-base text-c6-gray-400">

// Texto pequeno (labels, hints)
<span className="text-sm text-c6-gray-500">
```

---

## 📏 Espaçamento

### Border Radius (Arredondamento)

```css
rounded-c6:    20px  /* Padrão para cards */
rounded-c6-sm: 12px  /* Botões, inputs */
rounded-c6-lg: 24px  /* Cards grandes */
```

### Padding/Margin

- **Mobile**: Use espaçamentos menores (px-4, py-3)
- **Desktop**: Use espaçamentos maiores (px-6, py-4)

### Safe Areas (Mobile)

```css
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 🧩 Componentes

### Botões

#### Botão Primário (C6)
```tsx
<button className="btn-c6">
  Confirmar
</button>
```

**Estilo**:
- Background: `c6-yellow`
- Texto: `c6-black`
- Padding: `py-4 px-6`
- Border Radius: `rounded-c6`
- Sombra: `shadow-c6-yellow`
- Hover: `bg-c6-yellow-light`
- Active: `scale-95`

#### Botão Outline
```tsx
<button className="btn-c6-outline">
  Cancelar
</button>
```

**Estilo**:
- Border: `2px solid c6-yellow`
- Texto: `c6-yellow`
- Hover: Background `c6-yellow`, texto `c6-black`

### Cards

#### Card Principal
```tsx
<div className="card-c6">
  {/* Conteúdo */}
</div>
```

**Estilo**:
- Background: `c6-gray-900`
- Border Radius: `rounded-c6`
- Padding: `p-6`
- Sombra: `shadow-c6`
- Border: `1px solid c6-gray-800`

### Inputs

#### Input de Texto
```tsx
<input className="input-c6" type="text" />
```

**Estilo**:
- Background: `c6-gray-900`
- Border: `1px solid c6-gray-700`
- Border Radius: `rounded-c6-sm`
- Padding: `px-4 py-3`
- Focus: Border `c6-yellow`, Ring `c6-yellow/20`

### Navigation

#### Bottom Navigation (Mobile)
- **Posição**: Fixed bottom
- **Altura**: 60px + safe-area-inset-bottom
- **Background**: `c6-black`
- **Border Top**: `1px solid c6-gray-800`

#### Top Bar (Mobile)
- **Posição**: Sticky top
- **Padding Top**: safe-area-inset-top
- **Background**: `c6-black`
- **Border Bottom**: `1px solid c6-gray-800`

---

## 📱 Mobile-First

### Breakpoints

```css
sm: 640px   /* Tablet pequeno */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### Abordagem

1. **Design para Mobile Primeiro**
   ```tsx
   <div className="text-sm sm:text-base lg:text-lg">
   ```

2. **Stacking no Mobile, Grid no Desktop**
   ```tsx
   <div className="flex flex-col sm:flex-row gap-4">
   ```

3. **Hidden/Visible Responsivo**
   ```tsx
   {/* Apenas mobile */}
   <div className="sm:hidden">Mobile Menu</div>
   
   {/* Apenas desktop */}
   <div className="hidden sm:block">Desktop Nav</div>
   ```

### Touch Optimization

```css
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

**Aplicar em**:
- Todos os botões
- Links clicáveis
- Cards interativos

### Minimum Target Size
- **Mínimo**: 44x44px para áreas clicáveis (seguindo WCAG)
- **Botões**: 48px de altura no mobile

---

## ♿ Acessibilidade

### Contraste

| Combinação | Ratio | WCAG |
|-----------|-------|------|
| c6-yellow / c6-black | 12:1 | AAA ✓ |
| white / c6-black | 21:1 | AAA ✓ |
| c6-gray-400 / c6-black | 5.5:1 | AA ✓ |

### Focus States

Todos os elementos interativos devem ter estados de foco visíveis:

```css
focus:ring-2 focus:ring-c6-yellow focus:outline-none
```

### Screen Readers

```tsx
{/* Ícones decorativos */}
<Icon aria-hidden="true" />

{/* Botões apenas ícone */}
<button aria-label="Abrir menu">
  <MenuIcon />
</button>
```

---

## ⚡ Otimizações de Performance

### Fontes

```tsx
// Preload e display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Evita FOIT
});
```

### Lazy Loading

```tsx
// Componentes pesados
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div className="shimmer h-64" />,
});
```

### Animations

```css
/* Apenas GPU-accelerated properties */
.transition {
  transition: transform 0.2s, opacity 0.2s;
  will-change: transform; /* Use com cuidado */}

/* Loading shimmer */
.shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    to right, 
    #1A1A1A 4%, 
    #2D2D2D 25%, 
    #1A1A1A 36%
  );
  background-size: 1000px 100%;
}
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  width={100}
  height={100}
  alt="BolsoCoin"
  priority // Para imagens above-the-fold
/>
```

---

## 🎭 Exemplos de Uso

### Página Completa

```tsx
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-c6-black text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="font-display text-3xl font-bold mb-6">
          Título da Página
        </h1>
        
        {/* Card com conteúdo */}
        <div className="card-c6 bg-c6-gray-900">
          <h2 className="text-xl font-semibold mb-4">
            Subtítulo
          </h2>
          <p className="text-c6-gray-400 mb-4">
            Conteúdo do card...
          </p>
          
          {/* Input */}
          <input
            type="text"
            className="input-c6 mb-4"
            placeholder="Digite algo..."
          />
          
          {/* Botões */}
          <div className="flex gap-3">
            <button className="btn-c6 flex-1">
              Confirmar
            </button>
            <button className="btn-c6-outline flex-1">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Estatística com Ícone

```tsx
<div className="card-c6 bg-c6-gray-900">
  <div className="flex items-start justify-between mb-3">
    <div className="w-12 h-12 rounded-c6-sm flex items-center justify-center bg-green-500/20">
      <TrendingUp className="text-green-500" size={24} />
    </div>
  </div>
  <p className="text-c6-gray-400 text-sm mb-1">
    Receitas do Mês
  </p>
  <p className="font-display text-3xl font-bold text-green-500">
    R$ 5.000,00
  </p>
</div>
```

### Lista Mobile (Cards)

```tsx
<div className="sm:hidden space-y-3">
  {items.map((item) => (
    <div key={item.id} className="card-c6 bg-c6-gray-800 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-c6-yellow/20 rounded-full flex items-center justify-center">
            <Icon size={16} />
          </div>
          <div>
            <p className="font-semibold text-white">{item.title}</p>
            <p className="text-xs text-c6-gray-400">{item.subtitle}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-c6-yellow">
          {item.value}
        </span>
      </div>
    </div>
  ))}
</div>
```

---

## 🔧 Manutenção

### Atualizando Cores

1. Edite `tailwind.config.ts`
2. As classes CSS serão regeneradas automaticamente
3. Teste contraste com ferramentas WCAG

### Adicionando Novos Componentes

1. Siga a nomenclatura: `<Tipo>C6` (ex: `ButtonC6`, `CardC6`)
2. Use as classes utilitárias do Tailwind
3. Documente no Storybook (se implementado)

### Checklist de Qualidade

- [ ] Mobile-first implementado?
- [ ] Touch targets ≥ 44px?
- [ ] Contraste WCAG AA ou superior?
- [ ] Focus states visíveis?
- [ ] Aria labels quando necessário?
- [ ] Animações suaves (60fps)?
- [ ] Loading states implementados?

---

## 📚 Recursos Adicionais

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Mobile Touch Guidelines](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures/)
- [C6 Bank Website](https://www.c6bank.com.br) (inspiração)

---

**Desenvolvido por BRANDUP HUB** 💚

