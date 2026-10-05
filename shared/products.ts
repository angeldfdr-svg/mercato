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

  "arcade-clock-31": {
    id: "arcade-clock-31",
    name: "Relógio de Mesa Arcade",
    amountCents: 5800,
  },
  "serra-cushion-32": {
    id: "serra-cushion-32",
    name: "Almofada Serra",
    amountCents: 4800,
  },
  "halo-floor-lamp-33": {
    id: "halo-floor-lamp-33",
    name: "Candeeiro de Pé Halo",
    amountCents: 21900,
  },
  "aurora-vase-34": {
    id: "aurora-vase-34",
    name: "Vaso Aurora",
    amountCents: 6400,
  },
  "tide-wall-mirror-35": {
    id: "tide-wall-mirror-35",
    name: "Espelho Tide",
    amountCents: 12900,
  },
  "nilo-wood-tray-36": {
    id: "nilo-wood-tray-36",
    name: "Tabuleiro Valet Nilo",
    amountCents: 4200,
  },
  "lume-shelf-37": {
    id: "lume-shelf-37",
    name: "Prateleira Flutuante Lume",
    amountCents: 8400,
  },
  "pulse-earbuds-38": {
    id: "pulse-earbuds-38",
    name: "Auriculares Pulse",
    amountCents: 8900,
  },
  "orbit-powerbank-39": {
    id: "orbit-powerbank-39",
    name: "Powerbank Orbit",
    amountCents: 4900,
  },
  "sonora-radio-40": {
    id: "sonora-radio-40",
    name: "Rádio Portátil Sonora",
    amountCents: 11900,
  },
  "pixel-camera-41": {
    id: "pixel-camera-41",
    name: "Câmara Compacta Pixel",
    amountCents: 28900,
  },
  "flow-keyboard-42": {
    id: "flow-keyboard-42",
    name: "Teclado Mecânico Flow",
    amountCents: 13900,
  },
  "nova-monitor-light-43": {
    id: "nova-monitor-light-43",
    name: "Luz de Monitor Nova",
    amountCents: 6900,
  },
  "shift-mousepad-44": {
    id: "shift-mousepad-44",
    name: "Tapete de Secretária Shift",
    amountCents: 3900,
  },
  "sol-tote-45": {
    id: "sol-tote-45",
    name: "Saco Tote Sol",
    amountCents: 7200,
  },
  "brisa-scarf-46": {
    id: "brisa-scarf-46",
    name: "Lenço Brisa",
    amountCents: 5400,
  },
  "clara-wallet-47": {
    id: "clara-wallet-47",
    name: "Carteira Clara",
    amountCents: 4900,
  },
  "mira-sandals-48": {
    id: "mira-sandals-48",
    name: "Sandálias Mira",
    amountCents: 7900,
  },
  "vento-cap-49": { id: "vento-cap-49", name: "Boné Vento", amountCents: 3500 },
  "lume-earrings-50": {
    id: "lume-earrings-50",
    name: "Brincos Lume",
    amountCents: 4200,
  },
  "norte-belt-51": {
    id: "norte-belt-51",
    name: "Cinto Norte",
    amountCents: 5800,
  },
  "calma-massage-roller-52": {
    id: "calma-massage-roller-52",
    name: "Rolo de Massagem Calma",
    amountCents: 2900,
  },
  "onda-massage-ball-53": {
    id: "onda-massage-ball-53",
    name: "Bola de Massagem Onda",
    amountCents: 1600,
  },
  "brisa-diffuser-54": {
    id: "brisa-diffuser-54",
    name: "Difusor Brisa",
    amountCents: 6900,
  },
  "noite-sleep-mask-55": {
    id: "noite-sleep-mask-55",
    name: "Máscara de Descanso Noite",
    amountCents: 2400,
  },
  "sereno-towels-56": {
    id: "sereno-towels-56",
    name: "Toalhas Sereno",
    amountCents: 4400,
  },
  "ritual-care-kit-57": {
    id: "ritual-care-kit-57",
    name: "Kit de Cuidado Ritual",
    amountCents: 5800,
  },
  "rio-bottle-58": {
    id: "rio-bottle-58",
    name: "Garrafa Rio",
    amountCents: 3200,
  },
  "oliva-oil-set-59": {
    id: "oliva-oil-set-59",
    name: "Galheteiro Oliva",
    amountCents: 2800,
  },
  "mare-plates-60": {
    id: "mare-plates-60",
    name: "Serviço de Pratos Maré",
    amountCents: 8900,
  },
  "serra-chef-knife-61": {
    id: "serra-chef-knife-61",
    name: "Faca de Chef Serra",
    amountCents: 7200,
  },
  "vela-kettle-62": {
    id: "vela-kettle-62",
    name: "Chaleira Vela",
    amountCents: 9400,
  },
  "grao-pantry-jars-63": {
    id: "grao-pantry-jars-63",
    name: "Frascos de Despensa Grão",
    amountCents: 4800,
  },
  "salina-saltcellar-64": {
    id: "salina-saltcellar-64",
    name: "Saleiro Salina",
    amountCents: 2400,
  },
  "mar-stoneware-mug-65": {
    id: "mar-stoneware-mug-65",
    name: "Chávena de Grés Mar",
    amountCents: 2200,
  },
  "nomada-cooler-66": {
    id: "nomada-cooler-66",
    name: "Saco Térmico Nómada",
    amountCents: 6400,
  },
  "sossegohammock-hammock-67": {
    id: "sossegohammock-hammock-67",
    name: "Rede de Jardim Sossego",
    amountCents: 8900,
  },
  "campo-folding-table-68": {
    id: "campo-folding-table-68",
    name: "Mesa Dobrável Campo",
    amountCents: 9900,
  },
  "pico-travel-mug-69": {
    id: "pico-travel-mug-69",
    name: "Caneca Térmica Pico",
    amountCents: 3600,
  },
  "solis-solar-lantern-70": {
    id: "solis-solar-lantern-70",
    name: "Lanterna Solar Solis",
    amountCents: 5600,
  },
  "trilho-backpack-71": {
    id: "trilho-backpack-71",
    name: "Mochila Trilho",
    amountCents: 12400,
  },
  "serra-trekking-poles-72": {
    id: "serra-trekking-poles-72",
    name: "Bastões de Caminhada Serra",
    amountCents: 7900,
  },
  "serra-weekly-planner-73": {
    id: "serra-weekly-planner-73",
    name: "Agenda Semanal Serra",
    amountCents: 3200,
  },
  "salvia-notepad-74": {
    id: "salvia-notepad-74",
    name: "Bloco de Notas Sálvia",
    amountCents: 1200,
  },
  "grafite-pencil-set-75": {
    id: "grafite-pencil-set-75",
    name: "Conjunto de Lápis Grafite",
    amountCents: 1800,
  },
  "tempo-desk-calendar-76": {
    id: "tempo-desk-calendar-76",
    name: "Calendário de Mesa Tempo",
    amountCents: 2200,
  },
  "atelier-sketchbook-77": {
    id: "atelier-sketchbook-77",
    name: "Caderno de Desenho Atelier",
    amountCents: 2900,
  },
  "organic-paperclips-78": {
    id: "organic-paperclips-78",
    name: "Clips Orgânicos",
    amountCents: 900,
  },
  "risco-letter-opener-79": {
    id: "risco-letter-opener-79",
    name: "Abre-cartas Risco",
    amountCents: 2600,
  },
  "arco-wooden-blocks-80": {
    id: "arco-wooden-blocks-80",
    name: "Blocos de Madeira Arco",
    amountCents: 4400,
  },
  "fofo-fox-plush-81": {
    id: "fofo-fox-plush-81",
    name: "Raposa de Peluche Fofo",
    amountCents: 2900,
  },
  "mini-raincoat-82": {
    id: "mini-raincoat-82",
    name: "Capa de Chuva Mini Chuva",
    amountCents: 3900,
  },
  "mini-lunchbox-83": {
    id: "mini-lunchbox-83",
    name: "Marmita Mini Lanche",
    amountCents: 2800,
  },
  "bosque-picture-book-84": {
    id: "bosque-picture-book-84",
    name: "Livro Ilustrado Bosque",
    amountCents: 1800,
  },
  "mar-wood-puzzle-85": {
    id: "mar-wood-puzzle-85",
    name: "Puzzle de Madeira Mar",
    amountCents: 2400,
  },
  "balance-stones-86": {
    id: "balance-stones-86",
    name: "Pedras de Equilíbrio",
    amountCents: 3400,
  },
  "norte-dog-leash-87": {
    id: "norte-dog-leash-87",
    name: "Trela Norte",
    amountCents: 2900,
  },
  "gato-ninho-scratcher-88": {
    id: "gato-ninho-scratcher-88",
    name: "Arranhador Gato Ninho",
    amountCents: 6900,
  },
  "trilha-pet-carrier-89": {
    id: "trilha-pet-carrier-89",
    name: "Transportadora Pet Trilha",
    amountCents: 8900,
  },
  "pelo-grooming-brush-90": {
    id: "pelo-grooming-brush-90",
    name: "Escova de Pelagem Pêlo",
    amountCents: 1600,
  },
  "pata-treat-jar-91": {
    id: "pata-treat-jar-91",
    name: "Pote de Petiscos Pata",
    amountCents: 2400,
  },
  "serra-pet-collar-92": {
    id: "serra-pet-collar-92",
    name: "Coleira Serra",
    amountCents: 2200,
  },
  "gota-pet-bottle-93": {
    id: "gota-pet-bottle-93",
    name: "Garrafa Portátil Pet Gota",
    amountCents: 1800,
  },
  "pico-monitor-stand-94": {
    id: "pico-monitor-stand-94",
    name: "Suporte de Monitor Pico",
    amountCents: 7900,
  },
  "vale-deskmat-95": {
    id: "vale-deskmat-95",
    name: "Deskmat Vale",
    amountCents: 3900,
  },
  "linha-pen-holder-96": {
    id: "linha-pen-holder-96",
    name: "Porta-canetas Linha",
    amountCents: 2400,
  },
  "campo-task-lamp-97": {
    id: "campo-task-lamp-97",
    name: "Candeeiro de Secretária Campo",
    amountCents: 9900,
  },
  "alto-monitor-riser-98": {
    id: "alto-monitor-riser-98",
    name: "Suporte de Monitor Alto Nível",
    amountCents: 6900,
  },
  "nuvem-cable-kit-99": {
    id: "nuvem-cable-kit-99",
    name: "Kit de Cabos Nuvem",
    amountCents: 1900,
  },
  "lado-drawer-tray-100": {
    id: "lado-drawer-tray-100",
    name: "Organizador de Gaveta Lado",
    amountCents: 3400,
  },
  "mira-planter-101": {
    id: "mira-planter-101",
    name: "Vaso Jardineira Mira",
    amountCents: 5800,
  },
  "nook-bookends-102": {
    id: "nook-bookends-102",
    name: "Suportes de Livros Nook",
    amountCents: 4900,
  },
  "duna-table-runner-103": {
    id: "duna-table-runner-103",
    name: "Caminho de Mesa Duna",
    amountCents: 6400,
  },
  "halo-mini-projector-104": {
    id: "halo-mini-projector-104",
    name: "Projetor Portátil Halo",
    amountCents: 24900,
  },
  "orbit-alarm-clock-105": {
    id: "orbit-alarm-clock-105",
    name: "Despertador Luminoso Orbit",
    amountCents: 8900,
  },
  "axis-webcam-106": {
    id: "axis-webcam-106",
    name: "Câmara Web Axis",
    amountCents: 7900,
  },
  "maia-crossbody-107": {
    id: "maia-crossbody-107",
    name: "Carteira a Tiracolo Maia",
    amountCents: 13800,
  },
  "costa-leather-belt-108": {
    id: "costa-leather-belt-108",
    name: "Cinto de Pele Costa",
    amountCents: 6200,
  },
  "onda-sunglasses-109": {
    id: "onda-sunglasses-109",
    name: "Óculos de Sol Onda",
    amountCents: 9400,
  },
  "sereno-eye-mask-110": {
    id: "sereno-eye-mask-110",
    name: "Máscara de Dormir Sereno",
    amountCents: 2900,
  },
  "vento-running-shoes-111": {
    id: "vento-running-shoes-111",
    name: "Ténis de Corrida Vento",
    amountCents: 11900,
  },
  "pace-sports-watch-112": {
    id: "pace-sports-watch-112",
    name: "Relógio Desportivo Pace",
    amountCents: 18900,
  },
  "lume-dumbbell-set-113": {
    id: "lume-dumbbell-set-113",
    name: "Conjunto de Halteres Lume",
    amountCents: 7900,
  },
  "eixo-resistance-bands-114": {
    id: "eixo-resistance-bands-114",
    name: "Bandas de Resistência Eixo",
    amountCents: 2400,
  },
  "rally-padel-racket-115": {
    id: "rally-padel-racket-115",
    name: "Raquete de Padel Rally",
    amountCents: 14900,
  },
  "mare-swim-goggles-116": {
    id: "mare-swim-goggles-116",
    name: "Óculos de Natação Maré",
    amountCents: 3800,
  },
  "vento-cycling-helmet-117": {
    id: "vento-cycling-helmet-117",
    name: "Capacete de Ciclismo Vento",
    amountCents: 10900,
  },
  "trilho-running-vest-118": {
    id: "trilho-running-vest-118",
    name: "Colete de Hidratação Trilho",
    amountCents: 9800,
  },
  "ritmo-jump-rope-119": {
    id: "ritmo-jump-rope-119",
    name: "Corda de Saltar Ritmo",
    amountCents: 2400,
  },
  "terra-yoga-blocks-120": {
    id: "terra-yoga-blocks-120",
    name: "Blocos de Yoga Terra",
    amountCents: 2800,
  },
};
