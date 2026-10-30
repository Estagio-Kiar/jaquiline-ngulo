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
          {about.skillLevels?.some((x) => x.percentage != null) ? (
            <ul className="mt-5 space-y-4">
              {about.skillLevels.map((skill) => (
                <li key={skill.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                    <span>{skill.name}</span>
                    {skill.percentage != null && (
                      <span className="font-heading text-xs">
                        {Math.round(skill.percentage)}%
                      </span>
                    )}
                  </div>
                  {skill.percentage != null && (
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-ink"
                        style={{
                          width: `${Math.min(100, Math.max(0, skill.percentage ?? 0))}%`,
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
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
          )}
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
