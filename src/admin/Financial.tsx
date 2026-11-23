import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCatalog } from "../store/catalog";
import { isValid, useRangeOrders } from "./store";
import { timeSeries } from "./series";
import { C, Card, ChartTip, Kpi, PageHead, RangePicker } from "./ui";
import { formatBRL, formatBRLFull } from "../data/catalog";
import type { MockOrder } from "../data/mock";

export default function Financial() {
  const { cur, prev, start, range } = useRangeOrders();
  const products = useCatalog((s) => s.products);
  const costOf = (id: string) => products.find((p) => p.id === id)?.cost ?? 11800;
  const calc = (list: MockOrder[]) => {
    const ok = list.filter(isValid);
    const gross = ok.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty * i.price, 0), 0);
    const discounts = ok.reduce((s, o) => s + o.discount, 0);
    const shipping = ok.reduce((s, o) => s + o.shipping, 0);
    const refunds = list.filter((o) => o.status === "Refunded").reduce((s, o) => s + o.total, 0);
    const cogs = ok.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty * costOf(i.productId), 0), 0);
    const net = gross - discounts;
    return { gross, discounts, shipping, refunds, cogs, net, profit: net - cogs, margin: net ? (net - cogs) / net : 0 };
  };
  const f = calc(cur);
  const pf = calc(prev);
  const series = useMemo(() => timeSeries(cur, start, range).map((b) => ({ ...b })), [cur, start, range]);
  const chart = series.map((b) => {
    const inBucket = cur.filter(isValid).filter((o) => (range === "today" ? String(o.date.getHours()) === b.key : range === "year" ? String(o.date.getMonth()) === b.key : o.date.toDateString() === b.key));
    const r = inBucket.reduce((s, o) => s + o.total - o.shipping, 0);
    const c = inBucket.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty * costOf(i.productId), 0), 0);
    return { label: b.label, "Net revenue": r, "Gross profit": r - c };
  });
  const ok = cur.filter(isValid);
  const pix = ok.filter((o) => o.payment === "Pix").reduce((s, o) => s + o.total, 0);
  const card = ok.filter((o) => o.payment === "Card").reduce((s, o) => s + o.total, 0);
  const tot = pix + card || 1;

  return (
    <>
      <PageHead title="Financial" sub="Demonstration figures, calculated from the fictional orders"><RangePicker /></PageHead>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Net revenue" value={formatBRL(f.net)} cur={f.net} prev={pf.net} />
        <Kpi label="Gross profit" value={formatBRL(f.profit)} cur={f.profit} prev={pf.profit} />
        <Kpi label="Gross margin" value={`${(f.margin * 100).toFixed(1)}%`} hint="After cost of goods" />
        <Kpi label="Refunds" value={formatBRL(f.refunds)} cur={f.refunds} prev={pf.refunds} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card title="Net revenue and gross profit">
          <div className="h-[300px]" role="img" aria-label="Grouped bars of net revenue and gross profit per period">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barGap={2} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} width={64} tickFormatter={(v) => formatBRL(v)} />
                <Tooltip content={<ChartTip fmt={formatBRL} />} cursor={{ fill: "#f4f3f0" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: C.ink }} />
                <Bar dataKey="Net revenue" fill={C.a} radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="Gross profit" fill={C.b} radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Statement">
            <dl className="space-y-2.5">
              {[["Gross sales", f.gross], ["Discounts", -f.discounts], ["Net revenue", f.net], ["Cost of goods", -f.cogs], ["Gross profit", f.profit], ["Shipping collected", f.shipping]].map(([l, v], i) => (
                <div key={l as string} className={`flex justify-between ${i === 2 || i === 4 ? "border-t border-[#efeeeb] pt-2.5" : ""}`}><dt className={i === 2 || i === 4 ? "" : "text-mute"}>{l}</dt><dd className="tabular-nums">{(v as number) < 0 ? "− " : ""}{formatBRLFull(Math.abs(v as number))}</dd></div>
              ))}
            </dl>
          </Card>
          <Card title="Payment methods">
            <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Pix ${Math.round((pix / tot) * 100)}%, card ${Math.round((card / tot) * 100)}%`}>
              <div style={{ width: `${(pix / tot) * 100}%`, background: C.a }} />
              <div style={{ width: `${(card / tot) * 100}%`, background: C.b }} />
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: C.a }} />Pix<span className="ml-auto tabular-nums">{formatBRL(pix)} · {Math.round((pix / tot) * 100)}%</span></li>
              <li className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: C.b }} />Card<span className="ml-auto tabular-nums">{formatBRL(card)} · {Math.round((card / tot) * 100)}%</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
