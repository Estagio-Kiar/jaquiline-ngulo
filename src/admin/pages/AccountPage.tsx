import { useState, type FormEvent } from "react"
import { CheckCircle2, Info, ShieldCheck, UserPlus } from "lucide-react"

import { isAdmin, patchSessionUser, useSession } from "@/admin/auth"
import { GOOGLE_CLIENT_ID, GoogleButton } from "@/admin/google"
import {
  Badge,
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  useToast,
} from "@/admin/ui"
import { api } from "@/lib/api"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type NewUser = {
  nome: string
  email: string
  password: string
  confirm: string
  role: "admin" | "editor"
}

const EMPTY: NewUser = {
  nome: "",
  email: "",
  password: "",
  confirm: "",
  role: "editor",
}

function MyAccount() {
  const session = useSession()
  const toast = useToast()
  const [linking, setLinking] = useState(false)
  const user = session?.user
  if (!user) return null

  const initials = (user.name || user.email)
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  const link = async (idToken: string) => {
    setLinking(true)
    try {
      await api.auth.linkGoogle(idToken, user.email)
      patchSessionUser({ google_id: user.google_id ?? "associada" })
      toast.success("Conta Google associada. Já pode entrar com o Google.")
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLinking(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-heading text-sm font-bold text-ink">A minha conta</h2>
      <div className="mt-5 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink font-heading text-lg font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {user.name || "Sem nome"}
          </p>
          <p className="truncate text-sm text-ink/55">{user.email}</p>
          <div className="mt-1.5">
            <Badge tone={isAdmin(user.role) ? "lip" : "neutral"}>
              {isAdmin(user.role) ? "Administrador" : "Editor"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/8 bg-ink/[0.02] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ink/60" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Entrar com Google</p>
            {user.google_id ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" /> Conta Google associada.
              </p>
            ) : GOOGLE_CLIENT_ID ? (
              <>
                <p className="mt-1 text-sm text-ink/55">
                  Associe a conta Google de <strong>{user.email}</strong> para
                  entrar sem palavra-passe.
                </p>
                <div className="mt-4 flex justify-start">
                  {linking ? (
                    <p className="text-sm text-ink/55">A associar…</p>
                  ) : (
                    <GoogleButton
                      onCredential={link}
                      text="continue_with"
                      width={280}
                    />
                  )}
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink/55">
                Indisponível: defina <code>VITE_GOOGLE_CLIENT_ID</code> no front
                e <code>GOOGLE_CLIENT_ID</code> na API.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function NewUserForm() {
  const toast = useToast()
  const [v, setV] = useState<NewUser>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof NewUser, string>>>(
    {}
  )
  const [saving, setSaving] = useState(false)

  const set = (k: keyof NewUser) => (e: { target: { value: string } }) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!v.nome.trim()) errs.nome = "Indique o nome."
    if (!EMAIL_RE.test(v.email.trim())) errs.email = "E-mail inválido."
    if (v.password.length < 8) errs.password = "Use pelo menos 8 caracteres."
    if (v.confirm !== v.password)
      errs.confirm = "As palavras-passe não coincidem."
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      await api.auth.signUp({
        nome: v.nome.trim(),
        email: v.email.trim().toLowerCase(),
        password: v.password,
        role: v.role,
      })
      toast.success(
        `Utilizador ${v.email.trim()} criado. Já pode entrar no painel.`
      )
      setV(EMPTY)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender/40 text-ink">
          <UserPlus className="size-[18px]" />
        </span>
        <div>
          <h2 className="font-heading text-sm font-bold text-ink">
            Adicionar utilizador
          </h2>
          <p className="mt-0.5 text-sm text-ink/55">
            Crie acesso ao painel para outra pessoa da equipa.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 grid gap-5 sm:grid-cols-2"
        noValidate
      >
        <Field label="Nome" required error={errors.nome} htmlFor="u-nome">
          <Input id="u-nome" value={v.nome} onChange={set("nome")} />
        </Field>
        <Field label="E-mail" required error={errors.email} htmlFor="u-email">
          <Input
            id="u-email"
            type="email"
            autoComplete="off"
            value={v.email}
            onChange={set("email")}
          />
        </Field>
        <Field
          label="Palavra-passe"
          required
          error={errors.password}
          hint="Mínimo 8 caracteres."
          htmlFor="u-pass"
        >
          <Input
            id="u-pass"
            type="password"
            autoComplete="new-password"
            value={v.password}
            onChange={set("password")}
          />
        </Field>
        <Field
          label="Confirmar palavra-passe"
          required
          error={errors.confirm}
          htmlFor="u-confirm"
        >
          <Input
            id="u-confirm"
            type="password"
            autoComplete="new-password"
            value={v.confirm}
            onChange={set("confirm")}
          />
        </Field>
        <Field
          label="Função"
          htmlFor="u-role"
          className="sm:col-span-2"
          hint={
            v.role === "admin"
              ? "Pode criar, editar e remover conteúdos."
              : "Pode criar e editar conteúdos, mas não remover."
          }
        >
          <Select id="u-role" value={v.role} onChange={set("role")}>
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </Select>
        </Field>
        <div className="flex items-center justify-between gap-4 sm:col-span-2">
          <p className="flex items-center gap-1.5 text-xs text-ink/50">
            <Info className="size-3.5" /> A API permite no máximo 4
            utilizadores.
          </p>
          <Btn type="submit" loading={saving}>
            <UserPlus /> Criar utilizador
          </Btn>
        </div>
      </form>
    </Card>
  )
}

export function AccountPage() {
  const session = useSession()
  const admin = isAdmin(session?.user.role)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Acesso"
        title="Conta & equipa"
        description="Os seus dados de acesso, o login com Google e as contas da equipa."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <MyAccount />
        {admin ? (
          <NewUserForm />
        ) : (
          <Card className="flex items-start gap-3 p-6 text-sm text-ink/60">
            <Info className="mt-0.5 size-4 shrink-0" />
            Só administradores podem adicionar utilizadores.
          </Card>
        )}
      </div>
    </div>
  )
}
