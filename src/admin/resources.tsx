import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarDays,
  FileText,
  Gauge,
  Newspaper,
  Share2,
  Tags,
} from "lucide-react"

import type { DataKey, DataMap } from "@/admin/data"
import { dateTime, longDate, monthYear } from "@/lib/format"
import type { UploadFolder } from "@/lib/types"

export type FieldType =
  | "text"
  | "textarea"
  | "longtext"
  | "url"
  | "date"
  | "datetime"
  | "number"
  | "image"
  | "select"
  | "slug"

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  hint?: string
  /** Ocupa a linha inteira no formulário (por omissão: sim, exceto campos curtos). */
  half?: boolean
  /** Campo de origem para gerar o slug automaticamente. */
  from?: string
  folder?: UploadFolder
  /** Opções fixas ou derivadas de outra lista do painel. */
  options?: { value: string; label: string }[]
  optionsFrom?: DataKey
  /** Permite escrever um valor que não está nas opções. */
  allowCustom?: boolean
  /** Limites para campos numéricos. */
  min?: number
  max?: number
}

export type CardView = {
  title: string
  subtitle?: string
  meta?: string
  image?: string | null
  badge?: string
  link?: string | null
}

export type ResourceConfig<K extends DataKey = DataKey> = {
  key: K
  path: string
  title: string
  singular: string
  /** Género gramatical do singular, para os textos da interface. */
  gender: "m" | "f"
  description: string
  icon: LucideIcon
  layout: "grid" | "list"
  fields: FieldDef[]
  view: (item: DataMap[K]) => CardView
  /** Ajustes finais no payload antes de enviar à API. */
  finalize?: (payload: Record<string, unknown>) => Record<string, unknown>
  sort?: (a: DataMap[K], b: DataMap[K]) => number
  /** Onde aparece no site, para orientar quem edita. */
  siteSection: string
  /** Só administradores podem criar/editar (a API recusa outros perfis). */
  adminOnly?: boolean
}

const byDate = (
  a: { published_at: string | null; created_at: string },
  b: typeof a
) =>
  (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at)

export const SOCIAL_PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X / Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "spotify", label: "Spotify" },
  { value: "website", label: "Website" },
  { value: "email", label: "E-mail" },
]

const career: ResourceConfig<"career"> = {
  key: "career",
  path: "percurso",
  title: "Percurso",
  singular: "marco",
  gender: "m",
  description: "Marcos da trajetória apresentados na linha do tempo do site.",
  icon: Briefcase,
  layout: "list",
  siteSection: "Secção «Percurso»",
  // Mesma ordem do site: cronológica, pela data de criação.
  sort: (a, b) => a.created_at.localeCompare(b.created_at),
  fields: [
    {
      name: "role",
      label: "Título / cargo",
      type: "text",
      required: true,
      placeholder: "Diretora da Women in Tech Angola",
    },
    {
      name: "period",
      label: "Período",
      type: "text",
      half: true,
      placeholder: "Setembro 2025",
      hint: "Texto livre: «2020 – 2024», «Março 2025»…",
    },
    {
      name: "company",
      label: "Organização",
      type: "text",
      half: true,
      placeholder: "Women in Tech Angola",
    },
    {
      name: "description",
      label: "Descrição",
      type: "textarea",
      placeholder: "O que aconteceu neste marco?",
    },
  ],
  view: (i) => ({
    title: i.role,
    subtitle: i.description ?? undefined,
    meta: [i.period, i.company].filter(Boolean).join(" · "),
  }),
}

const news: ResourceConfig<"news"> = {
  key: "news",
  path: "imprensa",
  title: "Imprensa",
  singular: "notícia",
  gender: "f",
  description:
    "Artigos e reconhecimentos na imprensa, mostrados em «Na voz da imprensa».",
  icon: Newspaper,
  layout: "grid",
  siteSection: "Secção «Conquistas & reconhecimentos»",
  sort: byDate,
  fields: [
    {
      name: "thumbnail_url",
      label: "Imagem de capa",
      type: "image",
      folder: "news",
    },
    {
      name: "title",
      label: "Título",
      type: "text",
      required: true,
      placeholder: "Título do artigo na imprensa",
    },
    {
      name: "source_name",
      label: "Meio de comunicação",
      type: "text",
      half: true,
      placeholder: "Forbes África Lusófona",
    },
    {
      name: "published_at",
      label: "Data de publicação",
      type: "date",
      half: true,
    },
    {
      name: "external_link",
      label: "Link para o artigo",
      type: "url",
      placeholder: "https://…",
    },
    {
      name: "category",
      label: "Categoria",
      type: "text",
      half: true,
      placeholder: "Reconhecimento",
    },
    { name: "description", label: "Resumo", type: "textarea" },
  ],
  view: (i) => ({
    title: i.title,
    subtitle: i.description ?? undefined,
    meta: [i.source_name, monthYear(i.published_at)]
      .filter(Boolean)
      .join(" · "),
    image: i.thumbnail_url,
    badge: i.category ?? undefined,
    link: i.external_link,
  }),
}

const articles: ResourceConfig<"articles"> = {
  key: "articles",
  path: "artigos",
  title: "Artigos",
  singular: "artigo",
  gender: "m",
  description:
    "Textos próprios publicados no site, com página de leitura dedicada.",
  icon: FileText,
  layout: "grid",
  siteSection: "Secção «Artigos» e página /artigos/…",
  sort: byDate,
  fields: [
    {
      name: "capa_url",
      label: "Imagem de capa",
      type: "image",
      folder: "articles",
    },
    { name: "title", label: "Título", type: "text", required: true },
    {
      name: "slug",
      label: "Slug (URL)",
      type: "slug",
      required: true,
      from: "title",
      half: true,
      hint: "Gerado a partir do título.",
    },
    {
      name: "category_id",
      label: "Categoria",
      type: "select",
      optionsFrom: "categories",
      half: true,
    },
    {
      name: "published_at",
      label: "Data de publicação",
      type: "date",
      half: true,
      hint: "Datas futuras ficam agendadas.",
    },
    {
      name: "excerpt",
      label: "Resumo",
      type: "textarea",
      placeholder: "Uma ou duas frases que aparecem nos cartões.",
    },
    {
      name: "content",
      label: "Conteúdo",
      type: "longtext",
      required: true,
      hint: "Separe parágrafos com uma linha em branco.",
    },
  ],
  view: (i) => ({
    title: i.title,
    subtitle: i.excerpt ?? undefined,
    meta: longDate(i.published_at ?? i.created_at),
    image: i.capa_url,
    badge: i.category?.name,
    link: `/artigos/${i.id}`,
  }),
}

const categories: ResourceConfig<"categories"> = {
  key: "categories",
  path: "categorias",
  title: "Categorias",
  singular: "categoria",
  gender: "f",
  description: "Organize os artigos por tema.",
  icon: Tags,
  layout: "list",
  siteSection: "Etiqueta dos artigos",
  fields: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      required: true,
      half: true,
      placeholder: "Carreira",
    },
    {
      name: "slug",
      label: "Slug",
      type: "slug",
      required: true,
      from: "name",
      half: true,
    },
  ],
  view: (i) => ({ title: i.name, meta: `/${i.slug}` }),
}

const social: ResourceConfig<"social"> = {
  key: "social",
  path: "redes",
  title: "Redes & contacto",
  singular: "rede",
  gender: "f",
  description:
    "Botões de contacto no fim da página. Use «E-mail» para o botão «Contactar».",
  icon: Share2,
  layout: "list",
  siteSection: "Secção «Contacto»",
  fields: [
    {
      name: "platform",
      label: "Plataforma",
      type: "select",
      required: true,
      options: SOCIAL_PLATFORMS,
      allowCustom: true,
      half: true,
    },
    {
      name: "profile_url",
      label: "Link / endereço",
      type: "text",
      required: true,
      half: true,
      placeholder: "https://… ou nome@exemplo.com",
    },
  ],
  finalize: (p) => {
    const platform = String(p.platform ?? "").toLowerCase()
    let url = String(p.profile_url ?? "").trim()
    if (platform === "email" && url && !url.startsWith("mailto:"))
      url = `mailto:${url}`
    return { ...p, platform, profile_url: url, icon_name: platform }
  },
  view: (i) => ({
    title:
      SOCIAL_PLATFORMS.find((p) => p.value === i.platform)?.label ?? i.platform,
    meta: i.profile_url.replace(/^mailto:/, ""),
    link: i.profile_url,
  }),
}

const skills: ResourceConfig<"skills"> = {
  key: "skills",
  path: "competencias",
  title: "Competências",
  singular: "competência",
  gender: "f",
  description:
    "Competências mostradas na secção «Sobre». A percentagem é opcional e aparece como barra de progresso.",
  icon: Gauge,
  layout: "list",
  siteSection: "Secção «Sobre» → Competências",
  sort: (a, b) => a.created_at.localeCompare(b.created_at),
  fields: [
    {
      name: "name",
      label: "Competência",
      type: "text",
      required: true,
      half: true,
      placeholder: "Liderança e advocacy",
    },
    {
      name: "percentage",
      label: "Domínio (%)",
      type: "number",
      half: true,
      min: 0,
      max: 100,
      placeholder: "85",
      hint: "Opcional, de 0 a 100.",
    },
  ],
  view: (i) => ({
    title: i.name,
    meta:
      i.percentage != null ? `${Math.round(i.percentage)}%` : "Sem percentagem",
  }),
}

export const AGENDA_TYPES = [
  "Palestra",
  "Workshop",
  "Painel",
  "Mentoria",
  "Entrevista",
  "Lançamento",
  "Conferência",
].map((v) => ({ value: v, label: v }))

export const AGENDA_STATUS = [
  "Confirmado",
  "Por confirmar",
  "Esgotado",
  "Realizado",
  "Adiado",
  "Cancelado",
].map((v) => ({ value: v, label: v }))

const agenda: ResourceConfig<"agenda"> = {
  key: "agenda",
  path: "agenda",
  title: "Agenda",
  singular: "evento",
  gender: "m",
  description:
    "Palestras, workshops e outras participações. Os próximos eventos aparecem na secção «Agenda» do site.",
  icon: CalendarDays,
  layout: "grid",
  siteSection: "Secção «Agenda»",
  sort: (a, b) => b.data.localeCompare(a.data),
  fields: [
    {
      name: "imagem",
      label: "Imagem do evento",
      type: "image",
      folder: "agenda",
    },
    {
      name: "evento",
      label: "Nome do evento",
      type: "text",
      required: true,
      placeholder: "Women in Tech Summit 2026",
    },
    {
      name: "data",
      label: "Data e hora",
      type: "datetime",
      required: true,
      half: true,
    },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      half: true,
      options: AGENDA_TYPES,
      allowCustom: true,
    },
    {
      name: "local",
      label: "Local",
      type: "text",
      required: true,
      half: true,
      placeholder: "Luanda · Hotel Epic Sana ou Online",
    },
    {
      name: "status",
      label: "Estado",
      type: "select",
      required: true,
      half: true,
      options: AGENDA_STATUS,
      allowCustom: true,
    },
    {
      name: "link",
      label: "Link (inscrição ou mais informação)",
      type: "url",
      required: true,
      placeholder: "https://…",
    },
    {
      name: "descricao",
      label: "Descrição",
      type: "textarea",
      required: true,
      placeholder: "Sobre o que vai falar, para quem é o evento…",
    },
  ],
  view: (i) => ({
    title: i.evento,
    subtitle: i.descricao,
    meta: [dateTime(i.data), i.local].filter(Boolean).join(" · "),
    image: i.imagem,
    badge: i.status,
    link: i.link,
  }),
}

export const RESOURCES = [
  career,
  skills,
  agenda,
  news,
  articles,
  categories,
  social,
] as ResourceConfig[]

export const findResource = (path: string) =>
  RESOURCES.find((r) => r.path === path)
