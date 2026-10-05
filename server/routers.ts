import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createCheckoutSession } from "./stripe";
import * as db from "./db";
import { emitChatMessage } from "./realtime";
import { z } from "zod";

const conversationInput = z.object({
  productSlug: z.string().min(1).max(128),
  productName: z.string().min(1).max(255),
});

const conversationIdInput = z.object({ conversationId: z.number().int().positive() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  checkout: router({
    createSession: protectedProcedure.input(z.object({
      items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
    })).mutation(({ ctx, input }) => createCheckoutSession(ctx.req, ctx.user, input.items)),
  }),
  orders: router({
    list: protectedProcedure.query(({ ctx }) => db.listOrdersForUser(ctx.user.id)),
  }),
  chat: router({
    open: protectedProcedure.input(conversationInput).mutation(async ({ ctx, input }) => {
      const current = await db.getConversationForBuyer(ctx.user.id, input.productSlug);
      return current ?? db.createConversation({ buyerId: ctx.user.id, productSlug: input.productSlug, productName: input.productName });
    }),
    messages: protectedProcedure.input(conversationIdInput).query(async ({ ctx, input }) => {
      const conversation = await db.getConversationById(input.conversationId);
      if (!conversation) throw new Error("Conversa não encontrada");
      if (conversation.buyerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Sem acesso a esta conversa");
      return db.listConversationMessages(input.conversationId);
    }),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(1000) })).mutation(async ({ ctx, input }) => {
      const conversation = await db.getConversationById(input.conversationId);
      if (!conversation) throw new Error("Conversa não encontrada");
      if (conversation.buyerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Sem acesso a esta conversa");
      const message = await db.createMessage({ conversationId: input.conversationId, senderUserId: ctx.user.id, senderType: ctx.user.role === "admin" ? "seller" : "buyer", body: input.body });
      if (message) emitChatMessage(message);
      return message;
    }),
    inbox: adminProcedure.query(() => db.listInbox()),
  }),
});

export type AppRouter = typeof appRouter;
