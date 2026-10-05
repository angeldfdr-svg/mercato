import { Heart } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { getFavoriteProducts, useFavorites } from "@/contexts/FavoritesContext";
import { products } from "@/data/catalog";

export default function Favorites() {
  const { favoriteIds } = useFavorites();
  const favorites = getFavoriteProducts(products, favoriteIds);

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 lg:px-10 lg:pt-16">
      <div className="shop-header">
        <div>
          <p className="section-kicker"><Heart size={14} /> A sua seleção</p>
          <h1 className="page-title">Os seus<br /><em>favoritos.</em></h1>
        </div>
        <p className="max-w-sm text-[15px] leading-7 text-[#536178]">Guarde as peças que quer reencontrar mais tarde.</p>
      </div>
      {favorites.length ? (
        <div className="product-grid mt-10">{favorites.map(product => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="empty-state page-empty mt-10">
          <Heart size={27} className="mx-auto mb-4 text-[#155eef]" />
          <h2 className="font-display text-2xl font-bold">Ainda não guardou nada.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#536178]">Toque no coração de qualquer produto para o adicionar aqui.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#155eef] px-6 py-3 text-sm font-bold text-white">Explorar produtos</Link>
        </div>
      )}
    </div>
  );
}
