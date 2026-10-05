import type { Express, Request, Response } from "express";
import * as db from "../db";
import { createLocalSession, destroyLocalSession, finishGoogle, hashPassword, sendPasswordResetEmail, startGoogle, verifyPassword } from "../localAuth";
import { randomBytes, createHash } from "node:crypto";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resetMinutes = 30;

function bodyString(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function tokenHash(value: string) { return createHash("sha256").update(value).digest("hex"); }

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req, res) => {
    try { startGoogle(req, res); } catch (error) { res.status(503).json({ error: error instanceof Error ? error.message : "Google OAuth indisponível" }); }
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!code || !state) return res.status(400).json({ error: "Código Google inválido" });
    try { await finishGoogle(req, res, code, state); } catch (error) { console.error("[Auth] Google callback failed", error); res.status(400).json({ error: "Não foi possível concluir o login Google" }); }
  });

  app.post("/api/auth/register", async (req, res) => {
    const email = bodyString(req.body?.email).toLowerCase();
    const name = bodyString(req.body?.name);
    const password = bodyString(req.body?.password);
    if (!emailPattern.test(email) || name.length < 2 || password.length < 8) return res.status(400).json({ error: "Indique nome, email válido e uma password com pelo menos 8 caracteres" });
    try {
      if (await db.getUserByEmail(email)) return res.status(409).json({ error: "Já existe uma conta com este email" });
      const user = await db.createLocalUser({ openId: `local_${randomBytes(20).toString("hex")}`, email, name, passwordHash: await hashPassword(password) });
      if (!user) return res.status(500).json({ error: "Não foi possível criar a conta" });
      await createLocalSession(user.id, res, req);
      return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) { console.error("[Auth] Register failed", error); return res.status(500).json({ error: "Não foi possível criar a conta" }); }
  });

  app.post("/api/auth/login", async (req, res) => {
    const email = bodyString(req.body?.email).toLowerCase();
    const password = bodyString(req.body?.password);
    try {
      const user = await db.getUserByEmail(email);
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: "Email ou password incorretos" });
      await createLocalSession(user.id, res, req);
      return res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) { console.error("[Auth] Login failed", error); return res.status(500).json({ error: "Não foi possível iniciar sessão" }); }
  });

  app.post("/api/auth/logout", async (req, res) => { await destroyLocalSession(req, res); res.status(204).end(); });

  app.post("/api/auth/request-password-reset", async (req, res) => {
    const email = bodyString(req.body?.email).toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ error: "Indique um email válido" });
    try {
      const user = await db.getUserByEmail(email);
      if (user) {
        const raw = randomBytes(32).toString("base64url");
        await db.createPasswordResetToken({ userId: user.id, tokenHash: tokenHash(raw), expiresAt: new Date(Date.now() + resetMinutes * 60 * 1000) });
        await sendPasswordResetEmail(email, raw, req);
      }
      return res.status(202).json({ message: "Se existir uma conta com este email, receberá instruções de recuperação." });
    } catch (error) { console.error("[Auth] Password reset email failed", error); return res.status(503).json({ error: "A recuperação de password ainda não está configurada. Contacte o administrador." }); }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const token = bodyString(req.body?.token);
    const password = bodyString(req.body?.password);
    if (!token || password.length < 8) return res.status(400).json({ error: "Token inválido ou password demasiado curta" });
    try {
      const row = await db.getPasswordResetToken(tokenHash(token));
      if (!row) return res.status(400).json({ error: "Este link expirou ou já foi usado" });
      const passwordHash = await hashPassword(password);
      await db.consumePasswordResetToken(row.token.id, row.user.id, passwordHash);
      await createLocalSession(row.user.id, res, req);
      return res.json({ message: "Password atualizada" });
    } catch (error) { console.error("[Auth] Password reset failed", error); return res.status(500).json({ error: "Não foi possível atualizar a password" }); }
  });
}
