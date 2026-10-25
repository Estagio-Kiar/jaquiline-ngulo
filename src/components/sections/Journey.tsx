import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"

export function Journey() {
  const { journey } = useSiteContent()
  return (
    <section id="percurso" data-side="left" data-photo="2">
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <Reveal>
          <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
            Percurso
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Marcos de uma trajetória
          </h2>
        </Reveal>
        <ol className="relative mt-10 space-y-8 border-l-2 border-ink/25 pl-7">
          {journey.map((item, i) => (
            <Reveal
              as="li"
              key={`${item.title}-${i}`}
              delay={i * 60}
              className="relative"
            >
              <span
                aria-hidden
                className="absolute top-1.5 -left-[2.15rem] size-3.5 rounded-full border-2 border-background bg-lip"
              />
              <p className="font-heading text-[11px] font-semibold tracking-[0.2em] uppercase">
                {item.date}
              </p>
              <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
              {item.company && (
                <p className="text-sm font-semibold text-lip">{item.company}</p>
              )}
              <p className="mt-1 text-base/7">{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
