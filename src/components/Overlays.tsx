import { Link, useNavigate } from "react-router";
import { tr } from "../i18n";
import { useMemo, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { useBag, useUi } from "../store/shop";
import { useCatalog } from "../store/catalog";
import { useDialog } from "./useDialog";
import { CATEGORIES, formatBRL, SIZE_INTL } from "../data/catalog";

export function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  const setSearch = useUi((s) => s.setSearch);
  const ref = useDialog<HTMLDivElement>(open, () => setSearch(false));
  const all = useCatalog((s) => s.products);
  const products = useMemo(() => all.filter((p) => p.published), [all]);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return products.filter((p) => [p.name, p.category, CATEGORIES.find((c) => c.slug === p.category)?.namePt ?? "", ...p.colors.map((c) => c.name), "linen"].join(" ").toLowerCase().includes(t));
  }, [q, products]);
  const close = () => setSearch(false);
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={tr("Search")} aria-hidden={!open} className={`fixed inset-0 z-[60] overflow-y-auto bg-white text-ink transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <div className="gutter flex h-[68px] items-center justify-end md:h-[96px]">
        <button type="button" onClick={close} className="t-nav u-reveal" tabIndex={open ? 0 : -1}>{tr("Close")}</button>
      </div>
      <form
        role="search"
        className="gutter mx-auto mt-[6vh] max-w-6xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            close();
            nav(`/search?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      >
        <label htmlFor="q" className="t-micro text-mute">{tr("Search the collection")}</label>
        <input id="q" data-autofocus value={q} onChange={(e) => setQ(e.target.value)} tabIndex={open ? 0 : -1} autoComplete="off" placeholder={tr("Shirts, linen trousers, Celeste…")} className="t-display mt-4 w-full border-b border-ink bg-transparent pb-3 text-[clamp(32px,5vw,64px)] placeholder:text-hair focus:outline-none" />
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 t-caps text-[13px] text-mute">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/shop/${c.slug}`} onClick={close} tabIndex={open ? 0 : -1} className="hover:text-ink">{tr(c.name)}</Link>
          ))}
        </div>
        <div className="mt-12 min-h-40" aria-live="polite">
          {q.trim().length >= 2 && !results.length ? <p className="text-mute">{tr("No pieces match “{q}”.", { q: q.trim() })}</p> : null}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {results.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.slug}`} onClick={close} tabIndex={open ? 0 : -1} className="group block">
                  <div className="aspect-[428/503] overflow-hidden bg-studio"><img src={p.gallery[0].src} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                  <div className="mt-3 flex justify-between gap-3 t-caps text-[13px]"><span>{p.name}</span><span>{formatBRL(p.price)}</span></div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}

export function BagDrawer() {
  const open = useUi((s) => s.bagOpen);
  const setBag = useUi((s) => s.setBag);
  const { lines, setQty, remove } = useBag();
  const products = useCatalog((s) => s.products);
  const ref = useDialog<HTMLElement>(open, () => setBag(false));
  const rows = lines.map((l, i) => ({ l, i, p: products.find((p) => p.id === l.productId) })).filter((r) => r.p);
  const subtotal = rows.reduce((s, r) => s + r.p!.price * r.l.qty, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const close = () => setBag(false);
  return (
    <>
      <div className={`fixed inset-0 z-[70] bg-ink/25 transition-opacity duration-700 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={close} aria-hidden />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={tr("Shopping bag")} aria-hidden={!open} className={`fixed bottom-0 right-0 top-0 z-[71] flex w-full max-w-[480px] flex-col bg-white text-ink transition-transform duration-[850ms] ease-[var(--ease-expo)] ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between border-b border-hair px-6 md:h-[96px] md:px-8">
          <p className="t-nav">{tr("Bag")} ({count})</p>
          <button type="button" onClick={close} className="t-nav u-reveal" tabIndex={open ? 0 : -1}>{tr("Close")}</button>
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="t-display text-[30px]">{tr("Your bag is empty")}</p>
            <p className="mt-3 t-caps-thin text-[13px] text-mute">{tr("Linen pieces made for long Mediterranean days.")}</p>
            <Link to="/shop" onClick={close} className="btn btn-line mt-8" tabIndex={open ? 0 : -1}>{tr("Discover the collection")}</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-hair overflow-y-auto px-6 md:px-8">
              {rows.map(({ l, i, p }) => {
                const img = p!.colors.find((c) => c.name === l.color)?.image ?? p!.gallery[0].src;
                return (
                  <li key={`${l.productId}-${l.color}-${l.size}`} className="flex gap-4 py-6">
                    <Link to={`/product/${p!.slug}`} onClick={close} className="block aspect-[428/503] w-24 shrink-0 overflow-hidden bg-studio" tabIndex={open ? 0 : -1}><img src={img} alt="" className="h-full w-full object-cover" /></Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <p className="t-caps text-[14px]">{p!.name}</p>
                        <p className="tabular-nums text-[14px]">{formatBRL(p!.price * l.qty)}</p>
                      </div>
                      <p className="mt-1 t-caps-thin text-[12px] text-mute">{l.color} · {l.size} ({SIZE_INTL[l.size]})</p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-hair" role="group" aria-label={tr("Quantity")}>
                          <button type="button" className="grid size-10 place-items-center disabled:opacity-30 md:size-8" onClick={() => setQty(i, l.qty - 1)} disabled={l.qty <= 1} aria-label={tr("Decrease")} tabIndex={open ? 0 : -1}><Minus size={13} strokeWidth={1.3} /></button>
                          <span className="w-7 text-center text-[13px] tabular-nums">{l.qty}</span>
                          <button type="button" className="grid size-10 place-items-center disabled:opacity-30 md:size-8" onClick={() => setQty(i, l.qty + 1)} disabled={l.qty >= Math.min(10, p!.stock[l.color]?.[l.size] ?? 0)} aria-label={tr("Increase")} tabIndex={open ? 0 : -1}><Plus size={13} strokeWidth={1.3} /></button>
                        </div>
                        <button type="button" onClick={() => remove(i)} className="t-micro text-mute hover:text-ink" tabIndex={open ? 0 : -1}>{tr("Remove")}</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-hair px-6 pb-6 pt-5 md:px-8">
              <div className="flex justify-between t-caps text-[14px]"><span>{tr("Subtotal")}</span><span className="tabular-nums">{formatBRL(subtotal)}</span></div>
              <p className="mt-1 t-caps-thin text-[11px] text-mute">{tr("Shipping calculated at checkout · Complimentary over R$1.500")}</p>
              <Link to="/checkout" onClick={close} className="btn btn-dark mt-5 w-full" tabIndex={open ? 0 : -1}>{tr("Checkout")}</Link>
              <Link to="/bag" onClick={close} className="mt-3 block text-center t-micro text-mute hover:text-ink" tabIndex={open ? 0 : -1}>{tr("View bag")}</Link>
            </div>
          </>
        )}
        <button type="button" onClick={close} className="sr-only" tabIndex={open ? 0 : -1}><X />{tr("Close bag")}</button>
      </aside>
    </>
  );
}
