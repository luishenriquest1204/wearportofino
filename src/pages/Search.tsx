import { useMeta } from "../lib/meta";
import { Link, useSearchParams } from "react-router";
import { tr } from "../i18n";
import { useMemo, useState } from "react";
import { useCatalog } from "../store/catalog";
import { CATEGORIES } from "../data/catalog";
import { ProductCard } from "../components/ProductCard";

export function matchProducts<T extends { name: string; category: string; description: string; colors: { name: string }[]; published: boolean }>(list: T[], q: string) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return list.filter((p) => {
    if (!p.published) return false;
    const cat = CATEGORIES.find((c) => c.slug === p.category);
    const hay = [p.name, p.category, cat?.name, cat?.namePt, p.description, "linen linho", ...p.colors.map((c) => c.name)].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [value, setValue] = useState(q);
  const products = useCatalog((s) => s.products);
  useMeta(tr("Search"));
  const results = useMemo(() => matchProducts(products, q), [products, q]);
  return (
    <div className="pt-header">
      <section className="gutter pb-[clamp(64px,8vw,160px)] pt-[clamp(36px,4.5vw,90px)]">
        <h1 className="t-display text-[clamp(40px,5.2vw,104px)]">{tr("Search")}</h1>
        <form role="search" onSubmit={(e) => { e.preventDefault(); setParams(value.trim() ? { q: value.trim() } : {}, { replace: true }); }} className="mt-10 flex items-end gap-6 border-b border-ink">
          <label htmlFor="sq" className="sr-only">{tr("Search the collection")}</label>
          <input id="sq" value={value} onChange={(e) => setValue(e.target.value)} placeholder={tr("Shirt, bata, bianco…")} className="min-w-0 flex-1 bg-transparent py-4 text-[clamp(20px,2vw,36px)] font-extralight italic placeholder:text-ink/40 focus:outline-none" />
          <button type="submit" className="t-nav pb-4">{tr("Search")}</button>
        </form>
        {q ? (
          <p className="t-micro mt-8 text-mute" aria-live="polite">{tr(results.length === 1 ? "{n} result for “{q}”" : "{n} results for “{q}”", { n: results.length, q })}</p>
        ) : (
          <div className="mt-10">
            <p className="field-label">{tr("Browse")}</p>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {CATEGORIES.map((c) => <li key={c.slug}><Link to={`/shop/${c.slug}`} className="t-nav u-reveal">{tr(c.name)}</Link></li>)}
            </ul>
          </div>
        )}
        {q && !results.length ? (
          <div className="py-20 text-center">
            <p className="t-display text-[clamp(24px,2.2vw,40px)]">{tr("No pieces found")}</p>
            <p className="mt-3 text-[13px] font-light uppercase text-mute">{tr("Try “shirt”, “trouser” or a colour such as “bianco”.")}</p>
          </div>
        ) : null}
        {results.length ? (
          <div className="mt-10 grid grid-cols-2 gap-x-[clamp(12px,2.2vw,44px)] gap-y-14 lg:grid-cols-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
