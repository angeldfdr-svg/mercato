import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice, getProductImageSrcSet } from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLocalLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { getAmountToFreeShippingCents } from "@shared/shipping";

export default function Cart() {
  const cart = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [checkout, setCheckout] = useState(false);
  const closeCheckout = useCallback(() => setCheckout(false), []);
  const checkoutDialogRef = useDialogAccessibility<HTMLDivElement>(
    checkout,
    closeCheckout
  );
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const verifyPaymentMutation = trpc.checkout.verifySession.useMutation();
  const verifiedSession = useRef("");
  const paymentParams = new URLSearchParams(window.location.search);
  const paymentStatus = paymentParams.get("payment");
  const paymentSessionId = paymentParams.get("session_id");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (paymentStatus === "cancelled") {
      toast.info("Pagamento cancelado. O seu saco continua guardado.");
      params.delete("payment");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${params.size ? `?${params}` : ""}`
      );
      return;
    }
    if (paymentStatus !== "success" || authLoading) return;
    if (!paymentSessionId) {
      toast.error("Não recebemos a referência do pagamento Stripe.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Inicie sessão para confirmar o estado do pagamento.");
      return;
    }
    if (verifiedSession.current === paymentSessionId) return;
    verifiedSession.current = paymentSessionId;

    void verifyPaymentMutation
      .mutateAsync({ sessionId: paymentSessionId })
      .then(result => {
        if (!result.paid) {
          toast.info("O pagamento ainda está a ser confirmado pelo Stripe.");
          return;
        }
        cart.clearCart();
        toast.success("Pagamento confirmado. O carrinho foi atualizado.");
        params.delete("payment");
        params.delete("session_id");
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${params.size ? `?${params}` : ""}`
        );
      })
      .catch(error => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível confirmar o pagamento."
        );
      });
  }, [
    authLoading,
    cart.clearCart,
    isAuthenticated,
    paymentSessionId,
    paymentStatus,
    verifyPaymentMutation.mutateAsync,
  ]);

  const beginStripeCheckout = async () => {
    if (!isAuthenticated) return startLocalLogin();
    const paymentWindow = window.open(
      "about:blank",
      "_blank",
      "noopener,noreferrer"
    );
    try {
      const result = await checkoutMutation.mutateAsync({
        items: cart.items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      });
      toast.success("A abrir o checkout seguro Stripe.");
      if (paymentWindow) paymentWindow.location.href = result.url;
      else window.location.href = result.url;
    } catch (error) {
      paymentWindow?.close();
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento."
      );
    }
  };

  if (cart.items.length === 0)
    return (
      <div className="empty-state page-empty">
        <div className="empty-bag">M/</div>
        <p className="section-kicker">O seu saco</p>
        <h1 className="page-title mt-3">Ainda está vazio.</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-7 text-[#536178]">
          Deixe espaço para uma boa descoberta. A seleção Mercato está à sua
          espera.
        </p>
        <Button asChild className="mt-8 rounded-full bg-[#155eef] px-6 py-6">
          <Link href="/shop">
            Explorar a loja <ArrowRight size={17} />
          </Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16">
      <Link href="/shop" className="back-link">
        <ArrowLeft size={15} /> Continuar a explorar
      </Link>
      <div className="cart-page-heading">
        <div>
          <p className="section-kicker">O seu saco</p>
          <h1 className="page-title mt-3">
            Quase <em>seu.</em>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#536178]">
          <Lock size={15} className="text-[#155eef]" /> Checkout seguro via
          Stripe
        </div>
      </div>
      <div className="cart-layout">
        <div className="cart-lines">
          {cart.items.map(({ product, quantity, variant }) => (
            <div className="cart-page-line" key={`${product.id}-${variant}`}>
              <img
                src={product.image}
                srcSet={getProductImageSrcSet(product.image)}
                sizes="116px"
                alt={product.name}
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-[#7b8799]">
                      {product.category} · {variant}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[#7b8799] hover:text-[#e15b4f]"
                    onClick={() => cart.removeItem(product.id, variant)}
                    aria-label={`Remover ${product.name} do carrinho`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        cart.updateQuantity(product.id, variant, quantity - 1)
                      }
                      aria-label={`Diminuir quantidade de ${product.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      disabled={
                        quantity >= 20 || cart.count >= cart.maxCartQuantity
                      }
                      onClick={() =>
                        cart.updateQuantity(product.id, variant, quantity + 1)
                      }
                      aria-label={`Aumentar quantidade de ${product.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-display font-bold">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="summary-card">
          <p className="section-kicker">Resumo</p>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(cart.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Entrega</span>
            <strong>
              {cart.shipping === 0 ? "Grátis" : formatPrice(cart.shipping)}
            </strong>
          </div>
          <div className="my-5 border-t border-[#10203a]/10" />
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>
          <div className="mt-5 flex gap-2 rounded-xl bg-[#efff9e] p-3 text-xs leading-5 text-[#10203a]">
            <Truck size={16} className="mt-0.5 shrink-0" />{" "}
            {cart.shipping === 0
              ? "Tem entrega gratuita neste pedido."
              : `Faltam ${formatPrice(getAmountToFreeShippingCents(Math.round(cart.subtotal * 100)) / 100)} para entrega gratuita.`}
          </div>
          <Button
            className="mt-6 w-full rounded-full bg-[#155eef] py-6 text-[15px]"
            onClick={() => setCheckout(true)}
            disabled={checkoutMutation.isPending}
          >
            Avançar para checkout <ArrowRight size={17} />
          </Button>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#7b8799]">
            <CreditCard size={13} /> Pagamento seguro com cartão via Stripe
          </div>
        </aside>
      </div>
      {checkout && (
        <div
          className="fixed inset-0 z-50 bg-[#10203a]/30 p-4"
          onClick={closeCheckout}
        >
          <div
            ref={checkoutDialogRef}
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="section-kicker">Checkout Stripe</p>
                <h2
                  id="checkout-title"
                  className="font-display text-2xl font-bold"
                >
                  Confirme e pague com segurança.
                </h2>
              </div>
              <button
                type="button"
                className="text-[#7b8799]"
                onClick={closeCheckout}
                aria-label="Fechar checkout"
              >
                Fechar
              </button>
            </div>
            <div className="mt-6 rounded-2xl bg-[#e8efff] p-4 text-sm leading-6 text-[#10203a]">
              <div className="flex gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-1 shrink-0 text-[#155eef]"
                />
                <span>
                  Vai ser redirecionado para uma página Stripe hospedada. Os
                  dados do cartão nunca passam pelo Mercato.
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="checkout-summary-line">
                <span>Artigos</span>
                <strong>{cart.count}</strong>
              </div>
              <div className="checkout-summary-line">
                <span>Total</span>
                <strong>{formatPrice(cart.total)}</strong>
              </div>
            </div>
            <p className="mt-6 text-xs leading-5 text-[#7b8799]">
              O endereço de entrega será recolhido no próprio checkout Stripe.
              Códigos promocionais também ficam disponíveis no ambiente de
              teste.
            </p>
            <Button
              className="mt-6 w-full rounded-full bg-[#155eef] py-6"
              onClick={() => {
                closeCheckout();
                void beginStripeCheckout();
              }}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending
                ? "A preparar checkout..."
                : "Ir para pagamento Stripe"}{" "}
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
