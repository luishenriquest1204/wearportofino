import { useMemo, useState } from "react";
import { CUSTOMERS } from "../data/mock";
import { isValid, useOrders } from "./store";
import { Card, Kpi, PageHead, Pill, inputCls } from "./ui";
import { formatBRL } from "../data/catalog";

type Sort = "spend" | "orders" | "recent" | "name";
export default function Customers() {
  const orders = useOrders();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("spend");
  const rows = useMemo(() => {
    const r = CUSTOMERS.map((c) => {
      const mine = orders.filter((o) => o.customerId === c.id);
      const ok = mine.filter(isValid);
      return { ...c, orders: ok.length, spend: ok.reduce((s, o) => s + o.total, 0), last: mine[0]?.date ?? null };
    }).filter((c) => !q || `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
    return r.sort((a, b) => (sort === "spend" ? b.spend - a.spend : sort === "orders" ? b.orders - a.orders : sort === "recent" ? (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0) : a.name.localeCompare(b.name)));
  }, [orders, q, sort]);
  const buyers = rows.filter((r) => r.orders > 0);
  const repeat = buyers.filter((r) => r.orders > 1).length;
  const ltv = buyers.length ? buyers.reduce((s, r) => s + r.spend, 0) / buyers.length : 0;
  return (
    <>
      <PageHead title="Customers" sub="Fictional customers — every email uses the reserved example.com domain" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Customers" value={String(CUSTOMERS.length)} hint="All time" />
        <Kpi label="With purchases" value={String(buyers.length)} hint="Valid orders" />
        <Kpi label="Repeat rate" value={`${buyers.length ? Math.round((repeat / buyers.length) * 100) : 0}%`} hint="2+ orders" />
        <Kpi label="Average lifetime value" value={formatBRL(Math.round(ltv))} hint="Per buying customer" />
      </div>
      <Card className="mt-4" pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-[#efeeeb] p-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or city" aria-label="Search customers" className={`${inputCls} max-w-[340px]`} />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className={`${inputCls} w-auto`}><option value="spend">Highest spend</option><option value="orders">Most orders</option><option value="recent">Most recent</option><option value="name">Name</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Customer</th><th className="font-normal">City</th><th className="font-normal">Orders</th><th className="font-normal">Last order</th><th className="font-normal">Segment</th><th className="px-5 text-right font-normal">Total spent</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-[#efeeeb]">
                  <td className="px-5 py-2.5"><span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#f1f0ed] text-[11px]">{c.name.split(" ").map((n) => n[0]).join("")}</span><span><span className="block">{c.name}</span><span className="text-[11px] text-mute">{c.email}</span></span></span></td>
                  <td>{c.city}</td>
                  <td className="tabular-nums">{c.orders}</td>
                  <td className="text-mute">{c.last ? c.last.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  <td>{c.orders >= 5 ? <Pill tone="info">Loyal</Pill> : c.orders >= 2 ? <Pill tone="good">Returning</Pill> : c.orders === 1 ? <Pill>New</Pill> : <Pill tone="warn">No purchase</Pill>}</td>
                  <td className="px-5 text-right tabular-nums">{formatBRL(c.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
