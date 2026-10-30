import { Headphones, Play } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"
import { assetUrl } from "@/lib/api"
import { longDate, minutes } from "@/lib/format"

/** Episódios de podcast. Só aparece se houver episódios. */
export function Podcast() {
  const { episodes } = useSiteContent()
  if (episodes.length === 0) return null

  return (
    <section
      id="podcast"
      data-side="none"
      className="bg-card text-card-foreground"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-caramel uppercase">
              Podcast
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Conversas que inspiram
            </h2>
          </div>
          <span className="hidden size-14 place-items-center rounded-2xl bg-caramel text-ink sm:grid">
            <Headphones className="size-7" />
          </span>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.slice(0, 6).map((ep, i) => (
            <Reveal as="li" key={ep.id} delay={i * 70}>
              <a
                href={ep.external_link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="relative aspect-square overflow-hidden bg-graphite">
                  {ep.thumbnail_url ? (
                    <img
                      src={assetUrl(ep.thumbnail_url)}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-linear-to-br from-graphite to-lip/50">
                      <Headphones className="size-12 text-lavender" />
                    </div>
                  )}
                  <span className="absolute right-4 bottom-4 grid size-12 place-items-center rounded-full bg-lip text-white shadow-lg transition-transform group-hover:scale-110">
                    <Play className="size-5 fill-current" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="font-heading text-[10px] tracking-[0.18em] text-caramel uppercase">
                    {[longDate(ep.published_at), minutes(ep.duration)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="font-bold">{ep.title}</h3>
                  {ep.description && (
                    <p className="line-clamp-3 text-sm/6 text-card-foreground/75">
                      {ep.description}
                    </p>
                  )}
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
