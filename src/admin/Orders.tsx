import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAdmin, useRangeOrders } from "./store";
import { Card, PageHead, Pill, RangePicker, inputCls, statusTone } from "./ui";
import { Modal } from "./Products";
import { formatBRL, formatBRLFull } from "../data/catalog";
import type { MockOrder, OrderStatus } from "../data/mock";

const ALL: OrderStatus[] = ["Awaiting payment", "Paid", "Preparing", "Shipped", "Delivered", "Cancelled", "Refunded"];
const PER = 15;

export default function Orders() {
  const { cur } = useRangeOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [pay, setPay] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<MockOrder | null>(null);
  const list = useMemo(() => cur.filter((o) => (!q || `#${o.number} ${o.customer} ${o.email}`.toLowerCase().includes(q.toLowerCase())) && (!status || o.status === status) && (!pay || o.payment === pay)), [cur, q, status, pay]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const pg = Math.min(page, pages);
  const counts = ALL.map((s) => [s, cur.filter((o) => o.status === s).length] as const);
  return (
    <>
      <PageHead title="Orders" sub={`${list.length} of ${cur.length} orders in this period`}><RangePicker /></PageHead>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <button type="button" onClick={() => { setStatus(""); setPage(1); }} className={`whitespace-nowrap rounded-full border px-3 py-1 text-[12px] ${!status ? "border-ink bg-ink text-white" : "border-hair bg-white"}`}>All · {cur.length}</button>
        {counts.map(([s, n]) => <button key={s} type="button" onClick={() => { setStatus(s); setPage(1); }} className={`whitespace-nowrap rounded-full border px-3 py-1 text-[12px] ${status === s ? "border-ink bg-ink text-white" : "border-hair bg-white"}`}>{s} · {n}</button>)}
      </div>
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-[#efeeeb] p-4">
          <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search orders</span><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Order number, customer or email" className={`${inputCls} pl-8`} /></label>
          <select value={pay} onChange={(e) => { setPay(e.target.value); setPage(1); }} aria-label="Payment" className={`${inputCls} w-auto`}><option value="">Any payment</option><option>Pix</option><option>Card</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Order</th><th className="font-normal">Date</th><th className="font-normal">Customer</th><th className="font-normal">Items</th><th className="font-normal">Payment</th><th className="font-normal">Status</th><th className="px-5 text-right font-normal">Total</th></tr></thead>
            <tbody>
              {list.slice((pg - 1) * PER, pg * PER).map((o) => (
                <tr key={o.id} onClick={() => setOpen(o)} className="cursor-pointer border-t border-[#efeeeb] hover:bg-[#fafaf8]">
                  <td className="px-5 py-3"><button type="button" className="tabular-nums hover:underline" onClick={(e) => { e.stopPropagation(); setOpen(o); }}>#{o.number}</button></td>
                  <td className="text-mute">{o.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td><span className="block">{o.customer}</span><span className="text-[11px] text-mute">{o.email}</span></td>
                  <td className="tabular-nums">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                  <td>{o.payment}</td>
                  <td><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                  <td className="px-5 text-right tabular-nums">{formatBRL(o.total)}</td>
                </tr>
              ))}
              {!list.length ? <tr><td colSpan={7} className="py-12 text-center text-mute">No orders match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#efeeeb] px-5 py-3 text-[12px] text-mute">
          <span>Page {pg} of {pages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={pg <= 1} onClick={() => setPage(pg - 1)} className="rounded-md border border-hair bg-white px-3 py-1 disabled:opacity-40">Previous</button>
            <button type="button" disabled={pg >= pages} onClick={() => setPage(pg + 1)} className="rounded-md border border-hair bg-white px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
      {open ? <OrderDetail o={cur.find((x) => x.id === open.id) ?? open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function OrderDetail({ o, onClose }: { o: MockOrder; onClose: () => void }) {
  const { setStatus, notify } = useAdmin();
  const sub = o.items.reduce((s, i) => s + i.qty * i.price, 0);
  return (
    <Modal title={`Order #${o.number}`} onClose={onClose} wide>
      <div className="flex flex-wrap items-center gap-3">
        <Pill tone={statusTone(o.status)}>{o.status}</Pill>
        <span className="text-mute">{o.date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {o.payment}</span>
        <label className="ml-auto flex items-center gap-2 text-[12px]">Change status
          <select value={o.status} onChange={(e) => { setStatus(o.id, e.target.value as OrderStatus); notify(`Order #${o.number} → ${e.target.value}`); }} className={`${inputCls} w-auto py-1.5`}>{ALL.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </div>
      <div className="mt-5 rounded-lg bg-[#f7f7f5] p-4"><p>{o.customer}</p><p className="text-mute">{o.email}</p></div>
      <table className="mt-5 w-full text-left">
        <tbody>
          {o.items.map((i, k) => (
            <tr key={k} className="border-b border-[#efeeeb]"><td className="py-2.5">{i.name}<span className="block text-[11px] text-mute">{i.color} · {i.size}</span></td><td className="text-mute tabular-nums">× {i.qty}</td><td className="text-right tabular-nums">{formatBRL(i.qty * i.price)}</td></tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 space-y-1.5 text-[13px]">
        <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="tabular-nums">{formatBRLFull(sub)}</dd></div>
        {o.discount ? <div className="flex justify-between"><dt className="text-mute">Discount</dt><dd className="tabular-nums">− {formatBRLFull(o.discount)}</dd></div> : null}
        <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd className="tabular-nums">{o.shipping ? formatBRLFull(o.shipping) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-[#efeeeb] pt-2 text-[14px]"><dt>Total</dt><dd className="tabular-nums">{formatBRLFull(o.total)}</dd></div>
      </dl>
    </Modal>
  );
}
