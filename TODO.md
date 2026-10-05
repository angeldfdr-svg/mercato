# Outcomes — Mercato Marketplace

- [ ] **Experiência inicial profissional e responsiva:** O site deve apresentar uma página inicial dinâmica de marketplace, com hero, proposta de valor, acesso rápido às principais categorias, produtos em evidência e adaptação a computador, tablet e telemóvel.
- [ ] **Descoberta e catálogo:** O site deve permitir navegar por categorias e subcategorias, pesquisar produtos com resultados relevantes, filtrar e ordenar a listagem sem perder o contexto atual.
- [ ] **Detalhe de produto:** Cada produto deve apresentar imagens, preço, descrição, variantes, disponibilidade e uma ação clara para adicionar ao carrinho, com feedback visual após a ação.
- [ ] **Carrinho interativo:** O utilizador deve conseguir abrir o carrinho, atualizar quantidades, remover artigos e consultar um resumo do pedido com subtotal, entrega e total.
- [ ] **Checkout demonstrável:** O fluxo deve permitir avançar do carrinho para uma etapa de checkout com recolha de dados de entrega e uma ação de conclusão, deixando explícito quando a finalização real depende da integração comercial Shopify.
- [ ] **Login e área de conta:** O site deve disponibilizar registo/início de sessão através do Manus OAuth existente, mostrar o estado autenticado, permitir terminar sessão e apresentar uma área de conta com dados do utilizador e espaço para histórico de encomendas.
- [ ] **Estados e feedback:** As interações principais devem ter estados de loading, vazio, erro ou sucesso quando aplicável, incluindo pesquisa sem resultados, carrinho vazio, favorito e confirmação de adição.
- [ ] **Rotas e continuidade:** As páginas `/`, `/shop`, `/product/:slug`, `/account`, `/cart` e `/404` devem estar acessíveis e declaradas em `public/manus-routes.json`, com o servidor `/api/health` preservado.
