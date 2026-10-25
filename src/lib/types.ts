/** Modelos devolvidos pela API (jaquiline-ngulo-server). */

export type Timestamps = {
  created_at: string
  updated_at: string
}

export type Profile = Timestamps & {
  id: string
  tagline: string | null
  title: string | null
  quote: string | null
  bio: string | null
  bio_description: string | null
  location: string | null
  experience_years: number | null
}

export type SocialLink = Timestamps & {
  id: string
  platform: string
  profile_url: string
  icon_name: string | null
}

export type Category = Timestamps & {
  id: string
  name: string
  slug: string
}

export type Post = Timestamps & {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  capa_url: string | null
  published_at: string | null
  category_id: string | null
  category?: Category | null
}

export type News = Timestamps & {
  id: string
  title: string
  source_name: string | null
  description: string | null
  published_at: string | null
  thumbnail_url: string | null
  external_link: string | null
  category: string | null
}

export type Episode = Timestamps & {
  id: string
  title: string
  description: string | null
  duration: number | null
  published_at: string | null
  thumbnail_url: string | null
  external_link: string | null
}

export type CareerHistory = Timestamps & {
  id: string
  role: string
  company: string | null
  period: string | null
  description: string | null
}

export type AdminUser = {
  id: string
  email: string
  name: string | null
  role: string
  google_id: string | null
}

export type AuthResponse = {
  token: string
  refresh_token: string
  user: AdminUser
}

export type UploadResponse = {
  filename: string
  original_name: string
  mimetype: string
  size: number
  path: string
  url: string
}

export type UploadFolder = "articles" | "news" | "episodes"
