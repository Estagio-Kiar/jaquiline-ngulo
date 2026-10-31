import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"

export function About() {
  const { about } = useSiteContent()
  return (
    <section
      id="sobre"
      data-side="right"
      data-photo="1"
      className="bg-lavender"
    >
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
          {/* Botões (pills); a percentagem, quando existe, aparece dentro do botão */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {(
              about.skillLevels ??
              about.skills.map((name) => ({ name, percentage: null }))
            ).map((skill) => (
              <li
                key={skill.name}
                className="inline-flex items-center gap-2 rounded-full bg-ink py-2 pr-2 pl-4 text-sm text-card-foreground"
              >
                <span className={skill.percentage == null ? "pr-2" : ""}>
                  {skill.name}
                </span>
                {skill.percentage != null && (
                  <span className="rounded-full bg-lavender px-2 py-0.5 font-heading text-[11px] font-bold text-ink">
                    {Math.round(skill.percentage)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
          {(about.location || about.experienceYears) && (
            <dl className="mt-8 grid grid-cols-2 gap-3">
              {about.location && (
                <div className="rounded-xl bg-ink/5 p-4">
                  <dt className="font-heading text-[10px] tracking-[0.18em] uppercase">
                    Baseada em
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {about.location}
                  </dd>
                </div>
              )}
              {about.experienceYears ? (
                <div className="rounded-xl bg-ink/5 p-4">
                  <dt className="font-heading text-[10px] tracking-[0.18em] uppercase">
                    Experiência
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {about.experienceYears}+ anos
                  </dd>
                </div>
              ) : null}
            </dl>
          )}
        </Reveal>
      </div>
    </section>
  )
}
