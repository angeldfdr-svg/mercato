import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { authSessions, conversations, InsertUser, messages, orders, passwordResetTokens, processedStripeEvents, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getConversationForBuyer(buyerId: number, productSlug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(and(eq(conversations.buyerId, buyerId), eq(conversations.productSlug, productSlug))).limit(1);
  return result[0];
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

export async function createConversation(input: { buyerId: number; productSlug: string; productName: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(conversations).values(input);
  return getConversationForBuyer(input.buyerId, input.productSlug);
}

export async function listConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function createMessage(input: { conversationId: number; senderUserId: number; senderType: "buyer" | "seller"; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(messages).values(input);
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, input.conversationId));
  const result = await db.select().from(messages).where(and(eq(messages.conversationId, input.conversationId), eq(messages.senderUserId, input.senderUserId), eq(messages.body, input.body))).orderBy(desc(messages.id)).limit(1);
  return result[0];
}

export async function listInbox() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

export async function hasProcessedStripeEvent(eventId: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: processedStripeEvents.id }).from(processedStripeEvents).where(eq(processedStripeEvents.eventId, eventId)).limit(1);
  return result.length > 0;
}

export async function recordStripeEvent(eventId: string, eventType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(processedStripeEvents).values({ eventId, eventType }).onDuplicateKeyUpdate({ set: { eventType } });
}

export async function recordPaidOrder(input: { userId: number; sessionId: string; paymentIntentId: string | null; amountCents: number; currency: string; itemsJson: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(orders).values({
    userId: input.userId,
    stripeCheckoutSessionId: input.sessionId,
    stripePaymentIntentId: input.paymentIntentId,
    amountCents: input.amountCents,
    currency: input.currency,
    status: "paid",
    itemsJson: input.itemsJson,
  }).onDuplicateKeyUpdate({ set: { status: "paid", stripePaymentIntentId: input.paymentIntentId } });
}

export async function listOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function findOrCreateGoogleUser(input: { googleId: string; email: string; name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const byGoogle = await db.select().from(users).where(eq(users.googleId, input.googleId)).limit(1);
  if (byGoogle[0]) {
    await db.update(users).set({ name: input.name, email: input.email.toLowerCase(), loginMethod: "google", lastSignedIn: new Date() }).where(eq(users.id, byGoogle[0].id));
    return (await getUserById(byGoogle[0].id))!;
  }
  const byEmail = await getUserByEmail(input.email);
  if (byEmail) {
    await db.update(users).set({ googleId: input.googleId, name: input.name, loginMethod: "google", lastSignedIn: new Date() }).where(eq(users.id, byEmail.id));
    return (await getUserById(byEmail.id))!;
  }
  const openId = `google_${input.googleId}`.slice(0, 64);
  await db.insert(users).values({ openId, googleId: input.googleId, email: input.email.toLowerCase(), name: input.name, loginMethod: "google", lastSignedIn: new Date() });
  const created = await getUserByEmail(input.email);
  if (!created) throw new Error("Google user was not created");
  return created;
}

export async function createLocalUser(input: { openId: string; email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(users).values({ ...input, email: input.email.toLowerCase(), loginMethod: "password", lastSignedIn: new Date() });
  return getUserByEmail(input.email);
}

export async function createAuthSession(input: { userId: number; tokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(authSessions).values(input);
}

export async function getUserBySessionToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ user: users, session: authSessions }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(eq(authSessions.tokenHash, tokenHash)).limit(1);
  if (!result[0] || result[0].session.expiresAt.getTime() <= Date.now()) return undefined;
  return result[0].user;
}

export async function deleteAuthSession(tokenHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
}

export async function createPasswordResetToken(input: { userId: number; tokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.userId));
  await db.insert(passwordResetTokens).values(input);
}

export async function getPasswordResetToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ token: passwordResetTokens, user: users }).from(passwordResetTokens).innerJoin(users, eq(passwordResetTokens.userId, users.id)).where(eq(passwordResetTokens.tokenHash, tokenHash)).limit(1);
  const row = result[0];
  if (!row || row.token.usedAt || row.token.expiresAt.getTime() <= Date.now()) return undefined;
  return row;
}

export async function consumePasswordResetToken(id: number, userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ passwordHash, loginMethod: "password", lastSignedIn: new Date() }).where(eq(users.id, userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
}
