import { EventEmitter } from "node:events";
import type { Message } from "../drizzle/schema";

export const chatEvents = new EventEmitter();
chatEvents.setMaxListeners(200);

export function emitChatMessage(message: Message) {
  chatEvents.emit(`conversation:${message.conversationId}`, message);
}
