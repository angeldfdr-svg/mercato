export type Category = "Casa" | "Tech" | "Estilo" | "Bem-estar";

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

export const categoryMeta: Array<{ label: string; note: string; tone: string }> = [
  { label: "Casa", note: "Peças para viver melhor", tone: "from-[#d7f64a] to-[#efff9e]" },
  { label: "Tech", note: "Ferramentas que acompanham", tone: "from-[#155eef] to-[#73a1ff]" },
  { label: "Estilo", note: "O essencial, bem escolhido", tone: "from-[#ffc7b8] to-[#ffe1d8]" },
  { label: "Bem-estar", note: "Ritmos mais leves", tone: "from-[#d9d3ff] to-[#f2f0ff]" },
];

const productImage = (asset: string) => `https://files.manuscdn.com/search-media/310519664002014210/P659sEpMrOvmF8bRJ0qhya/${asset}`;

export const products: Product[] = [
  {
    id: "luma-01", slug: "luma-table-lamp", name: "Luma Table Lamp", category: "Casa", subcategory: "Iluminação", price: 129, compareAt: 159, rating: 4.9, reviews: 86, badge: "Best-seller",
    description: "Uma luz de presença com desenho silencioso e um brilho que muda o ambiente.", details: ["Alumínio escovado", "3 níveis de intensidade", "USB-C incluído"], variants: ["Cobalto", "Creme", "Grafite"], color: "Cobalto", image: productImage("HxuzcQGtm4bsEGx7DyaKGT.jpg"), accent: "#d7f64a",
  },
  {
    id: "carry-02", slug: "carry-canvas-tote", name: "Carry Canvas Tote", category: "Estilo", subcategory: "Acessórios", price: 68, rating: 4.8, reviews: 54, badge: "Novo",
    description: "Canvas resistente, bolso certo e espaço para tudo o que merece ir consigo.", details: ["Canvas orgânico", "Alças reforçadas", "Bolso interior"], variants: ["Natural", "Cobalto"], color: "Natural", image: productImage("nANYgiBTvHAM6JtcQiRr9g.jpg"), accent: "#ffc7b8",
  },
  {
    id: "sonic-03", slug: "sonic-mini-speaker", name: "Sonic Mini Speaker", category: "Tech", subcategory: "Áudio", price: 95, compareAt: 119, rating: 4.7, reviews: 112, badge: "-20%",
    description: "Som limpo num corpo pequeno, para levar a banda sonora consigo.", details: ["12 h de bateria", "Bluetooth 5.3", "Resistente a salpicos"], variants: ["Cobalto", "Pérola"], color: "Cobalto", image: productImage("tJ28ttuP7JnD996RPptCDi.jpg"), accent: "#d9d3ff",
  },
  {
    id: "arc-04", slug: "arc-lounge-chair", name: "Arc Lounge Chair", category: "Casa", subcategory: "Mobiliário", price: 449, rating: 4.9, reviews: 31, badge: "Curadoria",
    description: "Curvas generosas e presença escultórica para o canto que pede pausa.", details: ["Tecido bouclé", "Estrutura em carvalho", "Montagem simples"], variants: ["Cobalto", "Areia"], color: "Cobalto", image: productImage("zwvwiPXDLBo9HyKvrYbp7k.jpg"), accent: "#efff9e",
  },
  {
    id: "mori-05", slug: "mori-desk-organizer", name: "Mori Desk Organizer", category: "Tech", subcategory: "Escritório", price: 42, rating: 4.6, reviews: 28,
    description: "Uma base discreta para cabos, cadernos e ideias em movimento.", details: ["Cortiça natural", "Base antiderrapante", "Feito em Portugal"], variants: ["Cortiça", "Cobalto"], color: "Cortiça", image: productImage("jTXBmKgbTTDTuijPpB923k.jpg"), accent: "#d7f64a",
  },
  {
    id: "sora-06", slug: "sora-soft-robe", name: "Sora Soft Robe", category: "Bem-estar", subcategory: "Casa & corpo", price: 115, rating: 4.8, reviews: 42, badge: "Ritual da semana",
    description: "Algodão macio, corte envolvente e a sensação de domingo, todos os dias.", details: ["Algodão 100%", "Lavável à máquina", "Cinto ajustável"], variants: ["Marfim", "Rosa névoa", "Cobalto"], color: "Marfim", image: productImage("tEKroTU87yjdxkC46h3LMX.jpg"), accent: "#ffc7b8",
  },
];

export const featuredProducts = products.slice(0, 4);

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

export function getProduct(slug: string) {
  return products.find(product => product.slug === slug);
}
