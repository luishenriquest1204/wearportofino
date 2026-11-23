import { useId, useState } from "react";
import { tr } from "../i18n";

/** Newsletter sign-up — demonstration only: nothing is sent or stored outside this tab. */
export function NewsletterForm({ align = "center" }: { align?: "center" | "left" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Please enter a valid email address.");
    if (!ok) return setErr("Please accept to receive our notes.");
    setErr("");
    setDone(true);
  };
  if (done)
    return (
      <p role="status" className={`t-italic-thin text-[clamp(15px,1.2vw,20px)] ${align === "center" ? "text-center" : ""}`}>
        {tr("Grazie — you are on the list.")} <span className="demo-tag not-italic">{tr("Demo · nothing was sent")}</span>
      </p>
    );
  return (
    <form onSubmit={submit} noValidate className={`mx-auto w-full max-w-[780px] ${align === "left" ? "mx-0" : ""}`}>
      <div className="flex items-end gap-6 border-b border-ink">
        <label htmlFor={`${id}-e`} className="sr-only">{tr("Email address")}</label>
        <input
          id={`${id}-e`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tr("Enter your email address")}
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-err` : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-[16px] font-extralight italic md:text-[clamp(14px,1.05vw,20px)] placeholder:text-ink/70 focus:outline-none"
        />
        <button type="submit" className="pb-3 text-[clamp(12px,0.9vw,17px)] font-light uppercase tracking-[0.04em] hover:opacity-60">{tr("Subscribe")}</button>
      </div>
      <label className={`mt-5 flex cursor-pointer items-start gap-3 text-left text-[clamp(11px,0.72vw,14px)] font-light uppercase leading-snug ${align === "center" ? "mx-auto max-w-[600px]" : ""}`}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-navy" />
        <span>{tr("I agree to receive emails from PORTOFINO and accept the privacy policy.")}</span>
      </label>
      {err ? <p id={`${id}-err`} role="alert" className="mt-3 text-[12px] text-brown">{tr(err)}</p> : null}
    </form>
  );
}
