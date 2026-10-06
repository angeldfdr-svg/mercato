import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import * as db from "./db";
import { resolveAppOrigin } from "./_core/requestOrigin";
import { jwtVerify } from "jose";
import type { User } from "../drizzle/schema";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "mercato_session";
const SUPABASE_COOKIE = "mercato_supabase_access";
const SESSION_DAYS = 30;
const RESET_MINUTES = 30;

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !key) throw new Error("Supabase não está configurado");
  return { url, key };
}

export class SupabaseAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SupabaseAuthError";
  }
}

export async function supabaseAuthRequest(path: string, body: Record<string, unknown>) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new SupabaseAuthError(
      data.msg ?? data.error_description ?? data.message ?? "Não foi possível autenticar",
      response.status,
      data.error_code ?? data.code,
    );
  }
  return data as { access_token?: string; user?: { id: string; email?: string; user_metadata?: { name?: string } } };
}

export function setSupabaseSession(accessToken: string, res: Response, req: Request) {
  res.cookie(SUPABASE_COOKIE, accessToken, { ...cookieOptions(req), maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000 });
}

export async function authenticateSupabaseRequest(req: Request): Promise<User | null> {
  const token = req.cookies?.[SUPABASE_COOKIE];
  const secret = process.env.SUPABASE_JWT_SECRET?.trim();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    const metadata = payload.user_metadata as { name?: unknown } | undefined;
    const numericId = Number.parseInt(payload.sub.replaceAll(/[^0-9]/g, "").slice(0, 9) || "1", 10) || 1;
    const now = new Date();
    return { id: numericId, openId: payload.sub, name: typeof metadata?.name === "string" ? metadata.name : payload.email.split("@")[0], email: payload.email, loginMethod: "supabase", passwordHash: null, googleId: null, role: "user", createdAt: now, updatedAt: now, lastSignedIn: now };
  } catch { return null; }
}

function requiredSecret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está configurado`);
  return value;
}

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cookieOptions(req: Request) {
  const secure =
    req.secure ||
    req.protocol === "https" ||
    process.env.NODE_ENV === "production";
  return { httpOnly: true, sameSite: "lax" as const, secure, path: "/" };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [, salt, stored] = encoded.split(":");
  if (!salt || !stored) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(stored, "hex");
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

export async function createLocalSession(
  userId: number,
  res: Response,
  req: Request
) {
  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.createAuthSession({ userId, tokenHash: hashToken(raw), expiresAt });
  res.cookie(SESSION_COOKIE, raw, {
    ...cookieOptions(req),
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function authenticateLocalRequest(req: Request) {
  const raw =
    req.cookies?.[SESSION_COOKIE] ??
    req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!raw) return null;
  return db.getUserBySessionToken(hashToken(raw));
}

export async function destroyLocalSession(req: Request, res: Response) {
  const raw =
    req.cookies?.[SESSION_COOKIE] ??
    req.headers.cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (raw) await db.deleteAuthSession(hashToken(raw));
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(req), maxAge: -1 });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  req: Request
) {
  const apiKey = requiredSecret("RESEND_API_KEY");
  const from = requiredSecret("AUTH_EMAIL_FROM");
  const url = `${resolveAppOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Recupere a sua password Mercato",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h1>Recuperar password</h1><p>Recebemos um pedido para criar uma nova password da sua conta Mercato.</p><p><a href="${url}" style="background:#155eef;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">Criar nova password</a></p><p>Este link expira em ${RESET_MINUTES} minutos. Se não pediu esta alteração, ignore este email.</p></div>`,
    }),
  });
  if (!response.ok)
    throw new Error("Não foi possível enviar o email de recuperação");
}

export { RESET_MINUTES, SESSION_COOKIE, SUPABASE_COOKIE };
