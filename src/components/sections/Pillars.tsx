import { Reveal } from "@/components/Reveal"
import { pillars } from "@/data/profile"

export function Pillars() {
  return (
    <section aria-label="Áreas de atuação" data-side="none" className="border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl gap-px px-5 py-16 md:grid-cols-3 md:py-20">
        {pillars.map((pillar, i) => (
          <Reveal
            key={pillar.number}
            delay={i * 100}
            className="py-6 md:px-8 md:first:pl-0 md:last:pr-0 md:not-first:border-l md:not-first:border-ink/15"
          >
            <p className="font-heading text-5xl font-extrabold text-lip">
              {pillar.number}
            </p>
            <h3 className="mt-4 text-xl font-bold">{pillar.title}</h3>
            <p className="mt-3 text-base/7">{pillar.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
