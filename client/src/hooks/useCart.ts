import { useCallback, useEffect, useMemo, useState } from "react";
import { type Product, products } from "@/data/catalog";

type CartLine = { productId: string; quantity: number; variant?: string };
const STORAGE_KEY = "mercato-cart";
const CART_EVENT = "mercato-cart-updated";
const MAX_LINE_QUANTITY = 20;
const MAX_CART_QUANTITY = 50;

function readCart(): CartLine[] {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    if (!Array.isArray(saved)) return [];

    const lines: CartLine[] = [];
    let total = 0;
    for (const value of saved) {
      if (!value || typeof value !== "object") continue;
      const line = value as Partial<CartLine>;
      const product = products.find(item => item.id === line.productId);
      if (
        !product ||
        !Number.isSafeInteger(line.quantity) ||
        !line.quantity ||
        line.quantity < 1
      ) {
        continue;
      }
      const variant =
        typeof line.variant === "string" &&
        product.variants.includes(line.variant)
          ? line.variant
          : product.variants[0];
      const quantity = Math.min(
        line.quantity,
        MAX_LINE_QUANTITY,
        MAX_CART_QUANTITY - total
      );
      if (quantity < 1) break;

      const existing = lines.find(
        item => item.productId === product.id && item.variant === variant
      );
      if (existing) {
        const merged = Math.min(
          MAX_LINE_QUANTITY,
          existing.quantity + quantity
        );
        total += merged - existing.quantity;
        existing.quantity = merged;
      } else {
        lines.push({ productId: product.id, quantity, variant });
        total += quantity;
      }
      if (total >= MAX_CART_QUANTITY) break;
    }
    return lines;
  } catch {
    return [];
  }
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>(readCart);

  useEffect(() => {
    const handleCartUpdate = () => {
      const nextLines = readCart();
      setLines(current =>
        JSON.stringify(current) === JSON.stringify(nextLines)
          ? current
          : nextLines
      );
    };

    window.addEventListener(CART_EVENT, handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener(CART_EVENT, handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    window.dispatchEvent(new Event(CART_EVENT));
  }, [lines]);

  const addItem = useCallback(
    (product: Product, variant = product.variants[0]) => {
      setLines(current => {
        const total = current.reduce((sum, line) => sum + line.quantity, 0);
        if (total >= MAX_CART_QUANTITY) return current;

        const existing = current.find(
          line => line.productId === product.id && line.variant === variant
        );
        if (existing) {
          if (existing.quantity >= MAX_LINE_QUANTITY) return current;
          return current.map(line =>
            line === existing ? { ...line, quantity: line.quantity + 1 } : line
          );
        }
        return [...current, { productId: product.id, quantity: 1, variant }];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variant: string | undefined, quantity: number) => {
      setLines(current => {
        if (quantity <= 0) {
          return current.filter(
            line => !(line.productId === productId && line.variant === variant)
          );
        }
        const existing = current.find(
          line => line.productId === productId && line.variant === variant
        );
        if (!existing) return current;
        const totalWithoutLine =
          current.reduce((sum, line) => sum + line.quantity, 0) -
          existing.quantity;
        const boundedQuantity = Math.min(
          Math.floor(quantity),
          MAX_LINE_QUANTITY,
          MAX_CART_QUANTITY - totalWithoutLine
        );
        if (boundedQuantity < 1) return current;
        return current.map(line =>
          line === existing ? { ...line, quantity: boundedQuantity } : line
        );
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variant?: string) => {
    setLines(current =>
      current.filter(
        line => !(line.productId === productId && line.variant === variant)
      )
    );
  }, []);

  const items = useMemo(
    () =>
      lines
        .map(line => ({
          ...line,
          product: products.find(product => product.id === line.productId)!,
        }))
        .filter(line => line.product),
    [lines]
  );
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );
  const shipping = subtotal > 120 || subtotal === 0 ? 0 : 6.9;
  const total = subtotal + shipping;

  return {
    lines,
    items,
    count,
    subtotal,
    shipping,
    total,
    addItem,
    updateQuantity,
    removeItem,
  };
}
