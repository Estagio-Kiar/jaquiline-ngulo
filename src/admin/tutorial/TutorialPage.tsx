import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react"

import { Badge, Btn, Card, Input, PageHeader } from "@/admin/ui"
import { GROUP_ORDER, TOPICS, type Topic } from "@/admin/tutorial/content"
import { setTopicRead, useReadTopics } from "@/admin/tutorial/progress"
import { Steps } from "@/admin/tutorial/Steps"
import { Link } from "@/lib/router"
import { cn } from "@/lib/utils"

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function topicFromHash() {
  const id = window.location.hash.slice(1)
  return TOPICS.find((t) => t.id === id)?.id ?? TOPICS[0].id
}

export function TutorialPage() {
  const [current, setCurrent] = useState(topicFromHash)
  const [query, setQuery] = useState("")
  const read = useReadTopics()

  // Mantém o tópico no endereço (#id) para poder partilhar/voltar.
  useEffect(() => {
    window.history.replaceState(null, "", `/admin/tutorial#${current}`)
  }, [current])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return TOPICS
    return TOPICS.filter((t) =>
      normalize(
        [t.title, t.summary, ...t.steps.flatMap((s) => [s.title, s.text])].join(
          " "
        )
      ).includes(q)
    )
  }, [query])

  const topic = TOPICS.find((t) => t.id === current) ?? TOPICS[0]
  const index = TOPICS.indexOf(topic)
  const prev = TOPICS[index - 1]
  const next = TOPICS[index + 1]
  const done = read.includes(topic.id)
  const readCount = TOPICS.filter((t) => read.includes(t.id)).length

  const open = (t: Topic) => {
    setCurrent(t.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Ajuda"
        title="Tutorial do painel"
        description="Guias passo a passo para cada funcionalidade. Escolha um tema à esquerda ou pesquise."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Índice */}
        <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-6">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-ink/60">
              <span>Progresso</span>
              <span>
                {readCount} de {TOPICS.length}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full bg-lip transition-[width] duration-500"
                style={{ width: `${(readCount / TOPICS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/35" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar (ex.: imagem, agenda)"
              className="h-10 pl-9 text-sm"
            />
          </div>

          <nav className="flex flex-col gap-4" aria-label="Temas do tutorial">
            {GROUP_ORDER.map((group) => {
              const items = filtered.filter((t) => t.group === group)
              if (!items.length) return null
              return (
                <div key={group}>
                  <p className="px-2 pb-1.5 font-heading text-[10px] font-semibold tracking-[0.2em] text-ink/40 uppercase">
                    {group}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((t) => {
                      const active = t.id === topic.id
                      const seen = read.includes(t.id)
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => open(t)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                              active
                                ? "bg-ink text-white"
                                : "text-ink/75 hover:bg-ink/[0.04] hover:text-ink"
                            )}
                          >
                            <t.icon
                              className={cn(
                                "size-4 shrink-0",
                                active ? "text-lavender" : "text-ink/40"
                              )}
                            />
                            <span className="flex-1 truncate">{t.title}</span>
                            {seen && (
                              <CheckCircle2
                                className={cn(
                                  "size-3.5 shrink-0",
                                  active
                                    ? "text-emerald-300"
                                    : "text-emerald-600"
                                )}
                              />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-2 text-sm text-ink/50">
                Nada encontrado para «{query}».
              </p>
            )}
          </nav>
        </Card>

        {/* Conteúdo do tema */}
        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-ink p-6 text-white sm:p-8">
            <div className="absolute -top-16 -right-10 size-56 rounded-full bg-lip/35 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-lavender">
                <topic.icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-[10px] font-semibold tracking-[0.25em] text-caramel uppercase">
                  {topic.group} · {topic.steps.length} passos
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">{topic.title}</h2>
                <p className="mt-1 text-sm text-white/70">{topic.summary}</p>
                {topic.adminOnly && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                    <ShieldCheck className="size-3.5" /> Só administradores
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <Steps steps={topic.steps} />

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-6">
              <Btn
                variant={done ? "soft" : "outline"}
                onClick={() => setTopicRead(topic.id, !done)}
              >
                {done ? <CheckCircle2 /> : <Circle />}
                {done ? "Concluído" : "Marcar como concluído"}
              </Btn>
              {topic.route && (
                <Link
                  to={topic.route}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-lip px-4 text-sm font-medium text-white shadow-sm shadow-lip/30 hover:bg-lip/90"
                >
                  <ExternalLink className="size-4" /> Ir para a página
                </Link>
              )}
              <span className="flex-1" />
              {prev && (
                <Btn
                  variant="ghost"
                  onClick={() => open(prev)}
                  title={prev.title}
                >
                  <ArrowLeft /> Anterior
                </Btn>
              )}
              {next && (
                <Btn
                  variant="dark"
                  onClick={() => {
                    setTopicRead(topic.id, true)
                    open(next)
                  }}
                  title={next.title}
                >
                  Seguinte <ArrowRight />
                </Btn>
              )}
            </div>
            {next && (
              <p className="mt-3 text-right text-xs text-ink/40">
                A seguir: {next.title}
              </p>
            )}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-ink/40">
        <Badge>Dica</Badge> Em qualquer página do painel, o botão «?» no canto
        inferior esquerdo mostra as instruções dessa página.
      </p>
    </div>
  )
}
