import "dotenv/config";
import { createApp } from "../server/_core/app";

export const config = { api: { bodyParser: false } };

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: any, res: any) {
  const originalPath = req.query?.__path;
  if (typeof originalPath === "string" && originalPath.startsWith("/")) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query ?? {})) {
      if (key === "__path") continue;
      if (Array.isArray(value)) value.forEach(item => query.append(key, String(item)));
      else if (value != null) query.set(key, String(value));
    }
    req.url = `${originalPath}${query.toString() ? `?${query}` : ""}`;
  }
  appPromise ??= createApp({ serveFrontend: false });
  const app = await appPromise;
  return app(req, res);
}
