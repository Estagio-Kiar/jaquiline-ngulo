import type {
  AdminUser,
  AuthResponse,
  CareerHistory,
  Category,
  Episode,
  News,
  Post,
  Profile,
  SocialLink,
  UploadFolder,
  UploadResponse,
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
      message = "Apenas administradores podem remover registos."
    else if (res.status === 400 && raw) message = `Dados inválidos: ${raw}`
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
  },
  profile: resource<Profile>("/profile"),
  social: resource<SocialLink>("/social_medias"),
  categories: resource<Category>("/categories"),
  articles: resource<Post>("/articles"),
  news: resource<News>("/news"),
  episodes: resource<Episode>("/episodes"),
  career: resource<CareerHistory>("/career_history"),
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
