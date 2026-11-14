import { useSyncExternalStore } from "react"

import { api, sessionStore, type Session } from "@/lib/api"

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get)
}

export async function login(email: string, password: string) {
  const data = await api.auth.signIn(email.trim(), password)
  sessionStore.set(data)
  return data
}

export async function loginWithGoogle(idToken: string) {
  const data = await api.auth.google(idToken)
  sessionStore.set(data)
  return data
}

/** Atualiza os dados do utilizador guardados na sessão. */
export function patchSessionUser(patch: Partial<Session["user"]>) {
  const current = sessionStore.get()
  if (current)
    sessionStore.set({ ...current, user: { ...current.user, ...patch } })
}

export function logout() {
  sessionStore.set(null)
}

export const isAdmin = (role?: string) =>
  role === "admin" || role === "administrador"

/** Gestores e administradores podem remover conteúdos (ContentDeleteGuards). */
export const canDeleteContent = (role?: string) =>
  isAdmin(role) || role === "manager"

/** Todas as funções ativas podem criar e editar conteúdos (ContentWriteGuards). */
export const canWriteContent = (role?: string) =>
  canDeleteContent(role) || role === "editor" || role === "user"

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  administrador: "Administrador",
  manager: "Gestor",
  editor: "Editor",
  user: "Utilizador",
}

export const roleLabel = (role?: string) =>
  (role && ROLE_LABEL[role]) || role || "Utilizador"
