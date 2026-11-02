import { useEffect } from "react"

import { person } from "@/data/profile"
import { Link } from "@/lib/router"

type LegalDocument = "privacy" | "terms"

const updatedAt = "2 de novembro de 2026"

const documents = {
  privacy: {
    title: "Política de Privacidade",
    intro:
      "Esta política explica, em linguagem simples, que informação é apresentada neste portfólio e como funciona o acesso ao painel que o mantém.",
    sections: [
      {
        title: "1. Responsável pelo conteúdo",
        paragraphs: [
          `${person.name} é a titular do portfólio e acompanha a gestão do seu conteúdo com o Grupo KIAR, responsável pela manutenção da plataforma.`,
          "O site apresenta informação profissional e biográfica sobre a Jaqueline, incluindo percurso, projetos, publicações, fotografias e referências públicas. O conteúdo é revisto e pode ser atualizado ou removido pela Jaqueline ou por pessoas autorizadas por ela.",
        ],
      },
      {
        title: "2. Informação de visitantes",
        paragraphs: [
          "O site público é informativo e, atualmente, não disponibiliza criação de conta, formulário de contacto ou subscrição de newsletter. Não peça nem envie dados pessoais através de páginas que não tenham essa finalidade.",
          "Como acontece com qualquer serviço web, os sistemas de alojamento e entrega do site podem tratar dados técnicos necessários para apresentar as páginas e proteger o serviço, de acordo com as configurações e políticas dos fornecedores utilizados.",
        ],
      },
      {
        title: "3. Painel de gestão",
        paragraphs: [
          "O painel em /admin destina-se apenas à Jaqueline e a membros autorizados do Grupo KIAR. Para autenticação, o painel pode tratar endereço de e-mail e credenciais de acesso; se o login Google estiver configurado e associado à conta, também recebe do Google a credencial necessária para validar a sessão.",
          "A sessão autenticada é mantida no armazenamento local do navegador utilizado para aceder ao painel. Não use dispositivos partilhados sem terminar a sessão.",
          "A recuperação de palavra-passe é iniciada no login do painel e usa um código enviado para o e-mail da conta. O Grupo KIAR pode apoiar a titular na gestão do acesso.",
        ],
      },
      {
        title: "4. Utilização e partilha",
        paragraphs: [
          "A informação pública é utilizada para apresentar o percurso e o trabalho da Jaqueline. Os dados de acesso ao painel são utilizados para autenticação, recuperação de conta e administração do portfólio.",
          "Os dados necessários ao funcionamento do painel podem ser transmitidos à API do sistema e aos serviços de autenticação ou envio de e-mail efetivamente configurados. Este site não declara que controla as práticas de privacidade desses fornecedores; consulte também as respetivas políticas.",
        ],
      },
      {
        title: "5. Direitos e pedidos",
        paragraphs: [
          "Se encontrar informação pessoal publicada que considere incorreta ou que deva ser revista, contacte a Jaqueline pelos canais indicados na secção Contacto do site. A titular pode pedir a correção ou remoção de conteúdo que lhe diga respeito.",
          "Para questões sobre acesso ao painel, a Jaqueline pode contactar o Grupo KIAR. Os canais públicos de contacto podem ainda não estar disponíveis em todas as versões do site.",
        ],
      },
      {
        title: "6. Atualizações desta política",
        paragraphs: [
          "Esta política pode ser atualizada quando o site ou o modo de gestão do portfólio mudar. A data no início da página indica a revisão mais recente.",
        ],
      },
    ],
  },
  terms: {
    title: "Termos de Utilização",
    intro:
      "Ao navegar neste site, aceita utilizá-lo de forma responsável e de acordo com estes termos.",
    sections: [
      {
        title: "1. Finalidade do site",
        paragraphs: [
          `Este site é um portfólio profissional de ${person.name}. Apresenta informação biográfica e profissional, projetos, percurso, publicações e outras referências relacionadas com o seu trabalho.`,
          "O conteúdo é mantido pela Jaqueline com o apoio do Grupo KIAR, responsável pela gestão técnica do sistema. Pode ser alterado, corrigido ou removido a qualquer momento.",
        ],
      },
      {
        title: "2. Precisão e atualidade",
        paragraphs: [
          "A informação é disponibilizada para fins informativos e pode não refletir alterações recentes. Embora se procure manter o conteúdo correto, não é garantido que todos os dados estejam sempre completos ou atualizados.",
          "As ligações para publicações, organizações e outros sites externos são fornecidas como referência. O conteúdo e a disponibilidade desses sites são da responsabilidade dos respetivos proprietários.",
        ],
      },
      {
        title: "3. Direitos sobre o conteúdo",
        paragraphs: [
          "Textos, fotografias, identidade visual e outros materiais apresentados podem estar protegidos por direitos de autor, direitos de imagem ou outros direitos. A sua visualização no portfólio não concede autorização para copiar, republicar, adaptar ou utilizar esses materiais.",
          "Salvo indicação em contrário, peça autorização à titular ou ao respetivo titular dos direitos antes de reutilizar qualquer conteúdo. Marcas, publicações e materiais de terceiros pertencem aos seus titulares.",
        ],
      },
      {
        title: "4. Utilização permitida",
        paragraphs: [
          "Pode consultar e partilhar ligações para as páginas públicas para fins pessoais, profissionais ou informativos, desde que não apresente o conteúdo de forma enganadora nem sugira uma relação ou aprovação que não exista.",
          "Não é permitido tentar aceder sem autorização ao painel /admin, interferir com o funcionamento do site, contornar medidas de segurança ou utilizar o serviço para fins ilícitos.",
        ],
      },
      {
        title: "5. Painel de gestão",
        paragraphs: [
          "O painel é reservado à Jaqueline e às pessoas autorizadas pelo Grupo KIAR. As credenciais são pessoais e não devem ser partilhadas fora dessa equipa.",
          "A recuperação da palavra-passe é feita através do fluxo de recuperação disponível no login do painel, com envio de um código para o e-mail da conta. Em caso de dificuldade, a titular deve contactar o Grupo KIAR.",
        ],
      },
      {
        title: "6. Alterações dos termos",
        paragraphs: [
          "Estes termos podem ser revistos quando necessário. A versão publicada nesta página é a que se aplica durante a utilização do site.",
        ],
      },
    ],
  },
} satisfies Record<
  LegalDocument,
  {
    title: string
    intro: string
    sections: { title: string; paragraphs: string[] }[]
  }
>

export function LegalPage({ document }: { document: LegalDocument }) {
  const content = documents[document]

  useEffect(() => {
    const previousTitle = window.document.title
    window.document.title = `${content.title} | ${person.name}`
    return () => {
      window.document.title = previousTitle
    }
  }, [content.title])

  return (
    <main className="min-h-svh bg-background px-5 pt-28 pb-16">
      <article className="mx-auto max-w-3xl">
        <p className="font-heading text-[11px] font-semibold tracking-[0.22em] text-lip uppercase">
          {person.name}
        </p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          Última atualização: {updatedAt}
        </p>
        <p className="mt-8 text-base/7 text-ink/75">{content.intro}</p>

        <div className="mt-10 flex flex-col gap-8">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3 text-sm/7 text-ink/75">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Link
          to="/"
          className="mt-10 inline-flex font-heading text-xs font-semibold tracking-widest text-lip uppercase hover:underline"
        >
          Voltar ao portfólio
        </Link>
      </article>
    </main>
  )
}
