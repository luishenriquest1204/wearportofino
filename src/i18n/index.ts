import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localJSON } from "../store/storage";
import { PT } from "./pt";

export type Lang = "en" | "pt";
type LangState = { lang: Lang; setLang: (l: Lang) => void };

export const useLang = create<LangState>()(
  persist((set) => ({ lang: "en", setLang: (lang) => set({ lang }) }), { name: "pf-lang", storage: localJSON }),
);

/**
 * Translate an English source string. English is the source language of the site;
 * Portuguese comes from the PT dictionary (keys are the English strings). Unknown strings
 * (e.g. text typed in the Creator) are shown as written. `{name}` placeholders are filled from `vars`.
 * The storefront re-mounts on language change (see Layout), so a plain function is enough.
 */
export function tr(s: string, vars?: Record<string, string | number>) {
  const lang = useLang.getState().lang;
  let out = lang === "pt" ? (PT[s] ?? PT[s.trim()] ?? s) : s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

/** "1 piece" / "2 pieces" style helper. */
export const plural = (n: number, one: string, many: string) => tr(n === 1 ? one : many, { n });
