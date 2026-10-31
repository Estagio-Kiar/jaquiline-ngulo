import { useState } from "react"
import { BookOpen, CircleHelp } from "lucide-react"

import { topicForPath, TOPICS } from "@/admin/tutorial/content"
import { Steps } from "@/admin/tutorial/Steps"
import { Drawer } from "@/admin/ui"
import { Link, usePathname } from "@/lib/router"
import { cn } from "@/lib/utils"

const SEEN_KEY = "jn-help-seen"

function wasSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1"
  } catch {
    return true
  }
}

/**
 * Botão de ajuda fixo (canto inferior esquerdo da área de conteúdo).
 * Abre as instruções da página atual num painel lateral.
 */
export function HelpButton() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(wasSeen)
  const topic = topicForPath(path)
  if (!topic) return null

  const related = TOPICS.filter(
    (t) =>
      t.id !== topic.id &&
      t.route &&
      t.route === topic.route &&
      t.route !== "/admin"
  )

  const show = () => {
    setOpen(true)
    if (!seen) {
      setSeen(true)
      try {
        localStorage.setItem(SEEN_KEY, "1")
      } catch {
        /* ignora */
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={`Ajuda: ${topic.title}`}
        className="group fixed bottom-5 left-5 z-30 flex items-center gap-2 rounded-full bg-ink py-2.5 pr-4 pl-2.5 text-sm font-semibold text-white shadow-xl shadow-ink/25 transition-all hover:-translate-y-0.5 hover:bg-graphite lg:left-[19.5rem]"
      >
        <span className="relative grid size-7 place-items-center rounded-full bg-lip">
          {!seen && (
            <span className="absolute inset-0 animate-ping rounded-full bg-lip/70" />
          )}
          <CircleHelp className="relative size-4" />
        </span>
        Ajuda
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={topic.title}
        subtitle={topic.summary}
        footer={
          <Link
            to={`/admin/tutorial#${topic.id}`}
            onClick={() => setOpen(false)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white hover:bg-graphite"
          >
            <BookOpen className="size-4" /> Abrir o tutorial completo
          </Link>
        }
      >
        <Steps steps={topic.steps} compact />

        {related.length > 0 && (
          <div className="mt-8 border-t border-ink/8 pt-5">
            <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
              Também nesta página
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {related.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/admin/tutorial#${t.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-3 text-sm transition-colors hover:border-lip/30"
                    )}
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-lavender/40 text-ink">
                      <t.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">
                        {t.title}
                      </span>
                      <span className="block truncate text-xs text-ink/55">
                        {t.summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>
    </>
  )
}
