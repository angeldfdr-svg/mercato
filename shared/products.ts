export type CheckoutProduct = {
  id: string;
  name: string;
  amountCents: number;
};

export const checkoutProducts: Record<string, CheckoutProduct> = {
  "luma-01": { id: "luma-01", name: "Luma Table Lamp", amountCents: 12900 },
  "carry-02": { id: "carry-02", name: "Carry Canvas Tote", amountCents: 6800 },
  "sonic-03": { id: "sonic-03", name: "Sonic Mini Speaker", amountCents: 9500 },
  "arc-04": { id: "arc-04", name: "Arc Lounge Chair", amountCents: 44900 },
  "mori-05": { id: "mori-05", name: "Mori Desk Organizer", amountCents: 4200 },
  "sora-06": { id: "sora-06", name: "Sora Soft Robe", amountCents: 11500 },
};
