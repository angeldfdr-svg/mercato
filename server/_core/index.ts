import dotenv from "dotenv";

// The preview stores managed variables in the development-local dotenv file.
dotenv.config({ path: ".env.development.local" });
dotenv.config();
import { createServer } from "node:http";
import { createApp } from "./app";

async function startServer() {
  const server = createServer();
  const app = await createApp({ server });
  server.on("request", app);
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
