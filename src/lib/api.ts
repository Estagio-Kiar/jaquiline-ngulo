import type {
  AdminUser,
  AgendaEvent,
  AuthResponse,
  CareerHistory,
  GalleryPhoto,
  Category,
  Episode,
  News,
  Post,
  PanelUser,
  Profile,
  Skill,
  SocialLink,
  UploadFolder,
  UploadResponse,
  UserRole,
} from "@/lib/types"

/** URL base da API. Defina `VITE_API_URL` no `.env` do front. */
export const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3333"
).replace(/\/+$/, "")

/** Converte caminhos devolvidos pela API (`/uploads/...`) em URLs absolutas. */
export function assetUrl(src?: string | null) {
  if (!src) return undefined
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src
  if (src.startsWith("/uploads/")) return `${API_URL}${src}`
  return src
}

/**
 * Versão redimensionada de uma imagem do Cloudinary (largura máxima,
 * qualidade e formato automáticos). Outros URLs ficam como estão.
 */
export function imageVariant(src: string | null | undefined, width: number) {
  const url = assetUrl(src)
  if (!url) return undefined
  if (/res\.cloudinary\.com\/.+\/image\/upload\//.test(url))
    return url.replace(
      "/image/upload/",
      `/image/upload/c_limit,w_${width},q_auto,f_auto/`
    )
  return url
}

/* ------------------------------------------------------------------ */
/* Sessão                                                              */
/* ------------------------------------------------------------------ */

const SESSION_KEY = "jn-admin-session"

export type Session = {
  token: string
  refresh_token: string
  user: AdminUser
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

let session: Session | null = readSession()
const listeners = new Set<(s: Session | null) => void>()

export const sessionStore = {
  get: () => session,
  set(next: Session | null) {
    session = next
    try {
      if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* armazenamento indisponível: a sessão fica só em memória */
    }
    listeners.forEach((fn) => fn(next))
  },
  subscribe(fn: (s: Session | null) => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}

/* ------------------------------------------------------------------ */
/* Pedidos                                                             */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Verifique os campos e tente novamente.",
  401: "Sessão expirada. Inicie sessão novamente.",
  403: "Não tem permissão para esta ação.",
  404: "Registo não encontrado.",
  409: "Já existe um registo com estes dados.",
  413: "Ficheiro demasiado grande (máx. 5 MB).",
}

const AUTH_MESSAGES: Record<string, string> = {
  "Credentials taken": "Já existe um utilizador com este e-mail.",
  "Invalid Google token":
    "A sessão Google é inválida ou expirou. Tente novamente.",
  "Google email not verified":
    "O e-mail desta conta Google não está verificado.",
  "Google email does not match":
    "A conta Google escolhida não corresponde ao seu e-mail.",
  "Google account already linked to another user":
    "Esta conta Google já está associada a outro utilizador.",
  "Google account not registered":
    "Esta conta Google não pertence a nenhum utilizador do painel.",
  "Only active users":
    "A sua conta ainda não está ativa. Confirme o e-mail para continuar.",
  "Invalid or expired confirmation link":
    "O link de confirmação é inválido ou já expirou.",
  "Use the email confirmation code to reset your own password.":
    "Para alterar a sua própria palavra-passe use «Esqueci-me da palavra-passe» no login.",
  "User not found": "Utilizador não encontrado.",
  "Agenda event not found": "Evento não encontrado.",
}

async function toError(res: Response) {
  let message = MESSAGES[res.status] ?? `Erro inesperado (${res.status}).`
  try {
    const body = await res.json()
    const raw = Array.isArray(body?.message)
      ? body.message.join(" · ")
      : body?.message
    if (raw === "Invalid credentials")
      message = "E-mail ou palavra-passe incorretos."
    else if (raw === "Only manager")
      message = "Esta ação é reservada a administradores com conta ativa."
    else if (raw && AUTH_MESSAGES[raw]) message = AUTH_MESSAGES[raw]
    else if (typeof raw === "string" && /can not create \d+ users/i.test(raw))
      message = "Limite de utilizadores atingido na API."
    else if (res.status === 400 && raw) message = `Dados inválidos: ${raw}`
    // Mensagens que a API já escreve em português (ex.: «Código inválido ou
    // expirado.», «Confirme seu email antes de entrar.») passam tal e qual.
    else if (typeof raw === "string" && /[ãõçáéíóúâêô]/i.test(raw))
      message = raw
  } catch {
    /* corpo sem JSON */
  }
  return new ApiError(res.status, message)
}

let refreshing: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  const current = sessionStore.get()
  if (!current?.refresh_token) return false
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as AuthResponse
      sessionStore.set(data)
      return true
    } catch {
      sessionStore.set(null)
      return false
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

export async function request<T>(
  path: string,
  { method = "GET", body, auth = false, signal }: RequestOptions = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {}
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm)
    headers["Content-Type"] = "application/json"
  const token = sessionStore.get()?.token
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      signal,
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e
    throw new ApiError(
      0,
      "Não foi possível ligar à API. Confirme que o servidor está a correr."
    )
  }

  if (res.status === 401 && auth && retry && (await refreshSession())) {
    return request<T>(path, { method, body, auth, signal }, false)
  }
  if (!res.ok) throw await toError(res)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** CRUD genérico para os recursos REST da API. */
function resource<T, P = Partial<T>>(base: string) {
  return {
    list: (signal?: AbortSignal) => request<T[]>(base, { signal }),
    get: (id: string) => request<T>(`${base}/${id}`),
    create: (data: P) =>
      request<T>(base, { method: "POST", body: data, auth: true }),
    update: (id: string, data: P) =>
      request<T>(`${base}/${id}`, { method: "PATCH", body: data, auth: true }),
    remove: (id: string) =>
      request<T>(`${base}/${id}`, { method: "DELETE", auth: true }),
  }
}

export const api = {
  auth: {
    signIn: (email: string, password: string) =>
      request<AuthResponse>("/auth/sing_in", {
        method: "POST",
        body: { email, password },
      }),
    /**
     * Cria um utilizador do painel. A API envia um link de confirmação por
     * e-mail e a conta só fica ativa depois de confirmada. Se o e-mail já
     * existir, a API apenas reenvia o link.
     */
    signUp: (data: {
      nome: string
      email: string
      password: string
      role: UserRole
    }) =>
      request<{ message: string }>("/auth/sing_up", {
        method: "POST",
        body: data,
      }),
    /** Ativa a conta com o token recebido no link do e-mail. */
    confirmEmail: (token: string) =>
      request<{ message: string }>("/auth/confirm-email", {
        method: "POST",
        body: { token },
      }),
    /** Pede um código de 8 dígitos para redefinir a palavra-passe. */
    requestPasswordReset: (email: string) =>
      request<{ message: string }>("/auth/password-reset/request", {
        method: "POST",
        body: { email },
      }),
    /** Define a nova palavra-passe com o código recebido por e-mail. */
    confirmPasswordReset: (data: {
      email: string
      code: string
      newPassword: string
    }) =>
      request<{ message: string }>("/auth/password-reset/confirm", {
        method: "POST",
        body: data,
      }),
    /** Entra com o id_token devolvido pelo Google Identity Services. */
    google: (idToken: string) =>
      request<AuthResponse>("/auth/google", {
        method: "POST",
        body: { id_token: idToken },
      }),
    /** Associa uma conta Google ao utilizador com sessão iniciada. */
    linkGoogle: (idToken: string, email: string) =>
      request<{ message: string }>("/auth/link-google", {
        method: "POST",
        body: { id_token: idToken, email },
        auth: true,
      }),
  },
  profile: resource<Profile>("/profile"),
  social: resource<SocialLink>("/social_medias"),
  categories: resource<Category>("/categories"),
  articles: resource<Post>("/articles"),
  news: resource<News>("/news"),
  episodes: resource<Episode>("/episodes"),
  career: resource<CareerHistory>("/career_history"),
  skills: resource<Skill>("/skills"),
  agenda: resource<AgendaEvent>("/agenda"),
  gallery: resource<GalleryPhoto>("/gallery"),
  /** Gestão de utilizadores (só administradores). */
  users: {
    list: () => request<PanelUser[]>("/admin/users", { auth: true }),
    setPassword: (id: string, newPassword: string) =>
      request<{ message: string }>(`/admin/users/${id}/password`, {
        method: "PATCH",
        body: { newPassword },
        auth: true,
      }),
  },
  upload(folder: UploadFolder, file: File) {
    const form = new FormData()
    form.append("file", file)
    return request<UploadResponse>(`/uploads/${folder}`, {
      method: "POST",
      body: form,
      auth: true,
    })
  },
}

export type ApiResources = typeof api
