import { useSyncExternalStore } from "react"

/** Tópicos marcados como vistos (guardado só neste navegador). */
const KEY = "jn-tutorial-read"
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

let cache = read()

export function setTopicRead(id: string, done: boolean) {
  cache = done ? [...new Set([...cache, id])] : cache.filter((x) => x !== id)
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* sem armazenamento: fica só em memória */
  }
  listeners.forEach((fn) => fn())
}

export function useReadTopics() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => cache
  )
}
