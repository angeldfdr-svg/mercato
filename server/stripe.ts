import Stripe from "stripe";
import type { Request, Response } from "express";
import type { User } from "../drizzle/schema";
import { checkoutProducts } from "@shared/products";
import * as db from "./db";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe não está configurado neste ambiente");
  return new Stripe(secret);
}

function browserOrigin(req: Request) {
  const origin = req.get("origin");
  if (origin) return origin;
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
  if (!forwardedHost) throw new Error("Não foi possível determinar a origem pública do checkout");
  return `${forwardedProto}://${forwardedHost}`;
}

export async function createCheckoutSession(req: Request, user: User, items: Array<{ productId: string; quantity: number }>) {
  if (!items.length) throw new Error("O carrinho está vazio");
  const validated = items.map(item => {
    const product = checkoutProducts[item.productId];
    if (!product) throw new Error("Produto inválido no carrinho");
    return { ...item, product };
  });
  const stripe = getStripe();
  const origin = browserOrigin(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: validated.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.amountCents,
        product_data: { name: product.name },
      },
    })),
    allow_promotion_codes: true,
    customer_email: user.email ?? undefined,
    client_reference_id: String(user.id),
    metadata: {
      user_id: String(user.id),
      customer_email: user.email ?? "",
      customer_name: user.name ?? "",
      items: JSON.stringify(validated.map(({ productId, quantity }) => ({ productId, quantity }))),
    },
    success_url: `${origin}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?payment=cancelled`,
    shipping_address_collection: { allowed_countries: ["PT", "ES", "FR"] },
  });
  if (!session.url) throw new Error("Stripe não devolveu um URL de checkout");
  return { url: session.url, sessionId: session.id };
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return res.status(400).json({ error: "Webhook Stripe não configurado" });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.body as Buffer, signature, secret);
  } catch (error) {
    console.error("[Stripe] Invalid webhook signature", error);
    return res.status(400).json({ error: "Assinatura Stripe inválida" });
  }

  const alreadyProcessed = await db.hasProcessedStripeEvent(event.id);
  if (alreadyProcessed) return res.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.user_id ?? session.client_reference_id);
    if (Number.isInteger(userId) && userId > 0) {
      await db.recordPaidOrder({
        userId,
        sessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        itemsJson: session.metadata?.items ?? "[]",
      });
    }
  }
  await db.recordStripeEvent(event.id, event.type);
  return res.json({ received: true });
}
