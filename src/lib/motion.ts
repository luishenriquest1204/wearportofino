/**
 * PORTOFINO motion engine. GSAP, ScrollTrigger, SplitText and Lenis are loaded
 * lazily after first paint so motion never delays content.
 * Markup hooks:
 *   data-r="img"     clip-path reveal with inner zoom (child [data-inner])
 *   data-r="up|fade" translate / opacity reveal       (data-delay="0.1")
 *   data-r="lines|words" typographic reveal by line / word
 *   data-speed="6"   parallax (desktop only)
 *   data-stagger     children enter in sequence
 */
import type { gsap as G } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import type { SplitText as SP } from "gsap/SplitText";

export type Motion = { gsap: typeof G; ScrollTrigger: typeof ST; SplitText: typeof SP; Lenis: typeof import("lenis").default };
let p: Promise<Motion> | null = null;

export function loadMotion() {
  p ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText"), import("lenis")]).then(([g, st, sp, l]) => {
    const gsap = g.gsap;
    gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
    (window as unknown as { __pfMotion?: boolean }).__pfMotion = true;
    return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText, Lenis: l.default };
  });
  return p;
}

export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

/** Builds all scroll reveals inside `root`. Returns a cleanup. */
export function buildReveals(root: HTMLElement) {
  if (reduced()) {
    document.documentElement.classList.remove("motion");
    return () => {};
  }
  let cleanup = () => {};
  let dead = false;
  loadMotion().then(({ gsap, ScrollTrigger, SplitText }) => {
    if (dead) return;
    const mobile = isMobile();
    const splits: SP[] = [];
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-r="img"]').forEach((el) => {
        const inner = el.querySelector("[data-inner]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: mobile ? 1.1 : 1.6, ease: "expo.inOut" });
        if (inner) tl.fromTo(inner, { scale: 1.2 }, { scale: 1, duration: 2.1, ease: "expo.out" }, 0);
      });
      root.querySelectorAll<HTMLElement>('[data-r="up"]').forEach((el) =>
        gsap.fromTo(el, { y: mobile ? 22 : 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "expo.out", delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
      );
      root.querySelectorAll<HTMLElement>('[data-r="fade"]').forEach((el) =>
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out", delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: "top 94%", once: true } }),
      );
      root.querySelectorAll<HTMLElement>('[data-r="lines"],[data-r="words"]').forEach((el) => {
        const words = el.dataset.r === "words";
        if (mobile) {
          gsap.set(el, { visibility: "visible" });
          gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
          return;
        }
        splits.push(
          SplitText.create(el, {
            type: words ? "words,lines" : "lines",
            mask: words ? "words" : "lines",
            linesClass: "split-line",
            aria: "none",
            autoSplit: true,
            onSplit(self) {
              gsap.set(el, { visibility: "visible" });
              return gsap.from(words ? self.words : self.lines, { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: words ? 0.05 : 0.1, delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: "top 90%", once: true } });
            },
          }),
        );
      });
      root.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
        const items = Array.from(group.children);
        gsap.set(items, { opacity: 0, y: 30 });
        ScrollTrigger.batch(items, { start: "top 92%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }) });
      });
      if (!mobile)
        root.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
          const s = +(el.dataset.speed ?? 6);
          gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } });
        });
      root.querySelectorAll<HTMLElement>("[data-lockup]").forEach((el) =>
        gsap.fromTo(el, { yPercent: 45 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom bottom", scrub: 0.8 } }),
      );
    }, root);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    cleanup = () => {
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  });
  return () => {
    dead = true;
    cleanup();
  };
}
