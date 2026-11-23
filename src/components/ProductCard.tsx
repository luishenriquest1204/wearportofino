import { Link } from "react-router";
import { tr } from "../i18n";
import { useState } from "react";
import { formatBRL, type Product } from "../data/catalog";

export function Price({ p, className = "" }: { p: Pick<Product, "price" | "compareAt">; className?: string }) {
  return (
    <p className={`leading-[1.25] tabular-nums ${className}`}>
      {p.compareAt && p.compareAt > p.price ? (
        <span className="mr-2 inline-block text-faint line-through decoration-[0.5px] sm:mr-0 sm:block sm:no-underline">
          <span className="sr-only">{tr("Was")} </span>
          {formatBRL(p.compareAt)}
        </span>
      ) : null}
      <span className="inline-block sm:block">
        {p.compareAt ? <span className="sr-only">{tr("Now")} </span> : null}
        {formatBRL(p.price)}
      </span>
    </p>
  );
}

export function Swatches({ colors, active, onPick, size = 24 }: { colors: Product["colors"]; active?: number; onPick?: (i: number) => void; size?: number }) {
  return (
    <ul className="flex items-center gap-2" aria-label={tr("Colours")}>
      {colors.map((c, i) => (
        <li key={c.name}>
          <button
            type="button"
            onClick={() => onPick?.(i)}
            aria-label={tr("Colour: {c}", { c: c.name })}
            aria-pressed={active === i}
            title={c.name}
            className={`block rounded-full border transition-[box-shadow] ${active === i ? "border-ink shadow-[0_0_0_2px_#fff,0_0_0_3px_#191919]" : "border-ink/80"}`}
            style={{ width: size, height: size, background: c.hex }}
          />
        </li>
      ))}
    </ul>
  );
}

/** Product cell as in the reference: studio image, NEW pill, uppercase name, two-line price, swatches. */
export function ProductCard({ product, showSwatches = true, eager = false }: { product: Product; showSwatches?: boolean; eager?: boolean }) {
  const [active, setActive] = useState(0);
  const color = product.colors[active];
  const front = color.image ?? product.colors[0].image ?? product.gallery[0]?.src;
  const alt = product.gallery[1]?.src;
  const href = `/product/${product.slug}${active ? `?color=${encodeURIComponent(color.name)}` : ""}`;
  return (
    <article className="group">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[428/503] overflow-hidden bg-studio">
        <img src={front} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-[1.04] ${alt ? "group-hover:opacity-0" : ""}`} />
        {alt ? <img src={alt} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-100 group-hover:opacity-100" /> : null}
        {product.isNew ? <span className="absolute left-[3%] top-[2.5%] rounded-[6px] bg-white px-3.5 py-1 text-[12px] font-light leading-5 text-ink">{tr("NEW")}</span> : null}
        {!color.image ? <span className="absolute bottom-3 left-3 right-3 bg-white/85 px-2 py-1 text-center text-[10px] uppercase tracking-[0.12em] text-ink/70">{tr("{c} — photography coming soon", { c: color.name })}</span> : null}
      </Link>
      <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="t-caps text-[clamp(13px,1vw,15px)] leading-[1.3]">
            <Link to={href} className="hover:underline hover:underline-offset-4">{product.name}</Link>
          </h3>
          {showSwatches ? <div className="mt-2.5"><Swatches colors={product.colors} active={active} onPick={setActive} size={22} /></div> : null}
        </div>
        <Price p={product} className="shrink-0 text-[13px] sm:text-right sm:text-[clamp(13px,1vw,15px)]" />
      </div>
    </article>
  );
}
