import { ArrowRight } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"
import { assetUrl } from "@/lib/api"
import { longDate } from "@/lib/format"
import { Link } from "@/lib/router"

/** Artigos (posts) publicados no painel. Só aparece se houver artigos. */
export function Articles() {
  const { articles } = useSiteContent()
  if (articles.length === 0) return null
  const [featured, ...rest] = articles.slice(0, 4)

  return (
    <section id="artigos" data-side="none">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
            Artigos
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Ideias & reflexões
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <Reveal className={rest.length ? "lg:col-span-3" : "lg:col-span-5"}>
            <Link
              to={`/artigos/${featured.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ink text-card-foreground shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div
                className={`overflow-hidden bg-graphite ${rest.length ? "aspect-[16/9]" : "aspect-[16/9] lg:aspect-[21/8]"}`}
              >
                {featured.capa_url ? (
                  <img
                    src={assetUrl(featured.capa_url)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="size-full bg-linear-to-br from-graphite via-ink to-lip/60" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
                <p className="font-heading text-[11px] tracking-[0.2em] text-caramel uppercase">
                  {featured.category?.name ?? "Artigo"} ·{" "}
                  {longDate(featured.published_at ?? featured.created_at)}
                </p>
                <h3 className="text-2xl font-extrabold">{featured.title}</h3>
                {featured.excerpt && (
                  <p className="line-clamp-3 text-base/7 text-card-foreground/80">
                    {featured.excerpt}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-lavender group-hover:gap-2 group-hover:text-white">
                  Ler artigo <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </Reveal>

          {rest.length > 0 && (
            <ul className="flex flex-col gap-4 lg:col-span-2">
              {rest.map((post, i) => (
                <Reveal as="li" key={post.id} delay={i * 80}>
                  <Link
                    to={`/artigos/${post.id}`}
                    className="group flex gap-4 rounded-2xl border border-ink/15 p-4 transition-colors hover:border-lip hover:bg-white/60"
                  >
                    {post.capa_url && (
                      <img
                        src={assetUrl(post.capa_url)}
                        alt=""
                        loading="lazy"
                        className="size-20 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-heading text-[10px] tracking-[0.18em] text-lip uppercase">
                        {post.category?.name ?? "Artigo"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-bold group-hover:text-lip">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-xs">
                        {longDate(post.published_at ?? post.created_at)}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
