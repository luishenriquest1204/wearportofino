import { Link, NavLink, useLocation } from "react-router";
import { tr } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Monogram } from "./Marks";
import { LangSwitch } from "./LangSwitch";
import { useBag, useUi } from "../store/shop";

const LEFT = [
  { to: "/new-in", label: "New In" },
  { to: "/shop", label: "Clothing" },
  { to: "/essentials", label: "Essentials" },
  { to: "/about", label: "About Us" },
];

/** Minimal header exactly as the reference: four links left, monogram centred, three actions right. */
export function Header() {
  const overlay = useUi((s) => s.overlay);
  const { setBag, setMenu, setSearch, menuOpen, pulse } = useUi();
  const count = useBag((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setHidden(y > 300 && y > last.current + 3);
      if (y < last.current - 3) setHidden(false);
      last.current = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!pulse || !countRef.current) return;
    countRef.current.animate(
      [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-70%)", opacity: 0 }, { transform: "translateY(70%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 700, easing: "cubic-bezier(0.16,1,0.3,1)" },
    );
  }, [pulse]);

  const clear = overlay && !scrolled && !menuOpen;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:bg-white focus:px-3 focus:py-2">{tr("Skip to content")}</a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-700 ease-[var(--ease-expo)] ${clear ? "bg-transparent text-white" : "bg-white/95 text-ink backdrop-blur-sm"} ${hidden && !menuOpen ? "-translate-y-full" : ""}`}
      >
        <div className="gutter grid h-[68px] grid-cols-[1fr_auto_1fr] items-center md:h-[96px] lg:h-[122px]">
          <nav aria-label={tr("Main")} className="hidden items-center gap-[clamp(28px,5.3vw,80px)] lg:flex">
            {LEFT.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `t-nav u-reveal ${isActive ? "" : ""}`} aria-current={pathname.startsWith(l.to) ? "page" : undefined}>
                {tr(l.label)}
              </NavLink>
            ))}
          </nav>
          <button type="button" onClick={() => setMenu(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" className="t-nav -ml-2 flex min-h-11 items-center gap-2.5 justify-self-start px-2 lg:hidden">
            <span className="relative block h-2.5 w-5" aria-hidden>
              <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`} />
            </span>
            {menuOpen ? tr("Close") : tr("Menu")}
          </button>
          <Link to="/" aria-label={tr("PORTOFINO — home")} className="block w-[42px] md:w-[52px]">
            <Monogram />
          </Link>
          <div className="flex items-center justify-end gap-0 md:gap-[clamp(18px,5.3vw,80px)]">
            <LangSwitch className="hidden lg:flex" />
            <button type="button" className="t-nav u-reveal hidden md:inline" onClick={() => setSearch(true)}>{tr("Search")}</button>
            <button type="button" className="grid size-11 place-items-center md:hidden" aria-label={tr("Search")} onClick={() => setSearch(true)}><Search size={18} strokeWidth={1.2} /></button>
            <Link to="/account" className="t-nav u-reveal hidden md:inline">{tr("Account")}</Link>
            <button type="button" className="t-nav -mr-2 flex min-h-11 items-center gap-1 px-2 md:mr-0 md:min-h-0 md:px-0" onClick={() => setBag(true)} aria-label={tr("Bag, {n} items", { n: count })}>
              <span className="hidden md:inline">{tr("Bag")}</span>
              <ShoppingBag className="md:hidden" size={18} strokeWidth={1.2} aria-hidden />
              <span className="inline-flex overflow-hidden">
                <span ref={countRef} className="inline-block tabular-nums">({count})</span>
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
