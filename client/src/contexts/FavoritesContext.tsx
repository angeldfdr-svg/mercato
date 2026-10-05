import { createContext, useContext, useMemo, useState } from "react";
import type { Product } from "@/data/catalog";

type FavoritesContextValue = {
  favoriteIds: string[];
  count: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteIds,
    count: favoriteIds.length,
    isFavorite: productId => favoriteIds.includes(productId),
    toggleFavorite: productId => {
      setFavoriteIds(current =>
        current.includes(productId)
          ? current.filter(id => id !== productId)
          : [...current, productId]
      );
    },
  }), [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}

export function getFavoriteProducts(products: Product[], favoriteIds: string[]) {
  return products.filter(product => favoriteIds.includes(product.id));
}
