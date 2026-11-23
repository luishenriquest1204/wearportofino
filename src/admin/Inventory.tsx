import { useMemo, useState } from "react";
import { useCatalog, totalStock } from "../store/catalog";
import { SIZES } from "../data/catalog";
import { Card, Kpi, PageHead, inputCls } from "./ui";
import { LOW } from "./Dashboard";

export default function Inventory() {
  const { products, setStock } = useCatalog();
  const [onlyLow, setOnlyLow] = useState(false);
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => products.flatMap((p) => p.colors.map((c) => ({ p, color: c, stock: p.stock[c.name] ?? { PP: 0, P: 0, M: 0, G: 0, GG: 0 } }))).filter((r) => (!q || `${r.p.name} ${r.p.sku} ${r.color.name}`.toLowerCase().includes(q.toLowerCase())) && (!onlyLow || SIZES.some((s) => r.stock[s] <= LOW))),
    [products, onlyLow, q],
  );
  const variants = products.reduce((s, p) => s + p.colors.length * SIZES.length, 0);
  const lowN = products.reduce((s, p) => s + Object.values(p.stock).reduce((a, st) => a + SIZES.filter((z) => st[z] > 0 && st[z] <= LOW).length, 0), 0);
  const outN = products.reduce((s, p) => s + Object.values(p.stock).reduce((a, st) => a + SIZES.filter((z) => st[z] === 0).length, 0), 0);
  const units = products.reduce((s, p) => s + totalStock(p), 0);
  const value = products.reduce((s, p) => s + totalStock(p) * p.cost, 0);
  return (
    <>
      <PageHead title="Inventory" sub="Edit quantities directly — the storefront updates size availability immediately" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Units in stock" value={String(units)} hint={`${variants} variants`} />
        <Kpi label="Stock value (cost)" value={`R$${(value / 100).toLocaleString("pt-BR")}`} hint="At cost per item" />
        <Kpi label="Low stock" value={String(lowN)} hint={`1–${LOW} units`} />
        <Kpi label="Sold out" value={String(outN)} hint="Variants at zero" />
      </div>
      <Card className="mt-4" pad={false}>
        <div className="flex flex-wrap items-center gap-4 border-b border-[#efeeeb] p-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product, SKU or colour" aria-label="Search inventory" className={`${inputCls} max-w-[320px]`} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="accent-navy" /> Only low or sold-out</label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Product</th><th className="font-normal">Colour</th><th className="font-normal">SKU</th>{SIZES.map((s) => <th key={s} className="w-[86px] text-center font-normal">{s}</th>)}<th className="px-5 text-right font-normal">Total</th></tr></thead>
            <tbody>
              {rows.map(({ p, color, stock }) => (
                <tr key={p.id + color.name} className="border-t border-[#efeeeb]">
                  <td className="px-5 py-2.5">{p.name}</td>
                  <td><span className="flex items-center gap-2"><span className="size-3.5 rounded-full border border-ink/30" style={{ background: color.hex }} />{color.name}</span></td>
                  <td className="text-[12px] text-mute">{p.sku}-{color.name.slice(0, 3).toUpperCase()}</td>
                  {SIZES.map((s) => {
                    const v = stock[s];
                    return (
                      <td key={s} className="px-1 text-center">
                        <input
                          type="number"
                          min={0}
                          value={v}
                          aria-label={`${p.name} ${color.name} ${s} quantity`}
                          onChange={(e) => setStock(p.id, color.name, s, +e.target.value || 0)}
                          className={`w-[70px] rounded-md border px-2 py-1.5 text-center tabular-nums outline-none focus:border-ink/50 ${v === 0 ? "border-[#ecc9c2] bg-[#fbefec] text-[#a33a2b]" : v <= LOW ? "border-[#efd9b0] bg-[#fdf6e9] text-[#8a5a12]" : "border-hair"}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-5 text-right tabular-nums">{SIZES.reduce((a, s) => a + stock[s], 0)}</td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={9} className="py-12 text-center text-mute">Nothing to show.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <p className="flex flex-wrap gap-5 border-t border-[#efeeeb] px-5 py-3 text-[11px] text-mute">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-[#efd9b0] bg-[#fdf6e9]" /> Low (1–{LOW})</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-[#ecc9c2] bg-[#fbefec]" /> Sold out</span>
        </p>
      </Card>
    </>
  );
}
