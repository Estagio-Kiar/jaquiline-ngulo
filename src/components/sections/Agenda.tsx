import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"
import { assetUrl } from "@/lib/api"
import type { AgendaEvent } from "@/lib/types"

const MONTHS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
]

function when(iso: string) {
  const d = new Date(iso)
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
    year: d.getFullYear(),
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
  }
}

function statusTone(status: string) {
  const s = status.toLowerCase()
  if (s.includes("cancel")) return "bg-lip text-white"
  if (s.includes("adiad") || s.includes("por confirmar"))
    return "bg-caramel text-ink"
  if (s.includes("esgot") || s.includes("realiz"))
    return "bg-white/15 text-white"
  return "bg-lavender text-ink"
}

function EventCard({ event, past }: { event: AgendaEvent; past?: boolean }) {
  const d = when(event.data)
  const image = assetUrl(event.imagem)
  return (
    <a
      href={event.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-full overflow-hidden rounded-2xl bg-ink text-card-foreground shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${past ? "opacity-75 hover:opacity-100" : ""}`}
    >
      {/* Data em destaque */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 bg-lip px-3 py-6 text-white sm:w-28">
        <span className="font-heading text-4xl leading-none font-extrabold">
          {d.day}
        </span>
        <span className="font-heading text-xs font-bold tracking-[0.2em]">
          {d.month}
        </span>
        <span className="text-[11px] text-white/75">{d.year}</span>
        <span className="mt-2 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
          {d.time}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-[10px] font-semibold tracking-[0.18em] text-caramel uppercase">
            {event.tipo}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${statusTone(event.status)}`}
          >
            {event.status}
          </span>
        </div>
        <h3 className="text-lg/6 font-bold">{event.evento}</h3>
        <p className="flex items-center gap-1.5 text-sm text-lavender">
          <MapPin className="size-4 shrink-0" /> {event.local}
        </p>
        <p className="line-clamp-2 text-sm/6 text-card-foreground/75">
          {event.descricao}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm text-lavender transition-all group-hover:gap-2 group-hover:text-white">
          Saber mais <ArrowUpRight className="size-4" />
        </span>
      </div>

      {image && (
        <div className="hidden w-40 shrink-0 overflow-hidden md:block">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
    </a>
  )
}

/** Agenda de eventos. Só aparece quando a API tem eventos. */
export function Agenda() {
  const { agenda } = useSiteContent()
  if (agenda.length === 0) return null

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const upcoming = agenda
    .filter((e) => new Date(e.data) >= startOfToday)
    .slice(0, 6)
  const past = agenda
    .filter((e) => new Date(e.data) < startOfToday)
    .reverse()
    .slice(0, upcoming.length ? 2 : 4)

  return (
    <section id="agenda" data-side="none" className="border-t border-ink/15">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
              Agenda
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              {upcoming.length
                ? "Próximos encontros"
                : "Onde esteve recentemente"}
            </h2>
          </div>
          <span className="hidden size-14 place-items-center rounded-2xl bg-ink text-white sm:grid">
            <CalendarDays className="size-7" />
          </span>
        </Reveal>

        {upcoming.length > 0 && (
          <ul className="mt-10 grid gap-5 lg:grid-cols-2">
            {upcoming.map((event, i) => (
              <Reveal as="li" key={event.id} delay={i * 70}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </ul>
        )}

        {past.length > 0 && (
          <>
            {upcoming.length > 0 && (
              <h3 className="mt-14 font-heading text-xs font-semibold tracking-[0.2em] uppercase">
                Eventos anteriores
              </h3>
            )}
            <ul
              className={`grid gap-5 lg:grid-cols-2 ${upcoming.length ? "mt-5" : "mt-10"}`}
            >
              {past.map((event, i) => (
                <Reveal as="li" key={event.id} delay={i * 70}>
                  <EventCard event={event} past />
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
