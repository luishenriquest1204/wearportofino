import { useEffect } from "react";
import { tr } from "../i18n";

const DEFAULT_DESC = "A maison of 100% linen. Quiet luxury by the Mediterranean, made to last. Since MMXXVI";

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/** Per-page title and description (also mirrored to Open Graph) for search engines and link previews. */
export function useMeta(title?: string, description?: string) {
  useEffect(() => {
    const t = title ? `${title} — PORTOFINO` : `PORTOFINO — ${tr("A new destination awaits.")}`;
    const d = description || tr(DEFAULT_DESC);
    document.title = t;
    setMeta("name", "description", d);
    setMeta("property", "og:title", t);
    setMeta("property", "og:description", d);
  }, [title, description]);
}
