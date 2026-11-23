import { Link } from "react-router";
import { tr, useLang } from "../i18n";
const isPt = () => useLang.getState().lang === "pt";
import { useUi } from "../store/shop";
import { useDialog } from "./useDialog";
import { CATEGORIES } from "../data/catalog";
import { Dept } from "./Marks";
import { LangSwitch } from "./LangSwitch";

export function MobileMenu() {
  const open = useUi((s) => s.menuOpen);
  const setMenu = useUi((s) => s.setMenu);
  const ref = useDialog<HTMLDivElement>(open, () => setMenu(false));
  const close = () => setMenu(false);
  const items = [
    { to: "/new-in", label: "New In" },
    { to: "/shop", label: "Clothing" },
    ...CATEGORIES.map((c) => ({ to: `/shop/${c.slug}`, label: c.name, sub: isPt() ? c.name : c.namePt })),
    { to: "/essentials", label: "Essentials" },
    { to: "/about", label: "About Us" },
  ];
  return (
    <div
      id="mobile-menu"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={tr("Menu")}
      aria-hidden={!open}
      className={`fixed inset-0 z-40 flex flex-col bg-white pt-[84px] text-ink transition-[clip-path] duration-[900ms] ease-[var(--ease-expo)] lg:hidden ${open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`}
    >
      <nav className="gutter flex-1 overflow-y-auto" aria-label={tr("Mobile")}>
        <ul>
          {items.map((it, i) => (
            <li key={it.to} className={`transition-[transform,opacity] duration-700 ease-[var(--ease-expo)] ${open ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`} style={{ transitionDelay: open ? `${100 + i * 45}ms` : "0ms" }}>
              <Link to={it.to} onClick={close} tabIndex={open ? 0 : -1} className={`t-display block ${"sub" in it ? "py-1.5 pl-8 text-[24px] text-ink/70" : "py-2 text-[38px]"}`}>
                {tr(it.label)}
                {"sub" in it ? <span className="t-italic-thin ml-2 text-[12px] normal-case tracking-normal">{it.sub}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="gutter border-t border-hair py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 t-caps text-[13px]">
          <Link to="/account" onClick={close} tabIndex={open ? 0 : -1}>{tr("Account")}</Link>
          <Link to="/info/shipping" onClick={close} tabIndex={open ? 0 : -1}>{tr("Shipping")}</Link>
          <Link to="/info/returns" onClick={close} tabIndex={open ? 0 : -1}>{tr("Returns")}</Link>
          <Link to="/info/contact" onClick={close} tabIndex={open ? 0 : -1}>{tr("Contact")}</Link>
        </div>
        <div className="flex items-center justify-between">
          <Dept className="w-40" />
          <LangSwitch />
        </div>
      </div>
    </div>
  );
}
