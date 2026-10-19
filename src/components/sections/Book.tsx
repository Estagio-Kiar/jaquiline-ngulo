import { BookOpen } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { book, goal } from "@/data/profile"

export function Book() {
  return (
    /* Alterei desativei a animacao nessa seccao*/
    <section id="obra" data-side="none" data-photo="5" className="bg-card text-card-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <Reveal>
          <span className="grid size-12 place-items-center rounded-xl bg-caramel text-ink">
            <BookOpen className="size-6" />
          </span>
          <p className="mt-6 font-heading text-[11px] font-semibold tracking-[0.25em] text-caramel uppercase">
            Obra
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            {book.title}
          </h2>
          <p className="mt-1 text-lavender italic">{book.subtitle}</p>
          <p className="mt-5 text-base/7 text-card-foreground/90">{book.text}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {book.facts.map((fact) => (
              <div key={fact.label} className="rounded-xl bg-white/5 p-4">
                <dt className="text-[10px] tracking-[0.18em] text-lavender uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120} className="self-center">
          <div className="rounded-3xl bg-lavender p-8 text-ink md:p-10">
            <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
              {goal.title}
            </p>
            <p className="mt-4 font-heading text-6xl font-extrabold">
              {goal.value}
            </p>
            <p className="text-sm font-semibold uppercase tracking-widest">
              {goal.valueLabel}
            </p>
            <p className="mt-6 border-t border-ink/20 pt-6 text-lg/8 font-medium">
              «{goal.text}»
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
