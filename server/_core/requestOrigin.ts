import type { Request } from "express";

type OriginRequest = Pick<Request, "get" | "protocol">;

const configuredOriginKeys = [
  "APP_URL",
  "PUBLIC_APP_URL",
  "VERCEL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
] as const;

function parseOrigin(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed || /[\r\n]/.test(trimmed)) {
    throw new Error(`${label} não contém uma origem válida`);
  }
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`${label} não contém uma origem válida`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${label} deve ser uma origem HTTP(S) sem caminho`);
  }
  const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(
    url.hostname.toLowerCase()
  );
  if (url.protocol !== "https:" && !isLocalHost) {
    throw new Error(`${label} tem de usar HTTPS fora do ambiente local`);
  }
  return url.origin;
}

/**
 * Returns the trusted public origin for OAuth callbacks, recovery links and
 * payment redirects. Configured deployment URLs always take precedence over
 * request-controlled Origin/Host headers.
 */
export function resolveAppOrigin(req: OriginRequest) {
  for (const key of configuredOriginKeys) {
    const value = process.env[key]?.trim();
    if (value) return parseOrigin(value, key);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configure APP_URL (ou o domínio Vercel) antes de ativar fluxos de conta e pagamento"
    );
  }

  const host = req.get("host")?.trim();
  if (!host) throw new Error("Origem pública indisponível");
  const protocol = req.protocol.toLowerCase();
  if (protocol !== "http" && protocol !== "https") {
    throw new Error("Protocolo público inválido");
  }
  const requestOrigin = parseOrigin(`${protocol}://${host}`, "Host do pedido");
  const headerOrigin = req.get("origin");
  if (headerOrigin) {
    const suppliedOrigin = parseOrigin(headerOrigin, "Origin do pedido");
    if (suppliedOrigin !== requestOrigin) {
      throw new Error(
        "Origin do pedido não corresponde ao domínio da aplicação"
      );
    }
  }
  return requestOrigin;
}

/**
 * Rejects cross-site browser writes before they reach auth, checkout or other
 * API mutations. Stripe webhooks are mounted earlier with their raw-body parser.
 */
export function isSameOriginMutation(
  req: OriginRequest & Pick<Request, "method">
) {
  const origin = req.get("origin");
  if (!origin) return false;
  try {
    // In the v0 preview, the browser origin can differ from the internal host
    // Express receives after the reverse proxy forwards the request. The
    // browser's Fetch Metadata header still proves the mutation came from the
    // current same-origin document, so accept that verified case before
    // comparing proxy hostnames.
    if (req.get("sec-fetch-site") === "same-origin") return true;
    const suppliedOrigin = parseOrigin(origin, "Origin do pedido");
    const configuredOrigins = configuredOriginKeys
      .map(key => process.env[key]?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value, index) => parseOrigin(value, configuredOriginKeys[index]));

    if (configuredOrigins.includes(suppliedOrigin)) return true;

    // Reverse proxies can expose a public host while Express sees an internal one.
    const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || req.get("host")?.trim();
    if (!host) return false;
    const forwardedProtocol = req
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim()
      .toLowerCase();
    const protocol = forwardedProtocol || req.protocol.toLowerCase();
    return suppliedOrigin === parseOrigin(`${protocol}://${host}`, "Host do pedido");
  } catch {
    return false;
  }
}
