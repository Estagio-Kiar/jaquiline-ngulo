import { useState } from "react"
import { RotateCcw } from "lucide-react"

import { canDeleteContent, useSession } from "@/admin/auth"
import { useSlot } from "@/admin/data"
import { Badge, Btn, ImageField, Select, useToast } from "@/admin/ui"
import { gallery as staticGallery } from "@/data/profile"
import { api, imageVariant } from "@/lib/api"
import type { GalleryPhoto } from "@/lib/types"

/**
 * Fotos que acompanham o scroll no site (GET/POST/PATCH/DELETE /gallery).
 * Cada slot corresponde a uma secção. Guardar é imediato: ao carregar,
 * trocar ou remover uma foto, a alteração vai logo para a API.
 */

const SLOTS = [
  {
    slot: 0,
    label: "Principal",
    hint: "Usada por defeito e sempre que uma secção não tem foto própria.",
  },
  { slot: 1, label: "Secção «Sobre»", hint: "À direita do texto." },
  {
    slot: 2,
    label: "Secção «Percurso»",
    hint: "À esquerda da linha do tempo.",
  },
  { slot: 4, label: "Secção «Citações»", hint: "À esquerda das citações." },
]

const POSITIONS = [
  { value: "50% 10%", label: "Topo da foto" },
  { value: "50% 25%", label: "Rosto (recomendado)" },
  { value: "50% 50%", label: "Centro" },
  { value: "50% 80%", label: "Parte de baixo" },
]

function SlotCard({
  slot,
  label,
  hint,
  item,
  onChanged,
}: {
  slot: number
  label: string
  hint: string
  item?: GalleryPhoto
  onChanged: () => void
}) {
  const toast = useToast()
  const session = useSession()
  // Repor a foto padrão apaga o registo: só gestores e administradores.
  const canReset = canDeleteContent(session?.user.role)
  const [busy, setBusy] = useState(false)
  const fallback = staticGallery[slot] ?? staticGallery[0]
  const position = item?.position || "50% 25%"

  const save = async (patch: { image_url?: string; position?: string }) => {
    setBusy(true)
    try {
      if (item) await api.gallery.update(item.id, patch)
      else if (patch.image_url)
        await api.gallery.create({ slot, position, ...patch })
      toast.success(`Foto atualizada: ${label}.`)
      onChanged()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    if (!item) return
    if (!canReset) {
      toast.error("Só gestores e administradores podem repor a foto padrão.")
      return
    }
    setBusy(true)
    try {
      await api.gallery.remove(item.id)
      toast.success(`${label}: voltou à foto padrão.`)
      onChanged()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-ink/[0.015] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-ink/50">{hint}</p>
        </div>
        {item ? (
          <Badge tone="green">Personalizada</Badge>
        ) : (
          <Badge>Padrão</Badge>
        )}
      </div>

      {item ? (
        <ImageField
          value={item.image_url}
          folder="profile"
          allowUrl={false}
          onChange={(url) => (url ? save({ image_url: url }) : reset())}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <img
              src={fallback.src}
              alt=""
              className="size-full object-cover opacity-60 grayscale-[40%]"
              style={{ objectPosition: fallback.position }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="absolute inset-x-3 bottom-3 rounded-lg bg-white/90 px-3 py-1.5 text-center text-xs font-medium text-ink">
              A usar a foto padrão do site
            </span>
          </div>
          <ImageField
            value=""
            folder="profile"
            allowUrl={false}
            onChange={(url) => url && save({ image_url: url })}
          />
        </div>
      )}

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-ink/70">
          Enquadramento
          <Select
            value={position}
            disabled={!item || busy}
            onChange={(e) => save({ position: e.target.value })}
            className="h-10"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
            {!POSITIONS.some((p) => p.value === position) && (
              <option value={position}>Personalizado ({position})</option>
            )}
          </Select>
        </label>
        {item && canReset && (
          <Btn
            variant="ghost"
            size="sm"
            className="h-10"
            loading={busy}
            onClick={reset}
            title="Voltar à foto padrão"
          >
            <RotateCcw /> Padrão
          </Btn>
        )}
      </div>
    </div>
  )
}

export function GalleryManager() {
  const { items, reload, error } = useSlot("gallery")
  const bySlot = new Map(items.map((i) => [i.slot, i]))

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl bg-lip/10 px-4 py-3 text-sm text-lip">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOTS.map((s) => (
          <SlotCard
            key={`${s.slot}-${bySlot.get(s.slot)?.id ?? "default"}`}
            {...s}
            item={bySlot.get(s.slot)}
            onChanged={reload}
          />
        ))}
      </div>
      <p className="text-xs text-ink/45">
        As alterações destas fotos são guardadas de imediato. Para melhores
        resultados, use fotos verticais (3:4).
      </p>
    </div>
  )
}

/** Miniatura usada na pré-visualização do perfil. */
export const previewSrc = (url: string | null | undefined, fallback: string) =>
  imageVariant(url, 384) ?? fallback
