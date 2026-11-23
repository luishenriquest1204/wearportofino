import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, type Product, type Size } from "../data/catalog";
import { sessionJSON } from "./storage";

type CatalogState = {
  products: Product[];
  upsert: (p: Product) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | null;
  togglePublish: (id: string) => void;
  setStock: (id: string, color: string, size: Size, qty: number) => void;
  reset: () => void;
};

export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      upsert: (p) => set((s) => ({ products: s.products.some((x) => x.id === p.id) ? s.products.map((x) => (x.id === p.id ? p : x)) : [...s.products, p] })),
      remove: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      duplicate: (id) => {
        const src = get().products.find((p) => p.id === id);
        if (!src) return null;
        const nid = `p-${Date.now().toString(36)}`;
        const copy: Product = { ...structuredClone(src), id: nid, slug: `${src.slug}-copy-${nid.slice(-4)}`, name: `${src.name} (copy)`, published: false, sku: `${src.sku}-C` };
        set((s) => ({ products: [...s.products, copy] }));
        return nid;
      },
      togglePublish: (id) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, published: !p.published } : p)) })),
      setStock: (id, color, size, qty) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, stock: { ...p.stock, [color]: { ...p.stock[color], [size]: Math.max(0, Math.round(qty)) } } } : p)) })),
      reset: () => set({ products: PRODUCTS }),
    }),
    { name: "pf-catalog", storage: sessionJSON, version: 4, migrate: () => ({ products: PRODUCTS }) as CatalogState },
  ),
);

export const totalStock = (p: Product) => Object.values(p.stock).reduce((s, sizes) => s + Object.values(sizes).reduce((a, b) => a + b, 0), 0);
