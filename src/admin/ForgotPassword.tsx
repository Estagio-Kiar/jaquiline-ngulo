import { useState, type FormEvent } from "react"
import { ArrowLeft, KeyRound, Mail } from "lucide-react"

import { Btn, Field, Input } from "@/admin/ui"
import { api } from "@/lib/api"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Recuperação de palavra-passe em dois passos:
 *  1. POST /auth/password-reset/request  → a API envia um código de 8 dígitos
 *  2. POST /auth/password-reset/confirm  → código + nova palavra-passe (≥ 12)
 * A API só envia o código a administradores com conta ativa, mas responde
 * sempre da mesma forma (para não revelar que e-mails existem).
 */
export function ForgotPassword({
  initialEmail,
  onCancel,
  onDone,
}: {
  initialEmail: string
  onCancel: () => void
  onDone: (email: string) => void
}) {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const requestCode = async (e?: FormEvent) => {
    e?.preventDefault()
    setError("")
    if (!EMAIL_RE.test(email.trim())) {
      setError("Indique um e-mail válido.")
      return
    }
    setLoading(true)
    try {
      const res = await api.auth.requestPasswordReset(
        email.trim().toLowerCase()
      )
      setInfo(res.message)
      setStep("code")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const reset = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!/^\d{8}$/.test(code.trim())) {
      setError("O código tem 8 dígitos.")
      return
    }
    if (password.length < 12) {
      setError("A nova palavra-passe deve ter pelo menos 12 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.")
      return
    }
    setLoading(true)
    try {
      await api.auth.confirmPasswordReset({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: password,
      })
      onDone(email.trim())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <span className="grid size-14 place-items-center rounded-2xl bg-ink text-white shadow-lg">
        <KeyRound className="size-6" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-ink">
        Recuperar acesso
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        {step === "email"
          ? "Enviamos um código de 8 dígitos para o e-mail da conta de administrador."
          : "Introduza o código recebido e escolha uma nova palavra-passe."}
      </p>

      {step === "email" ? (
        <form
          onSubmit={requestCode}
          className="mt-8 flex flex-col gap-5"
          noValidate
        >
          <Field label="E-mail" htmlFor="fp-email">
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
              <Input
                id="fp-email"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="h-12 pl-10"
              />
            </div>
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-lip/10 px-4 py-3 text-sm font-medium text-lip"
            >
              {error}
            </p>
          )}
          <Btn type="submit" size="lg" loading={loading} className="w-full">
            Enviar código
          </Btn>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-8 flex flex-col gap-5" noValidate>
          {info && (
            <p className="rounded-xl bg-lavender/40 px-4 py-3 text-sm text-ink/80">
              {info}
            </p>
          )}
          <Field
            label="Código"
            htmlFor="fp-code"
            hint="Válido durante 10 minutos."
          >
            <Input
              id="fp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="00000000"
              className="h-12 text-center font-heading text-xl tracking-[0.4em]"
            />
          </Field>
          <Field
            label="Nova palavra-passe"
            htmlFor="fp-pass"
            hint="Mínimo 12 caracteres."
          >
            <Input
              id="fp-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </Field>
          <Field label="Confirmar nova palavra-passe" htmlFor="fp-confirm">
            <Input
              id="fp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12"
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-lip/10 px-4 py-3 text-sm font-medium text-lip"
            >
              {error}
            </p>
          )}
          <Btn type="submit" size="lg" loading={loading} className="w-full">
            Redefinir palavra-passe
          </Btn>
          <button
            type="button"
            onClick={() => requestCode()}
            className="text-sm font-medium text-lip hover:underline"
          >
            Não recebeu? Enviar novo código
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="mt-6 inline-flex items-center justify-center gap-2 text-sm text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Voltar ao login
      </button>
    </>
  )
}
