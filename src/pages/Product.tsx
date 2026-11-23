import { Link, useParams, useSearchParams } from "react-router";
import { tr, useLang } from "../i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "../store/catalog";
import { useBag, useUi } from "../store/shop";
import { CARE_TEXT, CATEGORIES, formatBRL, SIZE_CHART, SIZES, SIZE_INTL, type Size } from "../data/catalog";
import { Price, ProductCard, Swatches } from "../components/ProductCard";
import { useDialog } from "../components/useDialog";
import NotFound from "./NotFound";

export default function ProductPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const products = useCatalog((s) => s.products);
  const product = products.find((p) => p.slug === slug && p.published);
  const add = useBag((s) => s.add);
  const inBag = useBag((s) => s.lines);
  const { bump, setBag } = useUi();

  const colorIdx = Math.max(0, product?.colors.findIndex((c) => c.name === params.get("color")) ?? 0);
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [guide, setGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const [buyHidden, setBuyHidden] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBuyHidden(!e.isIntersecting && e.boundingClientRect.top > 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  });

  useEffect(() => {
    setSize(null);
    setQty(1);
    setErr("");
  }, [slug, colorIdx]);

  const color = product?.colors[colorIdx];
  const gallery = useMemo(() => {
    if (!product || !color) return [];
    if (!color.image) return [];
    const rest = product.gallery.filter((g) => g.src !== color.image);
    return [{ src: color.image, alt: tr("{p} in {c}", { p: product.name, c: color.name }), kind: "studio" as const }, ...(colorIdx === 0 ? rest : [])];
  }, [product, color, colorIdx]);

  if (!product || !color) return <NotFound />;
  const cat = CATEGORIES.find((c) => c.slug === product.category)!;
  const stockFor = (s: Size) => product.stock[color.name]?.[s] ?? 0;
  const already = (s: Size) => inBag.filter((l) => l.productId === product.id && l.color === color.name && l.size === s).reduce((a, l) => a + l.qty, 0);
  const max = size ? Math.min(10, stockFor(size) - already(size)) : 10;
  const related = products.filter((p) => p.published && p.id !== product.id).slice(0, 4);

  const submit = () => {
    if (!size) {
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return setErr("Please select a size.");
    }
    if (max < 1) return setErr("You already have all available units of this size in your bag.");
    add({ productId: product.id, color: color.name, size, qty: Math.min(qty, max) });
    bump();
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
    setTimeout(() => setBag(true), 450);
  };

  return (
    <div className="pt-header">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,58%)_1fr] [&>*]:min-w-0">
        {/* Gallery: stacked on desktop, swipe on touch */}
        <section aria-label={tr("Gallery")} className="relative">
          {gallery.length ? (
            <>
              <div
                ref={track}
                onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:block lg:overflow-visible"
              >
                {gallery.map((g, i) => (
                  <figure key={g.src} className={`relative w-full shrink-0 snap-center overflow-hidden ${g.kind === "studio" ? "bg-studio" : "bg-ink"} aspect-[428/503] lg:mb-[3px]`}>
                    <img src={g.src} alt={tr(g.alt)} loading={i ? "lazy" : "eager"} className="h-full w-full object-cover" />
                  </figure>
                ))}
              </div>
              {gallery.length > 1 ? (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 lg:hidden" aria-hidden>
                  {gallery.map((g, i) => <span key={g.src} className={`h-px w-6 transition-colors ${slide === i ? "bg-ink" : "bg-ink/25"}`} />)}
                </div>
              ) : null}
            </>
          ) : (
            <div className="grid aspect-[428/503] place-items-center bg-studio px-8 text-center">
              <div>
                <span className="mx-auto block size-12 rounded-full border border-ink/60" style={{ background: color.hex }} aria-hidden />
                <p className="mt-5 text-[12px] uppercase tracking-[0.16em]">{product.name} — {color.name}</p>
                <p className="t-italic-thin mt-2 text-[14px]">{tr("Photography for this colour is coming soon.")}</p>
              </div>
            </div>
          )}
        </section>

        {/* Buy box */}
        <section aria-labelledby="pname" className="gutter py-10 lg:py-0">
          <div className="lg:sticky lg:top-[150px] lg:mx-auto lg:max-w-[460px] lg:pb-24 lg:pt-14">
            <nav aria-label={tr("Breadcrumb")} className="t-micro text-mute">
              <Link to="/shop" className="hover:text-ink">{tr("Clothing")}</Link> / <Link to={`/shop/${cat.slug}`} className="hover:text-ink">{tr(cat.name)}</Link>
            </nav>
            {product.isNew ? <p className="mt-6 inline-block rounded-[6px] bg-studio px-3 py-0.5 text-[11px]">{tr("NEW")}</p> : null}
            <div className="mt-4 flex items-start justify-between gap-6">
              <h1 id="pname" className="t-display text-[clamp(30px,2.6vw,46px)]">{product.name}</h1>
              <Price p={product} className="pt-1 text-[15px]" />
            </div>
            <p className="t-italic-thin mt-1 text-[14px]">{tr("100% linen")} · {useLang.getState().lang === "pt" ? cat.name : cat.namePt}</p>
            <p className="mt-6 text-[14px] font-light leading-[1.75] text-ink/85">{tr(product.description)}</p>

            <div className="mt-9">
              <p className="field-label">{tr("Colour —")} <span className="text-ink">{color.name}</span></p>
              <div className="mt-3">
                <Swatches colors={product.colors} active={colorIdx} size={28} onPick={(i) => { const n = new URLSearchParams(params); if (i) n.set("color", product.colors[i].name); else n.delete("color"); setParams(n, { replace: true, preventScrollReset: true }); }} />
              </div>
            </div>

            <div ref={sizesRef} className="mt-8 scroll-mt-28">
              <div className="flex items-center justify-between">
                <p className="field-label" id="size-l">{tr("Size")}</p>
                <button type="button" onClick={() => setGuide(true)} className="u-line text-[11px] uppercase tracking-[0.12em]">{tr("Size guide")}</button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby="size-l">
                {SIZES.map((s) => {
                  const st = stockFor(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={size === s}
                      disabled={st === 0}
                      onClick={() => { setSize(s); setErr(""); setQty(1); }}
                      className={`relative h-12 border text-[13px] transition-colors disabled:cursor-not-allowed disabled:text-ink/30 ${size === s ? "border-ink bg-ink text-white" : "border-hair hover:border-ink/60"}`}
                    >
                      {s}
                      <span className="sr-only"> ({SIZE_INTL[s]}){st === 0 ? ", sold out" : ""}</span>
                      {st === 0 ? <span className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -rotate-[20deg] bg-ink/25" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 min-h-5 text-[12px] font-light text-mute" aria-live="polite">
                {size ? (stockFor(size) <= 3 ? tr("Only {n} left in {s}", { n: stockFor(size), s: size }) : tr("{s} — in stock", { s: `${size}${SIZE_INTL[size] !== size ? ` (${SIZE_INTL[size]})` : ""}` })) : ""}
              </p>
            </div>

            <div ref={buyRef} className="mt-4 flex gap-3">
              <div className="flex h-[50px] items-center border border-hair" aria-label={tr("Quantity")} role="group">
                <button type="button" className="h-full w-11 text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={tr("Decrease quantity")}>−</button>
                <output className="w-8 text-center text-[14px] tabular-nums" aria-live="polite">{qty}</output>
                <button type="button" className="h-full w-11 text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.min(Math.max(1, max), q + 1))} disabled={qty >= Math.max(1, max)} aria-label={tr("Increase quantity")}>+</button>
              </div>
              <button type="button" onClick={submit} className="btn btn-dark relative flex-1 overflow-hidden">
                <span className={`transition-transform duration-500 ease-[var(--ease-expo)] ${added ? "-translate-y-[180%]" : ""}`}>{tr("Add to bag")}</span>
                <span className={`absolute inset-0 grid place-items-center transition-transform duration-500 ease-[var(--ease-expo)] ${added ? "" : "translate-y-full"}`} aria-hidden={!added}>{tr("Added ✓")}</span>
              </button>
            </div>
            {err ? <p role="alert" className="mt-3 text-[12px] text-brown">{tr(err)}</p> : null}

            <div className="mt-10 border-t border-hair">
              <Acc title={tr("Details")} open>
                <ul className="list-inside list-disc space-y-1">{product.details.map((d) => <li key={d}>{tr(d)}</li>)}</ul>
              </Acc>
              <Acc title={tr("Composition & care")}>
                <p><strong className="font-normal">{tr("100% linen.")}</strong> {tr(CARE_TEXT)}</p>
              </Acc>
              <Acc title={tr("Fit")}>
                <p>{tr(product.fit)}</p>
              </Acc>
              <Acc title={tr("Shipping & returns")}>
                <p>{tr("Complimentary shipping across Brazil on orders over R$1.500. Returns accepted within 30 days, unworn and with labels.")} <span className="demo-tag ml-1">{tr("Demo")}</span></p>
              </Acc>
            </div>
            <p className="t-micro mt-6 text-mute">{tr("Ref.")} {product.sku}</p>
          </div>
        </section>
      </div>

      {/* Mobile: the purchase stays one tap away while the buy box is above the fold line */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm transition-transform duration-500 ease-[var(--ease-expo)] lg:hidden ${buyHidden ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!buyHidden}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] uppercase">{product.name}</p>
            <p className="text-[12px] font-light text-mute">{color.name}{size ? ` · ${size}` : ""} · {formatBRL(product.price)}</p>
          </div>
          <button type="button" tabIndex={buyHidden ? 0 : -1} onClick={submit} className="btn btn-dark min-h-[46px] px-5">{size ? tr("Add to bag") : tr("Select size")}</button>
        </div>
      </div>

      {related.length ? (
        <section className="border-t border-hair px-[clamp(16px,1.35vw,27px)] py-[clamp(64px,7vw,140px)]" aria-labelledby="also">
          <h2 id="also" className="t-display mb-[clamp(32px,3.5vw,64px)] text-center text-[clamp(26px,2.4vw,44px)]" data-r="lines">{tr("You may also like")}</h2>
          <div className="grid grid-cols-2 gap-x-[clamp(12px,2.2vw,44px)] gap-y-12 lg:grid-cols-4" data-stagger>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ) : null}

      <SizeGuide open={guide} onClose={() => setGuide(false)} rows={SIZE_CHART[product.category]} />
    </div>
  );
}

function Acc({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group border-b border-hair" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[12px] uppercase tracking-[0.12em] [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg font-extralight transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span>
      </summary>
      <div className="pb-5 text-[13px] font-light leading-[1.75] text-ink/85">{children}</div>
    </details>
  );
}

export function SizeGuide({ open, onClose, rows }: { open: boolean; onClose: () => void; rows: Array<{ label: string; values: number[] }> }) {
  const ref = useDialog<HTMLDivElement>(open, onClose);
  return (
    <div className={`fixed inset-0 z-[80] grid place-items-center p-4 transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!open}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="sg" className="relative w-full min-w-0 max-w-[640px] bg-white p-6 md:p-10">
        <div className="flex items-start justify-between">
          <h2 id="sg" className="t-display text-[28px]">{tr("Size guide")}</h2>
          <button type="button" onClick={onClose} className="t-nav text-[12px]">{tr("Close")}</button>
        </div>
        <p className="t-italic-thin mt-1 text-[14px]">{tr("Garment measurements, in centimetres.")}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[13px] tabular-nums">
            <thead>
              <tr className="border-b border-ink">
                <th className="py-3 font-normal uppercase tracking-[0.1em]">{tr("Size")}</th>
                {SIZES.map((s) => <th key={s} className="py-3 text-center font-normal">{s}<span className="block text-[10px] text-mute">{SIZE_INTL[s]}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-hair">
                  <th scope="row" className="py-3 font-light">{tr(r.label)}</th>
                  {r.values.map((v, i) => <td key={i} className="py-3 text-center font-light">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-[12px] font-light text-mute">{tr("Between two sizes? Linen relaxes with wear — choose the smaller for a closer fit.")}</p>
      </div>
    </div>
  );
}
