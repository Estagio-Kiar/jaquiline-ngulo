import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertCircle,
  ExternalLink,
  ImageOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { isAdmin, useSession } from "@/admin/auth"
import { useAdminData, useSlot, type DataKey } from "@/admin/data"
import type { FieldDef, ResourceConfig } from "@/admin/resources"
import {
  Badge,
  Btn,
  Card,
  ConfirmDialog,
  Drawer,
  Field,
  ImageField,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from "@/admin/ui"
import { api, assetUrl } from "@/lib/api"
import { relative, slugify } from "@/lib/format"
import { cn } from "@/lib/utils"

type Item = { id: string; updated_at: string } & Record<string, unknown>
type Values = Record<string, string>

/* ---------------------------- conversões ---------------------------- */

/** ISO → valor de <input type="datetime-local"> na hora local. */
function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toForm(fields: FieldDef[], item?: Item): Values {
  const v: Values = {}
  for (const f of fields) {
    const raw = item?.[f.name]
    if (raw === null || raw === undefined) v[f.name] = ""
    else if (f.type === "date") v[f.name] = String(raw).slice(0, 10)
    else if (f.type === "datetime") v[f.name] = toLocalInput(String(raw))
    else v[f.name] = String(raw)
  }
  return v
}

function toPayload(fields: FieldDef[], values: Values, editing: boolean) {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    const v = (values[f.name] ?? "").trim()
    if (f.type === "date") {
      if (v) out[f.name] = new Date(`${v}T12:00:00`).toISOString()
    } else if (f.type === "datetime") {
      if (v) out[f.name] = new Date(v).toISOString()
    } else if (f.type === "number") {
      if (v !== "")
        out[f.name] = Math.min(
          f.max ?? Infinity,
          Math.max(f.min ?? 0, Math.round(Number(v)))
        )
    } else if (f.type === "select" && !f.allowCustom) {
      if (v) out[f.name] = v
    } else if (f.type === "slug") {
      if (v) out[f.name] = slugify(v)
    } else if (v || editing) {
      out[f.name] = v
    }
  }
  return out
}

function validate(fields: FieldDef[], values: Values) {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    const v = (values[f.name] ?? "").trim()
    if (f.required && !v) errors[f.name] = "Campo obrigatório."
    else if (f.type === "url" && v && !/^https?:\/\//i.test(v))
      errors[f.name] = "Use um link completo, começado por https://"
    else if (f.type === "number" && v && Number.isNaN(Number(v)))
      errors[f.name] = "Indique um número."
    else if (f.type === "number" && v && f.max != null && Number(v) > f.max)
      errors[f.name] = `O valor máximo é ${f.max}.`
    else if (f.type === "number" && v && f.min != null && Number(v) < f.min)
      errors[f.name] = `O valor mínimo é ${f.min}.`
  }
  return errors
}

/* ----------------------------- formulário ---------------------------- */

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const { state } = useAdminData()
  const id = `f-${field.name}`
  const common = {
    id,
    "aria-invalid": !!error || undefined,
    placeholder: field.placeholder,
  }

  switch (field.type) {
    case "image":
      return (
        <ImageField
          value={value}
          onChange={onChange}
          folder={field.folder ?? "articles"}
        />
      )
    case "textarea":
      return (
        <Textarea
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "longtext":
      return (
        <Textarea
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-80 font-[450]"
        />
      )
    case "datetime":
      return (
        <Input
          {...common}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "date":
      return (
        <Input
          {...common}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "number":
      return (
        <Input
          {...common}
          type="number"
          min={field.min ?? 0}
          max={field.max}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "url":
      return (
        <Input
          {...common}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case "select": {
      const options =
        field.options ??
        (field.optionsFrom
          ? (
              state[field.optionsFrom].items as { id: string; name?: string }[]
            ).map((o) => ({ value: o.id, label: o.name ?? o.id }))
          : [])
      if (field.allowCustom) {
        return (
          <>
            <Input
              {...common}
              list={`${id}-list`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Escolha ou escreva"
            />
            <datalist id={`${id}-list`}>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </datalist>
          </>
        )
      }
      return (
        <Select
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Nenhuma —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )
    }
    default:
      return (
        <Input
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}

function ResourceForm({
  config,
  item,
  open,
  onClose,
  onSaved,
}: {
  config: ResourceConfig
  item?: Item
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const editing = !!item
  const [values, setValues] = useState<Values>(() =>
    toForm(config.fields, item)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [slugTouched, setSlugTouched] = useState(editing)
  const [saving, setSaving] = useState(false)

  const set = (name: string, v: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v }
      if (!slugTouched) {
        for (const f of config.fields)
          if (f.type === "slug" && f.from === name) next[f.name] = slugify(v)
      }
      return next
    })
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }))
  }

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const errs = validate(config.fields, values)
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) {
      toast.error("Reveja os campos assinalados.")
      return
    }
    let payload = toPayload(config.fields, values, editing)
    if (config.finalize) payload = config.finalize(payload)
    setSaving(true)
    try {
      const r = api[config.key as DataKey]
      if (item) await r.update(item.id, payload as never)
      else await r.create(payload as never)
      toast.success(
        item
          ? "Alterações guardadas."
          : `${capitalize(config.singular)} ${g(config, "criado")} com sucesso.`
      )
      onSaved()
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        submit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        item
          ? `Editar ${config.singular}`
          : `${config.gender === "f" ? "Nova" : "Novo"} ${config.singular}`
      }
      subtitle={`Aparece em: ${config.siteSection}`}
      footer={
        <>
          <span className="mr-auto hidden text-xs text-ink/40 sm:block">
            Ctrl + S para guardar · Esc para fechar
          </span>
          <Btn variant="outline" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn onClick={() => submit()} loading={saving}>
            {item ? "Guardar alterações" : "Criar"}
          </Btn>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
        {config.fields.map((f) => (
          <Field
            key={f.name}
            label={f.label}
            required={f.required}
            hint={f.hint}
            error={errors[f.name]}
            htmlFor={`f-${f.name}`}
            className={f.half ? "" : "sm:col-span-2"}
            aside={
              f.type === "slug" && slugTouched && f.from ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-lip hover:underline"
                  onClick={() => {
                    setSlugTouched(false)
                    set(f.name, slugify(values[f.from!] ?? ""))
                  }}
                >
                  Gerar do título
                </button>
              ) : undefined
            }
          >
            <FieldInput
              field={f}
              value={values[f.name] ?? ""}
              error={errors[f.name]}
              onChange={(v) => {
                if (f.type === "slug") setSlugTouched(true)
                set(
                  f.name,
                  f.type === "slug"
                    ? v
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .replace(/[^a-z0-9-]+/g, "-")
                        .slice(0, 120)
                    : v
                )
              }}
            />
          </Field>
        ))}
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  )
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** "criado" → "criada" quando o recurso é feminino. */
const g = (c: ResourceConfig, word: string) =>
  c.gender === "f" ? word.replace(/o$/, "a") : word

/* ------------------------------- lista ------------------------------- */

function Thumb({
  src,
  className,
}: {
  src?: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const url = assetUrl(src)
  return (
    <div
      className={cn(
        "overflow-hidden bg-linear-to-br from-graphite to-ink",
        className
      )}
    >
      {url && !failed ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="grid size-full place-items-center text-lavender/50">
          <ImageOff className="size-6" />
        </div>
      )}
    </div>
  )
}

export function ResourcePage({ config }: { config: ResourceConfig }) {
  const { items, loading, error, reload } = useSlot(config.key)
  const session = useSession()
  const admin = isAdmin(session?.user.role)
  const canDelete = admin
  // Recursos «adminOnly» (ex.: Agenda) só podem ser alterados por administradores.
  const canWrite = !config.adminOnly || admin
  const open = (item: Item | null) => {
    if (canWrite) setEditing(item)
  }
  const toast = useToast()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<Item | null | undefined>(undefined) // undefined = fechado, null = novo
  const [toDelete, setToDelete] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)
  const Icon = config.icon

  const list = useMemo(() => {
    const arr = [...(items as unknown as Item[])]
    if (config.sort) arr.sort(config.sort as never)
    const q = query.trim().toLowerCase()
    if (!q) return arr
    return arr.filter((i) => {
      const v = config.view(i as never)
      return [v.title, v.subtitle, v.meta, v.badge]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [items, query, config])

  const remove = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api[config.key].remove(toDelete.id)
      toast.success(`${capitalize(config.singular)} ${g(config, "removido")}.`)
      setToDelete(null)
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const actions = (item: Item, view: ReturnType<ResourceConfig["view"]>) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {view.link && (
        <a
          href={view.link}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir"
          className="grid size-9 place-items-center rounded-xl text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
      {canWrite && (
        <Btn
          variant="ghost"
          size="icon"
          title="Editar"
          onClick={() => open(item)}
        >
          <Pencil />
        </Btn>
      )}
      {canDelete && (
        <Btn
          variant="ghost"
          size="icon"
          title="Remover"
          className="hover:bg-lip/10 hover:text-lip"
          onClick={() => setToDelete(item)}
        >
          <Trash2 />
        </Btn>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Conteúdos"
        title={config.title}
        description={config.description}
        actions={
          canWrite ? (
            <Btn onClick={() => open(null)}>
              <Plus /> Adicionar {config.singular}
            </Btn>
          ) : undefined
        }
      />

      {!canWrite && (
        <Card className="flex items-center gap-3 border-caramel/40 bg-caramel/10 p-4 text-sm text-ink/80">
          <AlertCircle className="size-4 shrink-0 text-[#7a5236]" />
          Só administradores podem criar ou alterar {config.title.toLowerCase()}
          . Pode consultar a lista.
        </Card>
      )}

      {(items.length > 4 || query) && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Pesquisar em ${config.title.toLowerCase()}…`}
            className="pl-10"
          />
        </div>
      )}

      {error && (
        <Card className="flex items-center gap-4 border-lip/20 bg-lip/5 p-5">
          <AlertCircle className="size-5 shrink-0 text-lip" />
          <p className="flex-1 text-sm text-ink">{error}</p>
          <Btn variant="outline" size="sm" onClick={reload}>
            <RefreshCw /> Tentar de novo
          </Btn>
        </Card>
      )}

      {loading && items.length === 0 ? (
        <div
          className={
            config.layout === "grid"
              ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className={
                config.layout === "grid"
                  ? "h-72 rounded-3xl"
                  : "h-20 rounded-2xl"
              }
            />
          ))}
        </div>
      ) : list.length === 0 && !error ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-lavender/40 text-ink">
            <Icon className="size-7" />
          </span>
          <h3 className="mt-5 text-lg font-bold text-ink">
            {query
              ? "Sem resultados"
              : `Ainda não há ${config.title.toLowerCase()}`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink/55">
            {query
              ? "Experimente outra pesquisa."
              : `Adicione ${config.gender === "f" ? "a primeira" : "o primeiro"} ${config.singular} — aparece de imediato no site.`}
          </p>
          {!query && canWrite && (
            <Btn className="mt-6" onClick={() => open(null)}>
              <Plus /> Adicionar {config.singular}
            </Btn>
          )}
        </Card>
      ) : config.layout === "grid" ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => {
            const v = config.view(item as never)
            return (
              <li key={item.id}>
                <Card className="group flex h-full cursor-pointer flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5">
                  <div onClick={() => open(item)} className="relative">
                    <Thumb src={v.image} className="aspect-[16/9]" />
                    {v.badge && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
                        {v.badge}
                      </span>
                    )}
                  </div>
                  <div
                    onClick={() => open(item)}
                    className="flex flex-1 flex-col gap-1.5 p-5"
                  >
                    {v.meta && (
                      <p className="font-heading text-[10px] font-semibold tracking-[0.15em] text-lip uppercase">
                        {v.meta}
                      </p>
                    )}
                    <h3 className="line-clamp-2 font-bold text-ink">
                      {v.title}
                    </h3>
                    {v.subtitle && (
                      <p className="line-clamp-2 text-sm text-ink/55">
                        {v.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-ink/8 px-3 py-2">
                    <span className="pl-2 text-xs text-ink/40">
                      Atualizado {relative(item.updated_at)}
                    </span>
                    {actions(item, v)}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <Card className="divide-y divide-ink/8 overflow-hidden">
          {list.map((item) => {
            const v = config.view(item as never)
            return (
              <div
                key={item.id}
                onClick={() => open(item)}
                className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-ink/[0.02]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lavender/40 text-ink">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-ink">
                      {v.title}
                    </h3>
                    {v.badge && <Badge>{v.badge}</Badge>}
                  </div>
                  {v.meta && (
                    <p className="truncate text-xs font-medium text-lip">
                      {v.meta}
                    </p>
                  )}
                  {v.subtitle && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-ink/55">
                      {v.subtitle}
                    </p>
                  )}
                </div>
                <span className="hidden text-xs text-ink/40 md:block">
                  {relative(item.updated_at)}
                </span>
                {actions(item, v)}
              </div>
            )
          })}
        </Card>
      )}

      {editing !== undefined && (
        <ResourceForm
          key={editing?.id ?? "new"}
          config={config}
          item={editing ?? undefined}
          open
          onClose={() => setEditing(undefined)}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Remover ${config.singular}?`}
        description={
          <>
            «{toDelete ? config.view(toDelete as never).title : ""}» será{" "}
            {g(config, "removido")} do site. Esta ação não pode ser desfeita.
          </>
        }
        loading={deleting}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}
