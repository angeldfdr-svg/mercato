# Outcomes — Mercato Marketplace

- [x] **Experiência inicial profissional e responsiva:** O site apresenta uma página inicial dinâmica de marketplace, com hero, proposta de valor, acesso rápido às principais categorias, produtos em evidência e adaptação a computador, tablet e telemóvel.
- [x] **Descoberta e catálogo:** O site permite navegar por categorias e subcategorias, pesquisar produtos com resultados relevantes, filtrar e ordenar a listagem sem perder o contexto atual.
- [x] **Detalhe de produto e imagens:** Cada produto apresenta uma imagem editorial própria, preço, descrição, variantes, disponibilidade e ação clara para adicionar ao carrinho, com feedback visual após a ação.
- [x] **Carrinho interativo:** O utilizador consegue abrir o carrinho, atualizar quantidades, remover artigos e consultar subtotal, entrega e total.
- [x] **Checkout Stripe real:** O checkout cria uma Checkout Session no servidor com preços validados por ID, liga a sessão ao utilizador autenticado, permite códigos promocionais, recolhe a morada no Stripe e abre o pagamento numa nova aba sem expor dados de cartão ao Mercato.
- [x] **Webhook e histórico de encomendas:** O endpoint `/api/stripe/webhook` recebe o body raw, valida `stripe-signature`, reconhece eventos duplicados sem duplicar a encomenda e grava estado/IDs Stripe mínimos; a área de conta lista pagamentos confirmados.
- [x] **Login e área de conta:** O site disponibiliza início de sessão através do Manus OAuth existente, mostra o estado autenticado, permite terminar sessão e apresenta perfil, histórico de pagamentos e acesso à inbox de vendedor para admins.
- [x] **Chat comprador–vendedor:** Um comprador autenticado pode abrir uma conversa associada a um produto, consultar histórico e enviar mensagens; as mensagens são persistidas em MySQL e entregues em tempo real por SSE com polling de fallback.
- [x] **Inbox de vendedor:** Utilizadores com role `admin` podem abrir `/seller/inbox`, ver conversas e responder como vendedor; a resposta aparece no stream do comprador.
- [x] **Estados e feedback:** As interações principais têm estados de loading, vazio, erro ou sucesso quando aplicável, incluindo pesquisa sem resultados, carrinho vazio, favoritos, checkout cancelado e confirmação pendente via webhook.
- [x] **Rotas e continuidade:** As páginas `/`, `/shop`, `/product/:slug`, `/account`, `/cart`, `/seller/inbox` e `/404` estão acessíveis e declaradas em `client/public/manus-routes.json`, com `/api/health` preservado.
- [ ] **PayPal opcional:** PayPal permanece como provider futuro; para o ativar será necessário escolher a política de pagamentos multi-provider e fornecer/configurar as credenciais PayPal através do fluxo protegido.

- [x] **Autenticação própria no código:** O projeto inclui registo e login por email/password com hash scrypt, sessões próprias persistidas, logout e compatibilidade de fallback com o login Manus existente.
- [x] **Google OAuth no código:** Existem endpoints de início/callback, state protegido por cookie, validação de email verificado e ligação de contas Google existentes por email.
- [x] **Recuperação de password no código:** Existe pedido de reset com resposta anti-enumeração, token único com expiração de 30 minutos, email Resend e definição de nova password.
- [ ] **Ativação de Google e recuperação por email:** É necessário autorizar no cartão protegido os valores `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY` e `AUTH_EMAIL_FROM`; o cartão foi cancelado nesta sessão e não foi reaberto.
