import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CalendarDays,
  FileText,
  Gauge,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Mic,
  Newspaper,
  Rocket,
  Share2,
  ShieldCheck,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react"

import { RESOURCES } from "@/admin/resources"

/**
 * Conteúdo do tutorial do painel. Cada tópico explica, passo a passo,
 * uma funcionalidade. `route` liga o tópico à página do painel (é o tópico
 * aberto pelo botão de ajuda nessa página). Tópicos com `resource` só
 * aparecem se essa página existir no painel.
 */

export type Step = {
  title: string
  text: string
  /** Dica opcional, mostrada em destaque. */
  tip?: string
}

export type Topic = {
  id: string
  title: string
  summary: string
  icon: LucideIcon
  group: "Começar" | "Conteúdos" | "Imagens" | "Acesso" | "Ajuda"
  /** Página do painel relacionada (ex.: "/admin/percurso"). */
  route?: string
  /** Caminho do recurso em RESOURCES de que o tópico depende. */
  resource?: string
  /** Só administradores podem fazer esta ação. */
  adminOnly?: boolean
  steps: Step[]
}

const ALL_TOPICS: Topic[] = [
  {
    id: "primeiros-passos",
    title: "Primeiros passos",
    summary: "Entrar no painel, importar o conteúdo e conhecer o menu.",
    icon: Rocket,
    group: "Começar",
    route: "/admin",
    steps: [
      {
        title: "Inicie sessão",
        text: "Abra /admin, escreva o seu e-mail e a palavra-passe e clique em «Entrar no painel». Se tiver associado a conta Google, pode usar «Entrar com Google».",
        tip: "Contas novas só entram depois de confirmar o e-mail (link enviado no convite).",
      },
      {
        title: "Importe o conteúdo atual (só na primeira vez)",
        text: "No Painel, se aparecer o cartão «Primeiros passos», clique em «Importar agora». O perfil, o percurso, as competências e a imprensa que o site já mostra passam para a base de dados, prontos a editar.",
      },
      {
        title: "Use o menu lateral",
        text: "À esquerda estão todas as áreas: Perfil, conteúdos (Percurso, Competências, Agenda, Imprensa, Artigos…), Redes & contacto e Conta & equipa. O número ao lado de cada item é a quantidade de registos.",
      },
      {
        title: "Veja o resultado no site",
        text: "Clique em «Ver site» (no topo do Painel ou no fundo do menu). As alterações aparecem no site assim que guarda; se o site já estiver aberto noutro separador, basta voltar a ele.",
      },
      {
        title: "Peça ajuda em qualquer página",
        text: "O botão «?» no canto inferior esquerdo abre as instruções da página onde está. Este tutorial completo está em «Tutorial», no menu.",
      },
    ],
  },
  {
    id: "painel",
    title: "Painel inicial",
    summary: "Contadores, atividade recente e ações rápidas.",
    icon: LayoutDashboard,
    group: "Começar",
    route: "/admin",
    steps: [
      {
        title: "Consulte os contadores",
        text: "Cada cartão mostra quantos registos existem numa área. Clique num cartão para abrir essa página.",
      },
      {
        title: "Acompanhe a atividade recente",
        text: "A lista «Atividade recente» mostra os últimos registos alterados e quando. Clique num deles para ir à página correspondente.",
      },
      {
        title: "Use as ações rápidas",
        text: "Atalhos para as tarefas mais comuns: editar o perfil, adicionar uma notícia, escrever um artigo, criar um evento…",
      },
    ],
  },
  {
    id: "perfil",
    title: "Editar o perfil",
    summary: "Textos do topo do site, biografia, citação e localização.",
    icon: UserRound,
    group: "Conteúdos",
    route: "/admin/perfil",
    adminOnly: true,
    steps: [
      {
        title: "Abra «Perfil» no menu",
        text: "Se ainda não existir perfil, o formulário vem preenchido com os textos atuais do site — reveja e clique em «Criar perfil».",
      },
      {
        title: "Edite o destaque inicial",
        text: "«Etiqueta» é o texto pequeno acima do nome; «Frase de apresentação» e «Texto de introdução» aparecem ao lado da foto no topo do site.",
      },
      {
        title: "Escreva a biografia",
        text: "Em «Sobre», escreva a biografia. Deixe uma linha em branco entre parágrafos para os separar no site. Preencha também a localização e os anos de experiência.",
      },
      {
        title: "Acompanhe a pré-visualização",
        text: "À direita vê, em tempo real, como o topo do site, a secção «Sobre» e a citação vão ficar.",
      },
      {
        title: "Guarde",
        text: "Clique em «Guardar alterações» (ou Ctrl + S). «Descartar» volta ao que estava guardado.",
        tip: "O botão de guardar só fica ativo quando há alterações por guardar.",
      },
    ],
  },
  {
    id: "fotos-perfil",
    title: "Foto principal e fotos do scroll",
    summary:
      "Trocar a foto do topo do site e as fotos que acompanham o scroll.",
    icon: ImagePlus,
    group: "Imagens",
    route: "/admin/perfil",
    adminOnly: true,
    steps: [
      {
        title: "Abra «Perfil» e desça até «Fotografias»",
        text: "Aqui estão a foto principal (topo do site) e as fotos que acompanham o scroll em cada secção.",
      },
      {
        title: "Troque a foto principal",
        text: "Arraste uma imagem para a área tracejada ou clique nela para escolher. Depois clique em «Guardar alterações» — a foto principal só é gravada com o resto do perfil.",
        tip: "Prefira fotos verticais (3:4). Sem foto, o site usa a fotografia de estúdio.",
      },
      {
        title: "Personalize as fotos do scroll",
        text: "Em cada cartão (Principal, Sobre, Percurso, Citações) carregue uma foto. Estas são guardadas logo, sem precisar de clicar em guardar. O selo passa de «Padrão» a «Personalizada».",
      },
      {
        title: "Ajuste o enquadramento",
        text: "Em «Enquadramento» escolha que parte da foto fica visível: Topo, Rosto (recomendado), Centro ou Parte de baixo.",
      },
      {
        title: "Volte à foto padrão",
        text: "Clique em «Padrão» no cartão para remover a foto personalizada; o site volta a usar a foto original dessa secção.",
      },
    ],
  },
  {
    id: "percurso",
    title: "Percurso (linha do tempo)",
    summary: "Adicionar e editar os marcos da trajetória.",
    icon: Briefcase,
    group: "Conteúdos",
    route: "/admin/percurso",
    resource: "percurso",
    steps: [
      {
        title: "Abra «Percurso» e clique em «Adicionar marco»",
        text: "Abre-se um painel lateral com o formulário.",
      },
      {
        title: "Preencha o marco",
        text: "«Título / cargo» é obrigatório. «Período» é texto livre (ex.: «Setembro 2025» ou «2020 – 2024»). Junte a organização e uma descrição curta.",
      },
      {
        title: "Guarde",
        text: "Clique em «Criar» (ou Ctrl + S). O marco aparece no fim da linha do tempo do site.",
        tip: "A ordem é cronológica pela data de criação: crie os marcos do mais antigo para o mais recente.",
      },
      {
        title: "Edite ou remova",
        text: "Clique num marco (ou no lápis) para editar. O caixote do lixo remove — só administradores o veem, e há sempre confirmação.",
      },
    ],
  },
  {
    id: "competencias",
    title: "Competências",
    summary: "Gerir as competências da secção «Sobre».",
    icon: Gauge,
    group: "Conteúdos",
    route: "/admin/competencias",
    resource: "competencias",
    steps: [
      {
        title: "Abra «Competências» e clique em «Adicionar competência»",
        text: "Escreva o nome (ex.: «Liderança e advocacy»).",
      },
      {
        title: "Indique a percentagem (opcional)",
        text: "Um número de 0 a 100. No site aparece dentro do botão da competência, ex.: «Liderança 92%». Deixe vazio para mostrar só o nome.",
      },
      {
        title: "Guarde e confira na secção «Sobre»",
        text: "As competências aparecem pela ordem em que foram criadas.",
      },
    ],
  },
  {
    id: "agenda",
    title: "Agenda de eventos",
    summary: "Palestras, workshops e participações futuras e passadas.",
    icon: CalendarDays,
    group: "Conteúdos",
    route: "/admin/agenda",
    resource: "agenda",
    adminOnly: true,
    steps: [
      {
        title: "Abra «Agenda» e clique em «Adicionar evento»",
        text: "Só administradores podem criar ou alterar eventos; os outros perfis veem a lista.",
      },
      {
        title: "Preencha os dados obrigatórios",
        text: "Nome do evento, data e hora, tipo (Palestra, Workshop… ou escreva outro), local, estado (Confirmado, Por confirmar, Realizado…), link de inscrição/informação (começado por https://) e descrição.",
      },
      {
        title: "Junte uma imagem (opcional)",
        text: "Arraste o cartaz ou uma foto do evento para «Imagem do evento».",
      },
      {
        title: "Guarde",
        text: "No site, eventos com data a partir de hoje aparecem em «Próximos encontros»; os passados passam para «Eventos anteriores» automaticamente.",
        tip: "Quando o evento acontecer, mude o estado para «Realizado».",
      },
    ],
  },
  {
    id: "imprensa",
    title: "Imprensa (notícias)",
    summary: "Artigos e reconhecimentos publicados nos media.",
    icon: Newspaper,
    group: "Conteúdos",
    route: "/admin/imprensa",
    resource: "imprensa",
    steps: [
      {
        title: "Abra «Imprensa» e clique em «Adicionar notícia»",
        text: "Cada notícia vira um cartão na secção «Conquistas & reconhecimentos».",
      },
      {
        title: "Preencha título, meio e data",
        text: "Escreva o título como saiu na imprensa, o meio de comunicação (ex.: «Forbes África Lusófona») e a data de publicação.",
      },
      {
        title: "Cole o link e carregue a capa",
        text: "O link leva o visitante ao artigo original. A capa é a imagem do cartão; sem capa aparece um cartão com o nome do meio.",
      },
      {
        title: "Guarde",
        text: "As notícias aparecem da mais recente para a mais antiga.",
      },
    ],
  },
  {
    id: "categorias",
    title: "Categorias dos artigos",
    summary: "Organizar os artigos por tema.",
    icon: Tags,
    group: "Conteúdos",
    route: "/admin/categorias",
    resource: "categorias",
    steps: [
      {
        title: "Abra «Categorias» e clique em «Adicionar categoria»",
        text: "Escreva o nome (ex.: «Carreira»). O slug é gerado automaticamente.",
      },
      {
        title: "Use-a nos artigos",
        text: "Ao criar um artigo, escolha a categoria na lista. Ela aparece como etiqueta no cartão do artigo.",
        tip: "Crie as categorias antes dos artigos.",
      },
    ],
  },
  {
    id: "artigos",
    title: "Artigos",
    summary: "Escrever textos próprios, com página de leitura.",
    icon: FileText,
    group: "Conteúdos",
    route: "/admin/artigos",
    resource: "artigos",
    steps: [
      {
        title: "Abra «Artigos» e clique em «Adicionar artigo»",
        text: "Escreva o título — o «Slug (URL)» é gerado sozinho. Pode editá-lo ou clicar em «Gerar do título».",
      },
      {
        title: "Escolha a categoria e a data",
        text: "A data de publicação é opcional. Uma data futura deixa o artigo agendado: só aparece no site a partir desse dia.",
      },
      {
        title: "Escreva o resumo e o conteúdo",
        text: "O resumo aparece nos cartões. No conteúdo, deixe uma linha em branco entre parágrafos.",
      },
      {
        title: "Junte a capa e guarde",
        text: "O artigo aparece na secção «Artigos» e tem página própria (botão de link no cartão abre-a).",
      },
    ],
  },
  {
    id: "podcast",
    title: "Podcast",
    summary: "Publicar episódios na secção «Podcast».",
    icon: Mic,
    group: "Conteúdos",
    route: "/admin/podcast",
    resource: "podcast",
    steps: [
      {
        title: "Abra «Podcast» e clique em «Adicionar episódio»",
        text: "Escreva o título do episódio.",
      },
      {
        title: "Preencha duração, data e link",
        text: "A duração é em minutos. O link deve abrir o episódio (Spotify, YouTube…).",
      },
      {
        title: "Junte a capa e a descrição e guarde",
        text: "O episódio aparece na secção «Podcast» do site. Datas futuras ficam agendadas.",
      },
    ],
  },
  {
    id: "redes",
    title: "Redes & contacto",
    summary: "Botões de contacto no fim do site.",
    icon: Share2,
    group: "Conteúdos",
    route: "/admin/redes",
    resource: "redes",
    steps: [
      {
        title: "Abra «Redes & contacto» e clique em «Adicionar rede»",
        text: "Escolha a plataforma na lista (LinkedIn, Instagram, Website…) ou escreva outra.",
      },
      {
        title: "Cole o link do perfil",
        text: "Ex.: https://www.linkedin.com/in/… Cada plataforma só pode existir uma vez.",
      },
      {
        title: "Para o botão «Contactar», use «E-mail»",
        text: "Escolha a plataforma «E-mail» e escreva só o endereço — o painel acrescenta o «mailto:» por si.",
      },
    ],
  },
  {
    id: "imagens",
    title: "Carregar imagens",
    summary: "Como funcionam os uploads de capas e fotos.",
    icon: ImagePlus,
    group: "Imagens",
    steps: [
      {
        title: "Arraste ou clique",
        text: "Em qualquer campo de imagem, arraste o ficheiro para a área tracejada ou clique nela para o escolher.",
      },
      {
        title: "Respeite o formato",
        text: "Aceita JPEG, PNG, WEBP e GIF até 5 MB. Imagens AVIF ou maiores são recusadas — converta-as primeiro.",
      },
      {
        title: "Substitua ou remova",
        text: "Passe o rato por cima da imagem: «Substituir» troca-a, «Remover» limpa o campo. Depois guarde o formulário.",
      },
      {
        title: "Ou cole um link",
        text: "Por baixo da área há um campo para colar o URL de uma imagem que já esteja online.",
        tip: "Em produção as imagens ficam guardadas no Cloudinary.",
      },
    ],
  },
  {
    id: "equipa",
    title: "Conta & equipa",
    summary: "Convidar pessoas, funções e palavras-passe.",
    icon: UsersRound,
    group: "Acesso",
    route: "/admin/conta",
    steps: [
      {
        title: "Veja a sua conta",
        text: "Em «Conta & equipa» estão o seu nome, e-mail e função.",
      },
      {
        title: "Convide alguém (administradores)",
        text: "Em «Adicionar utilizador», preencha nome, e-mail, palavra-passe (mínimo 12 caracteres) e função. Clique em «Criar e enviar convite».",
        tip: "A API permite uma conta por função (Administrador, Editor, Utilizador): só aparecem as funções livres.",
      },
      {
        title: "A pessoa confirma o e-mail",
        text: "Ela recebe um link (válido 30 minutos). Até confirmar, aparece na lista como «Por confirmar». Se o link expirar, clique em «Reenviar».",
      },
      {
        title: "Defina a palavra-passe de outra pessoa",
        text: "Na lista da equipa, «Palavra-passe» permite definir uma nova (mínimo 12 caracteres). Para a sua própria use «Esqueci-me da palavra-passe» no login.",
      },
      {
        title: "Associe a conta Google (opcional)",
        text: "Em «Entrar com Google», escolha a conta Google com o mesmo e-mail. Depois pode entrar sem palavra-passe.",
      },
    ],
  },
  {
    id: "permissoes",
    title: "Funções e permissões",
    summary: "O que cada perfil pode fazer.",
    icon: ShieldCheck,
    group: "Acesso",
    steps: [
      {
        title: "Administrador",
        text: "Faz tudo: edita o perfil e as fotos, gere a agenda e a equipa, cria, edita e remove qualquer conteúdo.",
      },
      {
        title: "Editor e Utilizador",
        text: "Criam e editam conteúdos (percurso, competências, imprensa, artigos…), mas não removem registos, não alteram o perfil nem a agenda e não gerem a equipa.",
      },
      {
        title: "Conta ativa",
        text: "Qualquer função só funciona depois de confirmar o e-mail.",
      },
    ],
  },
  {
    id: "palavra-passe",
    title: "Recuperar a palavra-passe",
    summary: "Redefinir o acesso com um código enviado por e-mail.",
    icon: KeyRound,
    group: "Acesso",
    steps: [
      {
        title: "No login, clique em «Esqueci-me da palavra-passe»",
        text: "Escreva o e-mail da conta e clique em «Enviar código».",
      },
      {
        title: "Abra o e-mail",
        text: "Receberá um código de 8 dígitos, válido durante 10 minutos.",
        tip: "Por agora, a recuperação por código só está disponível para administradores.",
      },
      {
        title: "Defina a nova palavra-passe",
        text: "Escreva o código e a nova palavra-passe (mínimo 12 caracteres, duas vezes) e clique em «Redefinir palavra-passe». Depois entre normalmente.",
      },
    ],
  },
  {
    id: "problemas",
    title: "Problemas comuns",
    summary: "O que fazer quando algo não corre como esperado.",
    icon: LifeBuoy,
    group: "Ajuda",
    steps: [
      {
        title: "«Sessão expirada»",
        text: "A sessão renova-se sozinha, mas se ficar muito tempo inativo pode ter de entrar outra vez.",
      },
      {
        title: "«A sua conta ainda não está ativa»",
        text: "Confirme o e-mail pelo link recebido. Se expirou, peça a um administrador para o reenviar.",
      },
      {
        title: "«Esta ação é reservada a administradores»",
        text: "A sua função não permite essa ação (ex.: remover registos ou alterar a agenda). Peça a um administrador.",
      },
      {
        title: "A imagem não carrega",
        text: "Confirme o formato (JPEG, PNG, WEBP ou GIF) e o tamanho (até 5 MB). Se o erro for do Cloudinary, avise quem gere a API.",
      },
      {
        title: "Não vejo a alteração no site",
        text: "Volte ao separador do site (ele atualiza sozinho) ou recarregue a página. Artigos e episódios com data futura só aparecem nessa data.",
      },
      {
        title: "«Não foi possível ligar à API»",
        text: "O servidor pode estar a arrancar (no plano gratuito demora até um minuto) — aguarde e tente de novo.",
      },
    ],
  },
]

const availablePaths = new Set(RESOURCES.map((r) => r.path))

/** Tópicos disponíveis neste painel (ignora páginas que não existam). */
export const TOPICS = ALL_TOPICS.filter(
  (t) => !t.resource || availablePaths.has(t.resource)
)

export const GROUP_ORDER: Topic["group"][] = [
  "Começar",
  "Conteúdos",
  "Imagens",
  "Acesso",
  "Ajuda",
]

/** Tópico principal de uma página do painel (para o botão de ajuda). */
export function topicForPath(path: string): Topic | undefined {
  const clean = path.replace(/\/+$/, "") || "/admin"
  if (clean === "/admin/tutorial") return undefined
  return (
    TOPICS.find((t) => t.route === clean && t.id !== "primeiros-passos") ??
    TOPICS.find(
      (t) => t.route && clean.startsWith(t.route) && t.route !== "/admin"
    ) ??
    TOPICS.find((t) => t.id === "primeiros-passos")
  )
}
