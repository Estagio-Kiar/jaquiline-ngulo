import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"

export function Quotes() {
  const { quotes } = useSiteContent()
  return (
    <section aria-label="Citações" data-side="left" data-photo="4">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:py-24">
        {quotes.map((quote, i) => (
          <Reveal as="figure" key={quote.text} delay={i * 100}>
            <p
              aria-hidden
              className="font-heading text-7xl leading-none font-extrabold text-lip"
            >
              “
            </p>
            <blockquote className="-mt-2 text-2xl/9 font-semibold">
              {quote.text}
            </blockquote>
            <figcaption className="mt-4 font-heading text-[11px] tracking-[0.2em] uppercase">
              — Jaqueline Ngulo · {quote.source}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
