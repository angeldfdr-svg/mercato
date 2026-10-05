export type CheckoutProduct = {
  id: string;
  name: string;
  amountCents: number;
};

/**
 * Server-side checkout allowlist. Keep ids, names and prices in sync with
 * `client/src/data/catalog.ts`; storefront tests verify the two catalogues.
 */
export const checkoutProducts: Record<string, CheckoutProduct> = {
  "luma-01": {
    id: "luma-01",
    name: "Candeeiro de Mesa Luma",
    amountCents: 12900,
  },
  "carry-02": { id: "carry-02", name: "Saco de Lona Carry", amountCents: 6800 },
  "sonic-03": {
    id: "sonic-03",
    name: "Coluna Portátil Sonic",
    amountCents: 9500,
  },
  "arc-04": { id: "arc-04", name: "Poltrona Arc", amountCents: 44900 },
  "mori-05": {
    id: "mori-05",
    name: "Organizador de Secretária Mori",
    amountCents: 4200,
  },
  "sora-06": {
    id: "sora-06",
    name: "Robe de Algodão Sora",
    amountCents: 11500,
  },
  "alba-07": {
    id: "alba-07",
    name: "Jarra de Cerâmica Alba",
    amountCents: 5400,
  },
  "onda-08": { id: "onda-08", name: "Manta de Lã Onda", amountCents: 8900 },
  "nido-09": { id: "nido-09", name: "Mesa de Apoio Nido", amountCents: 18900 },
  "bruma-10": {
    id: "bruma-10",
    name: "Vela Perfumada Bruma",
    amountCents: 3200,
  },
  "nuvem-11": {
    id: "nuvem-11",
    name: "Auscultadores Nuvem",
    amountCents: 13900,
  },
  "dot-12": {
    id: "dot-12",
    name: "Conjunto Teclado e Rato Dot",
    amountCents: 7900,
  },
  "orbit-13": {
    id: "orbit-13",
    name: "Estação de Carregamento Orbit",
    amountCents: 5900,
  },
  "mini-14": {
    id: "mini-14",
    name: "Câmara Instantânea Polaroid 1000",
    amountCents: 11900,
  },
  "nilo-15": { id: "nilo-15", name: "Óculos de Sol Nilo", amountCents: 7400 },
  "campo-16": { id: "campo-16", name: "Relógio Campo", amountCents: 16900 },
  "cora-17": { id: "cora-17", name: "Mochila Cora", amountCents: 12900 },
  "forma-18": { id: "forma-18", name: "Sapatilhas Forma", amountCents: 9800 },
  "pausa-19": {
    id: "pausa-19",
    name: "Tapete de Yoga Pausa",
    amountCents: 3900,
  },
  "fluxo-20": {
    id: "fluxo-20",
    name: "Garrafa Térmica Fluxo",
    amountCents: 3600,
  },
  "origem-21": {
    id: "origem-21",
    name: "Conjunto de Café Origem",
    amountCents: 6800,
  },
  "raiz-22": {
    id: "raiz-22",
    name: "Tábua de Servir Raiz",
    amountCents: 4600,
  },
  "nomada-23": {
    id: "nomada-23",
    name: "Lanterna Nómada",
    amountCents: 7400,
  },
  "field-24": {
    id: "field-24",
    name: "Cadeira Dobrável Field",
    amountCents: 11900,
  },
  "ponto-25": {
    id: "ponto-25",
    name: "Caderno de Linho Ponto",
    amountCents: 2400,
  },
  "linha-26": {
    id: "linha-26",
    name: "Caneta Tinteiro Linha",
    amountCents: 5800,
  },
  "arco-27": {
    id: "arco-27",
    name: "Arco-íris de Madeira",
    amountCents: 3400,
  },
  "sol-28": {
    id: "sol-28",
    name: "Mochila Mini Sol",
    amountCents: 4200,
  },
  "nuvem-pet-29": {
    id: "nuvem-pet-29",
    name: "Cama Pet Nuvem",
    amountCents: 8900,
  },
  "pata-30": {
    id: "pata-30",
    name: "Taças Pata com Suporte",
    amountCents: 3800,
  },
};
