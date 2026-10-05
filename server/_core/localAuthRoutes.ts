import { createHash, randomBytes } from "node:crypto";
import type { Express } from "express";
import * as db from "../db";
import {
  createLocalSession,
  destroyLocalSession,
  finishGoogle,
  hashPassword,
  sendPasswordResetEmail,
  startGoogle,
  verifyPassword,
} from "../localAuth";
import { authRateLimits } from "./rateLimits";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resetMinutes = 30;
const passwordMinLength = 12;
const passwordMaxLength = 128;

function bodyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function bodyPassword(value: unknown) {
  return typeof value === "string" ? value : "";
}

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function validEmail(email: string) {
  return email.length <= 254 && emailPattern.test(email);
}

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", authRateLimits.googleStart, (req, res) => {
    try {
      startGoogle(req, res);
    } catch (error) {
      res.status(503).json({
        error:
          error instanceof Error ? error.message : "Google OAuth indisponível",
      });
    }
  });

  app.get(
    "/api/auth/google/callback",
    authRateLimits.googleCallback,
    async (req, res) => {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      if (!code || !state) {
        return res.status(400).json({ error: "Código Google inválido" });
      }
      try {
        await finishGoogle(req, res, code, state);
      } catch (error) {
        console.error("[Auth] Google callback failed", error);
        return res
          .status(400)
          .json({ error: "Não foi possível concluir o login Google" });
      }
    }
  );

  app.post("/api/auth/register", authRateLimits.register, async (req, res) => {
    const email = bodyString(req.body?.email).toLowerCase();
    const name = bodyString(req.body?.name);
    const password = bodyPassword(req.body?.password);
    if (
      !validEmail(email) ||
      name.length < 2 ||
      name.length > 100 ||
      password.length < passwordMinLength ||
      password.length > passwordMaxLength
    ) {
      return res.status(400).json({
        error: `Indique um nome (2–100 caracteres), email válido e uma password com ${passwordMinLength}–${passwordMaxLength} caracteres`,
      });
    }

    try {
      if (await db.getUserByEmail(email)) {
        return res
          .status(409)
          .json({ error: "Já existe uma conta com este email" });
      }
      const user = await db.createLocalUser({
        openId: `local_${randomBytes(20).toString("hex")}`,
        email,
        name,
        passwordHash: await hashPassword(password),
      });
      if (!user) {
        return res
          .status(500)
          .json({ error: "Não foi possível criar a conta" });
      }
      await createLocalSession(user.id, res, req);
      return res
        .status(201)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      return res.status(500).json({ error: "Não foi possível criar a conta" });
    }
  });

  app.post("/api/auth/login", authRateLimits.login, async (req, res) => {
    const email = bodyString(req.body?.email).toLowerCase();
    const password = bodyPassword(req.body?.password);
    if (
      !validEmail(email) ||
      !password ||
      password.length > passwordMaxLength
    ) {
      return res.status(401).json({ error: "Email ou password incorretos" });
    }
    try {
      const user = await db.getUserByEmail(email);
      if (
        !user?.passwordHash ||
        !(await verifyPassword(password, user.passwordHash))
      ) {
        return res.status(401).json({ error: "Email ou password incorretos" });
      }
      await createLocalSession(user.id, res, req);
      return res.json({
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return res.status(500).json({ error: "Não foi possível iniciar sessão" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      await destroyLocalSession(req, res);
      return res.status(204).end();
    } catch (error) {
      console.error("[Auth] Logout failed", error);
      return res
        .status(500)
        .json({ error: "Não foi possível terminar sessão" });
    }
  });

  app.post(
    "/api/auth/request-password-reset",
    authRateLimits.passwordResetRequest,
    async (req, res) => {
      const email = bodyString(req.body?.email).toLowerCase();
      if (!validEmail(email)) {
        return res.status(400).json({ error: "Indique um email válido" });
      }
      try {
        const user = await db.getUserByEmail(email);
        if (user) {
          const raw = randomBytes(32).toString("base64url");
          try {
            await db.createPasswordResetToken({
              userId: user.id,
              tokenHash: tokenHash(raw),
              expiresAt: new Date(Date.now() + resetMinutes * 60 * 1000),
            });
            await sendPasswordResetEmail(email, raw, req);
          } catch (error) {
            // Keep the response identical for existing and unknown accounts.
            console.error("[Auth] Password reset email failed", error);
          }
        }
        return res.status(202).json({
          message:
            "Se existir uma conta com este email, receberá instruções de recuperação.",
        });
      } catch (error) {
        console.error("[Auth] Password reset request failed", error);
        return res.status(503).json({
          error: "A recuperação de password está temporariamente indisponível.",
        });
      }
    }
  );

  app.post(
    "/api/auth/reset-password",
    authRateLimits.passwordReset,
    async (req, res) => {
      const token = bodyString(req.body?.token);
      const password = bodyPassword(req.body?.password);
      if (
        !token ||
        token.length > 128 ||
        password.length < passwordMinLength ||
        password.length > passwordMaxLength
      ) {
        return res.status(400).json({
          error: `Token inválido ou password não cumpre os requisitos (${passwordMinLength}–${passwordMaxLength} caracteres)`,
        });
      }
      try {
        const row = await db.getPasswordResetToken(tokenHash(token));
        if (!row) {
          return res
            .status(400)
            .json({ error: "Este link expirou ou já foi usado" });
        }
        const passwordHash = await hashPassword(password);
        const consumed = await db.consumePasswordResetToken(
          row.token.id,
          row.user.id,
          passwordHash
        );
        if (!consumed) {
          return res
            .status(400)
            .json({ error: "Este link expirou ou já foi usado" });
        }
        await createLocalSession(row.user.id, res, req);
        return res.json({ message: "Password atualizada" });
      } catch (error) {
        console.error("[Auth] Password reset failed", error);
        return res
          .status(500)
          .json({ error: "Não foi possível atualizar a password" });
      }
    }
  );
}
