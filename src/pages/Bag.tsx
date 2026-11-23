import { Link } from "react-router";
import { tr } from "../i18n";
import { useBag } from "../store/shop";
import { FREE_SHIPPING, useBagRows } from "../store/useBagRows";
import { formatBRL, SIZE_INTL } from "../data/catalog";

export default function Bag() {
  const { rows, subtotal, count } = useBagRows();
  const { setQty, remove } = useBag();
  const left = FREE_SHIPPING - subtotal;
  return (
    <div className="pt-header">
      <section className="gutter pb-[clamp(64px,8vw,160px)] pt-[clamp(36px,4.5vw,90px)]">
        <h1 className="t-display text-[clamp(40px,5.2vw,104px)]">{tr("Shopping bag")} <span className="font-sans text-[clamp(14px,1vw,18px)] font-extralight tracking-normal">({count})</span></h1>
        {!rows.length ? (
          <div className="py-24 text-center">
            <p className="t-italic-thin text-[20px]">{tr("Your bag is empty.")}</p>
            <Link to="/shop" className="btn btn-dark mt-8">{tr("Discover the collection")}</Link>
          </div>
        ) : (
          <div className="mt-[clamp(32px,4vw,72px)] grid gap-14 lg:grid-cols-[1fr_400px] lg:gap-20">
            <ul className="border-t border-hair">
              {rows.map(({ l, i, p, img, max }) => (
                <li key={`${l.productId}-${l.color}-${l.size}`} className="grid grid-cols-[96px_1fr] gap-5 border-b border-hair py-7 md:grid-cols-[140px_1fr]">
                  <Link to={`/product/${p.slug}`} className="block aspect-[428/503] overflow-hidden bg-studio">{img ? <img src={img} alt={tr("{p} in {c}", { p: p.name, c: l.color })} className="h-full w-full object-cover" /> : null}</Link>
                  <div className="flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link to={`/product/${p.slug}`} className="t-caps text-[15px] hover:underline">{p.name}</Link>
                        <p className="mt-1 text-[12px] font-light uppercase text-mute">{l.color} · {tr("Size")} {l.size} ({SIZE_INTL[l.size]}) · {tr("100% linen")}</p>
                      </div>
                      <p className="text-[15px] tabular-nums">{formatBRL(p.price * l.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <div className="flex h-10 items-center border border-hair" role="group" aria-label={tr("Quantity of {p}", { p: p.name })}>
                        <button type="button" className="h-full w-10 disabled:opacity-30" disabled={l.qty <= 1} onClick={() => setQty(i, l.qty - 1)} aria-label={tr("Decrease")}>−</button>
                        <span className="w-8 text-center text-[13px] tabular-nums">{l.qty}</span>
                        <button type="button" className="h-full w-10 disabled:opacity-30" disabled={l.qty >= max} onClick={() => setQty(i, l.qty + 1)} aria-label={tr("Increase")}>+</button>
                      </div>
                      <button type="button" onClick={() => remove(i)} className="t-micro u-line text-mute hover:text-ink">{tr("Remove")}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit bg-offwhite p-7 lg:sticky lg:top-[150px]" aria-label={tr("Summary")}>
              <h2 className="t-nav">{tr("Summary")}</h2>
              <dl className="mt-6 space-y-3 text-[13px]">
                <div className="flex justify-between"><dt className="font-light uppercase">{tr("Subtotal")}</dt><dd className="tabular-nums">{formatBRL(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="font-light uppercase">{tr("Shipping")}</dt><dd>{left <= 0 ? "Complimentary" : "At checkout"}</dd></div>
              </dl>
              <div className="mt-5 h-px bg-hair"><div className="h-px bg-navy transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} /></div>
              <p className="mt-2 text-[11px] font-light uppercase text-mute">{left > 0 ? tr("{v} away from complimentary shipping", { v: formatBRL(left) }) : tr("You have complimentary shipping")}</p>
              <Link to="/checkout" className="btn btn-dark mt-7 w-full">{tr("Checkout")}</Link>
              <Link to="/shop" className="t-micro mt-4 block text-center text-mute hover:text-ink">{tr("Continue shopping")}</Link>
              <p className="mt-6 text-center text-[11px] font-light text-mute">{tr("Demonstration store — no payment is processed.")}</p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
