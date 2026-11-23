import { useEffect, useRef } from "react";

/** Scroll lock, Escape to close, focus trap and focus return for overlays. */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const el = ref.current;
    const focusables = () => (el ? Array.from(el.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input,select,textarea")).filter((n) => n.offsetParent !== null) : []);
    const t = setTimeout(() => (el?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = "";
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}
