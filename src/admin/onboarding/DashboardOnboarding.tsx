import { useCallback, useEffect, useRef, useState } from "react"
import { driver, type DriveStep, type Driver } from "driver.js"
import "driver.js/dist/driver.css"

import { Btn, useToast } from "@/admin/ui"
import { api } from "@/lib/api"
import type { OnboardingProgress, OnboardingTour } from "@/lib/types"

type DashboardOnboardingProps = {
  userId: string
  ready: boolean
}

/** Chave do tour do Painel na API (seed `onboarding-frontend.*.sql`). */
const TOUR_KEY = "dashboard"
const STORAGE_KEY = "jn-dashboard-tour"
const TOUR_VERSION = "v1"

type Side = NonNullable<DriveStep["popover"]>["side"]

type TourStep = {
  key: string
  target: string
  title: string
  description: string
  side?: Side
}

/**
 * Passos usados quando a API não tem o tour (seed por correr) ou não
 * responde. São os mesmos do seed da API.
 */
const FALLBACK_STEPS: TourStep[] = [
  {
    key: "dashboard-welcome",
    target: "dashboard-welcome",
    title: "Bem-vindo ao painel",
    description: "Este é o ponto de partida para gerir o conteúdo do seu site.",
    side: "bottom",
  },
  {
    key: "dashboard-import",
    target: "dashboard-import",
    title: "Importe o conteúdo existente",
    description:
      "Se as secções estiverem vazias, pode copiar para aqui o conteúdo que já aparece no site.",
    side: "bottom",
  },
  {
    key: "dashboard-resources",
    target: "dashboard-resources",
    title: "Aceda às secções",
    description:
      "Os cartões mostram a quantidade de registos e abrem cada área para edição.",
    side: "bottom",
  },
  {
    key: "dashboard-activity",
    target: "dashboard-activity",
    title: "Acompanhe a atividade",
    description:
      "Aqui encontra os conteúdos alterados recentemente e pode abri-los diretamente.",
    side: "top",
  },
  {
    key: "dashboard-actions",
    target: "dashboard-actions",
    title: "Comece pelas ações rápidas",
    description:
      "Use estes atalhos para editar o perfil, adicionar notícias, artigos, eventos ou marcos do percurso.",
    side: "left",
  },
  {
    key: "dashboard-site",
    target: "dashboard-site",
    title: "Veja o resultado no site",
    description:
      "Abra o site numa nova aba para conferir as alterações publicadas.",
    side: "bottom",
  },
]

const SIDES = new Set(["top", "right", "bottom", "left"])

function fromApi(tour: OnboardingTour): TourStep[] {
  return [...tour.steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      key: s.key,
      target: s.target,
      title: s.title,
      description: s.description,
      side: s.side && SIDES.has(s.side) ? (s.side as Side) : undefined,
    }))
}

/** O tour mais recente com a chave `dashboard`. */
function pickTour(tours: OnboardingTour[]) {
  return tours
    .filter((t) => t.key === TOUR_KEY && t.isActive && t.steps.length > 0)
    .sort((a, b) => b.version.localeCompare(a.version))[0]
}

/**
 * Tour guiado do Painel (driver.js).
 *
 * Usa a API de onboarding: lê o tour (`GET /onboarding/tours`), o progresso
 * do utilizador (`GET /onboarding/status`), regista o início
 * (`POST /onboarding/start`), cada passo (`PATCH /onboarding/progress`), a
 * conclusão (`POST /onboarding/complete`) e o fecho antecipado
 * (`POST /onboarding/dismiss`). Abre sozinho só se o utilizador nunca o
 * concluiu nem fechou, e retoma no passo em que ficou.
 *
 * Se a API não tiver o tour, usa os passos locais e guarda o estado no
 * navegador, como antes.
 */
export function DashboardOnboarding({
  userId,
  ready,
}: DashboardOnboardingProps) {
  const toast = useToast()
  const driverRef = useRef<Driver | null>(null)
  const [tour, setTour] = useState<OnboardingTour | null>(null)
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loaded, setLoaded] = useState(false)
  const storageKey = `${STORAGE_KEY}:${userId}:${TOUR_VERSION}`

  // Carrega o tour e o progresso do utilizador.
  useEffect(() => {
    if (!ready) return
    let alive = true
    Promise.all([api.onboarding.tours(), api.onboarding.status()])
      .then(([tours, status]) => {
        if (!alive) return
        const t = pickTour(tours) ?? null
        setTour(t)
        setProgress(
          t ? (status.progress.find((p) => p.tourId === t.id) ?? null) : null
        )
      })
      .catch(() => {
        // API sem onboarding: fica o modo local.
        if (alive) setTour(null)
      })
      .finally(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [ready, userId])

  const startTour = useCallback(
    async ({ resume = false }: { resume?: boolean } = {}) => {
      driverRef.current?.destroy()

      const steps = tour ? fromApi(tour) : FALLBACK_STEPS
      let startIndex = 0

      if (tour) {
        // Retoma no passo guardado; senão (re)começa na API.
        const current =
          resume && progress?.status === "IN_PROGRESS"
            ? progress.currentStepKey
            : null
        const idx = current ? steps.findIndex((s) => s.key === current) : -1
        if (idx >= 0) startIndex = idx
        else {
          try {
            setProgress(await api.onboarding.start(tour.id))
          } catch (e) {
            toast.error((e as Error).message)
          }
        }
      }

      driverRef.current = driver({
        showProgress: true,
        allowClose: true,
        smoothScroll: true,
        skipMissingElement: true,
        nextBtnText: "Seguinte",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",
        closeBtnLabel: "Fechar",
        steps: steps.map((s) => ({
          element: `[data-tour="${s.target}"]`,
          popover: {
            title: s.title,
            description: s.description,
            side: s.side,
          },
        })),
        onHighlighted: (_el, _step, { state }) => {
          const step = steps[state.activeIndex ?? 0]
          if (tour && step)
            api.onboarding.progress(tour.id, step.key).catch(() => {})
        },
        onDestroyed: (_el, _step, { reason }) => {
          if (reason === "replaced" || reason === "api") return
          const done = reason === "done"
          if (tour) {
            const call = done
              ? api.onboarding.complete(tour.id)
              : api.onboarding.dismiss(tour.id)
            call.then(setProgress).catch(() => {})
            return
          }
          try {
            localStorage.setItem(storageKey, "done")
          } catch {
            toast.error("Não foi possível guardar o estado do tutorial.")
          }
        },
      })
      driverRef.current.drive(startIndex)
    },
    [tour, progress, storageKey, toast]
  )

  // Abre sozinho na primeira visita (ou retoma um tour a meio).
  useEffect(() => {
    if (!ready || !loaded) return

    if (tour) {
      if (progress && progress.status !== "IN_PROGRESS") return
    } else {
      let seen: string | null
      try {
        seen = localStorage.getItem(storageKey)
      } catch {
        return
      }
      if (seen === "done") return
    }

    const timer = window.setTimeout(() => startTour({ resume: true }), 500)
    return () => window.clearTimeout(timer)
    // Só na primeira carga: abrir o tour não deve voltar a dispará-lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, loaded])

  useEffect(
    () => () => {
      driverRef.current?.destroy()
      driverRef.current = null
    },
    []
  )

  return (
    <Btn
      variant="outline"
      onClick={() => startTour()}
      disabled={!ready || !loaded}
    >
      Conhecer o painel
    </Btn>
  )
}
