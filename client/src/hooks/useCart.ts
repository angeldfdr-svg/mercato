import { useCallback, useMemo, useSyncExternalStore } from "react";
import { type Product, products } from "@/data/catalog";
import {
  addCartLine,
  MAX_CART_QUANTITY,
  MAX_LINE_QUANTITY,
  normalizeCartLines,
  removeCartLine,
  setCartLineQuantity,
  type CartLine,
} from "@/data/cartState";
import { getShippingCostCents } from "@shared/shipping";

const STORAGE_KEY = "mercato-cart";
const EMPTY_LINES: CartLine[] = [];
const productById = new Map(products.map(product => [product.id, product]));
const listeners = new Set<() => void>();
let currentLines: CartLine[] | null = null;

function readCart(): CartLine[] {
  if (typeof window === "undefined") return EMPTY_LINES;
  try {
    return normalizeCartLines(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    );
  } catch {
    return EMPTY_LINES;
  }
}

function getSnapshot() {
  if (typeof window === "undefined") return EMPTY_LINES;
  if (currentLines === null) currentLines = readCart();
  return currentLines;
}

function notifySubscribers() {
  listeners.forEach(listener => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  currentLines = readCart();
  notifySubscribers();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function updateCart(updater: (current: CartLine[]) => CartLine[]) {
  const current = getSnapshot();
  const next = updater(current);
  if (next === current) return false;

  currentLines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory cart usable if browser storage is disabled or full.
  }
  notifySubscribers();
  return true;
}

function getServerSnapshot() {
  return EMPTY_LINES;
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (product: Product, variant = product.variants[0], quantity = 1) =>
      updateCart(current => addCartLine(current, product, variant, quantity)),
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variant: string | undefined, quantity: number) =>
      updateCart(current =>
        setCartLineQuantity(current, productId, variant ?? "", quantity)
      ),
    []
  );

  const removeItem = useCallback((productId: string, variant?: string) => {
    return updateCart(current =>
      removeCartLine(current, productId, variant ?? "")
    );
  }, []);

  const clearCart = useCallback(
    () => updateCart(current => (current.length === 0 ? current : EMPTY_LINES)),
    []
  );

  const items = useMemo(
    () =>
      lines
        .map(line => ({
          ...line,
          product: productById.get(line.productId),
        }))
        .filter((line): line is CartLine & { product: Product } =>
          Boolean(line.product)
        ),
    [lines]
  );
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = items.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );
  const shipping = getShippingCostCents(subtotal * 100) / 100;
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
    clearCart,
    maxCartQuantity: MAX_CART_QUANTITY,
    maxLineQuantity: MAX_LINE_QUANTITY,
  };
}
