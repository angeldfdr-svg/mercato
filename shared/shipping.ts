export const FREE_SHIPPING_THRESHOLD_CENTS = 12_000;
export const STANDARD_SHIPPING_CENTS = 690;

/** Free shipping starts strictly above €120, matching the storefront promise. */
export function getShippingCostCents(subtotalCents: number) {
  return subtotalCents > FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : STANDARD_SHIPPING_CENTS;
}

export function getAmountToFreeShippingCents(subtotalCents: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS + 1 - subtotalCents);
}
