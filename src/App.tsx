import { ScrollCompanion } from "@/components/ScrollCompanion"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { About } from "@/components/sections/About"
import { Book } from "@/components/sections/Book"
import { Contact } from "@/components/sections/Contact"
import { Hero } from "@/components/sections/Hero"
import { Journey } from "@/components/sections/Journey"
import { Pillars } from "@/components/sections/Pillars"
import { Press } from "@/components/sections/Press"
import { Quotes } from "@/components/sections/Quotes"
import { Stats } from "@/components/sections/Stats"

export function App() {
  return (
    <>
      <Header />
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
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
