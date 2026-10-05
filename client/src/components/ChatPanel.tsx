import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Store, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startLocalLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type ChatMessage = { id: number; senderType: "buyer" | "seller"; body: string; createdAt: string | Date };

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function ChatPanel({ productSlug, productName }: { productSlug: string; productName: string }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const openMutation = trpc.chat.open.useMutation({ onSuccess: conversation => setConversationId(conversation?.id ?? null) });
  const messagesQuery = trpc.chat.messages.useQuery({ conversationId: conversationId ?? 0 }, { enabled: Boolean(conversationId), refetchInterval: conversationId ? 5000 : false });
  const sendMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data as ChatMessage[]);
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!conversationId) return;
    const source = new EventSource(`/api/chat/stream?conversationId=${conversationId}`);
    const onSnapshot = (event: MessageEvent<string>) => setMessages(JSON.parse(event.data) as ChatMessage[]);
    const onMessage = (event: MessageEvent<string>) => setMessages(current => {
      const next = JSON.parse(event.data) as ChatMessage;
      return current.some(item => item.id === next.id) ? current : [...current, next];
    });
    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.addEventListener("message", onMessage as EventListener);
    return () => source.close();
  }, [conversationId]);

  const startConversation = () => {
    if (!isAuthenticated) return startLocalLogin();
    setOpen(true);
    if (!conversationId) openMutation.mutate({ productSlug, productName });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !conversationId) return;
    setBody("");
    const message = await sendMutation.mutateAsync({ conversationId, body: trimmed });
    if (message && !messages.some(item => item.id === message.id)) setMessages(current => [...current, message as ChatMessage]);
  };

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
  if (!open) return <button className="chat-launcher" onClick={startConversation}><MessageCircle size={19} /><span><strong>Fale com o vendedor</strong><small>{lastMessage ? "Continuar conversa" : "Pergunte sobre esta peça"}</small></span><span className="chat-launcher-dot" /></button>;

  return <section className="chat-panel"><div className="chat-header"><div className="chat-seller-avatar"><Store size={17} /></div><div className="min-w-0 flex-1"><strong>Mercato / Curadoria</strong><span><i /> Normalmente responde em poucas horas</span></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Fechar chat"><X size={17} /></button></div><div className="chat-context"><span>A falar sobre</span><strong>{productName}</strong></div><div className="chat-messages">{messages.length === 0 ? <div className="chat-empty"><MessageCircle size={24} /><p>Olá. Tem alguma dúvida sobre esta peça?</p><small>Escreva-nos e respondemos logo que possível.</small></div> : messages.map(message => <div className={cn("chat-message", message.senderType === "buyer" ? "chat-message-buyer" : "chat-message-seller")} key={message.id}><div className="chat-message-avatar">{message.senderType === "buyer" ? <UserRound size={13} /> : <Store size={13} />}</div><div><p>{message.body}</p><time>{formatMessageTime(message.createdAt)}</time></div></div>)}</div><form className="chat-compose" onSubmit={submit}><input value={body} onChange={event => setBody(event.target.value)} placeholder="Escreva uma mensagem..." aria-label="Mensagem" /><Button size="icon" className="rounded-full bg-[#155eef]" disabled={!body.trim() || sendMutation.isPending}><Send size={15} /></Button></form></section>;
}
