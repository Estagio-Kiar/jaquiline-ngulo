import { Lightbulb } from "lucide-react"

import type { Step } from "@/admin/tutorial/content"

/** Lista numerada de passos, em forma de linha do tempo. */
export function Steps({
  steps,
  compact,
}: {
  steps: Step[]
  compact?: boolean
}) {
  return (
    <ol className="relative flex flex-col gap-5">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4">
          {/* linha que liga os passos */}
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute top-9 bottom-[-1.25rem] left-[1.05rem] w-px bg-ink/10"
            />
          )}
          <span
            className={`relative grid shrink-0 place-items-center rounded-full bg-ink font-heading font-bold text-white ${compact ? "size-8 text-xs" : "size-9 text-sm"}`}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className={`font-semibold text-ink ${compact ? "text-sm" : ""}`}>
              {step.title}
            </p>
            <p
              className={`mt-1 text-ink/65 ${compact ? "text-[13px]/6" : "text-sm/6"}`}
            >
              {step.text}
            </p>
            {step.tip && (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-caramel/15 px-3 py-2 text-[13px]/5 text-[#6b4730]">
                <Lightbulb className="mt-0.5 size-4 shrink-0" />
                {step.tip}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
