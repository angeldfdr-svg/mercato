import { describe, expect, it } from "vitest";
import { products } from "./catalog";
import {
  addCartLine,
  normalizeCartLines,
  removeCartLine,
  setCartLineQuantity,
} from "./cartState";

const firstProduct = products[0];
const secondProduct = products[1];

describe("shared cart state", () => {
  it("adds, merges and separates product variants", () => {
    const variant = firstProduct.variants[0];
    const otherVariant = firstProduct.variants[1];
    let lines = addCartLine([], firstProduct, variant, 2);
    lines = addCartLine(lines, firstProduct, variant, 1);
    lines = addCartLine(lines, firstProduct, otherVariant, 1);

    expect(lines).toEqual([
      { productId: firstProduct.id, quantity: 3, variant },
      { productId: firstProduct.id, quantity: 1, variant: otherVariant },
    ]);
  });

  it("enforces the line and whole-cart limits without dropping existing items", () => {
    const fullLine = addCartLine(
      [],
      firstProduct,
      firstProduct.variants[0],
      20
    );
    expect(addCartLine(fullLine, firstProduct, firstProduct.variants[0])).toBe(
      fullLine
    );

    const almostFull = addCartLine(
      [],
      firstProduct,
      firstProduct.variants[0],
      20
    );
    const withSecond = addCartLine(
      almostFull,
      secondProduct,
      secondProduct.variants[0],
      20
    );
    const fullCart = addCartLine(
      withSecond,
      products[2],
      products[2].variants[0],
      10
    );
    expect(fullCart.reduce((total, line) => total + line.quantity, 0)).toBe(50);
    expect(addCartLine(fullCart, products[3], products[3].variants[0])).toBe(
      fullCart
    );
  });

  it("updates and removes lines", () => {
    const lines = addCartLine([], firstProduct, firstProduct.variants[0], 2);
    const updated = setCartLineQuantity(
      lines,
      firstProduct.id,
      firstProduct.variants[0],
      4
    );
    expect(updated[0].quantity).toBe(4);
    expect(
      removeCartLine(updated, firstProduct.id, firstProduct.variants[0])
    ).toEqual([]);
  });

  it("sanitizes persisted cart data and drops products no longer in the catalogue", () => {
    expect(
      normalizeCartLines([
        { productId: firstProduct.id, quantity: 2, variant: "invalid" },
        { productId: "removed-product", quantity: 5, variant: "test" },
        { productId: secondProduct.id, quantity: -1 },
      ])
    ).toEqual([
      {
        productId: firstProduct.id,
        quantity: 2,
        variant: firstProduct.variants[0],
      },
    ]);
  });
});
