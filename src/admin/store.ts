import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import { buildOrders, VALID, type MockOrder, type OrderStatus } from "../data/mock";
import { sessionJSON } from "../store/storage";

export type Range = "today" | "7d" | "30d" | "90d" | "year";
export const RANGES: Array<[Range, string]> = [["today", "Today"], ["7d", "7 days"], ["30d", "30 days"], ["90d", "90 days"], ["year", "This year"]];

const NOW = new Date();
const ORDERS = buildOrders(NOW);

type AdminState = {
  range: Range;
  setRange: (r: Range) => void;
  statusOverrides: Record<string, OrderStatus>;
  setStatus: (id: string, s: OrderStatus) => void;
  toast: string;
  notify: (m: string) => void;
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      range: "30d",
      setRange: (range) => set({ range }),
      statusOverrides: {},
      setStatus: (id, s) => set((st) => ({ statusOverrides: { ...st.statusOverrides, [id]: s } })),
      toast: "",
      notify: (toast) => {
        set({ toast });
        setTimeout(() => set((s) => (s.toast === toast ? { toast: "" } : s)), 2600);
      },
    }),
    { name: "pf-admin", storage: sessionJSON, partialize: (s) => ({ range: s.range, statusOverrides: s.statusOverrides }) },
  ),
);

export function rangeBounds(r: Range, now = NOW): { start: Date; prevStart: Date; days: number } {
  const day = 86400000;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (r === "today") return { start: today, prevStart: new Date(today.getTime() - day), days: 1 };
  if (r === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.ceil((now.getTime() - start.getTime()) / day);
    return { start, prevStart: new Date(start.getTime() - days * day), days };
  }
  const days = r === "7d" ? 7 : r === "30d" ? 30 : 90;
  const start = new Date(today.getTime() - (days - 1) * day);
  return { start, prevStart: new Date(start.getTime() - days * day), days };
}

/** All demo orders with any status changes made in this session. */
export function useOrders(): MockOrder[] {
  const ov = useAdmin((s) => s.statusOverrides);
  return useMemo(() => ORDERS.map((o) => (ov[o.id] ? { ...o, status: ov[o.id] } : o)), [ov]);
}

export function useRangeOrders() {
  const orders = useOrders();
  const range = useAdmin((s) => s.range);
  return useMemo(() => {
    const { start, prevStart, days } = rangeBounds(range);
    const cur = orders.filter((o) => o.date >= start);
    const prev = orders.filter((o) => o.date >= prevStart && o.date < start);
    return { all: orders, cur, prev, start, days, range };
  }, [orders, range]);
}

export const isValid = (o: MockOrder) => VALID.includes(o.status);
export function metrics(list: MockOrder[]) {
  const ok = list.filter(isValid);
  const revenue = ok.reduce((s, o) => s + o.total, 0);
  const units = ok.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  return { revenue, orders: ok.length, aov: ok.length ? Math.round(revenue / ok.length) : 0, units };
}
export const NOW_DATE = NOW;
