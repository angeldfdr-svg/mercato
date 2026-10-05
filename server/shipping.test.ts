import { describe, expect, it } from "vitest";
import {
  getAmountToFreeShippingCents,
  getShippingCostCents,
} from "@shared/shipping";

describe("checkout shipping price", () => {
  it("charges the standard delivery fee at or below €120", () => {
    expect(getShippingCostCents(0)).toBe(690);
    expect(getShippingCostCents(11_999)).toBe(690);
    expect(getShippingCostCents(12_000)).toBe(690);
  });

  it("makes delivery free only above €120", () => {
    expect(getShippingCostCents(12_001)).toBe(0);
    expect(getShippingCostCents(25_000)).toBe(0);
  });

  it("reports the exact amount needed to qualify for free delivery", () => {
    expect(getAmountToFreeShippingCents(11_900)).toBe(101);
    expect(getAmountToFreeShippingCents(12_000)).toBe(1);
    expect(getAmountToFreeShippingCents(12_001)).toBe(0);
  });
});
