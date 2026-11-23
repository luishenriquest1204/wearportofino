import { useMemo } from "react";
import { useBag } from "./shop";
import { useCatalog } from "./catalog";

export const FREE_SHIPPING = 150000;
export const SHIPPING = { standard: { label: "Standard", eta: "5–8 working days", price: 3500 }, express: { label: "Express", eta: "1–3 working days", price: 6900 } } as const;
export type ShipKey = keyof typeof SHIPPING;

/** Bag lines resolved against the (session) catalogue. */
export function useBagRows() {
  const lines = useBag((s) => s.lines);
  const products = useCatalog((s) => s.products);
  return useMemo(() => {
    const rows = lines
      .map((l, i) => {
        const p = products.find((x) => x.id === l.productId);
        return p ? { l, i, p, img: p.colors.find((c) => c.name === l.color)?.image ?? p.gallery[0]?.src, max: Math.min(10, p.stock[l.color]?.[l.size] ?? 0) } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    const subtotal = rows.reduce((s, r) => s + r.p.price * r.l.qty, 0);
    const count = rows.reduce((s, r) => s + r.l.qty, 0);
    return { rows, subtotal, count };
  }, [lines, products]);
}
