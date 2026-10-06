import { createHash, randomBytes } from "node:crypto";
import type { Express } from "express";
import * as db from "../db";
import {
  confirmSupabaseUser,
  createLocalSession,
  destroyLocalSession,
  hashPassword,
  sendPasswordResetEmail,
  setSupabaseSession,
  supabaseAuthRequest,
  SupabaseAuthError,
  SUPABASE_COOKIE,
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

export function getAuthProviderStatus() {
  const supabase = Boolean(
    process.env.SUPABASE_URL?.trim() &&
      (process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
        process.env.SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
  return {
    email: supabase,
    passwordRecovery: supabase,
  };
}

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/auth/providers", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    return res.json(getAuthProviderStatus());
  });

  app.post("/api/auth/register", authRateLimits.register, async (req, res) => {
    if (!getAuthProviderStatus().email) {
      return res.status(503).json({
        error: "A criação de conta está temporariamente indisponível.",
      });
    }
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
      let data = await supabaseAuthRequest("/signup", {
        email,
        password,
        data: { name },
      });

      // The project requires email confirmation by default. Confirm the newly
      // created account server-side, then issue a normal session so the user
      // can continue directly into the app without a dead-end confirmation step.
      if (!data.access_token && data.user?.id) {
        await confirmSupabaseUser(data.user.id);
        data = await supabaseAuthRequest("/token?grant_type=password", {
          email,
          password,
        });
      }
      if (!data.access_token) {
        return res.status(502).json({ error: "Não foi possível iniciar a sessão após criar a conta" });
      }
      setSupabaseSession(data.access_token, res, req);
      return res.status(201).json({ user: data.user ?? null, needsConfirmation: false });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      if (error instanceof SupabaseAuthError) {
        const message =
          error.code === "user_already_exists"
            ? "Já existe uma conta com este email."
            : error.code === "over_email_send_rate_limit" || error.status === 429
              ? "O serviço de email do Supabase atingiu o limite temporário. Tente novamente mais tarde."
              : error.status === 401 || error.status === 403
                ? "O pedido de criação de conta não foi autorizado pelo Supabase. Verifique se o provider Email está ativo."
                : error.status === 422
                  ? error.message
                  : "Não foi possível criar a conta";

        return res.status(error.status >= 400 && error.status < 500 ? error.status : 500).json({ error: message });
      }
      return res.status(500).json({ error: "Não foi possível criar a conta" });
    }
  });

  app.post("/api/auth/login", authRateLimits.login, async (req, res) => {
    if (!getAuthProviderStatus().email) {
      return res.status(503).json({
        error: "O acesso por email está temporariamente indisponível.",
      });
    }
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
      const data = await supabaseAuthRequest("/token?grant_type=password", {
        email,
        password,
      });
      if (!data.access_token) {
        return res.status(401).json({ error: "Email ou password incorretos" });
      }
      setSupabaseSession(data.access_token, res, req);
      return res.json({ user: data.user ?? null });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      if (error instanceof SupabaseAuthError) {
        return res.status(error.status >= 400 && error.status < 500 ? error.status : 500).json({
          error:
            error.status === 401
              ? "Email ou password incorretos, ou a conta ainda não foi confirmada."
              : error.status === 403
                ? "O acesso por email está bloqueado no Supabase. Ative o provider Email."
                : "Não foi possível iniciar sessão",
        });
      }
      return res.status(500).json({ error: "Não foi possível iniciar sessão" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      await destroyLocalSession(req, res);
      res.clearCookie(SUPABASE_COOKIE, { httpOnly: true, sameSite: "lax", secure: req.secure || req.protocol === "https" || process.env.NODE_ENV === "production", path: "/", maxAge: -1 });
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
      if (!getAuthProviderStatus().passwordRecovery) {
        return res.status(503).json({
          error: "A recuperação de password está temporariamente indisponível.",
        });
      }
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
      if (!getAuthProviderStatus().email) {
        return res.status(503).json({
          error: "A recuperação de password está temporariamente indisponível.",
        });
      }
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
