import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Send, Store } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type ChatMessage = { id: number; senderType: "buyer" | "seller"; body: string; createdAt: string | Date };

export default function SellerInbox() {
  const { user, isAuthenticated, loading } = useAuth();
  const inbox = trpc.chat.inbox.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchInterval: 5000 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = inbox.data?.find(item => item.id === selectedId) ?? inbox.data?.[0];
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesQuery = trpc.chat.messages.useQuery({ conversationId: selected?.id ?? 0 }, { enabled: Boolean(selected?.id), refetchInterval: selected?.id ? 5000 : false });
  const sendMutation = trpc.chat.send.useMutation();

  useEffect(() => { if (selected?.id) setSelectedId(selected.id); }, [selected?.id]);
  useEffect(() => { if (messagesQuery.data) setMessages(messagesQuery.data as ChatMessage[]); }, [messagesQuery.data]);
  useEffect(() => {
    if (!selected?.id) return;
    const source = new EventSource(`/api/chat/stream?conversationId=${selected.id}`);
    const onSnapshot = (event: MessageEvent<string>) => setMessages(JSON.parse(event.data) as ChatMessage[]);
    const onMessage = (event: MessageEvent<string>) => setMessages(current => { const next = JSON.parse(event.data) as ChatMessage; return current.some(item => item.id === next.id) ? current : [...current, next]; });
    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.addEventListener("message", onMessage as EventListener);
    return () => source.close();
  }, [selected?.id]);

  if (loading) return <div className="account-page"><div className="loading-card" /></div>;
  if (!isAuthenticated || user?.role !== "admin") return <div className="empty-state page-empty"><MessageCircle size={28} className="mx-auto mb-4 text-[#155eef]" /><h1 className="page-title mt-3">Inbox privada.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#536178]">Esta área está reservada à equipa de vendedores Mercato.</p><Link href="/account" className="mt-7 inline-flex"><Button className="rounded-full bg-[#155eef]">Voltar à conta</Button></Link></div>;

  return <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16"><Link href="/account" className="back-link"><ArrowLeft size={15} /> Voltar à conta</Link><div className="seller-inbox-header"><div><p className="section-kicker">Seller space</p><h1 className="page-title mt-3">Conversas que<br /><em>aproximam.</em></h1></div><div className="seller-online"><span /> Equipa online</div></div><div className="inbox-layout"><aside className="conversation-list"><div className="conversation-list-title"><span>Conversas</span><strong>{inbox.data?.length ?? 0}</strong></div>{inbox.data?.length ? inbox.data.map(conversation => <button key={conversation.id} className={cn("conversation-preview", selected?.id === conversation.id && "conversation-preview-active")} onClick={() => setSelectedId(conversation.id)}><span className="conversation-avatar"><Store size={15} /></span><span><strong>{conversation.productName}</strong><small>Comprador #{conversation.buyerId}</small></span></button>) : <div className="conversation-empty">Ainda não há conversas.<br />As perguntas dos compradores aparecem aqui.</div>}</aside><section className="seller-thread"><div className="seller-thread-header"><div className="chat-seller-avatar"><Store size={17} /></div><div><strong>{selected?.productName ?? "Selecione uma conversa"}</strong><span>Resposta em nome da curadoria Mercato</span></div></div>{selected ? <><div className="chat-messages">{messages.map(message => <div className={cn("chat-message", message.senderType === "buyer" ? "chat-message-seller-view-buyer" : "chat-message-seller-view-seller")} key={message.id}><div className="chat-message-avatar">{message.senderType === "buyer" ? "B" : <Store size={13} />}</div><div><p>{message.body}</p><time>{new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div></div>)}</div><form className="chat-compose" onSubmit={async event => { event.preventDefault(); if (!body.trim() || !selected) return; const message = await sendMutation.mutateAsync({ conversationId: selected.id, body: body.trim() }); setBody(""); if (message) setMessages(current => [...current, message as ChatMessage]); }}><input value={body} onChange={event => setBody(event.target.value)} placeholder="Responder ao comprador..." /><Button size="icon" className="rounded-full bg-[#155eef]" disabled={!body.trim()}><Send size={15} /></Button></form></> : <div className="seller-thread-empty"><MessageCircle size={28} /><p>Escolha uma conversa para começar.</p></div>}</section></div></div>;
}
