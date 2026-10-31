import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import * as defaults from "@/data/profile"
import { api, assetUrl, imageVariant } from "@/lib/api"
import { monthYear } from "@/lib/format"
import type {
  AgendaEvent,
  CareerHistory,
  GalleryPhoto,
  News,
  Post,
  Profile,
  Skill,
  SocialLink,
} from "@/lib/types"

/**
 * Conteúdo do site. Começa com os dados estáticos de `data/profile.ts`
 * e é substituído pelo que vier da API. Se a API estiver indisponível
 * (ou uma lista vier vazia), mantém-se o conteúdo estático dessa secção.
 */

type PressItem = {
  outlet: string
  date: string
  title: string
  url: string
  image?: string
}

type ContactLink = { key: string; label: string; href: string }

export type SiteContent = {
  person: typeof defaults.person
  about: typeof defaults.about & {
    location?: string
    experienceYears?: number
    /** Competências vindas da API, com percentagem opcional. */
    skillLevels?: { name: string; percentage: number | null }[]
  }
  quotes: { text: string; source: string }[]
  journey: { date: string; title: string; text: string; company?: string }[]
  press: PressItem[]
  contact: { email: string; links: ContactLink[] }
  articles: Post[]
  /** Eventos da agenda, por ordem cronológica. */
  agenda: AgendaEvent[]
  /** Fotos que acompanham o scroll (índice = slot; 0 é a principal). */
  gallery: { src: string; position: string }[]
  status: "loading" | "api" | "offline"
}

const staticContact = (): SiteContent["contact"] => ({
  email: defaults.contact.email,
  links: [
    { key: "linkedin", label: "LinkedIn", href: defaults.contact.linkedin },
    { key: "instagram", label: "Instagram", href: defaults.contact.instagram },
    {
      key: "wit",
      label: "Women in Tech Angola",
      href: defaults.contact.womenInTechSite,
    },
  ].filter((l) => l.href),
})

const initial: SiteContent = {
  person: defaults.person,
  about: defaults.about,
  quotes: defaults.quotes,
  journey: defaults.journey,
  press: defaults.press,
  contact: staticContact(),
  articles: [],
  agenda: [],
  gallery: defaults.gallery,
  status: "loading",
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X / Twitter",
  x: "X / Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  github: "GitHub",
  website: "Website",
  site: "Website",
  spotify: "Spotify",
}

function label(platform: string) {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform
}

/** Substitui, slot a slot, as fotos estáticas pelas que vêm da API. */
function mergeGallery(items: GalleryPhoto[]): SiteContent["gallery"] {
  const result = defaults.gallery.map((g) => ({ ...g }))
  for (const item of items) {
    const src = imageVariant(item.image_url, 768)
    if (!src || item.slot < 0) continue
    result[item.slot] = {
      src,
      position: item.position || result[item.slot]?.position || "50% 25%",
    }
  }
  // Slots vazios no meio (sem foto estática nem da API) usam a principal.
  for (let i = 0; i < result.length; i++)
    if (!result[i]) result[i] = { ...result[0] }
  return result
}

function mergeProfile(c: SiteContent, p?: Profile): SiteContent {
  if (!p) return c
  const paragraphs = p.bio_description
    ?.split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    ...c,
    person: {
      ...c.person,
      badge: p.title || c.person.badge,
      tagline: p.tagline || c.person.tagline,
      heroText: p.bio || c.person.heroText,
      // Foto do Hero vinda da API (Cloudinary) tem prioridade sobre a estática.
      ...(p.photo_url
        ? {
            photo: imageVariant(p.photo_url, 768) ?? c.person.photo,
            photoSmall: imageVariant(p.photo_url, 384) ?? c.person.photoSmall,
          }
        : {}),
    },
    about: {
      ...c.about,
      paragraphs: paragraphs?.length ? paragraphs : c.about.paragraphs,
      location: p.location ?? undefined,
      experienceYears: p.experience_years ?? undefined,
    },
    quotes: p.quote
      ? [{ text: p.quote, source: "Em destaque" }, ...c.quotes.slice(0, 1)]
      : c.quotes,
  }
}

// Linha do tempo cronológica: o marco criado primeiro aparece primeiro.
const mapCareer = (items: CareerHistory[]) =>
  [...items]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((i) => ({
      date: i.period ?? "",
      title: i.role,
      text: i.description ?? "",
      company: i.company ?? undefined,
    }))

const mapNews = (items: News[]): PressItem[] =>
  [...items]
    .sort((a, b) =>
      (b.published_at ?? b.created_at).localeCompare(
        a.published_at ?? a.created_at
      )
    )
    .map((n) => ({
      outlet: n.source_name || n.category || "Imprensa",
      date: monthYear(n.published_at),
      title: n.title,
      url: n.external_link || "#",
      image: assetUrl(n.thumbnail_url),
    }))

function mapSocial(items: SocialLink[]): SiteContent["contact"] {
  const email = items.find(
    (s) =>
      s.platform.toLowerCase() === "email" ||
      s.profile_url.startsWith("mailto:")
  )
  return {
    email: email ? email.profile_url.replace(/^mailto:/, "") : "",
    links: items
      .filter((s) => s !== email)
      .map((s) => ({
        key: s.id,
        label: label(s.platform),
        href: s.profile_url,
      })),
  }
}

const published = <
  T extends { published_at: string | null; created_at: string },
>(
  items: T[]
) =>
  items
    .filter((i) => !i.published_at || new Date(i.published_at) <= new Date())
    .sort((a, b) =>
      (b.published_at ?? b.created_at).localeCompare(
        a.published_at ?? a.created_at
      )
    )

const Ctx = createContext<SiteContent>(initial)

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(initial)
  const contentRef = useRef(content)
  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    let ctrl = new AbortController()
    let lastLoad = 0

    const load = () => {
      lastLoad = Date.now()
      ctrl.abort()
      ctrl = new AbortController()
      const s = ctrl.signal
      Promise.allSettled([
        api.profile.list(s),
        api.career.list(s),
        api.news.list(s),
        api.social.list(s),
        api.articles.list(s),
        api.skills.list(s),
        api.agenda.list(s),
        api.gallery.list(s),
      ]).then(
        ([
          profile,
          career,
          news,
          social,
          articles,
          skills,
          agenda,
          gallery,
        ]) => {
          if (s.aborted) return
          const ok = <T,>(r: PromiseSettledResult<T[]>) =>
            r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []
          const anyOk = [
            profile,
            career,
            news,
            social,
            articles,
            skills,
            agenda,
            gallery,
          ].some((r) => r.status === "fulfilled")
          // Numa recarga em segundo plano sem resposta da API, mantém o que
          // já está no ecrã em vez de voltar ao conteúdo estático.
          if (!anyOk && lastLoad && contentRef.current.status === "api") return
          let next: SiteContent = {
            ...initial,
            status: anyOk ? "api" : "offline",
          }
          next = mergeProfile(next, ok(profile)[0])
          const c = ok(career)
          if (c.length) next.journey = mapCareer(c)
          const n = ok(news)
          if (n.length) next.press = mapNews(n)
          const so = ok(social)
          if (so.length) next.contact = mapSocial(so)
          next.articles = published(ok(articles))
          next.gallery = mergeGallery(ok<GalleryPhoto>(gallery))
          next.agenda = ok<AgendaEvent>(agenda)
            .filter((e) => e.data && e.evento)
            .sort((a, b) => a.data.localeCompare(b.data))
          // Ignora registos que não sejam competências (versões antigas da API
          // devolviam categorias nesta rota).
          const sk = ok<Skill>(skills).filter((x) => !("slug" in x) && x.name)
          if (sk.length) {
            next.about = {
              ...next.about,
              skills: sk.map((x) => x.name),
              skillLevels: sk
                .slice()
                .sort((a, b) => a.created_at.localeCompare(b.created_at))
                .map((x) => ({ name: x.name, percentage: x.percentage })),
            }
          }
          setContent(next)
        }
      )
    }

    load()

    // Volta a pedir os dados quando o separador fica visível de novo
    // (ex.: depois de editar no /admin noutro separador), no máximo a cada
    // 15 s — assim as imagens novas do Cloudinary aparecem sem recarregar.
    const refresh = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastLoad > 15_000
      )
        load()
    }
    document.addEventListener("visibilitychange", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      ctrl.abort()
      document.removeEventListener("visibilitychange", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [])

  return <Ctx.Provider value={content}>{children}</Ctx.Provider>
}

export const useSiteContent = () => useContext(Ctx)
