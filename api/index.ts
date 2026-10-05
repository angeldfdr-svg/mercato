import "dotenv/config";
import { createApp } from "../server/_core/app";

export const config = { api: { bodyParser: false } };

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: any, res: any) {
  appPromise ??= createApp({ serveFrontend: false });
  const app = await appPromise;
  return app(req, res);
}
