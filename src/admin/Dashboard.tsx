import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, ChartTip, C, Kpi, PageHead, Pill, RangePicker, statusTone } from "./ui";
import { metrics, useRangeOrders } from "./store";
import { productRanking, timeSeries } from "./series";
import { useCatalog } from "../store/catalog";
import { formatBRL, formatBRLFull, SIZES } from "../data/catalog";

export const LOW = 2;

export default function Dashboard() {
  const { cur, prev, start, range } = useRangeOrders();
  const products = useCatalog((s) => s.products);
  const m = metrics(cur);
  const pm = metrics(prev);
  const series = useMemo(() => timeSeries(cur, start, range), [cur, start, range]);
  const top = useMemo(() => productRanking(cur), [cur]);
  const low = products.flatMap((p) => Object.entries(p.stock).flatMap(([color, s]) => SIZES.filter((z) => s[z] <= LOW).map((z) => ({ p, color, size: z, qty: s[z] }))));
  const maxTop = Math.max(1, ...top.map((t) => t.revenue));

  return (
    <>
      <PageHead title="Dashboard" sub="An overview of the store — demonstration data">
        <RangePicker />
      </PageHead>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Revenue" value={formatBRL(m.revenue)} cur={m.revenue} prev={pm.revenue} />
        <Kpi label="Orders" value={String(m.orders)} cur={m.orders} prev={pm.orders} />
        <Kpi label="Average ticket" value={formatBRL(m.aov)} cur={m.aov} prev={pm.aov} />
        <Kpi label="Products sold" value={String(m.units)} cur={m.units} prev={pm.units} />
        <Kpi label="Low-stock variants" value={String(low.length)} hint={`${LOW} units or fewer`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card title="Revenue">
          <div className="h-[280px]" role="img" aria-label={`Revenue over the selected period, total ${formatBRLFull(m.revenue)}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.a} stopOpacity={0.18} /><stop offset="100%" stopColor={C.a} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} width={64} tickFormatter={(v) => formatBRL(v)} />
                <Tooltip content={<ChartTip fmt={formatBRL} />} cursor={{ stroke: C.axis, strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.a} strokeWidth={2} fill="url(#rev)" activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top products" action={<Link to="/admin/analytics" className="text-[12px] text-mute hover:text-ink">Analytics →</Link>}>
          {top.length ? (
            <ol className="space-y-4">
              {top.map((t, i) => (
                <li key={t.id}>
                  <div className="flex justify-between gap-3"><span><span className="mr-2 text-mute tabular-nums">{i + 1}</span>{t.name}</span><span className="tabular-nums">{formatBRL(t.revenue)}</span></div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#f1f0ed]"><div className="h-1.5 rounded-full" style={{ width: `${(t.revenue / maxTop) * 100}%`, background: C.a }} /></div>
                  <p className="mt-1 text-[11px] text-mute">{t.units} units</p>
                </li>
              ))}
            </ol>
          ) : <p className="py-8 text-center text-mute">No sales in this period.</p>}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card title="Recent orders" pad={false} action={<Link to="/admin/orders" className="text-[12px] text-mute hover:text-ink">All orders →</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Order</th><th className="font-normal">Customer</th><th className="font-normal">Date</th><th className="font-normal">Status</th><th className="px-5 text-right font-normal">Total</th></tr></thead>
              <tbody>
                {cur.slice(0, 7).map((o) => (
                  <tr key={o.id} className="border-t border-[#efeeeb]">
                    <td className="px-5 py-3 tabular-nums">#{o.number}</td><td>{o.customer}</td><td className="text-mute">{o.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td><td><Pill tone={statusTone(o.status)}>{o.status}</Pill></td><td className="px-5 text-right tabular-nums">{formatBRL(o.total)}</td>
                  </tr>
                ))}
                {!cur.length ? <tr><td colSpan={5} className="px-5 py-8 text-center text-mute">No orders in this period.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Low stock" action={<Link to="/admin/inventory" className="text-[12px] text-mute hover:text-ink">Inventory →</Link>}>
          {low.length ? (
            <ul className="space-y-3">
              {low.slice(0, 8).map((l) => (
                <li key={`${l.p.id}${l.color}${l.size}`} className="flex items-center gap-3">
                  <AlertTriangle size={14} className={l.qty === 0 ? "text-[#a33a2b]" : "text-[#8a5a12]"} aria-hidden />
                  <span className="flex-1">{l.p.name} <span className="text-mute">· {l.color} · {l.size}</span></span>
                  <Pill tone={l.qty === 0 ? "bad" : "warn"}>{l.qty === 0 ? "Sold out" : `${l.qty} left`}</Pill>
                </li>
              ))}
              {low.length > 8 ? <li className="text-[12px] text-mute">+{low.length - 8} more</li> : null}
            </ul>
          ) : <p className="py-6 text-center text-mute">All variants are well stocked.</p>}
        </Card>
      </div>
    </>
  );
}
