import type { Request, Response } from "express";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { chatEvents } from "./realtime";

export async function handleChatStream(req: Request, res: Response) {
  const conversationId = Number(req.query.conversationId);
  if (!Number.isInteger(conversationId) || conversationId <= 0) return res.status(400).json({ error: "conversationId inválido" });
  try {
    const user = await sdk.authenticateRequest(req);
    const conversation = await db.getConversationById(conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversa não encontrada" });
    if (conversation.buyerId !== user.id && user.role !== "admin") return res.status(403).json({ error: "Sem acesso a esta conversa" });
    const initialMessages = await db.listConversationMessages(conversationId);

    res.status(200).set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    res.write(`event: snapshot\ndata: ${JSON.stringify(initialMessages)}\n\n`);

    const eventName = `conversation:${conversationId}`;
    const onMessage = (message: unknown) => {
      res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
    };
    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 20000);
    chatEvents.on(eventName, onMessage);
    req.on("close", () => {
      clearInterval(heartbeat);
      chatEvents.off(eventName, onMessage);
    });
  } catch {
    if (!res.headersSent) res.status(401).json({ error: "Sessão necessária" });
  }
}
