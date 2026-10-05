export type Category =
  | "Casa"
  | "Tech"
  | "Estilo"
  | "Bem-estar"
  | "Cozinha"
  | "Outdoor"
  | "Papelaria"
  | "Crianças"
  | "Animais"
  | "Escritório";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  details: string[];
  variants: string[];
  color: string;
  image: string;
  accent: string;
};

export const categoryMeta: Array<{
  label: Category;
  note: string;
  tone: string;
  symbol: string;
}> = [
  {
    label: "Casa",
    note: "Peças para viver melhor",
    tone: "from-[#d7f64a] to-[#efff9e]",
    symbol: "⌂",
  },
  {
    label: "Tech",
    note: "Ferramentas que acompanham",
    tone: "from-[#155eef] to-[#73a1ff]",
    symbol: "↗",
  },
  {
    label: "Estilo",
    note: "O essencial, bem escolhido",
    tone: "from-[#ffc7b8] to-[#ffe1d8]",
    symbol: "✳",
  },
  {
    label: "Bem-estar",
    note: "Ritmos mais leves",
    tone: "from-[#d9d3ff] to-[#f2f0ff]",
    symbol: "≈",
  },
  {
    label: "Cozinha",
    note: "Rituais para a mesa",
    tone: "from-[#f4d9b2] to-[#fff1d6]",
    symbol: "◒",
  },
  {
    label: "Outdoor",
    note: "Lá fora, com conforto",
    tone: "from-[#b9d8bb] to-[#e6f0d8]",
    symbol: "⌁",
  },
  {
    label: "Papelaria",
    note: "Ideias que ganham forma",
    tone: "from-[#c9e4df] to-[#eff7eb]",
    symbol: "✎",
  },
  {
    label: "Crianças",
    note: "Pequenas grandes descobertas",
    tone: "from-[#ffcbb8] to-[#fff0ce]",
    symbol: "✦",
  },
  {
    label: "Animais",
    note: "Conforto para toda a família",
    tone: "from-[#e2d6f2] to-[#f6f1fa]",
    symbol: "♡",
  },
  {
    label: "Escritório",
    note: "Mais espaço para as ideias",
    tone: "from-[#c5dcf1] to-[#edf5fb]",
    symbol: "▤",
  },
];

const productImage = (asset: string) => `/products/${asset}.webp`;

export const products: Product[] = [
  {
    id: "luma-01",
    slug: "luma-table-lamp",
    name: "Candeeiro de Mesa Luma",
    category: "Casa",
    subcategory: "Iluminação",
    price: 129,
    compareAt: 159,
    rating: 4.9,
    reviews: 86,
    badge: "Mais vendido",
    description:
      "Uma luz de presença com desenho silencioso e um brilho que transforma o ambiente.",
    details: [
      "Alumínio escovado",
      "3 níveis de intensidade",
      "Cabo USB-C incluído",
    ],
    variants: ["Azul-cobalto", "Creme", "Grafite"],
    color: "Azul-cobalto",
    image: productImage("luma-table-lamp"),
    accent: "#eee1c5",
  },
  {
    id: "carry-02",
    slug: "carry-canvas-tote",
    name: "Saco de Lona Carry",
    category: "Estilo",
    subcategory: "Bolsas e acessórios",
    price: 68,
    rating: 4.8,
    reviews: 54,
    badge: "Novo",
    description:
      "Lona resistente, bolso no sítio certo e espaço para tudo o que merece ir consigo.",
    details: [
      "Lona de algodão resistente",
      "Alças reforçadas",
      "Bolso interior",
    ],
    variants: ["Natural", "Terracota"],
    color: "Natural",
    image: productImage("carry-canvas-tote"),
    accent: "#f4d9ca",
  },
  {
    id: "sonic-03",
    slug: "sonic-mini-speaker",
    name: "Coluna Portátil Sonic",
    category: "Tech",
    subcategory: "Áudio",
    price: 95,
    compareAt: 119,
    rating: 4.7,
    reviews: 112,
    badge: "-20%",
    description:
      "Som limpo num corpo pequeno, para levar a banda sonora consigo.",
    details: [
      "Até 12 horas de bateria",
      "Bluetooth 5.3",
      "Resistente a salpicos",
    ],
    variants: ["Azul-cobalto", "Pérola"],
    color: "Azul-cobalto",
    image: productImage("sonic-mini-speaker"),
    accent: "#e3e0fb",
  },
  {
    id: "arc-04",
    slug: "arc-lounge-chair",
    name: "Poltrona Arc",
    category: "Casa",
    subcategory: "Mobiliário",
    price: 449,
    rating: 4.9,
    reviews: 31,
    badge: "Curadoria",
    description:
      "Curvas generosas e presença escultórica para aquele canto que pede uma pausa.",
    details: ["Estofos em bouclé", "Estrutura em carvalho", "Montagem simples"],
    variants: ["Azul-cobalto", "Areia"],
    color: "Azul-cobalto",
    image: productImage("arc-lounge-chair"),
    accent: "#e9e6d8",
  },
  {
    id: "mori-05",
    slug: "mori-desk-organizer",
    name: "Organizador de Secretária Mori",
    category: "Escritório",
    subcategory: "Organização",
    price: 42,
    rating: 4.6,
    reviews: 28,
    description:
      "Uma base discreta para cabos, cadernos e ideias em movimento.",
    details: [
      "Cortiça natural",
      "Base antiderrapante",
      "Produzido em Portugal",
    ],
    variants: ["Cortiça", "Carvalho"],
    color: "Cortiça",
    image: productImage("mori-desk-organizer"),
    accent: "#e6d3b5",
  },
  {
    id: "sora-06",
    slug: "sora-soft-robe",
    name: "Robe de Algodão Sora",
    category: "Bem-estar",
    subcategory: "Descanso",
    price: 115,
    rating: 4.8,
    reviews: 42,
    badge: "Ritual da semana",
    description:
      "Algodão macio, corte envolvente e a sensação de domingo, em qualquer dia da semana.",
    details: ["Algodão 100%", "Lavável à máquina", "Cinto ajustável"],
    variants: ["Marfim", "Rosa névoa", "Verde-sálvia"],
    color: "Marfim",
    image: productImage("sora-soft-robe"),
    accent: "#f0dce0",
  },
  {
    id: "alba-07",
    slug: "jarra-ceramica-alba",
    name: "Jarra de Cerâmica Alba",
    category: "Casa",
    subcategory: "Decoração",
    price: 54,
    rating: 4.8,
    reviews: 19,
    badge: "Feito à mão",
    description:
      "Cerâmica de toque mate e uma forma orgânica que fica bem com ou sem flores.",
    details: [
      "Cerâmica vidrada à mão",
      "Cada peça é única",
      "Fabricada em Portugal",
    ],
    variants: ["Marfim e terracota", "Areia"],
    color: "Marfim e terracota",
    image: productImage("jarra-ceramica-alba"),
    accent: "#e7d6c2",
  },
  {
    id: "onda-08",
    slug: "manta-onda",
    name: "Manta de Lã Onda",
    category: "Casa",
    subcategory: "Têxteis",
    price: 89,
    rating: 4.9,
    reviews: 23,
    description:
      "Uma camada de calor leve, tecida em lã macia para tardes que pedem ficar.",
    details: [
      "Lã de origem responsável",
      "Franja tecida à mão",
      "Lavagem delicada",
    ],
    variants: ["Areia e azul", "Cinza-pedra"],
    color: "Areia e azul",
    image: productImage("manta-onda"),
    accent: "#e8dfd1",
  },
  {
    id: "nido-09",
    slug: "mesa-de-apoio-nido",
    name: "Mesa de Apoio Nido",
    category: "Casa",
    subcategory: "Mobiliário",
    price: 189,
    rating: 4.8,
    reviews: 16,
    description:
      "Carvalho maciço e uma silhueta suave para ter o essencial sempre por perto.",
    details: [
      "Carvalho maciço",
      "Acabamento com óleo natural",
      "Montagem sem ferramentas",
    ],
    variants: ["Carvalho", "Nogal"],
    color: "Carvalho",
    image: productImage("mesa-de-apoio-nido"),
    accent: "#d9e2e4",
  },
  {
    id: "bruma-10",
    slug: "vela-perfumada-bruma",
    name: "Vela Perfumada Bruma",
    category: "Casa",
    subcategory: "Aromas",
    price: 32,
    rating: 4.7,
    reviews: 37,
    badge: "Favorito",
    description:
      "Notas quentes de figo e madeira para abrandar o ritmo ao fim do dia.",
    details: [
      "Cera vegetal",
      "Queima até 40 horas",
      "Copo de vidro reutilizável",
    ],
    variants: ["Figo e cedro", "Flor de laranjeira"],
    color: "Figo e cedro",
    image: productImage("vela-perfumada-bruma"),
    accent: "#ded2cf",
  },
  {
    id: "nuvem-11",
    slug: "auscultadores-nuvem",
    name: "Auscultadores Nuvem",
    category: "Tech",
    subcategory: "Áudio",
    price: 139,
    rating: 4.8,
    reviews: 26,
    badge: "Novo",
    description:
      "Som envolvente e conforto leve para trabalhar, viajar ou simplesmente desligar.",
    details: [
      "Bluetooth sem fios",
      "Até 30 horas de autonomia",
      "Almofadas macias",
    ],
    variants: ["Grafite", "Areia"],
    color: "Grafite",
    image: productImage("auscultadores-nuvem"),
    accent: "#f07c36",
  },
  {
    id: "dot-12",
    slug: "teclado-dot",
    name: "Conjunto Teclado e Rato Dot",
    category: "Escritório",
    subcategory: "Periféricos",
    price: 79,
    rating: 4.6,
    reviews: 34,
    description:
      "Teclas arredondadas, perfil silencioso e rato a condizer para uma secretária mais leve.",
    details: ["Ligação sem fios", "Layout completo", "Rato incluído"],
    variants: ["Marfim", "Rosa-pálido"],
    color: "Marfim",
    image: productImage("teclado-dot"),
    accent: "#f0e5d4",
  },
  {
    id: "orbit-13",
    slug: "estacao-carregamento-orbit",
    name: "Estação de Carregamento Orbit",
    category: "Tech",
    subcategory: "Acessórios",
    price: 59,
    rating: 4.7,
    reviews: 21,
    description:
      "Carrega o telemóvel sem fios e mantém os pequenos essenciais organizados no mesmo sítio.",
    details: [
      "Carregamento sem fios Qi",
      "Suporte vertical",
      "Tabuleiro em madeira",
    ],
    variants: ["Nogueira", "Carvalho claro"],
    color: "Nogueira",
    image: productImage("carregador-orbit"),
    accent: "#e8dfd4",
  },
  {
    id: "mini-14",
    slug: "polaroid-1000",
    name: "Câmara Instantânea Polaroid 1000",
    category: "Tech",
    subcategory: "Fotografia",
    price: 119,
    rating: 4.8,
    reviews: 29,
    badge: "Novo",
    description:
      "Imprima os momentos bons no instante em que acontecem e dê-lhes um lugar em casa.",
    details: [
      "Impressão instantânea",
      "Flash automático",
      "Espelho para autorretratos",
    ],
    variants: ["Marfim", "Preto"],
    color: "Marfim",
    image: productImage("camara-instantanea-mini"),
    accent: "#d7eef0",
  },
  {
    id: "nilo-15",
    slug: "oculos-sol-nilo",
    name: "Óculos de Sol Nilo",
    category: "Estilo",
    subcategory: "Acessórios",
    price: 74,
    rating: 4.7,
    reviews: 18,
    description:
      "Uma armação clássica em acetato e lentes com proteção para dias luminosos.",
    details: ["Armação em acetato", "Proteção UV400", "Estojo rígido incluído"],
    variants: ["Tartaruga", "Preto"],
    color: "Tartaruga",
    image: productImage("oculos-sol-nilo"),
    accent: "#f3d49f",
  },
  {
    id: "campo-16",
    slug: "relogio-campo",
    name: "Relógio Campo",
    category: "Estilo",
    subcategory: "Relógios",
    price: 169,
    rating: 4.8,
    reviews: 17,
    description:
      "Um mostrador verde profundo, linhas simples e uma bracelete em aço para usar todos os dias.",
    details: [
      "Movimento de quartzo",
      "Caixa em aço inoxidável",
      "Resistente a salpicos",
    ],
    variants: ["Verde-oliva", "Prateado"],
    color: "Verde-oliva",
    image: productImage("relogio-campo"),
    accent: "#e5ded0",
  },
  {
    id: "cora-17",
    slug: "mochila-cora",
    name: "Mochila Cora",
    category: "Estilo",
    subcategory: "Bolsas",
    price: 129,
    rating: 4.8,
    reviews: 24,
    badge: "Curadoria",
    description:
      "Lona robusta, bolsos de acesso rápido e espaço para acompanhar a cidade inteira.",
    details: [
      "Lona de algodão",
      "Compartimento acolchoado",
      "Alças ajustáveis",
    ],
    variants: ["Caqui", "Caramelo"],
    color: "Caqui",
    image: productImage("mochila-cora"),
    accent: "#d6c3a7",
  },
  {
    id: "forma-18",
    slug: "sapatilhas-forma",
    name: "Sapatilhas Forma",
    category: "Estilo",
    subcategory: "Calçado",
    price: 98,
    rating: 4.7,
    reviews: 32,
    description:
      "Malha respirável e uma sola leve para dias longos, sem abdicar do conforto.",
    details: ["Malha respirável", "Sola leve e flexível", "Palmilha removível"],
    variants: ["37", "38", "39", "40", "41"],
    color: "Marfim",
    image: productImage("sapatilhas-forma"),
    accent: "#e6eadc",
  },
  {
    id: "pausa-19",
    slug: "tapete-yoga-pausa",
    name: "Tapete de Yoga Pausa",
    category: "Bem-estar",
    subcategory: "Movimento",
    price: 39,
    rating: 4.9,
    reviews: 45,
    badge: "Mais vendido",
    description:
      "Textura natural, aderência confortável e espaço para encontrar o seu ritmo.",
    details: [
      "Superfície em juta natural",
      "Base antiderrapante",
      "Inclui fita de transporte",
    ],
    variants: ["4 mm", "6 mm"],
    color: "Juta natural",
    image: productImage("tapete-yoga-pausa"),
    accent: "#e8dfd1",
  },
  {
    id: "fluxo-20",
    slug: "garrafa-termica-fluxo",
    name: "Garrafa Térmica Fluxo",
    category: "Bem-estar",
    subcategory: "Hidratação",
    price: 36,
    rating: 4.8,
    reviews: 39,
    description:
      "Aço inoxidável com isolamento térmico e um padrão ondulado inspirado no mar.",
    details: ["Aço inoxidável", "Mantém frio até 24 horas", "Tampa hermética"],
    variants: ["Azul-onda", "Areia"],
    color: "Azul-onda",
    image: productImage("garrafa-termica-fluxo"),
    accent: "#e6d9ce",
  },
  {
    id: "origem-21",
    slug: "kit-cafe-origem",
    name: "Conjunto de Café Origem",
    category: "Cozinha",
    subcategory: "Café e chá",
    price: 68,
    rating: 4.9,
    reviews: 18,
    badge: "Novo",
    description:
      "Dripper, jarro e chávena em cerâmica e vidro para transformar o café da manhã num ritual tranquilo.",
    details: [
      "Dripper em cerâmica vidrada",
      "Jarro de vidro borossilicato",
      "Chávena a condizer incluída",
    ],
    variants: ["Verde-sálvia", "Areia"],
    color: "Verde-sálvia",
    image: productImage("cafe-origem"),
    accent: "#dde8d4",
  },
  {
    id: "raiz-22",
    slug: "tabua-de-servir-raiz",
    name: "Tábua de Servir Raiz",
    category: "Cozinha",
    subcategory: "Mesa posta",
    price: 46,
    rating: 4.8,
    reviews: 12,
    description:
      "Carvalho de grão marcado, formas suaves e um toque de couro para servir devagar e partilhar melhor.",
    details: [
      "Carvalho maciço",
      "Acabamento com óleo alimentar",
      "Argola de couro para pendurar",
    ],
    variants: ["Carvalho", "Nogueira"],
    color: "Carvalho",
    image: productImage("tabua-raiz"),
    accent: "#ead7c0",
  },
  {
    id: "nomada-23",
    slug: "lanterna-nomada",
    name: "Lanterna Nómada",
    category: "Outdoor",
    subcategory: "Iluminação exterior",
    price: 74,
    rating: 4.8,
    reviews: 16,
    badge: "Novo",
    description:
      "Uma luz quente e portátil, pronta para noites longas no jardim, no parque ou no próximo acampamento.",
    details: [
      "Bateria recarregável por USB-C",
      "Até 20 horas de autonomia",
      "Brilho regulável e pega integrada",
    ],
    variants: ["Verde-floresta", "Areia"],
    color: "Verde-floresta",
    image: productImage("lanterna-nomada"),
    accent: "#d8e2d5",
  },
  {
    id: "field-24",
    slug: "cadeira-dobravel-field",
    name: "Cadeira Dobrável Field",
    category: "Outdoor",
    subcategory: "Campismo",
    price: 119,
    rating: 4.7,
    reviews: 9,
    description:
      "Estrutura leve e lona robusta para levar um lugar confortável para onde o dia o levar.",
    details: [
      "Estrutura em alumínio leve",
      "Lona resistente e lavável",
      "Dobra compacta com bolsa incluída",
    ],
    variants: ["Terracota", "Verde-oliva"],
    color: "Terracota",
    image: productImage("cadeira-field"),
    accent: "#e7d7ce",
  },
  {
    id: "ponto-25",
    slug: "caderno-de-linho-ponto",
    name: "Caderno de Linho Ponto",
    category: "Papelaria",
    subcategory: "Cadernos",
    price: 24,
    rating: 4.9,
    reviews: 37,
    badge: "Novo",
    description:
      "Uma capa de linho natural e páginas suaves para guardar planos, listas e ideias ainda sem nome.",
    details: [
      "Capa rígida revestida a linho",
      "192 páginas marfim sem pauta",
      "Papel certificado FSC",
    ],
    variants: ["Linho natural", "Verde-sálvia"],
    color: "Linho natural",
    image: productImage("caderno-linho"),
    accent: "#e8e2d8",
  },
  {
    id: "linha-26",
    slug: "caneta-tinteiro-linha",
    name: "Caneta Tinteiro Linha",
    category: "Papelaria",
    subcategory: "Escrita",
    price: 58,
    rating: 4.7,
    reviews: 14,
    description:
      "Uma linha simples, equilíbrio confortável e uma ponta macia para tornar cada nota mais pessoal.",
    details: [
      "Ponta em aço inoxidável",
      "Corpo em resina acetinada",
      "Conversor e estojo incluídos",
    ],
    variants: ["Azul-noite", "Verde-floresta"],
    color: "Azul-noite",
    image: productImage("caneta-linha"),
    accent: "#dce1e8",
  },
  {
    id: "arco-27",
    slug: "arco-iris-de-madeira",
    name: "Arco-íris de Madeira",
    category: "Crianças",
    subcategory: "Brinquedos de madeira",
    price: 34,
    rating: 4.9,
    reviews: 22,
    badge: "Favorito",
    description:
      "Arcos coloridos que convidam a empilhar, construir e inventar uma história diferente todos os dias.",
    details: [
      "Madeira de faia certificada",
      "Tintas à base de água",
      "Adequado a partir dos 18 meses",
    ],
    variants: ["Cores suaves", "Tons naturais"],
    color: "Cores suaves",
    image: productImage("arco-madeira"),
    accent: "#f0dfc9",
  },
  {
    id: "sol-28",
    slug: "mochila-mini-sol",
    name: "Mochila Mini Sol",
    category: "Crianças",
    subcategory: "Mochilas",
    price: 42,
    rating: 4.8,
    reviews: 11,
    badge: "Novo",
    description:
      "Pequena no tamanho, grande nas aventuras: espaço para o lanche, o livro favorito e mais uma descoberta.",
    details: [
      "Lona de algodão resistente à água",
      "Alças acolchoadas ajustáveis",
      "Bolso frontal com fecho",
    ],
    variants: ["Amarelo-sol", "Verde-sálvia"],
    color: "Amarelo-sol",
    image: productImage("mochila-mini-sol"),
    accent: "#f4e3c8",
  },
  {
    id: "nuvem-pet-29",
    slug: "cama-pet-nuvem",
    name: "Cama Pet Nuvem",
    category: "Animais",
    subcategory: "Camas e descanso",
    price: 89,
    rating: 4.9,
    reviews: 13,
    badge: "Novo",
    description:
      "Bouclé macio, laterais acolchoadas e um lugar seguro para as sestas que também fazem parte da família.",
    details: [
      "Capa removível e lavável",
      "Base antiderrapante",
      "Enchimento de alta densidade",
    ],
    variants: ["Areia", "Cinza-pedra"],
    color: "Areia",
    image: productImage("cama-nuvem-pet"),
    accent: "#e8e0d5",
  },
  {
    id: "pata-30",
    slug: "tacas-pet-pata",
    name: "Taças Pata com Suporte",
    category: "Animais",
    subcategory: "Alimentação",
    price: 38,
    rating: 4.8,
    reviews: 8,
    description:
      "Cerâmica mate e carvalho natural para uma zona de refeição tão bem pensada como o resto da casa.",
    details: [
      "Duas taças de cerâmica",
      "Suporte em carvalho maciço",
      "Taças próprias para máquina de lavar",
    ],
    variants: ["Marfim e sálvia", "Marfim e terracota"],
    color: "Marfim e sálvia",
    image: productImage("tacas-pata"),
    accent: "#e6dccd",
  },
];

export const featuredProducts = products.filter(product =>
  ["luma-01", "origem-21", "nomada-23", "arco-27"].includes(product.id)
);

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function getProduct(slug: string) {
  return products.find(product => product.slug === slug);
}
