import { useState } from "react";
import { CheckCircle2, CircleDashed, AlertTriangle, XCircle, Lock } from "lucide-react";
import { STORE } from "../config/store";
import { READINESS, blocking, type Status } from "../config/launch";
import TESTS from "./launch-tests.json";
import { Card, PageHead, Pill, btnDark, inputCls } from "./ui";

const TONE: Record<Status, "good" | "info" | "warn" | "bad"> = { ready: "good", prepared: "info", pending: "warn", missing: "bad" };
const LABEL: Record<Status, string> = { ready: "Ready", prepared: "Prepared (off)", pending: "Pending", missing: "Not built" };
const ICON: Record<Status, typeof CheckCircle2> = { ready: CheckCircle2, prepared: CircleDashed, pending: AlertTriangle, missing: XCircle };

type Suite = { name: string; passed: number; failed: number; cases: Array<{ name: string; ok: boolean; detail?: string }> };
const tests = TESTS as { generatedAt: string | null; summary: string; suites: Suite[] };

const PHRASE = "ATIVAR OPERAÇÃO OFICIAL";

export default function Launch() {
  const block = blocking();
  const [typed, setTyped] = useState("");
  const [shown, setShown] = useState(false);
  const counts = READINESS.reduce<Record<Status, number>>((a, i) => ({ ...a, [i.status]: a[i.status] + 1 }), { ready: 0, prepared: 0, pending: 0, missing: 0 });
  const canActivate = STORE.PRELAUNCH && block.length === 0;

  return (
    <>
      <PageHead title="Launch control" sub="Commercial state, readiness for the official launch and test results" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Current state">
          <div className="flex items-center gap-3">
            <span className={`size-2.5 rounded-full ${STORE.PRELAUNCH ? "bg-[#c9922e]" : "bg-[#2c6e49]"}`} aria-hidden />
            <p className="text-[18px]">{STORE.PRELAUNCH ? "Pre-launch" : "Official operation"}</p>
          </div>
          <dl className="mt-4 space-y-1.5 font-mono text-[12px]">
            <div className="flex justify-between"><dt>PRELAUNCH</dt><dd>{String(STORE.PRELAUNCH)}</dd></div>
            <div className="flex justify-between"><dt>COMMERCE_ENABLED</dt><dd>{String(STORE.COMMERCE_ENABLED)}</dd></div>
            <div className="flex justify-between"><dt>VITE_STORE_MODE</dt><dd>{STORE.MODE}</dd></div>
          </dl>
          <p className="mt-4 text-[12px] text-mute">Fixed when the site is built. Visitors cannot change it from the browser.</p>
        </Card>
        <Card title="What is switched off">
          <ul className="space-y-1.5 text-[13px]">
            {["Add to bag", "Shopping bag and drawer", "Checkout (all steps)", "Order creation", "Payments", "Customer accounts"].map((f) => (
              <li key={f} className="flex items-center justify-between gap-3">{f}<Pill tone={STORE.COMMERCE_ENABLED ? "good" : "neutral"}>{STORE.COMMERCE_ENABLED ? "On" : "Off"}</Pill></li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-mute">Pages, products, prices, categories and policies stay public.</p>
        </Card>
        <Card title="Readiness">
          <p className="text-[30px] font-light tabular-nums">{counts.ready}<span className="text-[16px] text-mute"> / {READINESS.length} ready</span></p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(counts) as Status[]).map((s) => <Pill key={s} tone={TONE[s]}>{LABEL[s]} · {counts[s]}</Pill>)}
          </div>
          <p className="mt-4 text-[13px]">{block.length ? <><strong className="font-normal text-[#a33a2b]">{block.length} critical items</strong> must be ready before sales can open.</> : "No critical blockers."}</p>
        </Card>
      </div>

      <Card title="Launch checklist" className="mt-4" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Item</th><th className="font-normal">Area</th><th className="font-normal">Status</th><th className="font-normal">Critical</th><th className="px-5 font-normal">Notes</th></tr></thead>
            <tbody>
              {READINESS.map((i) => {
                const Icon = ICON[i.status];
                return (
                  <tr key={i.id} className="border-t border-[#efeeeb] align-top">
                    <td className="px-5 py-3"><span className="flex items-start gap-2"><Icon size={15} className="mt-0.5 shrink-0 text-ink/50" aria-hidden />{i.label}</span></td>
                    <td className="py-3 text-mute">{i.area}</td>
                    <td className="py-3"><Pill tone={TONE[i.status]}>{LABEL[i.status]}</Pill></td>
                    <td className="py-3">{i.critical ? "Yes" : "—"}</td>
                    <td className="px-5 py-3 text-[12px] text-ink/70">{i.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Automated tests" className="mt-4" action={<span className="text-[12px] text-mute">{tests.generatedAt ? `Last run ${new Date(tests.generatedAt).toLocaleString("en-GB")}` : "Not run"}</span>}>
        <p className="text-[13px]">{tests.summary}</p>
        {tests.suites.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {tests.suites.map((s) => (
              <details key={s.name} className="rounded-lg border border-[#efeeeb] p-3">
                <summary className="flex cursor-pointer items-center justify-between gap-3">
                  <span>{s.name}</span>
                  <Pill tone={s.failed ? "bad" : "good"}>{s.passed} passed{s.failed ? ` · ${s.failed} failed` : ""}</Pill>
                </summary>
                <ul className="mt-3 space-y-1 text-[12px]">
                  {s.cases.map((c) => <li key={c.name} className={c.ok ? "text-ink/70" : "text-[#a33a2b]"}>{c.ok ? "✓" : "✕"} {c.name}{c.detail ? <span className="text-mute"> — {c.detail}</span> : null}</li>)}
                </ul>
              </details>
            ))}
          </div>
        ) : null}
      </Card>

      <Card title="Official launch activation" className="mt-4">
        <div className="flex items-start gap-3">
          <Lock size={16} className="mt-0.5 shrink-0" aria-hidden />
          <div className="text-[13px] leading-[1.7]">
            <p>Opening sales follows the <strong className="font-normal">OFFICIAL LAUNCH PROTOCOL</strong> (docs/OFFICIAL-LAUNCH-PROTOCOL.md). Activation needs every critical item ready, a passing purchase test in a sandbox, and an explicit confirmation below.</p>
            <p className="mt-2 text-mute">This panel cannot switch the live site by itself: the switch is the server-side STORE_MODE setting on the hosting project, which only the administrator can change. A visit to the site never changes the state.</p>
          </div>
        </div>
        {STORE.COMMERCE_ENABLED ? (
          <p className="mt-5 rounded-lg bg-[#e6f1ea] px-4 py-3 text-[13px] text-[#2c6e49]">Official operation is active.</p>
        ) : (
          <div className="mt-5 rounded-lg border border-[#efeeeb] p-4">
            <label htmlFor="confirm-launch" className="text-[12px] text-mute">Type <span className="font-mono text-ink">{PHRASE}</span> to prepare the activation</label>
            <div className="mt-2 flex flex-wrap gap-3">
              <input id="confirm-launch" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={!canActivate} className={`${inputCls} max-w-[320px] font-mono`} autoComplete="off" />
              <button type="button" className={btnDark} disabled={!canActivate || typed.trim() !== PHRASE} onClick={() => setShown(true)}>Prepare activation</button>
            </div>
            {!canActivate ? <p className="mt-3 text-[12px] text-[#a33a2b]">Locked: {block.length} critical items are not ready ({block.map((b) => b.label).join("; ")}).</p> : null}
            {shown ? (
              <ol className="mt-4 list-decimal space-y-1 pl-5 text-[13px]">
                <li>Run the full test suite against the sandbox payment account.</li>
                <li>On the hosting project, set STORE_MODE=live (server) and VITE_STORE_MODE=live (site).</li>
                <li>Redeploy, then run the production smoke tests without charging a customer.</li>
                <li>To revert, set both back to prelaunch and redeploy.</li>
              </ol>
            ) : null}
          </div>
        )}
      </Card>
    </>
  );
}
