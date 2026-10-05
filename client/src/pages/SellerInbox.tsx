import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Send, Store } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  senderType: "buyer" | "seller";
  body: string;
  createdAt: string | Date;
};

function formatMessageTime(value: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SellerInbox() {
  const { user, isAuthenticated, loading } = useAuth();
  const inbox = trpc.chat.inbox.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 5000,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected =
    inbox.data?.find(item => item.id === selectedId) ?? inbox.data?.[0];
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesQuery = trpc.chat.messages.useQuery(
    { conversationId: selected?.id ?? 0 },
    {
      enabled: Boolean(selected?.id),
      refetchInterval: selected?.id ? 5000 : false,
    }
  );
  const sendMutation = trpc.chat.send.useMutation({
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (selected?.id) setSelectedId(selected.id);
  }, [selected?.id]);

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data as ChatMessage[]);
  }, [messagesQuery.data]);

  useEffect(() => {
    setBody("");
    if (!selected?.id) return;
    const source = new EventSource(
      `/api/chat/stream?conversationId=${selected.id}`
    );
    const onSnapshot = (event: MessageEvent<string>) => {
      try {
        setMessages(JSON.parse(event.data) as ChatMessage[]);
      } catch {
        toast.error("Não foi possível atualizar a conversa.");
      }
    };
    const onMessage = (event: MessageEvent<string>) => {
      try {
        const next = JSON.parse(event.data) as ChatMessage;
        setMessages(current =>
          current.some(item => item.id === next.id)
            ? current
            : [...current, next]
        );
      } catch {
        toast.error("Não foi possível receber a mensagem.");
      }
    };
    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.addEventListener("message", onMessage as EventListener);
    return () => source.close();
  }, [selected?.id]);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = body.trim();
      if (!trimmed || !selected || sendMutation.isPending) return;
      try {
        const message = await sendMutation.mutateAsync({
          conversationId: selected.id,
          body: trimmed,
        });
        setBody("");
        if (message) {
          setMessages(current =>
            current.some(item => item.id === message.id)
              ? current
              : [...current, message as ChatMessage]
          );
        }
      } catch {
        // The mutation displays an error and keeps the draft available to retry.
      }
    },
    [body, selected, sendMutation]
  );

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading-card" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="empty-state page-empty">
        <MessageCircle size={28} className="mx-auto mb-4 text-[#155eef]" />
        <h1 className="page-title mt-3">Inbox privada.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#536178]">
          Esta área está reservada à equipa de vendedores Mercato.
        </p>
        <Button asChild className="mt-7 rounded-full bg-[#155eef]">
          <Link href="/account">Voltar à conta</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16">
      <Link href="/account" className="back-link">
        <ArrowLeft size={15} /> Voltar à conta
      </Link>
      <div className="seller-inbox-header">
        <div>
          <p className="section-kicker">Seller space</p>
          <h1 className="page-title mt-3">
            Conversas que
            <br />
            <em>aproximam.</em>
          </h1>
        </div>
        <div className="seller-online">
          <span /> Equipa online
        </div>
      </div>

      <div className="inbox-layout">
        <aside className="conversation-list">
          <div className="conversation-list-title">
            <span>Conversas</span>
            <strong>{inbox.data?.length ?? 0}</strong>
          </div>
          {inbox.isLoading ? (
            <div className="conversation-empty" role="status">
              A carregar conversas…
            </div>
          ) : inbox.isError ? (
            <div className="conversation-empty" role="alert">
              <p>Não foi possível carregar as conversas.</p>
              <button
                type="button"
                className="text-link"
                onClick={() => void inbox.refetch()}
              >
                Tentar novamente
              </button>
            </div>
          ) : inbox.data?.length ? (
            inbox.data.map(conversation => (
              <button
                type="button"
                key={conversation.id}
                className={cn(
                  "conversation-preview",
                  selected?.id === conversation.id &&
                    "conversation-preview-active"
                )}
                onClick={() => setSelectedId(conversation.id)}
                aria-pressed={selected?.id === conversation.id}
              >
                <span className="conversation-avatar">
                  <Store size={15} />
                </span>
                <span>
                  <strong>{conversation.productName}</strong>
                  <small>Comprador #{conversation.buyerId}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="conversation-empty">
              Ainda não há conversas.
              <br />
              As perguntas dos compradores aparecem aqui.
            </div>
          )}
        </aside>

        <section className="seller-thread" aria-label="Conversa selecionada">
          <div className="seller-thread-header">
            <div className="chat-seller-avatar">
              <Store size={17} />
            </div>
            <div>
              <strong>
                {selected?.productName ?? "Selecione uma conversa"}
              </strong>
              <span>Resposta em nome da curadoria Mercato</span>
            </div>
          </div>
          {selected ? (
            <>
              <div className="chat-messages" aria-live="polite">
                {messagesQuery.isError ? (
                  <div className="conversation-empty" role="alert">
                    <p>Não foi possível carregar as mensagens.</p>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => void messagesQuery.refetch()}
                    >
                      Atualizar conversa
                    </button>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      className={cn(
                        "chat-message",
                        message.senderType === "buyer"
                          ? "chat-message-seller-view-buyer"
                          : "chat-message-seller-view-seller"
                      )}
                      key={message.id}
                    >
                      <div className="chat-message-avatar">
                        {message.senderType === "buyer" ? (
                          "B"
                        ) : (
                          <Store size={13} />
                        )}
                      </div>
                      <div>
                        <p>{message.body}</p>
                        <time>{formatMessageTime(message.createdAt)}</time>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="chat-compose" onSubmit={submit}>
                <input
                  value={body}
                  onChange={event => setBody(event.target.value)}
                  placeholder="Responder ao comprador..."
                  aria-label="Mensagem para o comprador"
                  disabled={sendMutation.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full bg-[#155eef]"
                  disabled={!body.trim() || sendMutation.isPending}
                  aria-label="Enviar mensagem"
                >
                  <Send size={15} />
                </Button>
              </form>
            </>
          ) : (
            <div className="seller-thread-empty">
              <MessageCircle size={28} />
              <p>Escolha uma conversa para começar.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
