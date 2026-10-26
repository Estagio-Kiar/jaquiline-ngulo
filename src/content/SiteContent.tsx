import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import * as defaults from "@/data/profile"
import { api, assetUrl } from "@/lib/api"
import { monthYear } from "@/lib/format"
import type {
  CareerHistory,
  Episode,
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
  episodes: Episode[]
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
  episodes: [],
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

  useEffect(() => {
    const ctrl = new AbortController()
    const s = ctrl.signal
    Promise.allSettled([
      api.profile.list(s),
      api.career.list(s),
      api.news.list(s),
      api.social.list(s),
      api.articles.list(s),
      api.episodes.list(s),
      api.skills.list(s),
    ]).then(([profile, career, news, social, articles, episodes, skills]) => {
      if (s.aborted) return
      const ok = <T,>(r: PromiseSettledResult<T[]>) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []
      const anyOk = [
        profile,
        career,
        news,
        social,
        articles,
        episodes,
        skills,
      ].some((r) => r.status === "fulfilled")
      let next: SiteContent = { ...initial, status: anyOk ? "api" : "offline" }
      next = mergeProfile(next, ok(profile)[0])
      const c = ok(career)
      if (c.length) next.journey = mapCareer(c)
      const n = ok(news)
      if (n.length) next.press = mapNews(n)
      const so = ok(social)
      if (so.length) next.contact = mapSocial(so)
      next.articles = published(ok(articles))
      next.episodes = published(ok(episodes))
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
    })
    return () => ctrl.abort()
  }, [])

  return <Ctx.Provider value={content}>{children}</Ctx.Provider>
}

export const useSiteContent = () => useContext(Ctx)
