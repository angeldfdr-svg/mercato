import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/catalog";

export default function Favorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(
      products
        .filter(product => window.localStorage.getItem(`mercato-favorite-${product.id}`) === "1")
        .map(product => product.id),
    );
    const sync = () => setFavoriteIds(products.filter(product => window.localStorage.getItem(`mercato-favorite-${product.id}`) === "1").map(product => product.id));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const favorites = products.filter(product => favoriteIds.includes(product.id));

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="section-kicker">A sua seleção</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">Favoritos</h1>
          <p className="mt-3 max-w-xl text-[#536178]">Guarde os objectos a que quer voltar mais tarde.</p>
        </div>
        <Heart aria-hidden="true" className="text-[#ef6b6b]" fill="currentColor" size={30} />
      </div>
      {favorites.length ? (
        <div className="product-grid">{favorites.map(product => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="rounded-3xl border border-[#10203a]/10 bg-white/60 px-6 py-16 text-center">
          <Heart className="mx-auto text-[#ef6b6b]" size={30} />
          <h2 className="mt-4 font-display text-2xl font-bold">Ainda não guardou favoritos</h2>
          <p className="mx-auto mt-2 max-w-md text-[#536178]">Explore a seleção e toque no coração dos produtos que quer guardar.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#10203a] px-5 py-3 text-sm font-semibold text-white">Explorar produtos</Link>
        </div>
      )}
    </main>
  );
}
