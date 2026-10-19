import { navLinks, person } from "@/data/profile"

export function Footer() {
  return (
    <footer className="bg-ink text-card-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-heading text-sm font-extrabold tracking-wider uppercase">
          {person.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {navLinks.slice(1, 6).map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-heading text-[11px] tracking-[0.18em] uppercase text-lavender hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-lavender">
          © {new Date().getFullYear()} {person.name}
        </p>
      </div>
    </footer>
  )
}
