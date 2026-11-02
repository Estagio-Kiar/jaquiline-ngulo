import { useCallback, useEffect, useRef, useState } from "react"
import { api, sessionStore } from "@/lib/api"
import { navigate } from "@/lib/router"

const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
)?.trim()

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string
            callback: (res: { credential?: string }) => void
            ux_mode?: "popup" | "redirect"
            auto_select?: boolean
          }) => void
          renderButton: (
            el: HTMLElement,
            opts: Record<string, string | number>
          ) => void
        }
      }
    }
  }
}

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    )
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () =>
        reject(new Error("Falha ao carregar Google Identity Services"))
      )
      if (existing.dataset.loaded === "true") resolve()
      return
    }
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = "true"
      resolve()
    }
    script.onerror = () =>
      reject(new Error("Falha ao carregar Google Identity Services"))
    document.head.appendChild(script)
  })
}

export function useGoogleLogin() {
  const { google } = api.auth
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCredential = useCallback(
    async (response: { credential?: string }) => {
      const idToken = response?.credential
      if (!idToken) {
        setError("Resposta inválida do Google")
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const data = await google(idToken)
        sessionStore.set(data)
        navigate("/admin")
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Falha ao entrar com Google"
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [google]
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGsi()
      .then(() => {
        if (cancelled) return
        window.google!.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
        })
        if (containerRef.current) {
          window.google!.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            locale: "pt-PT",
            width: 320,
          })
        }
        setIsReady(true)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [handleCredential])

  return {
    containerRef,
    isReady,
    isLoading,
    error:
      error ??
      (!GOOGLE_CLIENT_ID ? "VITE_GOOGLE_CLIENT_ID não configurado" : null),
    setError,
  }
}
