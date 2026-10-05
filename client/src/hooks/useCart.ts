import { useCallback, useEffect, useMemo, useState } from "react";
import { Product, products } from "@/data/catalog";

type CartLine = { productId: string; quantity: number; variant?: string };
const STORAGE_KEY = "mercato-cart";

function readCart(): CartLine[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addItem = useCallback((product: Product, variant = product.variants[0]) => {
    setLines(current => {
      const existing = current.find(line => line.productId === product.id && line.variant === variant);
      if (existing) {
        return current.map(line => line === existing ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { productId: product.id, quantity: 1, variant }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, variant: string | undefined, quantity: number) => {
    setLines(current => quantity <= 0
      ? current.filter(line => !(line.productId === productId && line.variant === variant))
      : current.map(line => line.productId === productId && line.variant === variant ? { ...line, quantity } : line)
    );
  }, []);

  const removeItem = useCallback((productId: string, variant?: string) => {
    setLines(current => current.filter(line => !(line.productId === productId && line.variant === variant)));
  }, []);

  const items = useMemo(() => lines.map(line => ({
    ...line,
    product: products.find(product => product.id === line.productId)!,
  })).filter(line => line.product), [lines]);
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal > 120 || subtotal === 0 ? 0 : 6.9;
  const total = subtotal + shipping;

  return { lines, items, count, subtotal, shipping, total, addItem, updateQuantity, removeItem };
}
