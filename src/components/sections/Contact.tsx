import { Mail } from "lucide-react"

import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/content/SiteContent"

export function Contact() {
  const { contact } = useSiteContent()
  const links = contact.links
  return (
    <section id="contacto" data-side="none">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Vamos construir{" "}
            <span className="text-lip">novas oportunidades?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base/7">
            Convites para palestras, mentoria, parcerias com a Women in Tech
            Angola e projetos de comunicação e marca pessoal.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-md bg-lip px-6 py-3 font-heading text-xs font-bold tracking-widest text-white uppercase hover:bg-lip/85"
              >
                <Mail className="size-4" /> Contactar
              </a>
            )}
            {links.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-ink px-6 py-3 font-heading text-xs font-bold tracking-widest uppercase hover:bg-ink hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          {!contact.email && links.length === 0 && (
            <p className="mt-6 text-sm">
              Canais de contacto oficiais em breve.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
