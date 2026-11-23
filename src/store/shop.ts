import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Size } from "../data/catalog";
import { sessionJSON } from "./storage";
import { STORE } from "../config/store";

export type BagLine = { productId: string; color: string; size: Size; qty: number };

type BagState = {
  lines: BagLine[];
  add: (l: BagLine) => void;
  setQty: (i: number, qty: number) => void;
  remove: (i: number) => void;
  clear: () => void;
};

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      lines: [],
      // Commerce gate: while COMMERCE_ENABLED is false nothing can enter the bag, whatever calls this.
      add: (l) =>
        set((s) => {
          if (!STORE.COMMERCE_ENABLED) return s;
          const i = s.lines.findIndex((x) => x.productId === l.productId && x.color === l.color && x.size === l.size);
          if (i >= 0) return { lines: s.lines.map((x, j) => (j === i ? { ...x, qty: Math.min(10, x.qty + l.qty) } : x)) };
          return { lines: [...s.lines, l] };
        }),
      setQty: (i, qty) => set((s) => !STORE.COMMERCE_ENABLED ? s : ({ lines: s.lines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Math.min(10, qty)) } : x)) })),
      remove: (i) => set((s) => ({ lines: s.lines.filter((_, j) => j !== i) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "pf-bag",
      storage: sessionJSON,
      // Lines saved in the browser (or injected into storage) are discarded in pre-launch.
      merge: (persisted, current) => (STORE.COMMERCE_ENABLED ? { ...current, ...(persisted as Partial<BagState>) } : current),
    },
  ),
);

type UiState = {
  bagOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  pulse: number;
  overlay: boolean;
  setBag: (v: boolean) => void;
  setMenu: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  bump: () => void;
  setOverlay: (v: boolean) => void;
};

export const useUi = create<UiState>()((set) => ({
  bagOpen: false,
  menuOpen: false,
  searchOpen: false,
  pulse: 0,
  overlay: false,
  setBag: (bagOpen) => set({ bagOpen, menuOpen: false, searchOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen, bagOpen: false, searchOpen: false }),
  setSearch: (searchOpen) => set({ searchOpen, bagOpen: false, menuOpen: false }),
  bump: () => set((s) => ({ pulse: s.pulse + 1 })),
  setOverlay: (overlay) => set({ overlay }),
}));

type AccountState = { user: { name: string; email: string } | null; signIn: (name: string, email: string) => void; signOut: () => void };
export const useAccount = create<AccountState>()(
  persist((set) => ({ user: null, signIn: (name, email) => set(STORE.COMMERCE_ENABLED ? { user: { name, email } } : {}), signOut: () => set({ user: null }) }), { name: "pf-account", storage: sessionJSON }),
);
