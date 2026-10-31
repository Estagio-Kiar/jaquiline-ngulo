import { useMemo, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  CloudDownload,
  Plus,
  UserRound,
} from "lucide-react"

import { useSession } from "@/admin/auth"
import { useAdminData, type DataKey } from "@/admin/data"
import { RESOURCES } from "@/admin/resources"
import { Btn, Card, PageHeader, Skeleton, useToast } from "@/admin/ui"
import { about, journey, person, press, quotes } from "@/data/profile"
import { api } from "@/lib/api"
import { parseMonthYear, relative } from "@/lib/format"
import { Link } from "@/lib/router"

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite"
}

/** Copia o conteúdo estático atual do site para a API (só o que estiver vazio). */
async function importStatic(state: ReturnType<typeof useAdminData>["state"]) {
  let created = 0
  if (state.profile.items.length === 0) {
    await api.profile.create({
      title: person.badge,
      tagline: person.tagline,
      bio: person.heroText,
      bio_description: about.paragraphs.join("\n\n"),
      quote: quotes[0]?.text,
      location: "Luanda, Angola",
    })
    created++
  }
  if (state.career.items.length === 0) {
    // Criados por ordem cronológica: o site ordena o percurso por data de criação.
    for (const j of journey) {
      await api.career.create({
        role: j.title,
        period: j.date,
        description: j.text,
      })
      created++
    }
  }
  if (state.skills.items.length === 0 && !state.skills.error) {
    for (const name of about.skills) {
      await api.skills.create({ name })
      created++
    }
  }
  if (state.news.items.length === 0) {
    for (const p of [...press].reverse()) {
      await api.news.create({
        title: p.title,
        source_name: p.outlet,
        external_link: p.url,
        published_at: parseMonthYear(p.date),
        ...("image" in p && p.image ? { thumbnail_url: p.image } : {}),
      })
      created++
    }
  }
  return created
}

export function Dashboard() {
  const session = useSession()
  const { state, reload } = useAdminData()
  const toast = useToast()
  const [importing, setImporting] = useState(false)

  const loading = Object.values(state).some((s) => !s.loaded)
  const offline = !loading && Object.values(state).every((s) => s.error)

  const recent = useMemo(() => {
    const all = RESOURCES.flatMap((r) =>
      (state[r.key].items as { id: string; updated_at: string }[]).map(
        (item) => ({
          id: item.id,
          updated: item.updated_at,
          title: r.view(item as never).title,
          resource: r,
        })
      )
    )
    if (state.profile.items[0]) {
      all.push({
        id: state.profile.items[0].id,
        updated: state.profile.items[0].updated_at,
        title: "Perfil",
        resource: { path: "", title: "Perfil", icon: UserRound } as never,
      })
    }
    return all.sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)
  }, [state])

  const canImport =
    !loading &&
    !offline &&
    (state.profile.items.length === 0 ||
      state.career.items.length === 0 ||
      state.news.items.length === 0 ||
      (state.skills.items.length === 0 && !state.skills.error))

  const runImport = async () => {
    setImporting(true)
    try {
      const n = await importStatic(state)
      toast.success(`${n} registo(s) importado(s) do site.`)
      await reload()
    } catch (e) {
      toast.error((e as Error).message)
      reload()
    } finally {
      setImporting(false)
    }
  }

  const firstName = session?.user.name?.split(" ")[0] ?? ""

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Painel"
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Tudo o que é publicado no portfólio, num só lugar."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Btn variant="outline">
              Ver site <ArrowUpRight />
            </Btn>
          </a>
        }
      />

      {offline && (
        <Card className="border-lip/20 bg-lip/5 p-5 text-sm text-ink">
          Não foi possível ligar à API. Confirme que o servidor está a correr em{" "}
          <code className="rounded bg-white px-1.5 py-0.5">
            {import.meta.env.VITE_API_URL ?? "http://localhost:3333"}
          </code>
          .
        </Card>
      )}

      {canImport && (
        <Card className="relative overflow-hidden bg-ink p-6 text-white sm:p-8">
          <div className="absolute -top-20 -right-10 size-64 rounded-full bg-lip/40 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-caramel uppercase">
                Primeiros passos
              </p>
              <h2 className="mt-2 text-xl font-extrabold">
                Importar o conteúdo atual do site
              </h2>
              <p className="mt-1.5 text-sm/6 text-white/70">
                O perfil, o percurso, as competências e a imprensa que o site já
                mostra são copiados para a API, para que os possa editar aqui.
                Só são importadas as secções que ainda estão vazias.
              </p>
            </div>
            <Btn
              size="lg"
              loading={importing}
              onClick={runImport}
              className="bg-white text-ink shadow-none hover:bg-lavender"
            >
              <CloudDownload /> Importar agora
            </Btn>
          </div>
        </Card>
      )}

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {RESOURCES.map((r) => {
          const slot = state[r.key as DataKey]
          const Icon = r.icon
          return (
            <Link key={r.key} to={`/admin/${r.path}`} className="group">
              <Card className="flex h-full flex-col gap-4 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-lip/30 group-hover:shadow-lg group-hover:shadow-ink/5">
                <span className="grid size-10 place-items-center rounded-xl bg-lavender/40 text-ink transition-colors group-hover:bg-lip group-hover:text-white">
                  <Icon className="size-[18px]" />
                </span>
                <div>
                  {slot.loaded ? (
                    <p className="font-heading text-3xl font-extrabold text-ink">
                      {slot.items.length}
                    </p>
                  ) : (
                    <Skeleton className="h-9 w-10" />
                  )}
                  <p className="mt-0.5 text-sm font-medium text-ink/55">
                    {r.title}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-ink">
              Atividade recente
            </h2>
          </div>
          {loading ? (
            <div className="mt-5 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="mt-5 text-sm text-ink/50">
              Sem atividade ainda. Comece por criar conteúdo.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/8">
              {recent.map((r) => {
                const Icon = r.resource.icon
                return (
                  <li key={`${r.resource.path}-${r.id}`}>
                    <Link
                      to={
                        r.resource.path
                          ? `/admin/${r.resource.path}`
                          : "/admin/perfil"
                      }
                      className="group flex items-center gap-3 py-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink/[0.04] text-ink/60">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink group-hover:text-lip">
                          {r.title}
                        </p>
                        <p className="text-xs text-ink/45">
                          {r.resource.title}
                        </p>
                      </div>
                      <span className="text-xs text-ink/40">
                        {relative(r.updated)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-2 p-6">
          <h2 className="mb-2 font-heading text-sm font-bold text-ink">
            Ações rápidas
          </h2>
          {[
            { to: "/admin/perfil", label: "Editar perfil", icon: UserRound },
            { to: "/admin/imprensa", label: "Adicionar notícia", icon: Plus },
            { to: "/admin/artigos", label: "Escrever artigo", icon: Plus },
            { to: "/admin/agenda", label: "Novo evento na agenda", icon: Plus },
            {
              to: "/admin/percurso",
              label: "Novo marco no percurso",
              icon: Plus,
            },
          ].map((a) => (
            <Link
              key={a.to + a.label}
              to={a.to}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]"
            >
              <a.icon className="size-4 text-lip" />
              <span className="flex-1">{a.label}</span>
              <ArrowRight className="size-4 text-ink/30 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  )
}
