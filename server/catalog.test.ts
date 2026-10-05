import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { categoryMeta, products } from "../client/src/data/catalog";
import { checkoutProducts } from "../shared/products";

describe("Mercato product catalogue", () => {
  it("has unique products with a local image for every listing", () => {
    expect(products).toHaveLength(30);
    expect(categoryMeta).toHaveLength(10);
    expect(new Set(products.map(product => product.category))).toEqual(
      new Set(categoryMeta.map(category => category.label))
    );
    expect(new Set(products.map(product => product.id)).size).toBe(
      products.length
    );
    expect(new Set(products.map(product => product.slug)).size).toBe(
      products.length
    );

    for (const product of products) {
      expect(product.image).toMatch(/^\/products\/.+\.webp$/);
      expect(
        existsSync(
          resolve(process.cwd(), "client/public", product.image.slice(1))
        )
      ).toBe(true);
    }
  });

  it("keeps the Stripe checkout allowlist in sync with displayed names and prices", () => {
    expect(Object.keys(checkoutProducts).sort()).toEqual(
      products.map(product => product.id).sort()
    );

    for (const product of products) {
      expect(checkoutProducts[product.id]).toEqual({
        id: product.id,
        name: product.name,
        amountCents: product.price * 100,
      });
    }
  });
});
