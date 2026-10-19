import { Reveal } from "@/components/Reveal"
import { about } from "@/data/profile"

export function About() {
  return (
    <section id="sobre" data-side="right" data-photo="1" className="bg-lavender">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-5 md:py-24">
        <Reveal className="md:col-span-3">
          <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
            Sobre
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            {about.title}
          </h2>
          <div className="mt-6 space-y-4 text-base/7">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} className="md:col-span-2">
          <h3 className="font-heading text-xs font-semibold tracking-[0.2em] uppercase">
            Competências
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-ink px-4 py-2 text-sm text-card-foreground"
              >
                {skill}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
