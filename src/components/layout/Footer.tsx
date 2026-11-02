import { useNavLinks } from "@/content/useNavLinks"
import { person } from "@/data/profile"

export function Footer() {
  const navLinks = useNavLinks()
  return (
    <footer className="bg-ink text-card-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-heading text-sm font-extrabold tracking-wider uppercase">
          {person.name}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.slice(1, 6).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-heading text-[11px] tracking-[0.18em] text-lavender uppercase hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <nav aria-label="Informação legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li>
                <a
                  href="/privacidade"
                  className="text-xs text-lavender hover:text-white"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a
                  href="/termos"
                  className="text-xs text-lavender hover:text-white"
                >
                  Termos de Utilização
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="text-xs text-lavender">
          © {new Date().getFullYear()} {person.name}
        </p>
      </div>
    </footer>
  )
}
