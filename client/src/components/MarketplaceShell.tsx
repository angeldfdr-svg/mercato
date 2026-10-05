import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLocalLogin } from "@/const";
import {
  categoryMeta,
  formatPrice,
  getProductImageSrcSet,
} from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { cn } from "@/lib/utils";

export function MarketplaceShell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();
  const cart = useCart();
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const searchDialogRef = useDialogAccessibility<HTMLElement>(
    searchOpen,
    closeSearch
  );
  const cartDialogRef = useDialogAccessibility<HTMLElement>(
    cartOpen,
    closeCart
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCartOpen(false);
        if (window.matchMedia("(max-width: 767px)").matches) {
          setSearchOpen(true);
        } else {
          desktopSearchRef.current?.focus();
        }
      }
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(
      search.trim()
        ? `/shop?query=${encodeURIComponent(search.trim())}`
        : "/shop"
    );
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const goTo = (href: string) => {
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(href);
  };

  const currentPath = location.split("?")[0];
  const currentCategory = new URLSearchParams(location.split("?")[1] ?? "").get(
    "category"
  );

  const openAccount = () => {
    if (isAuthenticated) navigate("/account");
    else startLocalLogin();
  };

  const openMobileSearch = () => {
    setMenuOpen(false);
    setCartOpen(false);
    setSearchOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f8f7f3] text-[#10203a]">
        <div className="announcement-bar">
          Entrega gratuita acima de 120€ <span>·</span> Peças escolhidas com
          cuidado <ArrowUpRight size={13} aria-hidden="true" />
        </div>
        <header className="sticky top-0 z-30 border-b border-[#10203a]/10 bg-[#f8f7f3]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-4 lg:px-10">
            <button
              type="button"
              className="icon-button lg:hidden"
              onClick={() => setMenuOpen(open => !open)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <span className="brand-mark">
                M<span>/</span>
              </span>
              <span className="font-display text-[20px] font-bold tracking-[-0.06em]">
                mercato
              </span>
            </Link>
            <nav className="main-nav" aria-label="Navegação principal">
              <button
                type="button"
                className={cn(
                  "nav-link",
                  currentPath === "/shop" &&
                    !currentCategory &&
                    "nav-link-active"
                )}
                onClick={() => goTo("/shop")}
                aria-current={
                  currentPath === "/shop" && !currentCategory
                    ? "page"
                    : undefined
                }
              >
                Descobrir
              </button>
              {(["Casa", "Tech", "Estilo"] as const).map(
                category => {
                  const active =
                    currentPath === "/shop" && currentCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      className={cn("nav-link", active && "nav-link-active")}
                      onClick={() =>
                        goTo(`/shop?category=${encodeURIComponent(category)}`)
                      }
                      aria-current={active ? "page" : undefined}
                    >
                      {category}
                    </button>
                  );
                }
              )}
            </nav>
            <form
              onSubmit={submitSearch}
              className="search-bar ml-auto hidden max-w-[310px] flex-1 md:flex"
              role="search"
            >
              <Search size={17} aria-hidden="true" />
              <input
                ref={desktopSearchRef}
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Procurar no Mercato"
                aria-label="Pesquisar produtos"
              />
              <kbd aria-hidden="true">⌘ K</kbd>
            </form>
            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <button
                type="button"
                className="icon-button md:hidden"
                onClick={openMobileSearch}
                aria-label="Pesquisar produtos"
                aria-haspopup="dialog"
                aria-controls="mobile-search-dialog"
              >
                <Search size={19} />
              </button>
              <button
                type="button"
                className="icon-button hidden sm:inline-flex"
                onClick={openAccount}
                aria-label={isAuthenticated ? "Abrir conta" : "Iniciar sessão"}
              >
                <UserRound size={19} />
              </button>
              <button
                type="button"
                className="cart-button"
                onClick={() => {
                  setSearchOpen(false);
                  setCartOpen(true);
                }}
                aria-label={`Abrir carrinho, ${cart.count} artigos`}
                aria-haspopup="dialog"
                aria-controls="cart-dialog"
              >
                <ShoppingBag size={19} />
                <span>{cart.count}</span>
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {menuOpen && (
              <motion.nav
                id="mobile-navigation"
                className="mobile-navigation border-t border-[#10203a]/10 px-5 py-4 lg:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                aria-label="Navegação móvel"
              >
                <button
                  type="button"
                  className="mobile-nav-search"
                  onClick={openMobileSearch}
                >
                  <span>
                    <Search size={17} /> Procurar no Mercato
                  </span>
                  <ArrowRight size={16} />
                </button>
                <div className="mt-3 grid max-h-[55vh] grid-cols-2 gap-2 overflow-y-auto">
                  <Link
                    href="/shop"
                    className="mobile-nav-link"
                    onClick={() => setMenuOpen(false)}
                    aria-current={
                      currentPath === "/shop" && !currentCategory
                        ? "page"
                        : undefined
                    }
                  >
                    Descobrir <ArrowUpRight size={15} />
                  </Link>
                  {categoryMeta.map(category => {
                    const active =
                      currentPath === "/shop" &&
                      currentCategory === category.label;
                    return (
                      <Link
                        key={category.label}
                        href={`/shop?category=${encodeURIComponent(category.label)}`}
                        className="mobile-nav-link"
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                      >
                        {category.label} <ArrowUpRight size={15} />
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    className="mobile-nav-link text-left"
                    onClick={() => {
                      setMenuOpen(false);
                      openAccount();
                    }}
                  >
                    {isAuthenticated ? "A minha conta" : "Iniciar sessão"}{" "}
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="mobile-search-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
            >
              <motion.section
                id="mobile-search-dialog"
                ref={searchDialogRef}
                className="mobile-search-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-search-title"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={event => event.stopPropagation()}
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">Pesquisa Mercato</p>
                    <h2
                      id="mobile-search-title"
                      className="font-display text-2xl font-bold"
                    >
                      O que procura?
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Fechar pesquisa"
                  >
                    <X size={19} />
                  </button>
                </div>
                <form
                  onSubmit={submitSearch}
                  className="search-bar"
                  role="search"
                >
                  <Search size={17} aria-hidden="true" />
                  <input
                    data-dialog-autofocus
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Ex.: candeeiro, mochila..."
                    aria-label="Pesquisar produtos"
                  />
                  <button type="submit" aria-label="Iniciar pesquisa">
                    <ArrowRight size={17} />
                  </button>
                </form>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#7b8799]">
                  Explore por categoria
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryMeta.slice(0, 5).map(category => (
                    <Link
                      key={category.label}
                      href={`/shop?category=${encodeURIComponent(category.label)}`}
                      className="category-pill"
                      onClick={() => setSearchOpen(false)}
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

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
              <p className="footer-kicker">A sua conta</p>
              <div className="footer-links">
                <Link href="/account">A minha conta</Link>
                <Link href="/cart">Carrinho</Link>
                <Link href="/login">Iniciar sessão</Link>
              </div>
            </div>
            <div>
              <p className="footer-kicker">A próxima descoberta</p>
              <p className="mb-4 max-w-xs text-sm leading-6 text-[#536178]">
                Novos objectos, marcas independentes e escolhas com intenção —
                reunidos numa só curadoria.
              </p>
              <Link href="/shop" className="text-link">
                Explorar a seleção <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-12 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-[#10203a]/10 pt-5 text-xs text-[#536178] sm:flex-row">
            <span>© 2026 Mercato. Feito para encontrar.</span>
            <span>Descobrir melhor, todos os dias.</span>
          </div>
        </footer>

        <AnimatePresence>
          {cartOpen && (
            <motion.div
              className="cart-overlay fixed inset-0 z-50 bg-[#10203a]/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            >
              <motion.aside
                id="cart-dialog"
                ref={cartDialogRef}
                className="cart-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-title"
                initial={{ x: 36, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 32, opacity: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                onClick={event => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#10203a]/10 px-6 py-5">
                  <div>
                    <p className="section-kicker">O seu saco</p>
                    <h2
                      id="cart-title"
                      className="font-display text-2xl font-bold"
                    >
                      Carrinho{" "}
                      <span className="text-[#7b8799]">({cart.count})</span>
                    </h2>
                  </div>
                  <button
                    type="button"
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
                        <div
                          className="cart-line"
                          key={`${product.id}-${variant}`}
                        >
                          <img
                            src={product.image}
                            srcSet={getProductImageSrcSet(product.image)}
                            sizes="78px"
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
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
                                type="button"
                                className="text-[#7b8799] transition hover:text-[#e15b4f]"
                                onClick={() =>
                                  cart.removeItem(product.id, variant)
                                }
                                aria-label={`Remover ${product.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="quantity-stepper">
                                <button
                                  type="button"
                                  onClick={() =>
                                    cart.updateQuantity(
                                      product.id,
                                      variant,
                                      quantity - 1
                                    )
                                  }
                                  aria-label={`Diminuir quantidade de ${product.name}`}
                                >
                                  <Minus size={13} />
                                </button>
                                <span>{quantity}</span>
                                <button
                                  type="button"
                                  disabled={
                                    quantity >= cart.maxLineQuantity ||
                                    cart.count >= cart.maxCartQuantity
                                  }
                                  onClick={() =>
                                    cart.updateQuantity(
                                      product.id,
                                      variant,
                                      quantity + 1
                                    )
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
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
