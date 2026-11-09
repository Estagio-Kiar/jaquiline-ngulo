# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

---

## Ligação à API e painel de administração

O site consome a API de `jaquiline-ngulo-server` e tem um painel em **`/admin`**.

### Configuração

1. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` (por omissão `http://localhost:3333`).
2. Na API, garanta que `FRONT_URL` inclui a origem do front
   (ex.: `FRONT_URL="http://localhost:3000,http://localhost:5173"`).
3. Abra `http://localhost:5173/setup`. A página verifica `GET /admin/users/setup` e, se ainda não existir um administrador, cria-o com `POST /auth/admin/setup`.

### Como funciona

- **Site público**: lê perfil, percurso, imprensa (news), redes sociais, artigos e episódios da API.
  Se a API estiver em baixo ou uma secção vier vazia, usa os textos de `src/data/profile.ts`.
  As secções «Artigos» e «Podcast» só aparecem quando há conteúdo; cada artigo tem página em `/artigos/:id`.
- **Painel `/admin`**: login com e-mail/palavra-passe (JWT + refresh automático), dashboard com
  contadores e atividade, edição do perfil com pré-visualização e CRUD de Percurso, Imprensa,
  Artigos, Categorias, Podcast e Redes, com upload de capas (arrastar e largar).
- **Configuração `/setup`**: permite criar o primeiro administrador apenas enquanto a API indica que ainda não existe nenhum.
  No primeiro acesso, o botão **Importar agora** copia o conteúdo atual do site para a API.
- Só utilizadores com role `admin` podem remover registos (o botão fica oculto para editores).
- **Competências** (`/skills`): editáveis no painel, com percentagem opcional; no site aparecem em «Sobre» (barras quando há percentagem).
- **Conta & equipa** (`/admin/conta`): criar utilizadores (`/auth/sing_up`, até 4 contas, função admin ou editor) e associar a conta Google (`/auth/link-google`).
- **Entrar com Google** (`/auth/google`): defina `VITE_GOOGLE_CLIENT_ID` (o mesmo `GOOGLE_CLIENT_ID` da API) e adicione os domínios do site em *Authorized JavaScript origins* no Google Cloud. Só funciona para contas já registadas.

### Estrutura

```text
src/lib/api.ts            cliente HTTP, sessão e refresh token
src/content/SiteContent   dados do site (API + fallback estático)
src/admin/                painel: login, layout, páginas e componentes de UI
src/admin/resources.tsx   definição dos formulários de cada recurso
```

> Em produção, configure o servidor para devolver `index.html` em todas as rotas
> (ex.: `/admin`, `/artigos/...`), já que o roteamento é feito no browser.
