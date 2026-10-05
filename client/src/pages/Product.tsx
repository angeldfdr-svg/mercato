import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  getProduct,
  getProductImageSrcSet,
  products,
} from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/ProductCard";
import { ChatPanel } from "@/components/ChatPanel";

export default function Product() {
  const [, params] = useRoute("/product/:slug");
  const product = getProduct(params?.slug ?? "");
  const cart = useCart();
  const [variant, setVariant] = useState(product?.variants[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product)
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="section-kicker">404</p>
        <h1 className="page-title mt-3">Peça não encontrada.</h1>
        <Link href="/shop" className="text-link mt-6 inline-flex">
          Voltar à loja <ArrowRight size={15} />
        </Link>
      </div>
    );
  const lineQuantity =
    cart.items.find(
      item => item.product.id === product.id && item.variant === variant
    )?.quantity ?? 0;
  const maxAddQuantity = Math.max(
    0,
    Math.min(20 - lineQuantity, 50 - cart.count)
  );
  const canAdd = quantity <= maxAddQuantity;
  const add = () => {
    if (!cart.addItem(product, variant, quantity)) {
      toast.error("O carrinho atingiu o limite desta peça.");
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const relatedProducts = [
    ...products.filter(
      item => item.id !== product.id && item.category === product.category
    ),
    ...products.filter(
      item => item.id !== product.id && item.category !== product.category
    ),
  ].slice(0, 4);
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-8 lg:px-10 lg:pt-12">
      <Link href="/shop" className="back-link">
        <ArrowLeft size={15} /> Voltar à seleção
      </Link>
      <div className="product-detail">
        <div
          className="product-detail-image"
          style={{ backgroundColor: product.accent }}
        >
          <img
            src={product.image}
            srcSet={getProductImageSrcSet(product.image)}
            sizes="(max-width: 900px) 100vw, 50vw"
            alt={product.name}
            decoding="async"
            fetchPriority="high"
          />
          <span className="product-detail-stamp">M/ CURATED</span>
        </div>
        <div className="product-detail-copy">
          <p className="section-kicker">
            {product.category} / {product.subcategory}
          </p>
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="rating-line">
              <Star size={14} fill="currentColor" /> {product.rating}
            </span>
            <span className="text-sm text-[#7b8799]">
              {product.reviews} avaliações
            </span>
          </div>
          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="text-sm text-[#9aa5b4] line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#536178]">
            {product.description}
          </p>
          <div className="mt-8 border-y border-[#10203a]/10 py-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-caps">Opção</span>
              <span className="text-sm text-[#536178]">{variant}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map(option => (
                <button
                  type="button"
                  key={option}
                  className={
                    variant === option
                      ? "variant-button variant-active"
                      : "variant-button"
                  }
                  onClick={() => setVariant(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="quantity-stepper large">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Diminuir quantidade"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                disabled={quantity >= maxAddQuantity}
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Aumentar quantidade"
              >
                <Plus size={15} />
              </button>
            </div>
            <Button
              disabled={!canAdd}
              onClick={add}
              className="h-12 flex-1 rounded-full bg-[#155eef] text-[15px] hover:bg-[#0e4ac7]"
            >
              {added ? (
                <>
                  <Check size={17} /> Adicionado ao saco
                </>
              ) : (
                <>
                  Adicionar ao saco <ArrowRight size={17} />
                </>
              )}
            </Button>
          </div>
          {!canAdd && (
            <p className="mt-3 text-sm text-[#7b8799]" role="status">
              {maxAddQuantity === 0
                ? "O limite do carrinho para esta peça foi atingido."
                : `Pode adicionar até mais ${maxAddQuantity} unidade${maxAddQuantity === 1 ? "" : "s"} desta opção.`}
            </p>
          )}
          <div className="mt-8 grid gap-4 border-t border-[#10203a]/10 pt-6 sm:grid-cols-3">
            <div className="feature-mini">
              <Truck size={17} />
              <span>
                <strong>Entrega</strong>
                <small>Detalhes no checkout</small>
              </span>
            </div>
            <div className="feature-mini">
              <ShieldCheck size={17} />
              <span>
                <strong>Pagamento seguro</strong>
                <small>Checkout protegido</small>
              </span>
            </div>
            <div className="feature-mini">
              <Check size={17} />
              <span>
                <strong>Curadoria Mercato</strong>
                <small>Escolha feita com cuidado</small>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[950px]">
        <ChatPanel productSlug={product.slug} productName={product.name} />
      </div>
      <div className="mt-24">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Talvez também goste</p>
            <h2 className="section-title">Continua a explorar.</h2>
          </div>
          <Link href="/shop" className="text-link">
            Ver catálogo <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {relatedProducts.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
