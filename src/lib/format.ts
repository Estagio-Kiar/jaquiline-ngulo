const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]
const MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
]

/** "Set 2026" */
export function monthYear(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "29 de março de 2025" */
export function longDate(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()}`
}

/** "há 3 dias" */
export function relative(iso?: string | null) {
  if (!iso) return ""
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "agora mesmo"
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
  const days = Math.floor(diff / 86400)
  if (days < 30) return `há ${days} dia${days > 1 ? "s" : ""}`
  return longDate(iso)
}

/** "Set 2026" → ISO (1.º dia do mês). */
export function parseMonthYear(label: string) {
  const m = label.match(/([A-Za-zç]{3})\w*\.?\s+(\d{4})/)
  if (!m) return undefined
  const idx = MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase())
  if (idx < 0) return undefined
  return new Date(Date.UTC(Number(m[2]), idx, 1, 12)).toISOString()
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function minutes(n?: number | null) {
  if (!n) return ""
  if (n < 60) return `${n} min`
  const h = Math.floor(n / 60)
  const rest = n % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}
