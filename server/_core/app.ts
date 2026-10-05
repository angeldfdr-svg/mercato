import express, { type Application, type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe";
import { handleChatStream } from "../chatStream";
import { registerLocalAuthRoutes } from "./localAuthRoutes";
import type { Server } from "node:http";

export async function createApp(options: { server?: Server; serveFrontend?: boolean } = {}): Promise<Application> {
  const app = express();
  // Stripe requires the exact raw request bytes for signature verification.
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req: Request, res: Response) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req: Request, res: Response) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.get("/api/chat/stream", handleChatStream);
  registerLocalAuthRoutes(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (options.serveFrontend !== false) {
    if (process.env.NODE_ENV === "development") {
      if (!options.server) throw new Error("Development app requires an HTTP server");
      await setupVite(app, options.server);
    } else {
      serveStatic(app);
    }
  }
  return app;
}
