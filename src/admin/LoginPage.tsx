import { useState, type FormEvent } from "react"
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { login, loginWithGoogle } from "@/admin/auth"
import { GOOGLE_CLIENT_ID, GoogleButton } from "@/admin/google"
import { Btn, Field, Input } from "@/admin/ui"
import { person } from "@/data/profile"
import { Link } from "@/lib/router"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Preencha o e-mail e a palavra-passe.")
      return
    }
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const google = async (idToken: string) => {
    setError("")
    setLoading(true)
    try {
      await loginWithGoogle(idToken)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh bg-[#f7f7f9] lg:grid-cols-[1.1fr_1fr]">
      {/* Painel visual */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          src={person.photo}
          alt=""
          className="absolute inset-0 size-full object-cover object-[50%_20%] opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute -right-32 -bottom-32 size-96 rounded-full bg-lip/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <p className="font-heading text-sm leading-tight font-extrabold tracking-wider uppercase">
            <span className="block">{person.firstName}</span>
            <span className="block text-lip">{person.lastName}</span>
          </p>
          <div className="max-w-md">
            <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-caramel uppercase">
              Painel de conteúdos
            </p>
            <h2 className="mt-3 text-4xl leading-tight font-extrabold">
              O portfólio, sempre atualizado.
            </h2>
            <p className="mt-4 text-base/7 text-white/75">
              Edite o perfil, o percurso, a imprensa, os artigos e o podcast —
              as alterações aparecem no site de imediato.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm text-ink/60 hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Voltar ao site
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <span className="grid size-14 place-items-center rounded-2xl bg-ink text-white shadow-lg">
            <Lock className="size-6" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold text-ink">
            Iniciar sessão
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Acesso reservado à equipa de gestão do portfólio.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 flex flex-col gap-5"
            noValidate
          >
            <Field label="E-mail" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="h-12 pl-10"
                />
              </div>
            </Field>

            <Field label="Palavra-passe" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pr-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink/40 hover:bg-ink/5 hover:text-ink"
                  aria-label={
                    show ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
                  }
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
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

            <Btn
              type="submit"
              size="lg"
              loading={loading}
              className="mt-1 w-full"
            >
              Entrar no painel
            </Btn>
          </form>

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
                <span className="h-px flex-1 bg-ink/10" />
                ou
                <span className="h-px flex-1 bg-ink/10" />
              </div>
              <GoogleButton onCredential={google} />
              <p className="mt-3 text-center text-xs text-ink/45">
                Só para contas Google já associadas a um utilizador do painel.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink/40">
          © {new Date().getFullYear()} {person.name}
        </p>
      </div>
    </div>
  )
}
