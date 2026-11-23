import { useMeta } from "../lib/meta";
import { Link, useParams, useSearchParams } from "react-router";
import { plural, tr, useLang } from "../i18n";
import { useMemo, useState } from "react";
import { useCatalog } from "../store/catalog";
import { CATEGORIES, SIZES, SIZE_INTL, type Product, type Size } from "../data/catalog";
import { ProductCard } from "../components/ProductCard";
import { useDialog } from "../components/useDialog";
import NotFound from "./NotFound";

type Mode = "all" | "category" | "new" | "essentials";
const SORTS = { featured: "Featured", new: "Newest", "price-asc": "Price, low to high", "price-desc": "Price, high to low", name: "Name, A–Z" } as const;
type SortKey = keyof typeof SORTS;
const PER_PAGE = 12;

const HEAD: Record<Exclude<Mode, "category">, { title: string; sub: string; intro: string }> = {
  all: { title: "Shop all", sub: "Clothing", intro: "Every piece of the collection, cut in 100% linen." },
  new: { title: "New in", sub: "For the moment", intro: "The latest arrivals — The Private, Collection 01." },
  essentials: { title: "Essentials", sub: "Timeless", intro: "The foundations of a linen wardrobe: the shirt and the trouser." },
};

export default function Shop({ mode }: { mode: Mode }) {
  const { category } = useParams();
  const products = useCatalog((s) => s.products);
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const cat = CATEGORIES.find((c) => c.slug === category);

  const sort = (params.get("sort") as SortKey) in SORTS ? (params.get("sort") as SortKey) : "featured";
  const colors = params.getAll("color");
  const sizes = params.getAll("size") as Size[];
  const page = Math.max(1, Number(params.get("page")) || 1);

  const base = useMemo(() => {
    const live = products.filter((p) => p.published);
    if (mode === "category") return live.filter((p) => p.category === category);
    if (mode === "new") return live.filter((p) => p.isNew);
    if (mode === "essentials") return live.filter((p) => p.category === "shirts" || p.category === "trousers");
    return live;
  }, [products, mode, category]);

  const allColors = useMemo(() => {
    const m = new Map<string, string>();
    base.forEach((p) => p.colors.forEach((c) => m.set(c.name, c.hex)));
    return [...m.entries()];
  }, [base]);

  const list = useMemo(() => {
    const avail = (p: Product, s: Size) => Object.entries(p.stock).some(([c, st]) => (!colors.length || colors.includes(c)) && st[s] > 0);
    const out = base.filter((p) => (!colors.length || p.colors.some((c) => colors.includes(c.name))) && (!sizes.length || sizes.some((s) => avail(p, s))));
    const sorted = [...out];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "new") sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return sorted;
  }, [base, colors, sizes, sort]);

  useMeta(cat ? tr(cat.name) : mode !== "category" ? tr(HEAD[mode].title) : undefined, cat ? tr(cat.caption) : mode !== "category" ? tr(HEAD[mode].intro) : undefined);
  if (mode === "category" && !cat) return <NotFound />;
  const pt = useLang.getState().lang === "pt";
  const base0 = cat ? { title: cat.name, sub: pt ? cat.name : cat.namePt, intro: tr(cat.caption) + "." } : HEAD[mode as Exclude<Mode, "category">];
  const head = { title: tr(base0.title), sub: cat && pt ? base0.sub : tr(base0.sub), intro: tr(base0.intro) };
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = list.slice((Math.min(page, pages) - 1) * PER_PAGE, Math.min(page, pages) * PER_PAGE);
  const activeFilters = colors.length + sizes.length;

  const update = (fn: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    fn(next);
    next.delete("page");
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const toggle = (key: string, v: string) =>
    update((p) => {
      const cur = p.getAll(key);
      p.delete(key);
      (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).forEach((x) => p.append(key, x));
    });

  return (
    <div className="pt-header">
      <header className="gutter pb-[clamp(28px,3vw,56px)] pt-[clamp(36px,4.5vw,90px)]">
        <nav aria-label={tr("Breadcrumb")} className="t-micro text-mute">
          <ol className="flex gap-2">
            <li><Link to="/" className="hover:text-ink">{tr("Home")}</Link></li>
            <li aria-hidden>/</li>
            {cat ? (<><li><Link to="/shop" className="hover:text-ink">{tr("Clothing")}</Link></li><li aria-hidden>/</li></>) : null}
            <li aria-current="page" className="text-ink">{head.title}</li>
          </ol>
        </nav>
        <div className="mt-[clamp(24px,3vw,56px)] grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <h1 className="t-display text-[clamp(40px,5.2vw,104px)]" data-r="lines">
            {head.title}
            <span className="t-italic-thin ml-3 align-top font-sans text-[clamp(11px,0.9vw,17px)] normal-case tracking-normal">{head.sub}</span>
          </h1>
          <p className="max-w-[360px] text-[13px] font-light uppercase leading-[1.6] text-ink/80 md:text-right" data-r="up">{head.intro}</p>
        </div>
      </header>

      {/* Category rail + toolbar */}
      <div className="gutter sticky top-0 z-30 border-y border-hair bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-6">
          <ul className="no-scrollbar -mx-1 flex min-w-0 gap-6 overflow-x-auto px-1 pr-6 [mask-image:linear-gradient(to_right,#000_80%,transparent)] md:gap-9 md:pr-1 md:[mask-image:none]">
            <li><Link to="/shop" className="t-nav u-reveal whitespace-nowrap text-[12px]" aria-current={mode === "all" ? "page" : undefined}>{tr("All")}</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link to={`/shop/${c.slug}`} className="t-nav u-reveal whitespace-nowrap text-[12px]" aria-current={c.slug === category ? "page" : undefined}>{tr(c.name)}</Link></li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-6">
            <label className="hidden items-center gap-2 text-[12px] uppercase md:flex">
              <span className="text-mute">{tr("Sort")}</span>
              <select value={sort} onChange={(e) => update((p) => p.set("sort", e.target.value))} className="cursor-pointer bg-transparent font-light uppercase focus:outline-none">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{tr(v)}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => setOpen(true)} className="t-nav text-[12px]" aria-haspopup="dialog">
              {tr("Filter")}{activeFilters ? ` (${activeFilters})` : ""}
            </button>
          </div>
        </div>
      </div>

      <section className="px-[clamp(16px,1.35vw,27px)] pb-[clamp(64px,8vw,160px)] pt-[clamp(28px,2.6vw,52px)]" aria-label={tr("Products")}>
        <p className="t-micro mb-8 text-mute" aria-live="polite">{plural(list.length, "{n} piece", "{n} pieces")}</p>
        {shown.length ? (
          <div className="grid grid-cols-2 gap-x-[clamp(12px,2.2vw,44px)] gap-y-14 lg:grid-cols-4" data-stagger key={params.toString()}>
            {shown.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 4} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="t-display text-[clamp(26px,2.4vw,44px)]">{tr("Nothing here, for now")}</p>
            <p className="mt-3 text-[13px] font-light uppercase text-mute">{tr("No piece matches these filters.")}</p>
            <button type="button" className="btn btn-line mt-8" onClick={() => setParams({}, { replace: true })}>{tr("Clear filters")}</button>
          </div>
        )}

        {pages > 1 ? (
          <nav aria-label={tr("Pagination")} className="mt-20 flex items-center justify-center gap-6 text-[13px]">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => { const nx = new URLSearchParams(params); nx.set("page", String(n)); setParams(nx); }} aria-current={n === page ? "page" : undefined} className={`u-reveal tabular-nums ${n === page ? "" : "text-mute"}`}>
                {String(n).padStart(2, "0")}
              </button>
            ))}
          </nav>
        ) : (
          <p className="t-micro mt-20 text-center text-mute">{tr("Page 01 of 01 — you have seen the whole selection")}</p>
        )}
      </section>

      <FilterPanel open={open} onClose={() => setOpen(false)} colors={allColors} picked={{ colors, sizes }} toggle={toggle} sort={sort} setSort={(v) => update((p) => p.set("sort", v))} clear={() => setParams({}, { replace: true })} count={list.length} />
    </div>
  );
}

function FilterPanel(props: { open: boolean; onClose: () => void; colors: [string, string][]; picked: { colors: string[]; sizes: Size[] }; toggle: (k: string, v: string) => void; sort: SortKey; setSort: (v: string) => void; clear: () => void; count: number }) {
  const ref = useDialog(props.open, props.onClose);
  return (
    <div className={`fixed inset-0 z-[70] ${props.open ? "" : "pointer-events-none"}`} aria-hidden={!props.open}>
      <div className={`absolute inset-0 bg-ink/30 transition-opacity duration-500 ${props.open ? "opacity-100" : "opacity-0"}`} onClick={props.onClose} />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={tr("Filter and sort")} className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white transition-transform duration-700 ease-[var(--ease-expo)] ${props.open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between border-b border-hair px-6 md:h-[96px] md:px-8">
          <h2 className="t-nav">{tr("Filter & sort")}</h2>
          <button type="button" onClick={props.onClose} className="t-nav text-[12px]">{tr("Close")}</button>
        </div>
        <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8 md:px-8">
          <fieldset>
            <legend className="field-label mb-4">{tr("Sort by")}</legend>
            <div className="space-y-3">
              {Object.entries(SORTS).map(([k, v]) => (
                <label key={k} className="flex cursor-pointer items-center gap-3 text-[13px] uppercase">
                  <input type="radio" name="sort" checked={props.sort === k} onChange={() => props.setSort(k)} className="accent-navy" />
                  {tr(v)}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="field-label mb-4">{tr("Colour")}</legend>
            <div className="flex flex-wrap gap-3">
              {props.colors.map(([name, hex]) => (
                <button key={name} type="button" aria-pressed={props.picked.colors.includes(name)} onClick={() => props.toggle("color", name)} className={`flex items-center gap-2.5 border px-3.5 py-2 text-[12px] uppercase transition-colors ${props.picked.colors.includes(name) ? "border-ink" : "border-hair hover:border-ink/50"}`}>
                  <span className="size-4 rounded-full border border-ink/70" style={{ background: hex }} aria-hidden />
                  {name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="field-label mb-4">{tr("Size (in stock)")}</legend>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((s) => (
                <button key={s} type="button" aria-pressed={props.picked.sizes.includes(s)} onClick={() => props.toggle("size", s)} className={`h-11 border text-[12px] transition-colors ${props.picked.sizes.includes(s) ? "border-ink bg-ink text-white" : "border-hair hover:border-ink/50"}`}>
                  {s}<span className="sr-only"> ({SIZE_INTL[s]})</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-hair p-6 md:px-8">
          <button type="button" className="btn btn-line" onClick={props.clear}>{tr("Clear all")}</button>
          <button type="button" className="btn btn-dark" onClick={props.onClose}>{tr("Show {n}", { n: props.count })}</button>
        </div>
      </aside>
    </div>
  );
}
