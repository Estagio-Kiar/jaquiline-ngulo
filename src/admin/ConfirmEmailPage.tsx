import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, MailWarning } from "lucide-react"

import { person } from "@/data/profile"
import { api } from "@/lib/api"
import { Link } from "@/lib/router"

/*
 * Página aberta a partir do e-mail de confirmação:
 *   <FRONTEND_URL>/confirmar-email#token=<id>.<segredo>
 * Envia o token para POST /auth/confirm-email e ativa a conta.
 */

// O token só pode ser usado uma vez: guarda o pedido para que o
// StrictMode (que monta o efeito duas vezes) não o envie em duplicado.
const pending = new Map<string, Promise<{ message: string }>>()

function readToken() {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get(
    "token"
  )
  const fromQuery = new URLSearchParams(window.location.search).get("token")
  return fromHash || fromQuery || ""
}

type State =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export default function ConfirmEmailPage() {
  const [token] = useState(readToken)
  const [state, setState] = useState<State>(() =>
    token
      ? { status: "loading" }
      : {
          status: "error",
          message:
            "O link não contém o código de confirmação. Abra-o diretamente a partir do e-mail.",
        }
  )

  useEffect(() => {
    if (!token) return
    let alive = true
    if (!pending.has(token)) pending.set(token, api.auth.confirmEmail(token))
    pending
      .get(token)!
      .then(() => {
        if (!alive) return
        setState({
          status: "success",
          message: "E-mail confirmado. A sua conta já está ativa.",
        })
        // Remove o token da barra de endereço.
        window.history.replaceState(null, "", window.location.pathname)
      })
      .catch(
        (e: Error) => alive && setState({ status: "error", message: e.message })
      )
    return () => {
      alive = false
    }
  }, [token])

  return (
    <div className="grid min-h-svh place-items-center bg-[#f7f7f9] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-ink/8 bg-white p-8 text-center shadow-xl shadow-ink/5">
        <p className="font-heading text-sm leading-tight font-extrabold tracking-wider uppercase">
          {person.firstName} <span className="text-lip">{person.lastName}</span>
        </p>

        <div className="mt-8 flex justify-center">
          {state.status === "loading" && (
            <span className="grid size-16 place-items-center rounded-2xl bg-ink/5 text-ink">
              <Loader2 className="size-7 animate-spin" />
            </span>
          )}
          {state.status === "success" && (
            <span className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </span>
          )}
          {state.status === "error" && (
            <span className="grid size-16 place-items-center rounded-2xl bg-lip/10 text-lip">
              <MailWarning className="size-8" />
            </span>
          )}
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-ink">
          {state.status === "loading"
            ? "A confirmar o e-mail…"
            : state.status === "success"
              ? "Conta ativada"
              : "Não foi possível confirmar"}
        </h1>
        {state.status !== "loading" && (
          <p className="mt-2 text-sm/6 text-ink/60">{state.message}</p>
        )}
        {state.status === "error" && (
          <p className="mt-2 text-xs text-ink/45">
            Os links expiram ao fim de 30 minutos. Peça a um administrador para
            reenviar a confirmação.
          </p>
        )}

        {state.status !== "loading" && (
          <Link
            to="/admin"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-lip text-sm font-medium text-white shadow-sm shadow-lip/30 hover:bg-lip/90"
          >
            {state.status === "success"
              ? "Iniciar sessão no painel"
              : "Ir para o login"}
          </Link>
        )}
      </div>
    </div>
  )
}
