import { useCallback, useEffect, useState, type FormEvent } from "react"
import { ArrowLeft, KeyRound, ShieldCheck, UserRound } from "lucide-react"

import { Btn, Field, Input } from "@/admin/ui"
import { api } from "@/lib/api"
import { Link, Redirect } from "@/lib/router"

const MIN_PASSWORD = 12

export function SetupPage() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState(false)

  const checkAdmin = useCallback(async (signal?: AbortSignal) => {
    setChecking(true)
    setError("")
    try {
      const exists = await api.auth.adminExists(signal)
      setAdminExists(exists)
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        setError((err as Error).message)
    } finally {
      if (!signal?.aborted) setChecking(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void checkAdmin(controller.signal)
    return () => controller.abort()
  }, [checkAdmin])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha todos os campos.")
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`A palavra-passe deve ter pelo menos ${MIN_PASSWORD} caracteres.`)
      return
    }
    if (password !== confirmation) {
      setError("As palavras-passe não coincidem.")
      return
    }

    setLoading(true)
    try {
      await api.auth.setupAdmin({
        nome: name.trim(),
        email: email.trim(),
        password,
      })
      setCreated(true)
      setAdminExists(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[#f7f7f9] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-ink/8 bg-white p-7 shadow-xl shadow-ink/5 sm:p-9">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink/55 hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Voltar ao site
        </Link>

        

        {checking ? (
          <p className="mt-8 text-sm text-ink/60" role="status">
            Processando a rota…
          </p>
        ) : error && adminExists === null ? (
          <div className="mt-8">
            <p role="alert" className="rounded-xl bg-lip/10 px-4 py-3 text-sm text-lip">
              {error}
            </p>
            <Btn className="mt-4 w-full" onClick={() => void checkAdmin()}>
              Tentar novamente
            </Btn>
          </div>
        ) : created ? (
          <div className="mt-8">
            <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700">
              Administrador criado. Já pode iniciar sessão no painel.
            </p>
            <Link
              to="/admin"
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-lip px-6 text-sm font-medium text-white shadow-sm shadow-lip/30 transition-colors hover:bg-lip/90"
            >
              Ir para o painel
            </Link>
          </div>
        ) : adminExists ? (
          <Redirect to="/" />
        ) : (
          
          <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
            <div className="mt-8 grid size-14 place-items-center rounded-2xl bg-ink text-white">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">
          Configuração inicial
        </h1>
        <p className="mt-2 text-sm/6 text-ink/55">
          Crie a conta de administrador para gerir o painel da Jaqueline Ngulo.
        </p>
            <Field label="Nome" htmlFor="setup-name" required>
              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
                <Input
                  id="setup-name"
                  autoComplete="name"
                  autoFocus
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </Field>
            <Field label="E-mail" htmlFor="setup-email" required>
              <Input
                id="setup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@exemplo.com"
                className="h-12"
              />
            </Field>
            <Field
              label="Palavra-passe"
              htmlFor="setup-password"
              required
              hint={`Mínimo de ${MIN_PASSWORD} caracteres.`}
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
                <Input
                  id="setup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </Field>
            <Field
              label="Confirmar palavra-passe"
              htmlFor="setup-confirmation"
              required
            >
              <Input
                id="setup-confirmation"
                type="password"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
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
              Criar administrador
            </Btn>
          </form>
        )}
      </section>
    </main>
  )
}
