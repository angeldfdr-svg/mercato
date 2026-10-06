import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe";
import { handleChatStream } from "../chatStream";
import { registerLocalAuthRoutes } from "./localAuthRoutes";
import { apiRateLimit } from "./rateLimits";
import { isSameOriginMutation } from "./requestOrigin";
import type { Server } from "node:http";

export async function createApp(
  options: { server?: Server; serveFrontend?: boolean } = {}
): Promise<Application> {
  const app = express();
  app.disable("x-powered-by");
  // The preview and production runtimes sit behind a reverse proxy even when
  // the VERCEL flag is not forwarded to the application process.
  app.set("trust proxy", 1);
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    if (process.env.NODE_ENV === "production" && _req.secure) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000");
    }
    next();
  });
  // Stripe requires the exact raw request bytes for signature verification.
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    handleStripeWebhook
  );
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ limit: "64kb", extended: false }));
  app.use((req, res, next) => {
    if (
      !req.path.startsWith("/api/") ||
      ["GET", "HEAD", "OPTIONS"].includes(req.method)
    ) {
      return next();
    }
    if (!isSameOriginMutation(req)) {
      return res.status(403).json({ error: "Origem do pedido não autorizada" });
    }
    return next();
  });
  app.get("/api/health", (_req: Request, res: Response) =>
    res.json({ status: "ok" })
  );
  app.get("/api/platform/config.js", (_req: Request, res: Response) => {
    res
      .set("Cache-Control", "no-store")
      .type("application/javascript")
      .send(publicPlatformScript());
  });
  app.get("/api/chat/stream", handleChatStream);
  registerLocalAuthRoutes(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    apiRateLimit,
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (options.serveFrontend !== false) {
    if (process.env.NODE_ENV === "development") {
      if (!options.server)
        throw new Error("Development app requires an HTTP server");
      await setupVite(app, options.server);
    } else {
      serveStatic(app);
    }
  }
  return app;
}
