import type { MockOrder } from "../data/mock";
import { isValid, type Range } from "./store";

/** Buckets valid orders into a revenue/orders time series for the selected range. */
export function timeSeries(orders: MockOrder[], start: Date, range: Range, now = new Date()) {
  const ok = orders.filter(isValid);
  const out: Array<{ key: string; label: string; revenue: number; orders: number }> = [];
  if (range === "today") {
    for (let h = 0; h <= now.getHours(); h++) out.push({ key: String(h), label: `${String(h).padStart(2, "0")}:00`, revenue: 0, orders: 0 });
    ok.forEach((o) => { const b = out[o.date.getHours()]; if (b) { b.revenue += o.total; b.orders++; } });
    return out;
  }
  if (range === "year") {
    for (let m = 0; m <= now.getMonth(); m++) out.push({ key: String(m), label: new Date(now.getFullYear(), m, 1).toLocaleDateString("en-GB", { month: "short" }), revenue: 0, orders: 0 });
    ok.forEach((o) => { const b = out[o.date.getMonth()]; if (b && o.date.getFullYear() === now.getFullYear()) { b.revenue += o.total; b.orders++; } });
    return out;
  }
  const day = 86400000;
  const n = Math.round((now.getTime() - start.getTime()) / day) + 1;
  for (let i = 0; i < n; i++) {
    const d = new Date(start.getTime() + i * day);
    out.push({ key: d.toDateString(), label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), revenue: 0, orders: 0 });
  }
  const idx = new Map(out.map((b, i) => [b.key, i]));
  ok.forEach((o) => { const i = idx.get(o.date.toDateString()); if (i !== undefined) { out[i].revenue += o.total; out[i].orders++; } });
  return out;
}

export function productRanking(orders: MockOrder[]) {
  const m = new Map<string, { id: string; name: string; units: number; revenue: number }>();
  orders.filter(isValid).forEach((o) => o.items.forEach((it) => {
    const r = m.get(it.productId) ?? { id: it.productId, name: it.name, units: 0, revenue: 0 };
    r.units += it.qty;
    r.revenue += it.qty * it.price;
    m.set(it.productId, r);
  }));
  return [...m.values()].sort((a, b) => b.revenue - a.revenue);
}
