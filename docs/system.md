# Contexto do sistema — Financy IA (`financeai`)

Documento de referência para implementações futuras. **Última sincronização:** App Router, persistência **Supabase** (PostgreSQL), autenticação **email/senha** via Supabase Auth.

## Visão geral

Aplicação web de **finanças pessoais** com painel, histórico de despesas, categorias e uma “Central de IA” que gera **insights determinísticos** a partir dos dados do usuário (regras locais em `AiInsightsModal` — **sem** chamada a modelo de linguagem externo).

**Metadados da app:** título “Financy IA”; idioma raiz `pt-BR`; fontes Google **Fraunces** (display) e **Outfit** (corpo), expostas como variáveis CSS `--font-display` / `--font-body`.

## Stack

| Área        | Tecnologia |
|------------|------------|
| Framework  | Next.js **14.2.x** (App Router) |
| UI         | React **18**, TypeScript **5** |
| Estilo     | Tailwind CSS **3.4** + tokens em `app/globals.css` (`--background`, `--accent`, etc.) |
| Backend / dados | **Supabase**: `@supabase/supabase-js`, `@supabase/ssr` (cliente browser, servidor e middleware com cookies) |
| Gráficos   | Recharts |
| Datas      | date-fns |
| Validação  | Zod (ex.: formulário de despesa em `ExpenseForm`) |

Scripts: `dev`, `build`, `start`, `lint` (`next lint`).

## Variáveis de ambiente

Obrigatórias para build e runtime (ver `.env.local.example`; **não** commitar valores reais nem documentar segredos aqui):

- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima (pública no cliente; políticas de segurança vêm do **RLS** no banco).

## Estrutura de pastas (principais)

```
app/                 # Rotas e layouts (App Router)
  layout.tsx         # Raiz: providers, fontes, metadata
  page.tsx           # Home: login/cadastro
  (main)/layout.tsx  # Área logada: AuthGuard + AppShell
  (main)/dashboard/ | expenses/ | settings/
components/
  auth/              # AuthPanel, AuthGuard, GuestGate
  layout/            # AppShell (nav)
  dashboard/         # Gráficos, lista recente, modal IA
  expenses/          # Formulário, modal
  ui/                # Modal, ConfirmModal
  providers/         # AppProviders
contexts/            # SessionContext, ExpensesContext
lib/
  types/             # User, Expense, Category, AiModelId, AI_MODEL_IDS, …
  supabase/
    client.ts        # createBrowserClient (@supabase/ssr) — uso no cliente
    server.ts        # createServerClient + cookies (Server Components / rotas server)
    mappers.ts       # Ex.: ExpenseRow → Expense (snake_case ↔ camelCase)
  data/index.ts      # Reexport de tipos; nota sobre camada de dados
  constants.ts       # AI_MODEL_LABELS (rótulos dos modelos de IA na UI)
  welcome-expenses.ts # insertWelcomeExpenses — seed de despesas no DB
  format.ts          # Ex.: formatação BRL
middleware.ts        # createServerClient + getUser() para refresh de sessão (cookies)
```

Alias de import: `@/` → raiz do projeto.

**Removido / obsoleto no desenho atual:** não há `lib/mocks` nem persistência em `localStorage` para dados da aplicação.

## Rotas e fluxos

| Rota | Comportamento |
|------|-----------------|
| `/` | Visitante: `GuestGate` redireciona para `/dashboard` se já houver sessão; conteúdo: `AuthPanel` (login/cadastro com Supabase). |
| `/dashboard` | Resumo do mês, gráficos (`ExpenseCharts`), últimas despesas, “Novo gasto” e “Central de IA”. |
| `/expenses` | Histórico com filtro por mês/categoria; criar/editar/excluir; cancelar recorrência (dados via Supabase). |
| `/expenses/new` | Redireciona para `/expenses` (novo lançamento via modal). |
| `/settings` | Perfil (nome, e-mail, avatar, modelo de IA preferido), logout. |

**Área autenticada:** rotas sob `app/(main)/` usam `AuthGuard` (exige usuário em sessão Supabase; senão redireciona para `/`). Enquanto `SessionContext` não hidrata, mostra spinner de carregamento.

**Middleware (`middleware.ts`):** matcher amplo nas rotas da app; instancia `createServerClient` com leitura/escrita de cookies e chama `supabase.auth.getUser()` para **renovar/refrescar a sessão** em requests.

**Navegação:** `AppShell` com links Painel (`/dashboard`), Despesas (`/expenses`), Configurações (`/settings`).

## Dados e persistência (Supabase)

### Tabelas (schema `public`)

| Tabela | Uso no app |
|--------|------------|
| `profiles` | Perfil do usuário: `name`, `avatar_url`, `preferred_ai_model`, alinhado ao `User` do cliente (`id` = auth user id). |
| `categories` | Categorias com `id`, `name`, `color`; carregadas no `ExpensesContext` e usadas nos formulários e gráficos. |
| `expenses` | Despesas por usuário (`user_id`, `title`, `amount`, `date`, `category_id`, `type`, `recurring` JSON). |

### Segurança no banco (esperado no projeto Supabase)

- **RLS** habilitado: acesso a linhas **por usuário autenticado** (políticas no Supabase), coerente com o uso da `anon` key no cliente.
- **Trigger `handle_new_user` em `auth.users`:** cria o registro correspondente em `public.profiles` quando um novo usuário se cadastra (o app não insere `profiles` manualmente no fluxo normal de cadastro).

*Nota:* políticas e definição exata do trigger não estão versionadas neste repositório; conferir no painel Supabase (SQL / migrations) ao reproduzir o ambiente.

### Comportamento no código

- **Categorias:** lidas do banco (`categories`), não de seed estático no frontend.
- **Despesas de boas-vindas:** se, após login, a contagem de despesas do usuário for **0**, `ExpensesContext` chama `insertWelcomeExpenses` (`lib/welcome-expenses.ts`), que **insere** linhas em `expenses` (IDs de categoria fixos no código, ex.: `cat-alim`, `cat-mor` — devem existir no banco).
- **Mapeamento:** `lib/supabase/mappers.ts` converte linhas (`user_id`, `category_id`, …) para os tipos camelCase em `lib/types`.

## Contextos React

### `SessionProvider` (`contexts/SessionContext.tsx`)

- Cliente Supabase via `createClient()` (`lib/supabase/client`).
- **Hidratação:** `getUser()` + leitura de `profiles` para montar `User`; `onAuthStateChange` recarrega o perfil.
- **Login / cadastro:** `signInWithPassword` e `signUp` (email/senha); mensagens de erro traduzidas superficialmente para PT-BR.
- **Cadastro sem sessão imediata:** se `signUp` não retornar `session` (ex.: confirmação de e-mail obrigatória), o fluxo retorna erro amigável pedindo confirmação — **a verificar** conforme configuração do projeto Auth no Supabase.
- **Logout:** `signOut`.
- **Atualização de perfil:** `auth.updateUser` para e-mail; `profiles.update` para nome, avatar e `preferred_ai_model`.

### `ExpensesProvider` (`contexts/ExpensesContext.tsx`)

- Depende de `SessionContext`: só carrega dados quando a sessão está hidratada e há `user`.
- **Categorias:** `select` em `categories` ordenado por `id`.
- **Despesas:** `select` em `expenses` filtrado por `user_id`, ordenação por `date` descendente.
- **Boas-vindas:** após carregar, se `count === 0`, insere despesas iniciais e atualiza a lista.
- **CRUD:** `insert` / `update` / `delete` em `expenses` com filtro por `user_id` onde aplicável; `cancelRecurring` ajusta tipo e JSON `recurring`.

## Tipos centrais (`lib/types`)

- `Expense`: `id`, `userId`, `title`, `amount`, `date` (`YYYY-MM-DD`), `categoryId`, `type` (`"pontual"` \| `"recorrente"`), `recurring` opcional.
- `User`: `id`, `name`, `email`, `avatarUrl?`, `preferredAiModel` (`AI_MODEL_IDS`: gpt-4, claude-3-opus, gemini-pro, llama-3).
- `Category`: `id`, `name`, `color`.
- Labels de modelos na UI: `AI_MODEL_LABELS` em **`lib/constants.ts`** (ids em `AI_MODEL_IDS` em `lib/types`).

## “IA” no produto

- **Configurações:** o usuário escolhe `AiModelId` — preferência persistida em `profiles.preferred_ai_model`; **não** dispara inferência real.
- **Central de IA (`AiInsightsModal`):** texto gerado por regras (`buildInsights`) sobre despesas do mês e categorias; sem API key nem backend de LLM.

## Convenções úteis para novas features

- Novas páginas autenticadas: preferir `app/(main)/…` para herdar `AuthGuard` + `AppShell`.
- Dados: estender chamadas Supabase nos contextos ou em Server Actions/route handlers usando `lib/supabase/server.ts` quando o código rodar no servidor.
- Formulários: padrão atual com Zod no cliente (`ExpenseForm`).
- Design: Tailwind + variáveis CSS; componentes em `components/ui/`.

## Pontos de atenção

- **Ambiente:** sem `NEXT_PUBLIC_SUPABASE_*` a app não se conecta ao projeto; erros em runtime/build.
- **Segurança:** a chave anônima é pública por desenho; **RLS** e políticas no Supabase são o controle de acesso. Não expor service role no cliente nem documentar segredos em `docs/`.
- **Confirmação de e-mail / OAuth:** fluxo atual foca email+senha; outras opções dependem de configuração no Supabase.
- **Boas-vindas:** categorias referenciadas em `welcome-expenses.ts` precisam existir no banco com os mesmos `id`.
- **IA:** insights continuam determinísticos; integração com LLM seria feature nova (API, custos, privacidade).
- **Consistência:** estado listado nos contextos é por sessão no browser; dados persistidos vêm do Postgres (multi-dispositivo quando o mesmo usuário autentica).
