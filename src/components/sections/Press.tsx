import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { press } from "@/data/profile"

type Article = (typeof press)[number] & { image?: string }

/** Capa do artigo; se a imagem faltar, mostra um cartão tipográfico na paleta. */
function Cover({ article }: { article: Article }) {
  const [failed, setFailed] = useState(false)
  const showImage = article.image && !failed

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
      {showImage ? (
        <img
          src={article.image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover grayscale-[35%] transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1 group-hover:grayscale-0"
        />
      ) : (
        <div className="grid size-full place-items-center bg-linear-to-br from-graphite via-ink to-lip/60 p-6 text-center transition-transform duration-700 group-hover:scale-110">
          <span className="font-heading text-2xl font-extrabold text-lavender">
            {article.outlet}
          </span>
        </div>
      )}

      {/* Véu na paleta: grafite por defeito, vermelho/lilás ao passar o rato */}
      <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
      <div className="absolute inset-0 bg-linear-to-t from-lip/70 via-lip/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <span className="absolute top-3 left-3 rounded-full bg-lavender px-3 py-1 font-heading text-[10px] font-bold tracking-[0.18em] text-ink uppercase transition-transform duration-300 group-hover:-translate-y-0.5">
        {article.outlet}
      </span>
      <span className="absolute right-3 bottom-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="size-5" />
      </span>
    </div>
  )
}

export function Press() {
  return (
    /*  Alterei  o id artigos para conquistas de desativei a animacao nessa seccao*/
    <section id="conquistas" data-side="none" data-photo="3" className="bg-lavender">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
            Conquistas & reconhecimentos
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Na voz da imprensa
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {press.map((item, i) => (
            <Reveal as="li" key={item.url} delay={i * 60}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-ink text-card-foreground shadow-md transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-ink/40 focus-visible:-translate-y-2 focus-visible:ring-4 focus-visible:ring-lip focus-visible:outline-none"
              >
                <Cover article={item} />
                <div className="flex flex-1 flex-col justify-between gap-5 p-6">
                  <div>
                    <p className="font-heading text-[11px] tracking-[0.2em] text-caramel uppercase">
                      {item.date}
                    </p>
                    <p className="mt-2 bg-linear-to-r from-lip to-lip bg-[length:0%_2px] bg-bottom-left bg-no-repeat pb-1 text-lg/7 font-semibold transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                      {item.title}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-lavender transition-all duration-300 group-hover:gap-2 group-hover:text-white">
                    Ler artigo{" "}
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
