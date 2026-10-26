import { useEffect, useRef, useState } from "react"

/**
 * Botão «Entrar com Google» via Google Identity Services.
 * Só é mostrado quando VITE_GOOGLE_CLIENT_ID está definido
 * (o mesmo Client ID configurado em GOOGLE_CLIENT_ID na API).
 */

export const GOOGLE_CLIENT_ID = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
)?.trim()

type CredentialResponse = { credential?: string }

type GoogleId = {
  initialize: (config: {
    client_id: string
    callback: (response: CredentialResponse) => void
    ux_mode?: "popup" | "redirect"
    auto_select?: boolean
  }) => void
  renderButton: (
    element: HTMLElement,
    options: Record<string, string | number>
  ) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Não foi possível carregar o login do Google."))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function GoogleButton({
  onCredential,
  text = "signin_with",
  width = 320,
}: {
  onCredential: (idToken: string) => void
  text?: "signin_with" | "continue_with" | "signup_with"
  width?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  const [error, setError] = useState("")

  useEffect(() => {
    callback.current = onCredential
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let alive = true
    loadScript()
      .then(() => {
        const id = window.google?.accounts.id
        if (!alive || !id || !ref.current) return
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) callback.current(response.credential)
          },
          ux_mode: "popup",
        })
        id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          locale: "pt-PT",
          width,
        })
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [text, width])

  if (!GOOGLE_CLIENT_ID) return null
  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className="min-h-11" />
      {error && <p className="text-xs text-lip">{error}</p>}
    </div>
  )
}
