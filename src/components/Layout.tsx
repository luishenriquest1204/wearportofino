import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileMenu } from "./MobileMenu";
import { BagDrawer, SearchOverlay } from "./Overlays";
import { Intro } from "./Intro";
import { buildReveals, loadMotion, reduced } from "../lib/motion";
import type Lenis from "lenis";
import { useLang } from "../i18n";
import { useUi } from "../store/shop";
import { STORE } from "../config/store";

/** Storefront shell: header, page transition, overlays, footer, smooth scroll and reveals per route. */
export function Layout() {
  const { pathname, search } = useLocation();
  const main = useRef<HTMLDivElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const lang = useLang((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  useEffect(() => {
    if (reduced() || matchMedia("(pointer: coarse)").matches) return;
    let off = () => {};
    let dead = false;
    loadMotion().then(({ gsap, ScrollTrigger, Lenis }) => {
      if (dead) return;
      const l = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.current = l;
      l.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => l.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      off = () => {
        gsap.ticker.remove(tick);
        l.destroy();
      };
    });
    return () => {
      dead = true;
      off();
    };
  }, []);

  const lastRoute = useRef("");
  useEffect(() => {
    const route = pathname + search;
    // A language switch re-renders the page in place; only a new route returns to the top.
    if (route !== lastRoute.current) {
      // Any navigation (links, back/forward) closes the bag, menu and search overlays.
      useUi.setState({ bagOpen: false, menuOpen: false, searchOpen: false });
      lenis.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      lastRoute.current = route;
    }
    if (!main.current) return;
    return buildReveals(main.current);
  }, [pathname, search, lang]);

  return (
    <>
      <Intro />
      <Header key={`h-${lang}`} />
      <MobileMenu key={`m-${lang}`} />
      <SearchOverlay key={`s-${lang}`} />
      {STORE.COMMERCE_ENABLED ? <BagDrawer key={`b-${lang}`} /> : null}
      <div ref={main}>
        <main id="main" key={`${pathname}-${lang}`} className="page-in min-h-[60vh]">
          <Outlet />
        </main>
        <Footer key={`f-${lang}`} />
      </div>
    </>
  );
}
