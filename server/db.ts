import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { conversations, InsertUser, messages, orders, processedStripeEvents, users } from "../drizzle/schema";
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
