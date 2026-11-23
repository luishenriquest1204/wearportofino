import { useAdmin, RANGES } from "./store";

export const C = { a: "#2F4F8F", b: "#B07A3C", grid: "#ECEBE8", axis: "#8C8C8C", ink: "#191919" };

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-normal tracking-[-0.01em]">{title}</h1>
        {sub ? <p className="mt-1 text-[13px] text-mute">{sub}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function RangePicker() {
  const { range, setRange } = useAdmin();
  return (
    <div className="flex rounded-lg border border-hair bg-white p-0.5 text-[12px]" role="radiogroup" aria-label="Period">
      {RANGES.map(([k, l]) => (
        <button key={k} type="button" role="radio" aria-checked={range === k} onClick={() => setRange(k)} className={`rounded-md px-3 py-1.5 transition-colors ${range === k ? "bg-ink text-white" : "text-ink/70 hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function Card({ title, action, children, className = "", pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`min-w-0 rounded-xl border border-hair bg-white ${className}`}>
      {title ? (
        <header className="flex items-center justify-between border-b border-[#efeeeb] px-5 py-3.5">
          <h2 className="text-[13px] font-normal">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return <span className="text-[11px] text-mute">— vs previous</span>;
  const d = ((cur - prev) / prev) * 100;
  const up = d >= 0;
  return (
    <span className={`text-[11px] ${up ? "text-[#2c6e49]" : "text-[#a33a2b]"}`}>
      {up ? "▲" : "▼"} {Math.abs(d).toFixed(1)}% <span className="text-mute">vs previous period</span>
    </span>
  );
}

export function Kpi({ label, value, cur, prev, hint }: { label: string; value: string; cur?: number; prev?: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-hair bg-white p-5">
      <p className="text-[12px] text-mute">{label}</p>
      <p className="mt-2 text-[26px] font-light tabular-nums tracking-[-0.01em]">{value}</p>
      <div className="mt-1 min-h-4">{cur !== undefined && prev !== undefined ? <Delta cur={cur} prev={prev} /> : <span className="text-[11px] text-mute">{hint}</span>}</div>
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  const t = { neutral: "bg-[#f1f0ed] text-ink/80", good: "bg-[#e6f1ea] text-[#2c6e49]", warn: "bg-[#fbf0dc] text-[#8a5a12]", bad: "bg-[#f8e5e1] text-[#a33a2b]", info: "bg-[#e7ecf6] text-[#2F4F8F]" }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${t}`}>{children}</span>;
}

export const statusTone = (s: string) => (s === "Delivered" ? "good" : s === "Shipped" || s === "Preparing" || s === "Paid" ? "info" : s === "Awaiting payment" ? "warn" : "bad") as "good" | "info" | "warn" | "bad";

export function ChartTip({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string; fmt: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hair bg-white px-3 py-2 text-[12px] shadow-sm">
      <p className="text-mute">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-0.5 flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
          <span className="text-ink/70">{p.name}</span> <span className="ml-auto pl-3">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-hair bg-white px-3 py-2 text-base outline-none md:text-[13px] transition-colors focus:border-ink/50";
export const btn = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] transition-colors disabled:opacity-40";
export const btnDark = `${btn} bg-ink text-white hover:bg-navy`;
export const btnLine = `${btn} border border-hair bg-white hover:border-ink/40`;
