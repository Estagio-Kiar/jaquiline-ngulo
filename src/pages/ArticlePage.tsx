import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { api, assetUrl } from "@/lib/api"
import { longDate } from "@/lib/format"
import { Link } from "@/lib/router"
import type { Post } from "@/lib/types"

export function ArticlePage({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    api.articles
      .get(id)
      .then((p) => {
        if (!alive) return
        setPost(p)
        document.title = `${p.title} | Jaqueline Ngulo`
      })
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [id])

  return (
    <main className="min-h-[80svh] pt-24 md:pt-28">
      <article className="mx-auto max-w-3xl px-5 pb-20">
        <Link
          to="/#artigos"
          className="inline-flex items-center gap-2 font-heading text-[11px] font-semibold tracking-[0.2em] uppercase hover:text-lip"
        >
          <ArrowLeft className="size-4" /> Voltar
        </Link>

        {error && (
          <p className="mt-10 rounded-xl bg-lip/10 p-6 text-lip">{error}</p>
        )}

        {!post && !error && (
          <div className="mt-10 space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-ink/10" />
            <div className="h-12 w-full animate-pulse rounded bg-ink/10" />
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-ink/10" />
          </div>
        )}

        {post && (
          <>
            <p className="mt-10 font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
              {post.category?.name ?? "Artigo"} ·{" "}
              {longDate(post.published_at ?? post.created_at)}
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-lg/8 font-medium">{post.excerpt}</p>
            )}
            {post.capa_url && (
              <img
                src={assetUrl(post.capa_url)}
                alt=""
                className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-lg"
              />
            )}
            <div className="mt-10 space-y-5 text-base/8">
              {post.content
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
            </div>
          </>
        )}
      </article>
    </main>
  )
}
