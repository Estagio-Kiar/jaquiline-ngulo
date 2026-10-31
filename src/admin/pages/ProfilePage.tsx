import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Info, MapPin, Save, Sparkles, Undo2 } from "lucide-react"

import { useSlot } from "@/admin/data"
import { GalleryManager, previewSrc } from "@/admin/GalleryManager"
import {
  Btn,
  Card,
  Field,
  ImageField,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
  useToast,
} from "@/admin/ui"
import { about, person, quotes } from "@/data/profile"
import { api } from "@/lib/api"
import { relative } from "@/lib/format"
import type { Profile } from "@/lib/types"

type Values = {
  title: string
  tagline: string
  bio: string
  bio_description: string
  quote: string
  location: string
  experience_years: string
  photo_url: string
}

const fromProfile = (p?: Profile): Values =>
  p
    ? {
        title: p.title ?? "",
        tagline: p.tagline ?? "",
        bio: p.bio ?? "",
        bio_description: p.bio_description ?? "",
        quote: p.quote ?? "",
        location: p.location ?? "",
        experience_years: p.experience_years?.toString() ?? "",
        photo_url: p.photo_url ?? "",
      }
    : {
        // Sem perfil na API: parte do conteúdo atual do site.
        title: person.badge,
        tagline: person.tagline,
        bio: person.heroText,
        bio_description: about.paragraphs.join("\n\n"),
        quote: quotes[0]?.text ?? "",
        location: "Luanda, Angola",
        experience_years: "",
        photo_url: "",
      }

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="p-6">
      <h2 className="font-heading text-sm font-bold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-ink/50">{description}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

export function ProfilePage() {
  const { items, loading, reload, loaded } = useSlot("profile")
  const profile = items[0]
  const toast = useToast()
  const initial = useMemo(() => fromProfile(profile), [profile])
  const [v, setV] = useState<Values>(initial)
  const [saving, setSaving] = useState(false)

  // Quando o perfil muda na API, o formulário volta ao valor guardado.
  const [base, setBase] = useState(initial)
  if (base !== initial) {
    setBase(initial)
    setV(initial)
  }

  const dirty = JSON.stringify(v) !== JSON.stringify(initial) || !profile
  const set = (k: keyof Values) => (e: { target: { value: string } }) =>
    setV((s) => ({ ...s, [k]: e.target.value }))

  const save = async () => {
    const years = v.experience_years.trim()
    if (years && (Number.isNaN(Number(years)) || Number(years) < 0)) {
      toast.error("Os anos de experiência devem ser um número.")
      return
    }
    const payload = {
      title: v.title.trim(),
      tagline: v.tagline.trim(),
      bio: v.bio.trim(),
      bio_description: v.bio_description.trim(),
      quote: v.quote.trim(),
      location: v.location.trim(),
      photo_url: v.photo_url.trim(),
      ...(years ? { experience_years: Math.round(Number(years)) } : {}),
    }
    setSaving(true)
    try {
      if (profile) await api.profile.update(profile.id, payload)
      else await api.profile.create(payload)
      toast.success("Perfil guardado. O site já mostra as alterações.")
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!saving) save()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (loading && !loaded) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-72" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-[32rem] rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    )
  }

  const paragraphs = v.bio_description.split(/\n\s*\n/).filter((p) => p.trim())

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Identidade"
        title="Perfil"
        description="Textos principais do site: a apresentação inicial, a biografia e a citação em destaque."
        actions={
          <>
            {profile && dirty && (
              <Btn variant="ghost" onClick={() => setV(initial)}>
                <Undo2 /> Descartar
              </Btn>
            )}
            <Btn onClick={save} loading={saving} disabled={!dirty}>
              <Save /> {profile ? "Guardar alterações" : "Criar perfil"}
            </Btn>
          </>
        }
      />

      {!profile && (
        <Card className="flex items-start gap-3 border-caramel/40 bg-caramel/10 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-[#7a5236]" />
          <p className="text-sm text-ink/80">
            Ainda não existe um perfil na API. Pré-preenchemos o formulário com
            os textos que o site mostra atualmente — reveja e clique em{" "}
            <strong>Criar perfil</strong>.
          </p>
        </Card>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Section
            title="Destaque inicial"
            description="O primeiro ecrã do site, junto à fotografia."
          >
            <Field
              label="Etiqueta"
              hint="Pequeno texto acima do nome."
              className="sm:col-span-2"
              htmlFor="p-title"
            >
              <Input
                id="p-title"
                value={v.title}
                onChange={set("title")}
                placeholder="Engenheira · Escritora · Ativista Digital"
              />
            </Field>
            <Field
              label="Frase de apresentação"
              className="sm:col-span-2"
              htmlFor="p-tagline"
            >
              <Input
                id="p-tagline"
                value={v.tagline}
                onChange={set("tagline")}
              />
            </Field>
            <Field
              label="Texto de introdução"
              className="sm:col-span-2"
              htmlFor="p-bio"
              aside={<Counter text={v.bio} max={260} />}
            >
              <Textarea
                id="p-bio"
                value={v.bio}
                onChange={set("bio")}
                className="min-h-24"
              />
            </Field>
          </Section>

          <Section
            title="Sobre"
            description="Biografia completa, apresentada na secção «Sobre»."
          >
            <Field
              label="Biografia"
              hint="Separe parágrafos com uma linha em branco."
              className="sm:col-span-2"
              htmlFor="p-desc"
              aside={
                <span className="text-xs text-ink/40">
                  {paragraphs.length} parágrafo(s)
                </span>
              }
            >
              <Textarea
                id="p-desc"
                value={v.bio_description}
                onChange={set("bio_description")}
                className="min-h-56"
              />
            </Field>
            <Field label="Localização" htmlFor="p-loc">
              <Input
                id="p-loc"
                value={v.location}
                onChange={set("location")}
                placeholder="Luanda, Angola"
              />
            </Field>
            <Field label="Anos de experiência" htmlFor="p-years">
              <Input
                id="p-years"
                type="number"
                min={0}
                value={v.experience_years}
                onChange={set("experience_years")}
                placeholder="10"
              />
            </Field>
          </Section>

          <Section
            title="Fotografias"
            description="A foto principal do topo do site e as fotos que acompanham o scroll."
          >
            <Field
              label="Foto principal (topo do site)"
              className="sm:col-span-2"
              hint="Guardada com «Guardar alterações». Se ficar vazia, o site usa a fotografia de estúdio. Prefira fotos verticais (3:4)."
            >
              <ImageField
                value={v.photo_url}
                folder="profile"
                onChange={(url) => setV((s) => ({ ...s, photo_url: url }))}
              />
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-3 text-[13px] font-semibold text-ink">
                Fotos que acompanham o scroll
              </p>
              <GalleryManager />
            </div>
          </Section>

          <Section
            title="Citação em destaque"
            description="Aparece em grande, na secção de citações."
          >
            <Field label="Citação" className="sm:col-span-2" htmlFor="p-quote">
              <Textarea
                id="p-quote"
                value={v.quote}
                onChange={set("quote")}
                className="min-h-20"
              />
            </Field>
          </Section>
        </div>

        {/* Pré-visualização */}
        <div className="sticky top-24 flex flex-col gap-3">
          <p className="flex items-center gap-2 font-heading text-[11px] font-semibold tracking-[0.2em] text-ink/50 uppercase">
            <Sparkles className="size-3.5 text-lip" /> Pré-visualização
          </p>
          <Card className="overflow-hidden">
            <div className="relative bg-background p-6">
              <div className="absolute -top-10 -right-10 size-40 rounded-full bg-lavender/50 blur-2xl" />
              <div className="relative flex gap-4">
                <img
                  src={previewSrc(v.photo_url, person.photoSmall)}
                  alt=""
                  className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-md"
                />
                <div className="min-w-0">
                  {v.title && (
                    <span className="inline-block rounded-sm border border-ink/40 px-2 py-0.5 font-heading text-[8px] font-semibold tracking-[0.15em] uppercase">
                      {v.title}
                    </span>
                  )}
                  <p className="mt-2 font-heading text-xl leading-tight font-extrabold">
                    {person.firstName}{" "}
                    <span className="text-lip">{person.lastName}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium">
                    {v.tagline}
                  </p>
                </div>
              </div>
              <p className="relative mt-4 line-clamp-4 text-xs/5 text-ink/80">
                {v.bio}
              </p>
            </div>
            <div className="bg-lavender p-6">
              <p className="font-heading text-[9px] font-semibold tracking-[0.25em] text-lip uppercase">
                Sobre
              </p>
              <p className="mt-2 line-clamp-5 text-xs/5">{paragraphs[0]}</p>
              {(v.location || v.experience_years) && (
                <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
                  <MapPin className="size-3" />{" "}
                  {[
                    v.location,
                    v.experience_years && `${v.experience_years}+ anos`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            {v.quote && (
              <div className="p-6">
                <p className="font-heading text-4xl leading-none font-extrabold text-lip">
                  “
                </p>
                <p className="-mt-1 line-clamp-4 text-sm font-semibold">
                  {v.quote}
                </p>
              </div>
            )}
          </Card>
          {profile && (
            <p className="text-center text-xs text-ink/40">
              Última alteração {relative(profile.updated_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Counter({ text, max }: { text: string; max: number }) {
  const n = text.length
  return (
    <span
      className={`text-xs ${n > max ? "font-semibold text-lip" : "text-ink/40"}`}
    >
      {n}/{max}
    </span>
  )
}
