import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react"
import { createPortal } from "react-dom"
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  X,
  XCircle,
} from "lucide-react"

import { api, assetUrl } from "@/lib/api"
import type { UploadFolder } from "@/lib/types"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Botões                                                              */
/* ------------------------------------------------------------------ */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "ghost" | "outline" | "danger" | "soft"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
}

export function Btn({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: BtnProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium transition-all outline-none select-none focus-visible:ring-4 focus-visible:ring-lavender/60 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
        {
          primary: "bg-lip text-white shadow-sm shadow-lip/30 hover:bg-lip/90",
          dark: "bg-ink text-white hover:bg-graphite",
          ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
          outline:
            "border border-ink/15 bg-white text-ink hover:border-ink/30 hover:bg-ink/[0.03]",
          danger: "bg-lip/10 text-lip hover:bg-lip hover:text-white",
          soft: "bg-lavender/40 text-ink hover:bg-lavender/70",
        }[variant],
        {
          sm: "h-8 px-3 text-xs",
          md: "h-10 px-4 text-sm",
          lg: "h-12 px-6 text-sm",
          icon: "size-9",
        }[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  required,
  error,
  children,
  className,
  htmlFor,
  aside,
}: {
  label: string
  hint?: ReactNode
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
  htmlFor?: string
  aside?: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-lip">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-lip">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink/50">{hint}</p>
      ) : null}
    </div>
  )
}

const inputCls =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 text-sm text-ink shadow-xs transition-colors placeholder:text-ink/35 hover:border-ink/25 focus:border-lip focus:ring-4 focus:ring-lip/10 focus:outline-none aria-invalid:border-lip"

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, "h-11", className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        inputCls,
        "min-h-28 resize-y py-3 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        inputCls,
        "h-11 appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2312181b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}

/* ------------------------------------------------------------------ */
/* Upload de imagem                                                    */
/* ------------------------------------------------------------------ */

export function ImageField({
  value,
  onChange,
  folder,
  allowUrl = true,
}: {
  value: string
  onChange: (url: string) => void
  folder: UploadFolder
  /** Mostra o campo para colar um URL (desligar quando cada alteração é guardada de imediato). */
  allowUrl?: boolean
}) {
  const id = useId()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [brokenSrc, setBrokenSrc] = useState("")
  const broken = !!value && brokenSrc === value
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem (JPEG, PNG, WEBP ou GIF).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem excede o limite de 5 MB.")
      return
    }
    setBusy(true)
    try {
      const res = await api.upload(folder, file)
      onChange(res.url)
      toast.success("Imagem carregada.")
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const src = assetUrl(value)

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          upload(e.dataTransfer.files[0])
        }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
          drag ? "border-lip bg-lip/5" : "border-ink/15 bg-ink/[0.02]",
          src && !broken ? "aspect-[16/9]" : "aspect-[16/7]"
        )}
      >
        {src && !broken ? (
          <>
            <img
              src={src}
              alt=""
              onError={() => setBrokenSrc(value)}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/55 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCw /> Substituir
              </Btn>
              <Btn
                variant="danger"
                size="sm"
                className="bg-white"
                onClick={() => onChange("")}
              >
                <Trash2 /> Remover
              </Btn>
            </div>
          </>
        ) : (
          <label
            htmlFor={id}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white text-lip shadow-sm ring-1 ring-ink/10">
              <ImagePlus className="size-5" />
            </span>
            <span className="text-sm font-semibold text-ink">
              {broken
                ? "Imagem indisponível — carregue outra"
                : "Arraste uma imagem ou clique para escolher"}
            </span>
            <span className="text-xs text-ink/50">
              JPEG, PNG, WEBP ou GIF · até 5 MB
            </span>
          </label>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Loader2 className="size-4 animate-spin" /> A carregar…
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      {allowUrl && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…ou cole o URL de uma imagem"
          className="h-9 text-xs"
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Painel lateral (drawer) e modal                                     */
/* ------------------------------------------------------------------ */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEscape(open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-in bg-ink/40 backdrop-blur-[2px] fade-in"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-2xl animate-in flex-col bg-[#f7f7f9] shadow-2xl duration-300 slide-in-from-right"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink/10 bg-white px-6 py-5">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-ink/55">{subtitle}</p>
            )}
          </div>
          <Btn
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X />
          </Btn>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-ink/10 bg-white px-6 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Remover",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  useEscape(open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div
        className="absolute inset-0 animate-in bg-ink/50 backdrop-blur-sm fade-in"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md animate-in rounded-3xl bg-white p-6 shadow-2xl zoom-in-95 fade-in"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-lip/10 text-lip">
          <AlertTriangle className="size-6" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-ink">
          {title}
        </h3>
        {description && (
          <div className="mt-2 text-sm/6 text-ink/60">{description}</div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>
            Cancelar
          </Btn>
          <Btn variant="primary" loading={loading} onClick={onConfirm}>
            <Trash2 /> {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

type Toast = { id: number; type: "success" | "error"; message: string }
type ToastApi = { success: (m: string) => void; error: (m: string) => void }

const ToastCtx = createContext<ToastApi>({
  success: () => {},
  error: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-3), { id, type, message }])
    setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      type === "error" ? 6000 : 3500
    )
  }, [])
  const [apiValue] = useState<ToastApi>(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  }))

  return (
    <ToastCtx.Provider value={apiValue}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex animate-in items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-xl fade-in slide-in-from-bottom-4"
            >
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-red-400" />
              )}
              <p className="flex-1 leading-relaxed">{t.message}</p>
              <button
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="text-white/50 hover:text-white"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

/* ------------------------------------------------------------------ */
/* Diversos                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/8 bg-white shadow-[0_1px_2px_rgb(18_24_27/0.04)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="font-heading text-[11px] font-semibold tracking-[0.25em] text-lip uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink/55">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-ink/[0.06]", className)} />
  )
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "lip" | "caramel" | "green"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        {
          neutral: "bg-ink/[0.06] text-ink/70",
          lip: "bg-lip/10 text-lip",
          caramel: "bg-caramel/25 text-[#7a5236]",
          green: "bg-emerald-500/10 text-emerald-700",
        }[tone]
      )}
    >
      {children}
    </span>
  )
}
