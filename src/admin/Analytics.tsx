import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { metrics, useRangeOrders } from "./store";
import { productRanking, timeSeries } from "./series";
import { C, Card, ChartTip, Kpi, PageHead, RangePicker } from "./ui";
import { formatBRL } from "../data/catalog";
import { categoryOf } from "../data/mock";

/** Simulated traffic: derived deterministically from the demo orders (≈2.1% conversion). */
function hash(s: string) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

export default function Analytics() {
  const { cur, prev, start, range } = useRangeOrders();
  const series = useMemo(() => timeSeries(cur, start, range).map((b) => ({ label: b.label, Sessions: Math.round(b.orders / 0.021 + 40 + (hash(b.key) % 90)) })), [cur, start, range]);
  const sessions = series.reduce((s, b) => s + b.Sessions, 0);
  const prevSessions = Math.round(metrics(prev).orders / 0.021 + 60 * Math.max(1, series.length));
  const m = metrics(cur);
  const conv = sessions ? (m.orders / sessions) * 100 : 0;
  const funnel = [["Sessions", sessions], ["Product views", Math.round(sessions * 0.46)], ["Added to bag", Math.round(sessions * 0.083)], ["Reached checkout", Math.round(sessions * 0.041)], ["Orders", m.orders]] as const;
  const sources = [["Instagram", 0.41], ["Direct", 0.24], ["Organic search", 0.19], ["Newsletter", 0.1], ["Referral", 0.06]] as const;
  const devices = [["Mobile", 0.71], ["Desktop", 0.24], ["Tablet", 0.05]] as const;
  const byCat = useMemo(() => {
    const m2 = new Map<string, number>();
    productRanking(cur).forEach((p) => m2.set(categoryOf(p.id), (m2.get(categoryOf(p.id)) ?? 0) + p.revenue));
    return [...m2.entries()].sort((a, b) => b[1] - a[1]);
  }, [cur]);
  const maxCat = Math.max(1, ...byCat.map((c) => c[1]));

  return (
    <>
      <PageHead title="Analytics" sub="Simulated traffic — no analytics service is connected"><RangePicker /></PageHead>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Sessions" value={sessions.toLocaleString("en-GB")} cur={sessions} prev={prevSessions} />
        <Kpi label="Conversion rate" value={`${conv.toFixed(2)}%`} hint="Orders ÷ sessions" />
        <Kpi label="Revenue per session" value={formatBRL(sessions ? Math.round(m.revenue / sessions) : 0)} hint="All sessions" />
        <Kpi label="Bag abandonment" value="51%" hint="Reached checkout, no order" />
      </div>
      <Card title="Sessions" className="mt-4">
        <div className="h-[260px]" role="img" aria-label={`Simulated sessions over the period, ${sessions} in total`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<ChartTip fmt={(v) => v.toLocaleString("en-GB")} />} cursor={{ stroke: C.axis, strokeDasharray: "3 3" }} />
              <Line type="monotone" dataKey="Sessions" stroke={C.a} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Conversion funnel">
          <ol className="space-y-3">
            {funnel.map(([l, v], i) => (
              <li key={l}>
                <div className="flex justify-between"><span>{l}</span><span className="tabular-nums">{v.toLocaleString("en-GB")}{i ? <span className="ml-2 text-[11px] text-mute">{((v / (funnel[0][1] || 1)) * 100).toFixed(1)}%</span> : null}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#f1f0ed]"><div className="h-1.5 rounded-full" style={{ width: `${Math.max(1, (v / (funnel[0][1] || 1)) * 100)}%`, background: C.a }} /></div>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Traffic sources">
          <ul className="space-y-3">
            {sources.map(([l, s]) => (
              <li key={l}>
                <div className="flex justify-between"><span>{l}</span><span className="tabular-nums">{Math.round(sessions * s).toLocaleString("en-GB")} <span className="ml-1 text-[11px] text-mute">{Math.round(s * 100)}%</span></span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#f1f0ed]"><div className="h-1.5 rounded-full" style={{ width: `${(s / sources[0][1]) * 100}%`, background: C.a }} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card title="Revenue by category">
            {byCat.length ? (
              <ul className="space-y-3">
                {byCat.map(([l, v]) => (
                  <li key={l}>
                    <div className="flex justify-between"><span>{l}</span><span className="tabular-nums">{formatBRL(v)}</span></div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[#f1f0ed]"><div className="h-1.5 rounded-full" style={{ width: `${(v / maxCat) * 100}%`, background: C.a }} /></div>
                  </li>
                ))}
              </ul>
            ) : <p className="py-4 text-center text-mute">No sales in this period.</p>}
          </Card>
          <Card title="Devices">
            <ul className="space-y-1.5">{devices.map(([l, s]) => <li key={l} className="flex justify-between"><span>{l}</span><span className="tabular-nums">{Math.round(s * 100)}%</span></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}
