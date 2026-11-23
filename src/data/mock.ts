/**
 * DEMONSTRATION DATA for PORTOFINO Creator. Deterministic, fictional customers
 * (example.com) and orders. Nothing here is real sales data.
 */
import { PRODUCTS, CATEGORIES } from "./catalog";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export type OrderStatus = "Awaiting payment" | "Paid" | "Preparing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
export type MockOrder = { id: string; number: number; customerId: string; customer: string; email: string; date: Date; items: Array<{ productId: string; name: string; qty: number; price: number; color: string; size: string }>; total: number; discount: number; shipping: number; status: OrderStatus; payment: "Pix" | "Card" };
export type MockCustomer = { id: string; name: string; email: string; city: string };

const FIRST = ["Giulia", "Marco", "Helena", "Rafael", "Beatriz", "Lorenzo", "Sofia", "Pedro", "Isabela", "Matteo", "Clara", "Tomás", "Valentina", "André", "Lívia", "Bruno", "Alice", "Gabriel", "Manuela", "Enzo"];
const LAST = ["Rossi", "Almeida", "Ferraz", "Bianchi", "Moreira", "Conti", "Carvalho", "Ricci", "Duarte", "Marino", "Teixeira", "Gallo"];
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Florianópolis", "Porto Alegre", "Salvador", "Brasília"];

const r = rng(2026);
export const CUSTOMERS: MockCustomer[] = Array.from({ length: 48 }, (_, i) => {
  const f = FIRST[Math.floor(r() * FIRST.length)];
  const l = LAST[Math.floor(r() * LAST.length)];
  return { id: `c${i + 1}`, name: `${f} ${l}`, email: `${f}.${l}${i}@example.com`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""), city: CITIES[Math.floor(r() * CITIES.length)] };
});

const STATUSES: OrderStatus[] = ["Delivered", "Delivered", "Delivered", "Shipped", "Preparing", "Paid", "Awaiting payment", "Cancelled", "Refunded", "Delivered"];

export function buildOrders(now = new Date()): MockOrder[] {
  const g = rng(77);
  const orders: MockOrder[] = [];
  for (let i = 0; i < 260; i++) {
    const daysAgo = Math.floor(Math.pow(g(), 1.6) * 360);
    const date = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(g() * 86400000));
    const c = CUSTOMERS[Math.floor(Math.pow(g(), 1.3) * CUSTOMERS.length)];
    const n = g() < 0.6 ? 1 : g() < 0.8 ? 2 : 3;
    const items = Array.from({ length: n }, () => {
      const p = PRODUCTS[Math.floor(g() * PRODUCTS.length)];
      const color = p.colors[Math.floor(g() * p.colors.length)].name;
      return { productId: p.id, name: p.name, qty: g() < 0.85 ? 1 : 2, price: p.price, color, size: ["PP", "P", "M", "G", "GG"][Math.floor(g() * 5)] };
    });
    const sub = items.reduce((s, it) => s + it.qty * it.price, 0);
    const discount = g() < 0.18 ? Math.round(sub * 0.1) : 0;
    const shipping = sub >= 150000 ? 0 : 2990;
    const status = daysAgo < 2 ? (g() < 0.5 ? "Awaiting payment" : "Paid") : daysAgo < 6 ? (g() < 0.5 ? "Preparing" : "Shipped") : STATUSES[Math.floor(g() * STATUSES.length)];
    orders.push({ id: `o${i}`, number: 1001 + i, customerId: c.id, customer: c.name, email: c.email, date, items, total: sub - discount + shipping, discount, shipping, status, payment: g() < 0.62 ? "Pix" : "Card" });
  }
  return orders.sort((a, b) => b.date.getTime() - a.date.getTime()).map((o, i, arr) => ({ ...o, number: 1001 + (arr.length - 1 - i) }));
}

export const VALID: OrderStatus[] = ["Paid", "Preparing", "Shipped", "Delivered"];
export const categoryOf = (productId: string) => CATEGORIES.find((c) => c.slug === PRODUCTS.find((p) => p.id === productId)?.category)?.name ?? "—";
