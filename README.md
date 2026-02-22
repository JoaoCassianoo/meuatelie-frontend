<div align="center">

# ✂️ Meu Ateliê — Frontend

**Interface web para gestão completa do Ateliê Janainy Fiel**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.4%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

[🌐 Acessar o sistema](https://meuatelie.vercel.app) • [⚙️ API](https://github.com/JoaoCassianoo/meuatelie-api)

</div>

---

## 📋 Sobre o projeto

Frontend do **Meu Ateliê**, um SaaS completo para gerenciamento de ateliês de costura. Desenvolvido em React com TypeScript, oferece uma interface intuitiva para controle financeiro, estoque, encomendas, vendas e assinaturas com pagamento via PIX.

---

## 🚀 Funcionalidades

- 🔐 **Login e cadastro** com autenticação via Supabase
- 🔑 **Recuperação de senha** por e-mail
- 📊 **Dashboard financeiro** — visão geral de receitas e despesas
- 📦 **Gestão de estoque** — materiais e peças prontas
- 📋 **Encomendas** — criação, acompanhamento e finalização
- 🛒 **Vendas** — registro e histórico
- ✅ **Todo list** — tarefas do dia a dia
- 💳 **Planos de assinatura** — mensal, trimestral e anual via PIX
- 🔒 **Bloqueio automático** de funcionalidades para planos expirados

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Supabase JS | Autenticação |
| Axios | Requisições HTTP |
| Lucide React | Ícones |
| Vite | Build tool |
| Vercel | Deploy em produção |

---

## ⚙️ Configuração

### Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [npm](https://npmjs.com) ou [yarn](https://yarnpkg.com)
- Conta no [Supabase](https://supabase.com)

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_API_URL=https://meuatelie-api.onrender.com
```

### Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/JoaoCassianoo/meuatelie-frontend.git
cd meuatelie-frontend/atelie-web

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

---

## 📁 Estrutura do projeto

```
atelie-web/
├── src/
│   ├── api/              # Funções de requisição à API
│   │   ├── atelie.api.ts
│   │   ├── cache.api.ts
│   │   ├── http.ts
│   │   └── supabase.ts
│   ├── pages/            # Telas da aplicação
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Encomendas.tsx
│   │   ├── Estoque.tsx
│   │   ├── Financeiro.tsx
│   │   ├── Vendas.tsx
│   │   ├── TodoList.tsx
│   │   ├── Perfil.tsx
│   │   ├── Upgrade.tsx
│   │   └── RedefinirSenha.tsx
│   ├── components/       # Componentes reutilizáveis
│   └── App.tsx           # Roteamento principal
```

---

## 💳 Fluxo de assinatura

O sistema de assinaturas é integrado com a **AbacatePay** e funciona via PIX:

```
Usuário acessa /upgrade
→ Seleciona o plano desejado
→ Preenche dados (nome, CPF, telefone)
→ É redirecionado para a página de pagamento da AbacatePay
→ Realiza o pagamento via PIX
→ Acesso é ativado automaticamente via webhook
```

### Planos disponíveis

| Plano | Valor |
|---|---|
| 📅 Mensal | R$ 40,00/mês |
| 📆 Trimestral | R$ 108,00/trimestre |
| 🗓️ Anual | R$ 360,00/ano |

---

## 🔐 Autenticação

A autenticação é gerenciada pelo **Supabase Auth**. O token JWT é armazenado automaticamente e enviado em todas as requisições para a API via `Authorization: Bearer`.

---

## 🌐 Deploy

O projeto é hospedado na **Vercel** com deploy automático a cada push na branch `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JoaoCassianoo/meuatelie-frontend)

---

## 📄 Licença

Este projeto é de uso privado. Todos os direitos reservados.

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/JoaoCassianoo">João Cassiano</a>
</div>