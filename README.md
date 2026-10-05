# Mercato — Marketplace

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

## Storefront and production URL

The Portuguese catalogue contains 30 products in 10 categories. Product photography is stored locally in `client/public/products/`; the checkout allowlist in `shared/products.ts` is tested against the storefront catalogue.

Set `APP_URL` to the canonical HTTPS origin in production (for example, `https://loja.example.com`). Vercel's deployment URL is used as a fallback, but an explicit `APP_URL` is recommended for custom domains and keeps Google OAuth callbacks, password-reset links and Stripe return URLs on the trusted domain. Production auth/payment flows fail closed if no trusted public URL is available.

Local account passwords must be 12–128 characters. Auth endpoints have per-IP rate limits and browser mutations require a same-origin `Origin` header. The default rate-limit store is process-local; use a shared store when deploying multiple application instances at scale.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
