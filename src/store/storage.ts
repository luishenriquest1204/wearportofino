import { createJSONStorage } from "zustand/middleware";

/** Session-only storage (the demo never promises permanent persistence). Falls back silently when blocked. */
export const sessionJSON = createJSONStorage(() => {
  try {
    const k = "__pf";
    sessionStorage.setItem(k, "1");
    sessionStorage.removeItem(k);
    return sessionStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  }
});

/** Per-visitor preferences (language) — kept across visits when the browser allows it. */
export const localJSON = createJSONStorage(() => {
  try {
    const k = "__pf";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  }
});
