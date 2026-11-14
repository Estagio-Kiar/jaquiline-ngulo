/**
 * Conteúdo do portfólio. Todos os factos vêm de fontes públicas
 * (ver `press`). Campos de contacto vazios não são apresentados.
 */

export const person = {
  name: "Jaqueline Mabiala Ngulo",
  firstName: "Jaqueline",
  lastName: "Ngulo",
  badge: "Engenheira · Escritora · Ativista Digital",
  tagline: "Tecnologia, inclusão e cultura ao serviço das mulheres angolanas",
  heroText:
    "Dirige a Women in Tech Angola, fundou a VEUMA e escreve para preservar a sabedoria de gerações. A tecnologia, defende, não tem género.",
  photo: "/jaqueline-hero-768.png",
  photoSmall: "/jaqueline-hero-384.png",
}

/**
 * Fotos que acompanham o scroll. A primeira é a fotografia de estúdio
 * (sempre disponível); as restantes são descarregadas com `pnpm photos`
 * (ou substituídas por fotos próprias com o mesmo nome de ficheiro).
 * Se um ficheiro faltar, usa-se a fotografia de estúdio.
 */
export const gallery = [
  { src: "/jaqueline-hero-768.png", position: "50% 25%" },
  { src: "/fotos/pti-blazer-vermelho.avif", position: "50% 30%" },
  { src: "/fotos/bantumen-exterior-1.jpg", position: "50% 25%" },
  { src: "/fotos/chocolate-premio-1.png", position: "50% 20%" },
  { src: "/fotos/bantumen-exterior-2.jpg", position: "45% 30%" },
  { src: "/fotos/chocolate-premio-2.png", position: "50% 25%" },
]

/** Preencha para ativar os botões de contacto. */
export const contact = {
  email: "",
  linkedin: "",
  instagram: "",
  womenInTechSite: "",
}

export const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Impacto", href: "#impacto" },
  { label: "Percurso", href: "#percurso" },
  { label: "Obra", href: "#obra" },
  { label: "Conquistas", href: "#conquistas" },
  { label: "Contacto", href: "#contacto" },
]

export const pillars = [
  {
    number: "01",
    title: "Women in Tech Angola",
    text: "Diretora do capítulo angolano da maior rede mundial pela igualdade de género na tecnologia: capacitação, mentoria, empregabilidade e advocacy.",
  },
  {
    number: "02",
    title: "VEUMA",
    text: "Fundadora de um projeto de desenvolvimento social e empresarial centrado em marca pessoal, soft skills e comunicação corporativa.",
  },
  {
    number: "03",
    title: "Escrita e Cultura",
    text: "Autora de «Malongui da Minha Avó», coletânea de provérbios transmitidos de geração em geração na sua família.",
  },
]

export const stats = [
  { value: 250, suffix: "", label: "Mulheres alcançadas" },
  { value: 266, suffix: "", label: "Capacitações realizadas" },
  { value: 53, suffix: "", label: "Mentorias" },
  { value: 63, suffix: "", label: "Países na rede" },
]
export const statsNote = "Primeiro ano da Women in Tech Angola (2025–2026)."

export const about = {
  title: "Recomeçar, reinventar, liderar",
  paragraphs: [
    "Engenheira de sistemas elétricos, Jaqueline define-se pela resiliência e por acreditar que cada obstáculo pode tornar-se oportunidade. Sonhava com o Direito e a comunicação; a engenharia «escolheu-a», e decidiu entregar com qualidade — foi a única mulher da sua turma a defender a licenciatura.",
    "A escrita e a oratória abriram-lhe um novo caminho: começou a moderar eventos, a palestrar e a estudar marketing, o que deu origem à VEUMA. Em 2025 assumiu a direção da Women in Tech Angola, com uma convicção: «Angola não é só Luanda».",
  ],
  skills: [
    "Engenharia de sistemas elétricos",
    "Liderança e advocacy",
    "Mentoria e capacitação",
    "Comunicação e marca pessoal",
    "Oratória e moderação",
    "Escrita",
  ],
}

export const journey = [
  {
    date: "Formação",
    title: "Engenharia de sistemas elétricos",
    text: "Licenciou-se com o apoio de uma bolsa de estudo, sendo a única mulher da turma a defender o curso.",
  },
  {
    date: "Março 2025",
    title: "Lança «Malongui da Minha Avó»",
    text: "Apresentação na Mediateca de Luanda, a 29 de março, com 170 exemplares vendidos no próprio dia.",
  },
  {
    date: "2025",
    title: "Funda a VEUMA",
    text: "Projeto de desenvolvimento social e empresarial que trabalha marca pessoal, soft skills e comunicação corporativa.",
  },
  {
    date: "Setembro 2025",
    title: "Diretora da Women in Tech Angola",
    text: "Angola passa a integrar a rede internacional Women in Tech, com mais de 30 representações em mais de 100 países.",
  },
  {
    date: "Abril 2026",
    title: "100 Personalidades Icónicas de África",
    text: "Distinguida em Lagos, na Nigéria, nos Iconic International Awards.",
  },
  {
    date: "Setembro 2026",
    title: "Balanço do primeiro ano",
    text: "250 mulheres alcançadas e presença no Huambo, Benguela e Lunda Norte. Meta para 2027: chegar a 1.000 mulheres.",
  },
]

export const book = {
  title: "Malongui da Minha Avó",
  subtitle: "O conselho da minha avó",
  text: "Uma obra «pequenina» que carrega herança de sabedoria e cultura: provérbios passados de geração em geração. A capa reúne imagens da avó, da mãe e da autora, símbolo da transmissão de ensinamentos.",
  facts: [
    { label: "Lançamento", value: "29 de março de 2025" },
    { label: "Local", value: "Mediateca de Luanda" },
    { label: "Vendidos no 1.º dia", value: "170 exemplares" },
  ],
}

export const quotes = [
  {
    text: "Defendemos que Angola não é só Luanda. As tecnologias não têm género.",
    source: "Portal de TI, 2025",
  },
  {
    text: "Quero que haja mais mulheres na tecnologia, mais mulheres a reinventarem-se.",
    source: "BANTUMEN, 2025",
  },
]

export const goal = {
  title: "Meta para 2027",
  text: "Que nenhuma jovem angolana deixe de desenvolver o seu potencial tecnológico por causa do lugar onde nasceu.",
  value: "1.000",
  valueLabel: "mulheres alcançadas",
}

export const press = [
  {
    outlet: "Forbes África Lusófona",
    image: "/fotos/artigos/forbes.jpg",
    date: "Set 2026",
    title: "«Que nenhuma jovem angolana deixe de desenvolver o seu potencial tecnológico por causa do lugar onde nasceu»",
    url: "https://forbesafricalusofona.com/que-nenhuma-jovem-angolana-deixe-de-desenvolver-o-seu-potencial-tecnologico-por-causa-do-lugar-onde-nasceu/",
  },
  {
    outlet: "allAfrica / ANGOP",
    date: "Abr 2026",
    title: "L'Angolaise Jaqueline Ngulo honorée au Nigéria",
    url: "https://fr.allafrica.com/stories/202604170384.html",
  },
  {
    outlet: "Chocolate",
    image: "/fotos/artigos/chocolate.png",
    date: "Abr 2026",
    title: "Jaqueline Mabiala Ngulo entre as 100 personalidades mais influentes de África em 2026",
    url: "https://chocolate.co.ao/sociedade/jaquelina-mabiala-ngulo-entre-as-100-personalidades-mais-influentes-de-africa-em-2026/",
  },
  {
    outlet: "BANTUMEN",
    image: "/fotos/artigos/bantumen.png",
    date: "Set 2025",
    title: "Jaqueline Ngulo e o desafio de transformar a Women in Tech Angola em motor de mudança",
    url: "https://www.bantumen.com/en/artigo/jaqueline-ngulo-entrevista/",
  },
  {
    outlet: "Portal de TI",
    image: "/fotos/artigos/pti.avif",
    date: "Set 2025",
    title: "Jaqueline Ngulo nomeada directora da Women in Tech Angola",
    url: "https://pti.ao/jaqueline-ngulo-nomeada-directora-da-women-in-tech-angola/",
  },
]
