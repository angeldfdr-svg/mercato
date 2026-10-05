import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Store, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startLocalLogin } from "@/const";
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

export function ChatPanel({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const openMutation = trpc.chat.open.useMutation({
    onSuccess: conversation => {
      if (!conversation) {
        toast.error("Não foi possível abrir esta conversa.");
        return;
      }
      setConversationId(conversation.id);
    },
    onError: error => toast.error(error.message),
  });
  const messagesQuery = trpc.chat.messages.useQuery(
    { conversationId: conversationId ?? 0 },
    {
      enabled: Boolean(conversationId),
      refetchInterval: conversationId ? 5000 : false,
    }
  );
  const sendMutation = trpc.chat.send.useMutation({
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data as ChatMessage[]);
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!conversationId) return;
    const source = new EventSource(
      `/api/chat/stream?conversationId=${conversationId}`
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
  }, [conversationId]);

  const openConversation = () => {
    if (!isAuthenticated) {
      startLocalLogin();
      return;
    }
    setOpen(true);
    if (conversationId || openMutation.isPending) return;
    openMutation.mutate({ productSlug, productName });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || !conversationId || sendMutation.isPending) return;
    try {
      const message = await sendMutation.mutateAsync({
        conversationId,
        body: trimmed,
      });
      setBody("");
      if (message && !messages.some(item => item.id === message.id)) {
        setMessages(current => [...current, message as ChatMessage]);
      }
    } catch {
      // The mutation displays a localized error and preserves the typed text.
    }
  };

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
  if (!open) {
    return (
      <button
        type="button"
        className="chat-launcher"
        onClick={openConversation}
        aria-label={`Falar com o vendedor sobre ${productName}`}
      >
        <MessageCircle size={19} />
        <span>
          <strong>Fale com o vendedor</strong>
          <small>
            {lastMessage ? "Continuar conversa" : "Pergunte sobre esta peça"}
          </small>
        </span>
        <span className="chat-launcher-dot" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section className="chat-panel" aria-labelledby="chat-panel-title">
      <div className="chat-header">
        <div className="chat-seller-avatar">
          <Store size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <strong id="chat-panel-title">Mercato / Curadoria</strong>
          <span>
            <i /> Normalmente responde em poucas horas
          </span>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => setOpen(false)}
          aria-label="Fechar chat"
        >
          <X size={17} />
        </button>
      </div>
      <div className="chat-context">
        <span>A falar sobre</span>
        <strong>{productName}</strong>
      </div>
      <div className="chat-messages" aria-live="polite">
        {openMutation.isPending ? (
          <p className="chat-empty" role="status">
            A abrir a conversa…
          </p>
        ) : openMutation.isError && !conversationId ? (
          <div className="chat-empty" role="alert">
            <MessageCircle size={24} />
            <p>Não foi possível ligar ao serviço de mensagens.</p>
            <button
              type="button"
              className="text-link"
              onClick={openConversation}
            >
              Tentar novamente
            </button>
          </div>
        ) : messagesQuery.isError ? (
          <div className="chat-empty" role="alert">
            <p>Não foi possível carregar as mensagens.</p>
            <button
              type="button"
              className="text-link"
              onClick={() => void messagesQuery.refetch()}
            >
              Atualizar conversa
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <MessageCircle size={24} />
            <p>Olá. Tem alguma dúvida sobre esta peça?</p>
            <small>Escreva-nos e respondemos logo que possível.</small>
          </div>
        ) : (
          messages.map(message => (
            <div
              className={cn(
                "chat-message",
                message.senderType === "buyer"
                  ? "chat-message-buyer"
                  : "chat-message-seller"
              )}
              key={message.id}
            >
              <div className="chat-message-avatar">
                {message.senderType === "buyer" ? (
                  <UserRound size={13} />
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
          placeholder={
            conversationId ? "Escreva uma mensagem..." : "Conversa indisponível"
          }
          aria-label="Mensagem"
          disabled={!conversationId || openMutation.isPending}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-full bg-[#155eef]"
          disabled={!body.trim() || !conversationId || sendMutation.isPending}
          aria-label="Enviar mensagem"
        >
          <Send size={15} />
        </Button>
      </form>
    </section>
  );
}
