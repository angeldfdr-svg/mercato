import Stripe from "stripe";
import type { Request, Response } from "express";
import type { User } from "../drizzle/schema";
import { checkoutProducts } from "@shared/products";
import * as db from "./db";
import { resolveAppOrigin } from "./_core/requestOrigin";
import { getShippingCostCents } from "@shared/shipping";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripe não está configurado neste ambiente");
  return new Stripe(secret);
}

export async function createCheckoutSession(
  req: Request,
  user: User,
  items: Array<{ productId: string; quantity: number }>
) {
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  if (
    !items.length ||
    items.length > 50 ||
    totalQuantity > 50 ||
    items.some(
      item =>
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
    )
  ) {
    throw new Error("O carrinho excede os limites de checkout permitidos");
  }
  const validated = items.map(item => {
    const product = checkoutProducts[item.productId];
    if (!product) throw new Error("Produto inválido no carrinho");
    return { ...item, product };
  });
  const subtotalCents = validated.reduce(
    (sum, { product, quantity }) => sum + product.amountCents * quantity,
    0
  );
  const shippingCents = getShippingCostCents(subtotalCents);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    validated.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.amountCents,
        product_data: { name: product.name },
      },
    }));
  if (shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: shippingCents,
        product_data: { name: "Entrega padrão" },
      },
    });
  }

  const stripe = getStripe();
  const origin = resolveAppOrigin(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    allow_promotion_codes: true,
    customer_email: user.email ?? undefined,
    client_reference_id: String(user.id),
    metadata: {
      user_id: String(user.id),
      customer_email: user.email ?? "",
      customer_name: user.name ?? "",
      items: JSON.stringify(
        validated.map(({ productId, quantity }) => ({ productId, quantity }))
      ),
    },
    success_url: `${origin}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?payment=cancelled`,
    shipping_address_collection: { allowed_countries: ["PT", "ES", "FR"] },
  });
  if (!session.url) throw new Error("Stripe não devolveu um URL de checkout");
  return { url: session.url, sessionId: session.id };
}

export async function verifyCheckoutSession(user: User, sessionId: string) {
  if (!sessionId || sessionId.length > 255) {
    throw new Error("Sessão de checkout inválida");
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (
    session.mode !== "payment" ||
    session.client_reference_id !== String(user.id) ||
    session.metadata?.user_id !== String(user.id)
  ) {
    throw new Error("Não foi possível confirmar esta sessão de checkout");
  }
  return { paid: session.payment_status === "paid", sessionId: session.id };
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret)
    return res.status(400).json({ error: "Webhook Stripe não configurado" });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      signature,
      secret
    );
  } catch (error) {
    console.error("[Stripe] Invalid webhook signature", error);
    return res.status(400).json({ error: "Assinatura Stripe inválida" });
  }

  const alreadyProcessed = await db.hasProcessedStripeEvent(event.id);
  if (alreadyProcessed) return res.json({ received: true, duplicate: true });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(
      session.metadata?.user_id ?? session.client_reference_id
    );
    if (
      session.mode === "payment" &&
      session.payment_status === "paid" &&
      Number.isInteger(userId) &&
      userId > 0
    ) {
      await db.recordPaidOrder({
        userId,
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        itemsJson: session.metadata?.items ?? "[]",
      });
    }
  }
  await db.recordStripeEvent(event.id, event.type);
  return res.json({ received: true });
}
