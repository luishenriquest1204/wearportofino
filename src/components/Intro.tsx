import { useEffect, useRef, useState } from "react";
import { Lockup, Monogram } from "./Marks";
import { loadMotion } from "../lib/motion";

declare global {
  interface Window {
    __pfIntroDone?: boolean;
  }
}
const done = () => {
  window.__pfIntroDone = true;
  window.dispatchEvent(new Event("pf:intro"));
};
export function afterIntro(cb: () => void) {
  if (window.__pfIntroDone || document.documentElement.classList.contains("intro-seen")) {
    cb();
    return () => {};
  }
  window.addEventListener("pf:intro", cb, { once: true });
  return () => window.removeEventListener("pf:intro", cb);
}

/** First visit only: off-white field, monogram, the PORTOFINO lockup drawn in, curtain lifts (~1.8s, skippable). */
export function Intro() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<{ progress: (n: number) => unknown; kill: () => void } | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (document.documentElement.classList.contains("intro-seen")) {
      done();
      const r = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(r);
    }
    let dead = false;
    loadMotion().then(({ gsap }) => {
      if (dead) return;
      const t = gsap.timeline({ onComplete: () => setGone(true) });
      tl.current = t;
      t.from("[data-i='mono']", { opacity: 0, y: 12, duration: 0.8, ease: "power2.out" })
        .fromTo("[data-i='word']", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "expo.inOut" }, "-=0.3")
        .to("[data-i='inner']", { opacity: 0, y: -14, duration: 0.45, ease: "power2.in" }, "+=0.2")
        .add(done, "-=0.1")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.15");
    });
    const skip = () => (tl.current ? tl.current.progress(1) : (done(), setGone(true)));
    window.addEventListener("keydown", skip, { once: true });
    const fs = setTimeout(() => !tl.current && (done(), setGone(true)), 2500);
    return () => {
      dead = true;
      clearTimeout(fs);
      window.removeEventListener("keydown", skip);
      tl.current?.kill();
    };
  }, []);
  if (gone) return null;
  return (
    <div ref={root} onClick={() => tl.current?.progress(1)} aria-hidden className="pf-intro fixed inset-0 z-[100] grid place-items-center bg-offwhite text-ink [clip-path:inset(0_0_0_0)]">
      <div data-i="inner" className="flex w-full flex-col items-center gap-10">
        <span data-i="mono"><Monogram className="w-16" /></span>
        <span data-i="word" className="block w-[min(84vw,760px)]"><Lockup /></span>
      </div>
    </div>
  );
}
