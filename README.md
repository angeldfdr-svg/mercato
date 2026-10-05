# Mercato — Marketplace

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

## Storefront and production URL

The Portuguese catalogue contains 120 products across 11 categories, including a new sports category. Every listing has its own local WebP image in `client/public/products/` plus a 640px responsive variant in `client/public/products/640/`; the Stripe checkout allowlist in `shared/products.ts` is tested against the storefront catalogue. Store filters support category, price, color and rating. A stock-availability toggle is intentionally not shown until a real inventory source exists.

Set `APP_URL` to the canonical HTTPS origin in production (for example, `https://loja.example.com`). Vercel's deployment URL is used as a fallback, but an explicit `APP_URL` is recommended for custom domains and keeps password-reset links and Stripe return URLs on the trusted domain. The only account sign-in option is email/password; Google sign-in has been removed. The login page only enables email/password when the database is configured and reports it as unavailable otherwise. Production auth/payment flows fail closed if no trusted public URL is available.

Local account passwords must be 12–128 characters. Auth endpoints have per-IP rate limits and browser mutations require a same-origin `Origin` header. The default rate-limit store is process-local; use a shared store when deploying multiple application instances at scale.

### External service configuration

Copy `.env.example` to `.env` for local development and set production values in the deployment platform's secret manager. Never commit `.env` or live credentials.

- **Database:** `DATABASE_URL` must point to the MySQL database. Apply schema migrations with `pnpm db:migrate` (or `pnpm db:push` while developing), then run `pnpm db:check` to verify connectivity and the auth/payment tables. Email/password accounts and order persistence depend on this database.
- **Password recovery (optional):** set `RESEND_API_KEY` and a verified `AUTH_EMAIL_FROM` sender. Recovery is enabled only when both email settings and the database are present; `/api/auth/providers` reports readiness and the UI disables unavailable actions.
- **Stripe checkout:** use test-mode `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` first. Register `/api/stripe/webhook` with Stripe and forward `checkout.session.completed` (plus asynchronous payment success if enabled). Switch to live keys only after validating checkout, shipping amount, webhook signature, persisted order and cancellation/return URLs on the canonical `APP_URL`.

This sandbox did not contain service credentials, so email delivery, database connectivity and Stripe transactions could not be exercised here. The code reports missing account providers instead of presenting unavailable options as ready; configure secrets and run those end-to-end checks in the deployment environment.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
