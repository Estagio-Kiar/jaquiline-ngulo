import { useSiteContent } from "@/content/SiteContent"
import { navLinks } from "@/data/profile"
import { usePathname } from "@/lib/router"

/** Links de navegação, incluindo Artigos/Agenda quando existem na API. */
export function useNavLinks() {
  const { articles, agenda } = useSiteContent()
  const path = usePathname()
  const links = [...navLinks]
  const contactIdx = links.findIndex((l) => l.href === "#contacto")
  const extra = [
    articles.length ? { label: "Artigos", href: "#artigos" } : null,
    agenda.length ? { label: "Agenda", href: "#agenda" } : null,
  ].filter((l): l is { label: string; href: string } => l !== null)
  links.splice(contactIdx < 0 ? links.length : contactIdx, 0, ...extra)
  // Fora da página inicial, as âncoras apontam para "/#secção".
  return path === "/" ? links : links.map((l) => ({ ...l, href: `/${l.href}` }))
}
