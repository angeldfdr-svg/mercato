# Plano — Mercato Marketplace

## Produto

O Mercato será um marketplace dinâmico, profissional e interativo, com descoberta de produtos, navegação por categorias, pesquisa, filtros, detalhe de produto, carrinho, checkout e área de conta. O login usa o fluxo Manus OAuth já fornecido pelo starter. A integração Shopify foi escolhida no Blueprint, mas a ativação ficou bloqueada por `owner_unavailable`; por isso a primeira versão usa catálogo e estado de compra próprios, com uma camada de dados preparada para a integração futura.

## Direção visual

- **Movimento:** editorial commerce contemporâneo, entre uma revista de design e uma loja digital premium.
- **Princípios:** hierarquia tipográfica forte, muito espaço de respiro, contraste alto com cor proprietária, e interações curtas que confirmam cada ação.
- **Filosofia de cor:** fundo marfim para reduzir ruído e criar calor; tinta azul-noite para confiança e legibilidade; azul cobalto como cor de marca proprietária; verde ácido apenas como sinal de descoberta/novidade; coral para estados de atenção.
- **Paradigma de layout:** composição assimétrica com hero dividido, trilho horizontal de categorias, grelha de produtos com cartões de alturas controladas e drawers laterais para carrinho/login, evitando uma página centralizada genérica.
- **Elementos assinatura:** wordmark “M/” construído com duas barras inclinadas; etiquetas de categoria em cápsula; marcador cobalto vertical em preços e estados de stock.
- **Interação:** cada ação importante tem feedback imediato (contador do carrinho, toast, drawer, estado vazio); pesquisa e filtros são client-side e preservam o contexto do utilizador.
- **Animação:** entrada suave de blocos com `fade-up`, hover de produto com zoom leve e deslocamento do preço, drawer com `slide-in`, sem animações contínuas ou decorativas que prejudiquem leitura.
- **Tipografia:** títulos em `Space Grotesk`/`Arial` com peso 700 e tracking negativo; corpo em `DM Sans`/`Arial` com 15–16px; labels em caixa alta com tracking amplo.
- **Essência de marca:** “Uma curadoria viva para comprar melhor, descobrir mais e voltar sempre.” Personalidade: criteriosa, calorosa, ágil.
- **Voz:** headlines diretas e convidativas; CTAs com verbo e benefício. Exemplos: “Encontre o que fica.” / “Adicionar ao saco”.
- **Wordmark/logo:** monograma `M/` dentro de um quadrado cobalto, acompanhado do nome Mercato em caixa baixa.
- **Cor proprietária:** azul cobalto `#155EEF`.

## Implementação

- **Frontend:** React + Wouter + Tailwind v4, usando componentes UI existentes apenas onde ajudam a acessibilidade; uma página shell responsiva com estados de home, catálogo, detalhe de produto, carrinho e conta.
- **Dados:** catálogo demo local tipado para a primeira experiência, com filtros, ordenação, pesquisa, favoritos e carrinho persistido em `localStorage`. O backend mantém o router tRPC extensível para produtos/encomendas quando a integração comercial estiver disponível.
- **Autenticação:** reaproveitar `useAuth`, `startLogin` e o fluxo OAuth do starter; mostrar login real via Manus OAuth, sem utilizador fictício ou bypass de Preview.
- **Persistência:** acrescentar schema Drizzle para favoritos/encomendas apenas se necessário; na primeira entrega, a experiência de carrinho é client-side e o login fica ligado ao backend fornecido.
- **Rotas:** `/`, `/shop`, `/product/:slug`, `/account`, `/cart`, `/404`; rotas declaradas também em `public/manus-routes.json`.
- **Servidor:** manter `/api/health`, OAuth e tRPC; iniciar com `pnpm dev` na porta 3000.
- **Metadados:** adicionar `app.config.ts` com logo HTTPS durável quando houver um ativo adequado; usar favicon inline/textual na UI até existir URL de logo externa.

## Estrutura principal

- `client/src/App.tsx` — shell de rotas e providers.
- `client/src/pages/Home.tsx` — composição principal e estados de navegação.
- `client/src/data/catalog.ts` — produtos, categorias e recomendações tipadas.
- `client/src/hooks/useCart.ts` — carrinho persistido e ações de quantidade.
- `client/src/index.css` — tokens de marca, responsividade e animações.
- `server/routers.ts` — procedimentos auth e futuros dados de negócio.
- `drizzle/schema.ts` — utilizadores fornecidos e futuras tabelas de domínio.
- `public/manus-routes.json` — manifest completo de páginas do website.
