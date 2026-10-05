import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLocalLogin } from "@/const";
import { categoryMeta, formatPrice } from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// The alias path is kept explicit here so auth remains the starter's real Manus OAuth flow.
export function MarketplaceShell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const cart = useCart();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(
      search.trim()
        ? `/shop?query=${encodeURIComponent(search.trim())}`
        : "/shop"
    );
  };

  const openAccount = () => {
    if (isAuthenticated) navigate("/account");
    else startLocalLogin();
  };

  const submitNewsletter = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Está na lista. Obrigado por subscrever.");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#10203a]">
      <div className="announcement-bar">
        Entrega gratuita acima de 120€ <span>·</span> Trocas simples durante 30
        dias <ArrowUpRight size={13} />
      </div>
      <header className="sticky top-0 z-30 border-b border-[#10203a]/10 bg-[#f8f7f3]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-4 lg:px-10">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2"
          >
            <span className="brand-mark">
              M<span>/</span>
            </span>
            <span className="font-display text-[20px] font-bold tracking-[-0.06em]">
              mercato
            </span>
          </Link>
          <nav className="main-nav">
            <Link
              href="/shop"
              className={cn(
                "nav-link",
                location === "/shop" && "nav-link-active"
              )}
              >
              Descobrir
            </Link>
          </nav>
          <form
            onSubmit={submitSearch}
            className="search-bar ml-auto hidden max-w-[310px] flex-1 md:flex"
          >
            <Search size={17} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Procurar no Mercato"
              aria-label="Pesquisar produtos"
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button
              className="icon-button md:hidden"
              onClick={() => navigate("/shop")}
              aria-label="Pesquisar"
            >
              <Search size={19} />
            </button>
            <button
              className="icon-button hidden sm:inline-flex"
              onClick={openAccount}
              aria-label={isAuthenticated ? "Abrir conta" : "Iniciar sessão"}
            >
              <UserRound size={19} />
            </button>
            <button
              className="cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={19} />
              <span>{cart.count}</span>
            </button>
          </div>
        </div>

      </header>
      <main>{children}</main>
      <footer className="border-t border-[#10203a]/10 bg-[#f0efe9] px-5 py-12 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="brand-mark">
                M<span>/</span>
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.06em]">
                mercato
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#536178]">
              Uma curadoria viva para comprar melhor, descobrir mais e voltar
              sempre.
            </p>
          </div>
          <div>
            <p className="footer-kicker">Explorar</p>
            <div className="footer-links">
              <Link href="/shop">Todos os produtos</Link>
              {categoryMeta.map(category => (
                <Link
                  key={category.label}
                  href={`/shop?category=${encodeURIComponent(category.label)}`}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="footer-kicker">Ajuda</p>
            <div className="footer-links">
              <span>Envios e trocas</span>
              <span>Estado da encomenda</span>
              <span>Guia de tamanhos</span>
              <span>Contacto</span>
            </div>
          </div>
          <div>
            <p className="footer-kicker">Receba o melhor</p>
            <p className="mb-3 text-sm leading-6 text-[#536178]">
              Novidades com intenção. Sem ruído.
            </p>
            <form className="newsletter" onSubmit={submitNewsletter}>
              <input
                placeholder="O seu email"
                type="email"
                required
                value={newsletterEmail}
                onChange={event => setNewsletterEmail(event.target.value)}
                aria-label="Email para newsletter"
              />
              <button type="submit" aria-label="Subscrever">
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-[#10203a]/10 pt-5 text-xs text-[#536178] sm:flex-row">
          <span>© 2026 Mercato. Feito para encontrar.</span>
          <span>
            Privacidade &nbsp;·&nbsp; Termos &nbsp;·&nbsp; Acessibilidade
          </span>
        </div>
      </footer>
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#10203a]/30"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#10203a]/10 px-6 py-5">
              <div>
                <p className="section-kicker">O seu saco</p>
                <h2 className="font-display text-2xl font-bold">
                  Carrinho{" "}
                  <span className="text-[#7b8799]">({cart.count})</span>
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>
            {cart.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag size={30} className="mb-4 text-[#155eef]" />
                <h3 className="font-display text-xl font-bold">
                  Ainda está vazio.
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#536178]">
                  As boas descobertas começam com um primeiro artigo.
                </p>
                <Button
                  className="mt-6 rounded-full bg-[#155eef] px-6"
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/shop");
                  }}
                >
                  Explorar produtos
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {cart.items.map(({ product, quantity, variant }) => (
                    <div className="cart-line" key={`${product.id}-${variant}`}>
                      <img src={product.image} alt="" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold leading-5">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[#7b8799]">
                              {variant}
                            </p>
                          </div>
                          <button
                            className="text-[#7b8799] transition hover:text-[#e15b4f]"
                            onClick={() => cart.removeItem(product.id, variant)}
                            aria-label={`Remover ${product.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="quantity-stepper">
                            <button
                              onClick={() =>
                                cart.updateQuantity(
                                  product.id,
                                  variant,
                                  quantity - 1
                                )
                              }
                              aria-label="Diminuir quantidade"
                            >
                              <Minus size={13} />
                            </button>
                            <span>{quantity}</span>
                            <button
                              disabled={quantity >= 20 || cart.count >= 50}
                              onClick={() =>
                                cart.updateQuantity(
                                  product.id,
                                  variant,
                                  quantity + 1
                                )
                              }
                              aria-label="Aumentar quantidade"
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
                <div className="border-t border-[#10203a]/10 px-6 py-5">
                  <div className="flex justify-between text-sm text-[#536178]">
                    <span>Subtotal</span>
                    <strong className="font-display text-lg text-[#10203a]">
                      {formatPrice(cart.subtotal)}
                    </strong>
                  </div>
                  <p className="mt-2 text-xs text-[#7b8799]">
                    {cart.shipping === 0
                      ? "Entrega gratuita incluída."
                      : `Entrega ${formatPrice(cart.shipping)}`}
                  </p>
                  <Button
                    className="mt-5 w-full rounded-full bg-[#155eef] py-6 text-[15px]"
                    onClick={() => {
                      setCartOpen(false);
                      navigate("/cart");
                    }}
                  >
                    Ver carrinho <ArrowRight size={17} />
                  </Button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
