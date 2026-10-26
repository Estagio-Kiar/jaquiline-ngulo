import { useState, type ReactNode } from "react"
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"

import { isAdmin, logout, useSession } from "@/admin/auth"
import { useAdminData, type DataKey } from "@/admin/data"
import { RESOURCES } from "@/admin/resources"
import { person } from "@/data/profile"
import { Link, usePathname } from "@/lib/router"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  count?: DataKey
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Geral",
    items: [
      { to: "/admin", label: "Painel", icon: LayoutDashboard },
      { to: "/admin/perfil", label: "Perfil", icon: UserRound },
    ],
  },
  {
    title: "Conteúdos",
    items: RESOURCES.filter((r) => r.key !== "social").map((r) => ({
      to: `/admin/${r.path}`,
      label: r.title,
      icon: r.icon,
      count: r.key,
    })),
  },
  {
    title: "Contacto",
    items: RESOURCES.filter((r) => r.key === "social").map((r) => ({
      to: `/admin/${r.path}`,
      label: r.title,
      icon: r.icon,
      count: r.key,
    })),
  },
  {
    title: "Acesso",
    items: [{ to: "/admin/conta", label: "Conta & equipa", icon: UsersRound }],
  },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname()
  const session = useSession()
  const { state } = useAdminData()
  const user = session?.user
  const initials = (user?.name || user?.email || "?")
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex h-20 items-center gap-3 px-6">
        <span className="grid size-10 place-items-center rounded-xl bg-lip font-heading text-sm font-extrabold">
          {person.firstName[0]}
          {person.lastName[0]}
        </span>
        <div className="leading-tight">
          <p className="font-heading text-xs font-extrabold tracking-wider uppercase">
            {person.firstName}{" "}
            <span className="text-lip">{person.lastName}</span>
          </p>
          <p className="text-[11px] text-white/45">Gestão de conteúdos</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Painel">
        {GROUPS.map((g) => (
          <div key={g.title} className="mt-5 first:mt-2">
            <p className="px-3 pb-2 font-heading text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
              {g.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((item) => {
                const active =
                  item.to === "/admin"
                    ? path === "/admin"
                    : path.startsWith(item.to)
                const slot = item.count ? state[item.count] : undefined
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {active && (
                        <span className="absolute top-2 bottom-2 -left-3 w-1 rounded-r-full bg-lip" />
                      )}
                      <item.icon
                        className={cn(
                          "size-[18px]",
                          active
                            ? "text-lip"
                            : "text-white/40 group-hover:text-white/70"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {slot?.loaded && !slot.error && (
                        <span
                          className={cn(
                            "min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold",
                            active
                              ? "bg-lip text-white"
                              : "bg-white/8 text-white/50"
                          )}
                        >
                          {slot.items.length}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-[18px] text-white/40" /> Ver site
        </a>
        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lavender font-heading text-xs font-bold text-ink">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user?.name || "Utilizador"}
            </p>
            <p className="truncate text-[11px] text-white/45">
              {isAdmin(user?.role) ? "Administrador" : "Editor"} · {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            title="Terminar sessão"
            aria-label="Terminar sessão"
            className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-svh bg-[#f4f4f6] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 animate-in bg-ink/50 fade-in"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 animate-in shadow-2xl slide-in-from-left">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="absolute top-5 -right-12 grid size-10 place-items-center rounded-xl bg-white text-ink"
            >
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink/8 bg-[#f4f4f6]/85 px-4 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="grid size-10 place-items-center rounded-xl hover:bg-ink/5"
          >
            <Menu className="size-5" />
          </button>
          <p className="font-heading text-xs font-extrabold tracking-wider uppercase">
            {person.firstName}{" "}
            <span className="text-lip">{person.lastName}</span>
          </p>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
