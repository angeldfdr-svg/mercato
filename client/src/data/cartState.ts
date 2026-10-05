import { products, type Product } from "./catalog";

export type CartLine = {
  productId: string;
  quantity: number;
  variant: string;
};

export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_QUANTITY = 50;

const productsById = new Map(products.map(product => [product.id, product]));

export function normalizeCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];

  const lines: CartLine[] = [];
  let total = 0;
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const saved = candidate as Partial<CartLine>;
    const product =
      typeof saved.productId === "string"
        ? productsById.get(saved.productId)
        : undefined;
    if (
      !product ||
      !Number.isSafeInteger(saved.quantity) ||
      !saved.quantity ||
      saved.quantity < 1
    ) {
      continue;
    }

    const variant =
      typeof saved.variant === "string" &&
      product.variants.includes(saved.variant)
        ? saved.variant
        : product.variants[0];
    const existing = lines.find(
      line => line.productId === product.id && line.variant === variant
    );
    const roomInLine = MAX_LINE_QUANTITY - (existing?.quantity ?? 0);
    const quantity = Math.min(
      saved.quantity,
      roomInLine,
      MAX_CART_QUANTITY - total
    );
    if (quantity <= 0) continue;

    if (existing) existing.quantity += quantity;
    else lines.push({ productId: product.id, quantity, variant });
    total += quantity;
    if (total >= MAX_CART_QUANTITY) break;
  }
  return lines;
}

export function addCartLine(
  lines: CartLine[],
  product: Product,
  variant: string,
  quantity = 1
): CartLine[] {
  const canonical = productsById.get(product.id);
  if (
    !canonical ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_LINE_QUANTITY
  ) {
    return lines;
  }
  const selectedVariant = canonical.variants.includes(variant)
    ? variant
    : canonical.variants[0];
  const total = lines.reduce((sum, line) => sum + line.quantity, 0);
  if (total + quantity > MAX_CART_QUANTITY) return lines;

  const existing = lines.find(
    line => line.productId === canonical.id && line.variant === selectedVariant
  );
  if (existing) {
    if (existing.quantity + quantity > MAX_LINE_QUANTITY) return lines;
    return lines.map(line =>
      line === existing ? { ...line, quantity: line.quantity + quantity } : line
    );
  }
  return [
    ...lines,
    { productId: canonical.id, quantity, variant: selectedVariant },
  ];
}

export function setCartLineQuantity(
  lines: CartLine[],
  productId: string,
  variant: string,
  quantity: number
): CartLine[] {
  const existing = lines.find(
    line => line.productId === productId && line.variant === variant
  );
  if (!existing) return lines;
  if (quantity <= 0) {
    return lines.filter(line => line !== existing);
  }
  if (!Number.isSafeInteger(quantity)) return lines;

  const totalWithoutLine =
    lines.reduce((sum, line) => sum + line.quantity, 0) - existing.quantity;
  const boundedQuantity = Math.min(
    quantity,
    MAX_LINE_QUANTITY,
    MAX_CART_QUANTITY - totalWithoutLine
  );
  if (boundedQuantity < 1 || boundedQuantity === existing.quantity)
    return lines;
  return lines.map(line =>
    line === existing ? { ...line, quantity: boundedQuantity } : line
  );
}

export function removeCartLine(
  lines: CartLine[],
  productId: string,
  variant: string
): CartLine[] {
  const next = lines.filter(
    line => !(line.productId === productId && line.variant === variant)
  );
  return next.length === lines.length ? lines : next;
}
