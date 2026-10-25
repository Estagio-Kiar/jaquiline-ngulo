import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

import { useNavLinks } from "@/content/useNavLinks"
import { person } from "@/data/profile"

export function Header() {
  const navLinks = useNavLinks()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled || open
          ? "border-b border-ink/10 bg-background/90 backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20">
        <a
          href={navLinks[0].href}
          className="font-heading text-sm leading-tight font-extrabold tracking-wider uppercase"
        >
          <span className="block">{person.firstName}</span>
          <span className="block text-lip">{person.lastName}</span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-heading text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:text-lip"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-lg hover:bg-ink/10 lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Principal móvel"
          className="border-t border-ink/10 bg-background lg:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-ink/10 py-3.5 font-heading text-xs font-semibold tracking-[0.18em] uppercase last:border-0"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
