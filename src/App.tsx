import { lazy, Suspense, useEffect } from "react"

import { ScrollCompanion } from "@/components/ScrollCompanion"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { About } from "@/components/sections/About"
import { Agenda } from "@/components/sections/Agenda"
import { Articles } from "@/components/sections/Articles"
import { Book } from "@/components/sections/Book"
import { Contact } from "@/components/sections/Contact"
import { Hero } from "@/components/sections/Hero"
import { Journey } from "@/components/sections/Journey"
import { Pillars } from "@/components/sections/Pillars"
import { Podcast } from "@/components/sections/Podcast"
import { Press } from "@/components/sections/Press"
import { Quotes } from "@/components/sections/Quotes"
import { Stats } from "@/components/sections/Stats"
import { SiteContentProvider } from "@/content/SiteContent"
import { ArticlePage } from "@/pages/ArticlePage"
import { usePathname } from "@/lib/router"

// O painel só é descarregado quando se visita /admin.
const AdminApp = lazy(() => import("@/admin/AdminApp"))
const ConfirmEmailPage = lazy(() => import("@/admin/ConfirmEmailPage"))

function Home() {
  // Ao chegar de outra página com "/#secção", desloca até à secção.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const t = setTimeout(
      () => document.getElementById(id)?.scrollIntoView(),
      150
    )
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <ScrollCompanion />
      <main>
        <Hero />
        <Pillars />
        <Stats />
        <About />
        <Journey />
        <Book />
        <Quotes />
        <Press />
        <Articles />
        <Podcast />
        <Agenda />
        <Contact />
      </main>
    </>
  )
}

export function App() {
  const path = usePathname()

  if (path === "/confirmar-email") {
    return (
      <Suspense fallback={null}>
        <ConfirmEmailPage />
      </Suspense>
    )
  }

  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <Suspense
        fallback={
          <div className="grid min-h-svh place-items-center bg-ink">
            <span className="size-8 animate-spin rounded-full border-2 border-lavender border-t-transparent" />
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    )
  }

  const article = path.match(/^\/artigos\/([^/]+)$/)

  return (
    <SiteContentProvider>
      <Header />
      {article ? <ArticlePage id={article[1]} /> : <Home />}
      <Footer />
    </SiteContentProvider>
  )
}

export default App
