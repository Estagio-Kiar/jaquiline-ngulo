import { useEffect, useRef, useState } from "react"

import { stats, statsNote } from "@/data/profile"

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Contador animado. Recomeça do zero sempre que a secção volta a entrar
 * no ecrã (a contagem é reposta quando sai de vista).
 */
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(() => (reducedMotion() ? to : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frame)
        if (!entry.isIntersecting) {
          // Fora de vista: volta a zero para recomeçar na próxima vez.
          setValue(0)
          return
        }
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 1200, 1)
          setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [to])

  return <span ref={ref}>{value}</span>
}

export function Stats() {
  return (
    <section
      id="impacto"
      data-side="none"
      className="bg-card text-card-foreground"
      aria-labelledby="impacto-title"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2
          id="impacto-title"
          className="mb-10 text-center font-heading text-xs font-semibold tracking-[0.25em] text-caramel uppercase"
        >
          Impacto da Women in Tech Angola
        </h2>
        <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="order-1 font-heading text-4xl font-extrabold sm:text-5xl">
                <Counter to={stat.value} />
                {stat.suffix}+
              </dd>
              <dt className="mt-2 text-[11px] font-semibold tracking-[0.18em] text-lavender uppercase">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-center text-xs text-lavender/80">
          {statsNote}
        </p>
      </div>
    </section>
  )
}
