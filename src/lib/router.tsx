import {
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
} from "react"

/** Router mínimo baseado em `history` — sem dependências extra. */

const subscribe = (fn: () => void) => {
  window.addEventListener("popstate", fn)
  return () => window.removeEventListener("popstate", fn)
}

export function navigate(to: string, { replace = false } = {}) {
  if (to === window.location.pathname + window.location.hash) return
  if (replace) window.history.replaceState(null, "", to)
  else window.history.pushState(null, "", to)
  window.dispatchEvent(new PopStateEvent("popstate"))
  const hash = to.split("#")[1]
  if (!hash) window.scrollTo({ top: 0 })
  else setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 60)
}

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname.replace(/\/+$/, "") || "/"
  )
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...props }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    )
      return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handle} {...props} />
}
