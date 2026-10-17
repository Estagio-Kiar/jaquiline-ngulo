import { ArrowRight } from "lucide-react"

import { person } from "@/data/profile"

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-24 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-lavender/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 md:grid-cols-2 md:pb-24">
        <div className="order-2 md:order-1">
          <span className="inline-block rounded-sm border border-ink/40 px-3 py-1 font-heading text-[10px] font-semibold tracking-[0.2em] uppercase">
            {person.badge}
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
            {person.firstName}
            <br />
            Mabiala <span className="text-lip">Ngulo</span>
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium">{person.tagline}</p>
          <p className="mt-3 max-w-md text-base/7">{person.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#impacto"
              className="inline-flex items-center gap-2 rounded-md bg-lip px-6 py-3 font-heading text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-lip/85"
            >
              Ver impacto <ArrowRight className="size-4" />
            </a>
            <a
              href="#obra"
              className="inline-flex items-center rounded-md border border-ink px-6 py-3 font-heading text-xs font-bold tracking-widest uppercase transition-colors hover:bg-ink hover:text-white"
            >
              A obra
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto max-w-[20rem] md:max-w-sm">
            <div
              aria-hidden
              className="absolute -bottom-3 -left-3 size-full rounded-3xl bg-caramel/70"
            />
            <img
              src={person.photoSmall}
              srcSet={`${person.photoSmall} 384w, ${person.photo} 768w`}
              sizes="(min-width: 768px) 384px, 80vw"
              alt={`Retrato de ${person.name}`}
              width={768}
              height={1024}
              decoding="async"
              fetchPriority="high"
              className="relative aspect-[3/4] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
