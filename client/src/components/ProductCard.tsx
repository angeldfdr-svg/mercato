import { useState } from "react";
import { ArrowUpRight, Heart, Star, Check } from "lucide-react";
import { Link } from "wouter";
import { Product, formatPrice } from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const cart = useCart();
  const add = () => {
    cart.addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article
      className={cn("product-card group", compact && "product-card-compact")}
    >
      <div
        className="product-image-wrap"
        style={{ backgroundColor: product.accent }}
      >
        <Link href={`/product/${product.slug}`} className="block h-full">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            decoding="async"
          />
        </Link>
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <button
          className={cn("save-button", saved && "save-button-active")}
          onClick={() => setSaved(!saved)}
          aria-label={saved ? "Remover dos favoritos" : "Guardar produto"}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <button
          className={cn("quick-add", added && "quick-add-success")}
          onClick={add}
        >
          {added ? (
            <>
              <Check size={15} /> Adicionado
            </>
          ) : (
            <>
              Adicionar <ArrowUpRight size={15} />
            </>
          )}
        </button>
      </div>
      <Link href={`/product/${product.slug}`} className="mt-4 block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7b8799]">
              {product.category} <span className="mx-1 text-[#c0c8d2]">/</span>{" "}
              {product.subcategory}
            </p>
            <h3 className="mt-1 font-display text-[17px] font-bold tracking-[-0.03em]">
              {product.name}
            </h3>
          </div>
          <span className="font-display text-[16px] font-bold">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-[#536178]">
          <Star size={13} fill="currentColor" className="text-[#f6ae4c]" />{" "}
          {product.rating}{" "}
          <span className="text-[#a8b1bf]">({product.reviews})</span>
        </div>
      </Link>
    </article>
  );
}
