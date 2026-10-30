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
