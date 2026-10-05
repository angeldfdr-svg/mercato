# Plano — Mercato Marketplace

## Produto e decisão de integração

O Mercato é um marketplace dinâmico, profissional e interativo, com descoberta de produtos, navegação por categorias, pesquisa, filtros, detalhe de produto, carrinho, checkout, área de conta, pagamentos e conversas entre compradores e vendedores. O login usa Manus OAuth. A gateway escolhida para a primeira integração real é **Stripe Checkout**, porque a plataforma fornece as credenciais de teste, webhook assinado e fluxo hospedado seguro. PayPal pode ser acrescentado depois como segundo provider, mas não é ativado nesta entrega.

## Direção visual

- **Movimento:** editorial commerce contemporâneo, entre uma revista de design e uma loja digital premium.
- **Princípios:** hierarquia tipográfica forte, espaço de respiro, contraste alto com cor proprietária e feedback imediato.
- **Filosofia de cor:** marfim para calor, azul-noite para confiança, cobalto como cor própria, verde ácido para descoberta e coral para atenção.
- **Paradigma de layout:** hero assimétrico, trilho horizontal de categorias, grelha editorial de produtos e painéis laterais para carrinho/chat.
- **Elementos assinatura:** monograma `M/`, etiquetas em cápsula e marcador cobalto em preços/stock.
- **Interação/animação:** toast, contador, drawer e estados vazios; fade-up, zoom ligeiro e slide-in sem movimento decorativo excessivo.
- **Tipografia:** Space Grotesk/Arial para títulos; DM Sans/Arial para corpo; labels em caixa alta com tracking amplo.
- **Essência:** “Uma curadoria viva para comprar melhor, descobrir mais e voltar sempre.” Personalidade: criteriosa, calorosa, ágil.
- **Voz:** headlines diretas e CTAs com benefício — “Encontre o que fica.” / “Adicionar ao saco”.
- **Marca:** monograma `M/` em quadrado cobalto; cor proprietária `#155EEF`.

## Implementação entregue

- **Frontend:** React + Wouter + Tailwind v4, shell responsivo, home, catálogo, detalhe, carrinho, conta e inbox.
- **Catálogo/imagens:** catálogo tipado local com uma imagem editorial por produto, variantes, preço, pesquisa, filtros, favoritos e carrinho persistido em `localStorage`.
- **Pagamento:** Checkout Sessions Stripe criadas apenas no servidor a partir de IDs/preços validados; `allow_promotion_codes`, email/identidade do comprador, morada recolhida no Stripe, URLs de retorno e abertura numa nova aba.
- **Webhook/persistência:** `/api/stripe/webhook` preserva o body raw, valida assinatura, deduplica eventos e grava encomendas pagas; a conta mostra histórico de pagamentos.
- **Chat:** conversas por produto guardadas em MySQL/Drizzle, procedimentos tRPC protegidos, stream SSE autenticado com fallback de polling e inbox de vendedor para utilizadores admin em `/seller/inbox`.
- **Autenticação:** `useAuth`, `startLogin` e OAuth real Manus; compradores precisam de sessão para checkout e chat.
- **Rotas:** `/`, `/shop`, `/product/:slug`, `/account`, `/cart`, `/seller/inbox`, `/404`, declaradas em `client/public/manus-routes.json`.
- **Servidor:** `/api/health`, OAuth, tRPC, webhook Stripe e stream de chat; runtime na porta 3000.
- **Metadados:** `app.config.ts` com logo HTTPS durável.

## Estrutura principal

- `client/src/App.tsx` — shell de rotas.
- `client/src/pages/Cart.tsx` — carrinho e Stripe Checkout.
- `client/src/components/ChatPanel.tsx` — chat do comprador.
- `client/src/pages/SellerInbox.tsx` — resposta do vendedor/admin.
- `client/src/data/catalog.ts` — produtos e imagens.
- `shared/products.ts` — preços validados no servidor.
- `server/stripe.ts` — sessão Stripe e webhook assinado.
- `server/chatStream.ts` / `server/realtime.ts` — SSE e eventos do chat.
- `server/routers.ts` / `server/db.ts` — tRPC, persistência e permissões.
- `drizzle/schema.ts` — utilizadores, conversas, mensagens, encomendas e eventos processados.
- `client/src/index.css` — tokens, responsividade e estilos de interação.

## Autenticação própria — implementação

A autenticação própria usa contas locais com password derivada por `scrypt`, sessões aleatórias persistidas em `authSessions` e recuperação por token de utilização única em `passwordResetTokens`. Os emails de recuperação são enviados pelo Resend. As rotas públicas são `/login`, `/reset-password`, `/api/auth/register`, `/api/auth/login`, `/api/auth/providers`, `/api/auth/request-password-reset` e `/api/auth/reset-password`. O início de sessão Google e as respetivas rotas OAuth foram removidos a pedido do utilizador; Google Maps não faz parte do fluxo de autenticação.

A implementação está no código e passa typecheck/build. Para ativar contas locais e pagamentos reais, configure `DATABASE_URL`, `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` no gestor de segredos do deployment. Sem essas credenciais, a interface desativa os fornecedores indisponíveis e as transações reais Stripe não podem ser testadas. Nunca coloque credenciais privadas no código ou em chat.
