import { useSyncExternalStore } from "react"

import { api, sessionStore } from "@/lib/api"

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get)
}

export async function login(email: string, password: string) {
  const data = await api.auth.signIn(email.trim(), password)
  sessionStore.set(data)
  return data
}

export function logout() {
  sessionStore.set(null)
}

export const isAdmin = (role?: string) =>
  role === "admin" || role === "administrador"
