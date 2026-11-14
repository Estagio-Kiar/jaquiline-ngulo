# Portfólio Jaqueline Mabiala Ngulo — Front-end

Site público e painel de administração (`/admin`) do portfólio de **Jaqueline Mabiala Ngulo**, engenheira, escritora e diretora da Women in Tech Angola.

O site mostra o perfil, o percurso, as competências, a imprensa, os artigos, a agenda e os contactos. O painel permite à equipa atualizar esses conteúdos sem mexer no código. Os dados vêm da API [`jaquiline-ngulo-server`](https://github.com/Estagio-Kiar/jaquiline-ngulo-server).

Projeto desenvolvido pelo **Grupo KIAR**.

## Stack

| Tecnologia | Uso |
| --- | --- |
| React 19 + TypeScript 6 | Interface do site e do painel |
| Vite 8 | Servidor de desenvolvimento e build |
| Tailwind CSS 4 + tw-animate-css | Estilos e animações |
| shadcn / Base UI + lucide-react | Componentes e ícones |
| driver.js | Tour guiado do painel (onboarding) |
| Google Identity Services | Entrar com Google |

O roteamento é feito no browser por um router próprio (`src/lib/router.tsx`), sem dependências extra.

## Começar

Requisitos: Node.js 22 ou superior e a API a correr (localmente ou no Render).

```bash
pnpm install        # ou: npm install
cp .env.example .env
pnpm dev            # http://localhost:5173
```

### Variáveis de ambiente (`.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `VITE_API_URL` | Endereço da API | `http://localhost:3333` |
| `VITE_GOOGLE_CLIENT_ID` | Opcional. Ativa «Entrar com Google»; é o mesmo `GOOGLE_CLIENT_ID` da API | `xxxx.apps.googleusercontent.com` |

### Do lado da API

1. **Origem do front:** `FRONTEND_URL` tem de incluir o endereço do site (ex.: `http://localhost:5173,https://<site>.onrender.com`), para o CORS e para os links de confirmação de e-mail.
2. **Primeiro administrador:** é criado pela própria API no arranque, a partir de `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD`. Não existe página de registo no front.
3. **Tour do painel:** para o tour vir da API, corra o seed de onboarding na API (`npx prisma db seed`). Sem seed, o painel usa os passos locais.
4. **Google:** adicione os domínios do site em *Authorized JavaScript origins* no Google Cloud.

## Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Verificação de tipos e build de produção em `dist/` |
| `pnpm preview` | Pré-visualiza o build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm photos` | Descarrega as fotos usadas como reserva no scroll |

## Como funciona

### Site público

Lê da API o perfil, as fotos (Hero e galeria do scroll), o percurso, as competências, a imprensa, os artigos e categorias, a agenda e as redes sociais. Se a API estiver em baixo, ou uma secção vier vazia, usa os textos de `src/data/profile.ts`, para o site nunca ficar vazio. Os dados voltam a ser pedidos quando o separador volta a ficar visível, por isso as alterações feitas no painel aparecem sem recarregar.

Outras páginas: `/artigos/:id` (artigo), `/termos` e `/privacidade` (páginas legais) e `/confirmar-email` (ativação de conta).

### Painel `/admin`

- Login com e-mail e palavra-passe ou com Google, com sessão JWT e renovação automática.
- Recuperação da palavra-passe por código de 8 dígitos enviado por e-mail (administradores).
- Painel inicial com contadores, atividade recente, ações rápidas e importação do conteúdo do site para a API.
- Edição do perfil, das fotos e de todos os conteúdos, com upload de imagens (local em desenvolvimento, Cloudinary em produção).
- Tour guiado do painel, com o progresso guardado na API.
- Tutorial passo a passo e botão de ajuda em cada página.
- Conta & equipa: convidar utilizadores, mudar funções, definir palavras-passe e associar a conta Google.

### Funções e permissões

As regras são da API; o painel só mostra os botões que cada função pode usar.

| Função | Criar e editar conteúdos | Remover conteúdos | Gerir a equipa |
| --- | :---: | :---: | :---: |
| Administrador (`admin`) | ✓ | ✓ | ✓ |
| Gestor (`manager`) | ✓ | ✓ | — |
| Editor (`editor`) | ✓ | — | — |
| Utilizador (`user`) | ✓ | — | — |

O administrador é criado pela API e a sua função não pode ser alterada. Pelo painel só se atribuem as funções Gestor, Editor e Utilizador.

## Endpoints da API usados

| Área | Endpoints |
| --- | --- |
| Autenticação | `POST /auth/sing_in`, `/auth/refresh`, `/auth/sing_up` (admin), `/auth/confirm-email`, `/auth/password-reset/request`, `/auth/password-reset/confirm`, `/auth/google`, `/auth/link-google` |
| Conteúdos (GET público; POST/PATCH/DELETE com sessão) | `/profile`, `/gallery`, `/career_history`, `/skills`, `/news`, `/articles`, `/categories`, `/agenda`, `/social_medias` |
| Uploads | `POST /uploads/{profile,articles,news,agenda}` |
| Equipa (admin) | `GET /admin/users`, `PATCH /admin/users/:id/password`, `PATCH /admin/users/:id/role` |
| Onboarding | `GET /onboarding/tours`, `/onboarding/status`, `POST /onboarding/start`, `PATCH /onboarding/progress`, `POST /onboarding/complete`, `/onboarding/dismiss` |

Não usados de propósito: `/episodes` (a secção de podcast foi retirada do site; a API mantém-na) e `/auth/send-test/:email` (teste de e-mail).

## Estrutura

```text
src/
├── App.tsx                 rotas: site, /artigos/:id, /termos, /privacidade, /confirmar-email, /admin
├── data/profile.ts         conteúdo estático de reserva
├── content/                dados do site (API + reserva)
├── components/             secções do site, cabeçalho, rodapé e efeitos
├── pages/                  página de artigo e página legal
├── lib/
│   ├── api.ts              cliente HTTP, sessão, refresh token e mensagens de erro
│   ├── types.ts            modelos devolvidos pela API
│   └── router.tsx          router baseado em history
└── admin/
    ├── AdminApp.tsx        rotas do painel
    ├── auth.ts             sessão e regras de permissão por função
    ├── resources.tsx       formulários de cada conteúdo
    ├── pages/              painel, perfil, conteúdos, conta & equipa
    ├── onboarding/         tour guiado (API de onboarding)
    └── tutorial/           tutorial e botão de ajuda
```

## Publicação (Render — Static Site)

| Campo | Valor |
| --- | --- |
| Build Command | `npm install --include=dev && npm run build` |
| Publish Directory | `dist` |
| Variáveis | `VITE_API_URL` (URL da API no Render) e, se usado, `VITE_GOOGLE_CLIENT_ID` |
| Redirects/Rewrites | `/*` → `/index.html` (Rewrite), para `/admin`, `/artigos/...`, `/termos` e `/privacidade` funcionarem |

As variáveis `VITE_*` são lidas no momento do build: depois de as mudar, faça um novo deploy.
