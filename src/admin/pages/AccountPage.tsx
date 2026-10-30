import { useCallback, useEffect, useState, type FormEvent } from "react"
import {
  CheckCircle2,
  Info,
  KeyRound,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react"

import { isAdmin, patchSessionUser, useSession } from "@/admin/auth"
import { GOOGLE_CLIENT_ID, GoogleButton } from "@/admin/google"
import {
  Badge,
  Btn,
  Card,
  Drawer,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  useToast,
} from "@/admin/ui"
import { api } from "@/lib/api"
import { relative } from "@/lib/format"
import type { PanelUser, UserRole } from "@/lib/types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 12

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  administrador: "Administrador",
  editor: "Editor",
  user: "Utilizador",
}

const ROLE_HINT: Record<UserRole, string> = {
  admin:
    "Acesso total: cria, edita e remove conteúdos, gere a agenda e a equipa.",
  editor: "Cria e edita conteúdos, mas não remove nem gere a agenda.",
  user: "Cria e edita conteúdos, mas não remove nem gere a agenda.",
}

const ROLES: UserRole[] = ["admin", "editor", "user"]

const initialsOf = (text: string) =>
  text
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

function MyAccount() {
  const session = useSession()
  const toast = useToast()
  const [linking, setLinking] = useState(false)
  const user = session?.user
  if (!user) return null

  const initials = initialsOf(user.name || user.email)

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
              {ROLE_LABEL[user.role] ?? user.role}
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

/* ------------------------------------------------------------------ */
/* Equipa: lista de utilizadores, palavra-passe e reenvio de confirmação */
/* ------------------------------------------------------------------ */

function SetPasswordDrawer({
  user,
  onClose,
}: {
  user: PanelUser | null
  onClose: () => void
}) {
  const toast = useToast()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!user) return
    if (password.length < MIN_PASSWORD) {
      setError(`Use pelo menos ${MIN_PASSWORD} caracteres.`)
      return
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.")
      return
    }
    setSaving(true)
    try {
      await api.users.setPassword(user.id, password)
      toast.success(`Palavra-passe de ${user.email} atualizada.`)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      title="Definir nova palavra-passe"
      subtitle={
        user ? `${user.name || "Utilizador"} · ${user.email}` : undefined
      }
      footer={
        <>
          <Btn variant="outline" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn onClick={() => save()} loading={saving}>
            <KeyRound /> Guardar
          </Btn>
        </>
      }
    >
      <form onSubmit={save} className="flex flex-col gap-5" noValidate>
        <p className="rounded-2xl bg-lavender/40 p-4 text-sm text-ink/75">
          A pessoa passa a entrar com esta palavra-passe. Comunique-a por um
          canal seguro e peça-lhe para a alterar com «Esqueci-me da
          palavra-passe».
        </p>
        <Field
          label="Nova palavra-passe"
          htmlFor="sp-pass"
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
        >
          <Input
            id="sp-pass"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("")
            }}
          />
        </Field>
        <Field label="Confirmar" htmlFor="sp-confirm" error={error}>
          <Input
            id="sp-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setError("")
            }}
          />
        </Field>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  )
}

function Team({
  users,
  loading,
  error,
  reload,
}: {
  users: PanelUser[]
  loading: boolean
  error: string
  reload: () => void
}) {
  const session = useSession()
  const toast = useToast()
  const [target, setTarget] = useState<PanelUser | null>(null)
  const [resending, setResending] = useState("")

  const resend = async (user: PanelUser) => {
    setResending(user.id)
    try {
      // Para um e-mail já registado, a API apenas reenvia o link de
      // confirmação (a palavra-passe enviada aqui é ignorada).
      const res = await api.auth.signUp({
        nome: user.name || user.email,
        email: user.email,
        password: crypto.randomUUID(),
        role: (ROLES.includes(user.role as UserRole)
          ? user.role
          : "user") as UserRole,
      })
      toast.success(res.message || `Confirmação reenviada para ${user.email}.`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setResending("")
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender/40 text-ink">
            <UsersRound className="size-[18px]" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-bold text-ink">Equipa</h2>
            <p className="mt-0.5 text-sm text-ink/55">
              Contas com acesso ao painel.
            </p>
          </div>
        </div>
        <Btn variant="ghost" size="icon" title="Atualizar" onClick={reload}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Btn>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl bg-lip/10 px-4 py-3 text-sm text-lip">
          {error}
        </p>
      ) : loading && users.length === 0 ? (
        <div className="mt-5 flex flex-col gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-ink/8">
          {users.map((u) => {
            const me = u.id === session?.user.id
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center gap-3 py-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-heading text-xs font-bold text-white">
                  {initialsOf(u.name || u.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
                    {u.name || "Sem nome"}
                    {me && (
                      <span className="text-xs font-normal text-ink/45">
                        (você)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink/55">{u.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone={isAdmin(u.role) ? "lip" : "neutral"}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </Badge>
                    {u.active ? (
                      <Badge tone="green">Ativa</Badge>
                    ) : (
                      <Badge tone="caramel">Por confirmar</Badge>
                    )}
                    <span className="text-[11px] text-ink/40">
                      criada {relative(u.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {!u.active && (
                    <Btn
                      variant="soft"
                      size="sm"
                      loading={resending === u.id}
                      onClick={() => resend(u)}
                    >
                      <MailCheck /> Reenviar
                    </Btn>
                  )}
                  {!me && (
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() => setTarget(u)}
                    >
                      <KeyRound /> Palavra-passe
                    </Btn>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <SetPasswordDrawer
        key={target?.id ?? "none"}
        user={target}
        onClose={() => setTarget(null)}
      />
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Novo utilizador                                                      */
/* ------------------------------------------------------------------ */

type NewUser = {
  nome: string
  email: string
  password: string
  confirm: string
  role: UserRole | ""
}

function NewUserForm({
  takenRoles,
  onCreated,
}: {
  takenRoles: string[]
  onCreated: () => void
}) {
  const toast = useToast()
  // A API só permite um utilizador por função (role única).
  const available = ROLES.filter((r) => !takenRoles.includes(r))
  const [v, setV] = useState<NewUser>({
    nome: "",
    email: "",
    password: "",
    confirm: "",
    role: available[0] ?? "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof NewUser, string>>>(
    {}
  )
  const [saving, setSaving] = useState(false)
  const role =
    v.role && available.includes(v.role) ? v.role : (available[0] ?? "")

  const set = (k: keyof NewUser) => (e: { target: { value: string } }) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!v.nome.trim()) errs.nome = "Indique o nome."
    if (!EMAIL_RE.test(v.email.trim())) errs.email = "E-mail inválido."
    if (v.password.length < MIN_PASSWORD)
      errs.password = `Use pelo menos ${MIN_PASSWORD} caracteres.`
    if (v.confirm !== v.password)
      errs.confirm = "As palavras-passe não coincidem."
    setErrors(errs)
    if (Object.keys(errs).length || !role) return

    setSaving(true)
    try {
      const res = await api.auth.signUp({
        nome: v.nome.trim(),
        email: v.email.trim().toLowerCase(),
        password: v.password,
        role,
      })
      toast.success(
        res.message || `Enviámos um link de confirmação para ${v.email.trim()}.`
      )
      setV({ nome: "", email: "", password: "", confirm: "", role: "" })
      onCreated()
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
            A pessoa recebe um e-mail para confirmar a conta antes de entrar.
          </p>
        </div>
      </div>

      {available.length === 0 ? (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-ink/[0.03] p-4 text-sm text-ink/65">
          <Info className="mt-0.5 size-4 shrink-0" />
          Todas as funções (administrador, editor e utilizador) já estão
          atribuídas. A API permite apenas uma conta por função.
        </p>
      ) : (
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
            hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
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
            hint={role ? ROLE_HINT[role] : undefined}
          >
            <Select id="u-role" value={role} onChange={set("role")}>
              {available.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs text-ink/50">
              <Info className="size-3.5" /> Uma conta por função · o link expira
              em 30 minutos.
            </p>
            <Btn type="submit" loading={saving}>
              <UserPlus /> Criar e enviar convite
            </Btn>
          </div>
        </form>
      )}
    </Card>
  )
}

export function AccountPage() {
  const session = useSession()
  const admin = isAdmin(session?.user.role)
  const [users, setUsers] = useState<PanelUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setUsers(await api.users.list())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!admin) return
    let alive = true
    api.users
      .list()
      .then((list) => alive && setUsers(list))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [admin])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Acesso"
        title="Conta & equipa"
        description="Os seus dados de acesso, o login com Google e as contas da equipa."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-6">
          <MyAccount />
          {admin && (
            <Team users={users} loading={loading} error={error} reload={load} />
          )}
        </div>
        {admin ? (
          <NewUserForm takenRoles={users.map((u) => u.role)} onCreated={load} />
        ) : (
          <Card className="flex items-start gap-3 p-6 text-sm text-ink/60">
            <Info className="mt-0.5 size-4 shrink-0" />
            Só administradores podem ver a equipa e adicionar utilizadores.
          </Card>
        )}
      </div>
    </div>
  )
}
