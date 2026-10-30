import { useEffect, useRef } from "react"

import { gallery } from "@/data/profile"

type Side = "left" | "right" | "none"

const GUTTER = 24
const DESKTOP = 1024

/**
 * Fotografias que acompanham o scroll: descem ao longo da página, alternam
 * entre a esquerda e a direita e mudam de foto consoante o `data-side` e o
 * `data-photo` da secção visível. Em `none` desaparecem suavemente.
 */
export function ScrollCompanion() {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const imgs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    const outerEl = outer.current
    const innerEl = inner.current
    if (!outerEl || !innerEl) return

    let frame = 0

    const showPhoto = (wanted: number) => {
      // Se a foto pedida não existir (ficheiro em falta), usa a de estúdio.
      const target = imgs.current[wanted]?.dataset.failed ? 0 : wanted
      imgs.current.forEach((img, i) => {
        if (img) img.style.opacity = i === target ? "1" : "0"
      })
    }

    const update = () => {
      frame = 0
      const vw = window.innerWidth
      const vh = window.innerHeight
      const desktop = vw >= DESKTOP
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("main section[data-side]")
      )
      if (sections.length === 0) return

      const mid = vh * 0.5
      const active = sections.find((s) => {
        const r = s.getBoundingClientRect()
        return r.top <= mid && r.bottom > mid
      })
      const side = (active?.dataset.side as Side | undefined) ?? "none"
      if (active?.dataset.photo) showPhoto(Number(active.dataset.photo))

      const first = sections[0].getBoundingClientRect().top + window.scrollY
      const last = sections[sections.length - 1]
      const end = last.getBoundingClientRect().bottom + window.scrollY
      const range = Math.max(end - first - vh, 1)
      const progress = Math.min(
        Math.max((window.scrollY - first) / range, 0),
        1
      )

      const h = outerEl.offsetHeight
      const w = innerEl.offsetWidth
      const top = desktop ? 88 : vh - h - 20
      const bottom = vh - h - 28
      const y = desktop ? top + progress * Math.max(bottom - top, 0) : top
      outerEl.style.transform = `translate3d(0, ${y}px, 0)`

      const cw = document.documentElement.clientWidth
      const x = side === "right" ? cw - w - GUTTER * 2 : 0
      const tilt = side === "right" ? 2.5 : side === "left" ? -2.5 : 0
      innerEl.style.transform = `translateX(${x}px) rotate(${tilt}deg)`
      innerEl.style.opacity = side === "none" ? "0" : "1"
    }

    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onChange, { passive: true })
    window.addEventListener("resize", onChange)
    return () => {
      window.removeEventListener("scroll", onChange)
      window.removeEventListener("resize", onChange)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={outer}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-30 will-change-transform"
    >
      <div
        ref={inner}
        style={{ opacity: 0, marginLeft: GUTTER }}
        className="companion relative transition-[transform,opacity] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      >
        {/* Efeito flutuante: oscila suavemente, independente do scroll */}
        <div className="companion-float relative">
          {/* Moldura em tons da paleta */}
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-caramel/80 lg:rounded-[2rem]" />
          <div className="absolute -inset-3 -z-10 rounded-full bg-lavender/50 blur-2xl lg:rounded-[2rem]" />

          <div className="relative aspect-square overflow-hidden rounded-full bg-graphite shadow-2xl ring-4 ring-lavender lg:aspect-[3/4] lg:rounded-[2rem]">
            {gallery.map((photo, i) => (
              <img
                key={photo.src}
                ref={(el) => {
                  imgs.current[i] = el
                }}
                src={photo.src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.currentTarget.dataset.failed = "1"
                  e.currentTarget.style.display = "none"
                }}
                style={{
                  objectPosition: photo.position,
                  opacity: i === 0 ? 1 : 0,
                }}
                className="absolute inset-0 size-full object-cover saturate-[0.9] transition-opacity duration-700 motion-reduce:transition-none"
              />
            ))}
            {/* Tom do fundo (#808688) sobre a foto para a integrar na paleta */}
            <div className="absolute inset-0 bg-background/15 mix-blend-multiply" />
            <div className="absolute inset-0 bg-linear-to-t from-ink/40 via-transparent to-lavender/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
