import { Link, useLocation, useNavigate } from "react-router";
import { plural, tr } from "../i18n";
import { useState } from "react";
import { useBag } from "../store/shop";
import { FREE_SHIPPING, SHIPPING, useBagRows, type ShipKey } from "../store/useBagRows";
import { formatBRL, formatBRLFull, SIZE_INTL } from "../data/catalog";
import { Monogram } from "../components/Marks";

type Form = { email: string; name: string; phone: string; cep: string; street: string; number: string; extra: string; district: string; city: string; state: string };
const EMPTY: Form = { email: "", name: "", phone: "", cep: "", street: "", number: "", extra: "", district: "", city: "", state: "" };
const UF = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
type Order = { number: string; email: string; name: string; total: number; ship: ShipKey; pay: "pix" | "card"; items: number };

export default function Checkout() {
  const { rows, subtotal } = useBagRows();
  const clear = useBag((s) => s.clear);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [ship, setShip] = useState<ShipKey>("standard");
  const [pay, setPay] = useState<"pix" | "card">("pix");
  const [sumOpen, setSumOpen] = useState(false);
  const shipping = subtotal >= FREE_SHIPPING && ship === "standard" ? 0 : SHIPPING[ship].price;
  const total = subtotal + shipping;

  if (!rows.length)
    return (
      <div className="pt-header">
        <section className="grid min-h-[60vh] place-items-center px-4 text-center">
          <div>
            <h1 className="t-display text-[clamp(32px,3.4vw,60px)]">{tr("Checkout")}</h1>
            <p className="t-italic-thin mt-3 text-[18px]">{tr("Your bag is empty.")}</p>
            <Link to="/shop" className="btn btn-dark mt-8">{tr("Discover the collection")}</Link>
          </div>
        </section>
      </div>
    );

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (k === "cep") v = v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
    if (k === "phone") v = v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    setF((s) => ({ ...s, [k]: v }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };
  const validate = () => {
    const e: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email.";
    if (f.name.trim().split(/\s+/).length < 2) e.name = "Enter your full name.";
    if (f.cep.replace(/\D/g, "").length !== 8) e.cep = "Enter an 8-digit CEP.";
    (["street", "number", "district", "city"] as const).forEach((k) => { if (!f[k].trim()) e[k] = "Required."; });
    if (!f.state) e.state = "Select a state.";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`co-${first}`)?.focus();
    return !first;
  };
  const place = () => {
    const order: Order = { number: `PF-${String(Date.now()).slice(-6)}`, email: f.email, name: f.name.split(" ")[0], total, ship, pay, items: rows.reduce((a, r) => a + r.l.qty, 0) };
    clear();
    nav("/checkout/confirmation", { state: order, replace: true });
  };

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label htmlFor={`co-${k}`} className="field-label">{tr(label)}</label>
      <input id={`co-${k}`} value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `co-${k}-e` : undefined} {...props} className="field" />
      {errors[k] ? <p id={`co-${k}-e`} className="mt-1 text-[12px] text-brown">{tr(errors[k]!)}</p> : null}
    </div>
  );

  const STEPS = ["Information", "Shipping", "Payment"];
  return (
    <div className="pt-header">
      <div className="bg-navy py-2 text-center text-[11px] uppercase tracking-[0.14em] text-white">{tr("Demonstration checkout — no order is placed and no payment is taken")}</div>
      <div className="gutter grid gap-14 pb-[clamp(64px,8vw,160px)] pt-[clamp(32px,4vw,72px)] lg:grid-cols-[1fr_420px] lg:gap-24">
        <div>
          <h1 className="t-display text-[clamp(36px,4vw,72px)]">{tr("Checkout")}</h1>
          <ol className="mt-8 flex gap-6 text-[12px] uppercase tracking-[0.1em]" aria-label={tr("Steps")}>
            {STEPS.map((s, i) => (
              <li key={s} aria-current={i === step ? "step" : undefined} className={i === step ? "" : "text-mute"}>
                <button type="button" disabled={i > step} onClick={() => setStep(i)} className="disabled:cursor-default">
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span> {tr(s)}
                </button>
              </li>
            ))}
          </ol>

          {step === 0 ? (
            <form noValidate onSubmit={(e) => { e.preventDefault(); if (validate()) setStep(1); }} className="mt-12 grid grid-cols-6 gap-x-6 gap-y-7">
              <fieldset className="col-span-6 grid grid-cols-6 gap-x-6 gap-y-7">
                <legend className="t-nav mb-6">{tr("Contact")}</legend>
                {field("email", "Email", { className: "col-span-6 md:col-span-3", type: "email", autoComplete: "email" })}
                {field("phone", "Phone (optional)", { className: "col-span-6 md:col-span-3", type: "tel", autoComplete: "tel", inputMode: "tel" })}
              </fieldset>
              <fieldset className="col-span-6 mt-6 grid grid-cols-6 gap-x-6 gap-y-7">
                <legend className="t-nav mb-6">{tr("Delivery address")}</legend>
                {field("name", "Full name", { className: "col-span-6", autoComplete: "name" })}
                {field("cep", "CEP", { className: "col-span-3 md:col-span-2", inputMode: "numeric", autoComplete: "postal-code" })}
                {field("street", "Street", { className: "col-span-6 md:col-span-4", autoComplete: "address-line1" })}
                {field("number", "Number", { className: "col-span-2", inputMode: "numeric" })}
                {field("extra", "Complement (optional)", { className: "col-span-4", autoComplete: "address-line2" })}
                {field("district", "Neighbourhood", { className: "col-span-6 md:col-span-2" })}
                {field("city", "City", { className: "col-span-4 md:col-span-3", autoComplete: "address-level2" })}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="co-state" className="field-label">{tr("State")}</label>
                  <select id="co-state" value={f.state} onChange={set("state")} aria-invalid={!!errors.state} className="field">
                    <option value="">—</option>
                    {UF.map((u) => <option key={u}>{u}</option>)}
                  </select>
                  {errors.state ? <p className="mt-1 text-[12px] text-brown">{tr(errors.state)}</p> : null}
                </div>
              </fieldset>
              <div className="col-span-6 mt-4 flex items-center justify-between">
                <Link to="/bag" className="t-micro u-line">{tr("Back to bag")}</Link>
                <button className="btn btn-dark">{tr("Continue to shipping")}</button>
              </div>
            </form>
          ) : null}

          {step === 1 ? (
            <div className="mt-12">
              <Recap f={f} onEdit={() => setStep(0)} />
              <fieldset className="mt-10">
                <legend className="t-nav mb-5">{tr("Shipping method")}</legend>
                <div className="border-t border-hair">
                  {(Object.keys(SHIPPING) as ShipKey[]).map((k) => {
                    const free = k === "standard" && subtotal >= FREE_SHIPPING;
                    return (
                      <label key={k} className={`flex cursor-pointer items-center gap-4 border-b border-hair py-5 ${ship === k ? "" : "text-ink/70"}`}>
                        <input type="radio" name="ship" checked={ship === k} onChange={() => setShip(k)} className="accent-navy" />
                        <span className="flex-1 text-[13px] uppercase">{tr(SHIPPING[k].label)} <span className="ml-2 font-extralight normal-case italic">{tr(SHIPPING[k].eta)}</span></span>
                        <span className="text-[13px] tabular-nums">{free ? tr("Complimentary") : formatBRL(SHIPPING[k].price)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-10 flex items-center justify-between">
                <button type="button" onClick={() => setStep(0)} className="t-micro u-line">{tr("Back")}</button>
                <button type="button" onClick={() => setStep(2)} className="btn btn-dark">{tr("Continue to payment")}</button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-12">
              <Recap f={f} onEdit={() => setStep(0)} extra={`${SHIPPING[ship].label} · ${SHIPPING[ship].eta}`} />
              <fieldset className="mt-10">
                <legend className="t-nav mb-5">{tr("Payment")} <span className="demo-tag ml-2 align-middle">{tr("Demo")}</span></legend>
                <div className="border-t border-hair">
                  {([["pix", "Pix", "Instant — a QR code would be shown here"], ["card", "Credit card", "Up to 6 interest-free instalments"]] as const).map(([k, t, d]) => (
                    <label key={k} className="flex cursor-pointer items-center gap-4 border-b border-hair py-5">
                      <input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} className="accent-navy" />
                      <span className="flex-1 text-[13px] uppercase">{tr(t)} <span className="ml-2 font-extralight normal-case italic">{tr(d)}</span></span>
                    </label>
                  ))}
                </div>
                <div className="mt-6 bg-offwhite p-6 text-[13px] font-light leading-[1.7]">
                  {pay === "pix" ? (
                    <div className="flex items-center gap-6">
                      <div className="grid size-24 shrink-0 place-items-center border border-dashed border-sand text-center text-[10px] uppercase tracking-[0.1em] text-mute">{tr("QR code")}<br />{tr("(demo)")}</div>
                      <p>{tr("In a live store the Pix QR code and copy-and-paste key would appear here. This demonstration does not connect to any bank or payment provider.")}</p>
                    </div>
                  ) : (
                    <div>
                      <p>{tr("Card fields are intentionally disabled: this demonstration never asks for or stores card details.")}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 opacity-50">
                        <input disabled placeholder={tr("Card number")} className="field col-span-2" aria-label={tr("Card number (disabled in demo)")} />
                        <input disabled placeholder={tr("MM / YY")} className="field" aria-label={tr("Expiry (disabled in demo)")} />
                        <input disabled placeholder={tr("CVC")} className="field" aria-label={tr("CVC (disabled in demo)")} />
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>
              <div className="mt-10 flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)} className="t-micro u-line">{tr("Back")}</button>
                <button type="button" onClick={place} className="btn btn-dark">{tr("Place demo order")} · {formatBRL(total)}</button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="order-first h-fit bg-offwhite p-5 md:p-7 lg:order-none lg:sticky lg:top-[150px]" aria-label={tr("Order summary")}>
          <button type="button" onClick={() => setSumOpen(!sumOpen)} aria-expanded={sumOpen} className="flex w-full items-center justify-between text-left lg:pointer-events-none">
            <h2 className="t-nav">{tr("Your order")} <span className="ml-1 text-[11px] text-mute lg:hidden">{sumOpen ? tr("Hide") : tr("Show")}</span></h2>
            <span className="text-[14px] tabular-nums lg:hidden">{formatBRLFull(step === 0 ? subtotal : total)}</span>
          </button>
          <div className={`${sumOpen ? "" : "hidden"} lg:block`}>
          <ul className="mt-6 space-y-5">
            {rows.map(({ l, p, img }) => (
              <li key={`${l.productId}-${l.color}-${l.size}`} className="flex gap-4">
                <div className="relative aspect-[428/503] w-16 shrink-0 bg-studio">
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                  <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-ink text-[10px] text-white">{l.qty}</span>
                </div>
                <div className="flex-1 text-[12px] uppercase">
                  <p>{p.name}</p>
                  <p className="font-extralight text-mute">{l.color} · {l.size} ({SIZE_INTL[l.size]})</p>
                </div>
                <p className="text-[13px] tabular-nums">{formatBRL(p.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-7 space-y-2 border-t border-hair pt-5 text-[13px]">
            <div className="flex justify-between"><dt className="font-light uppercase">{tr("Subtotal")}</dt><dd className="tabular-nums">{formatBRL(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="font-light uppercase">{tr("Shipping")}</dt><dd className="tabular-nums">{step === 0 ? tr("Next step") : shipping ? formatBRL(shipping) : tr("Complimentary")}</dd></div>
            <div className="flex justify-between border-t border-hair pt-3 text-[15px]"><dt className="uppercase">{tr("Total")}</dt><dd className="tabular-nums">{formatBRLFull(step === 0 ? subtotal : total)}</dd></div>
          </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Recap({ f, onEdit, extra }: { f: Form; onEdit: () => void; extra?: string }) {
  return (
    <div className="border border-hair p-5 text-[13px] font-light">
      <div className="flex justify-between gap-4"><span className="w-24 shrink-0 uppercase text-mute">{tr("Contact")}</span><span className="flex-1">{f.email}</span><button type="button" onClick={onEdit} className="u-line text-[11px] uppercase">{tr("Edit")}</button></div>
      <div className="mt-3 flex gap-4 border-t border-hair pt-3"><span className="w-24 shrink-0 uppercase text-mute">{tr("Ship to")}</span><span className="flex-1">{f.street}, {f.number}{f.extra ? ` — ${f.extra}` : ""}, {f.district}, {f.city} — {f.state}, {f.cep}</span></div>
      {extra ? <div className="mt-3 flex gap-4 border-t border-hair pt-3"><span className="w-24 shrink-0 uppercase text-mute">{tr("Method")}</span><span className="flex-1">{extra}</span></div> : null}
    </div>
  );
}

export function Confirmation() {
  const order = useLocation().state as Order | null;
  return (
    <div className="pt-header">
      <section className="grid min-h-[70vh] place-items-center px-4 py-24 text-center">
        <div className="max-w-[560px]">
          <Monogram className="mx-auto w-14 text-navy" />
          {order ? (
            <>
              <p className="t-micro mt-10 text-mute">{tr("Demo order")} {order.number}</p>
              <h1 className="t-display mt-4 text-[clamp(36px,4vw,72px)]">{tr("Grazie, {name}", { name: order.name })}</h1>
              <p className="t-script mt-2 text-[40px] text-brown">{tr("a presto")}</p>
              <p className="mt-6 text-[14px] font-light leading-[1.8]">
                {tr("This was a demonstration: {items}, {total} by {pay}, {ship} shipping. No order was created, no payment was taken and no email was sent to {email}.", { items: plural(order.items, "{n} piece", "{n} pieces"), total: formatBRLFull(order.total), pay: order.pay === "pix" ? "Pix" : tr("card"), ship: tr(SHIPPING[order.ship].label).toLowerCase(), email: order.email })}
              </p>
            </>
          ) : (
            <>
              <h1 className="t-display mt-10 text-[clamp(32px,3.4vw,60px)]">{tr("No recent order")}</h1>
              <p className="mt-4 text-[14px] font-light">{tr("Demo orders are not stored once you leave this page.")}</p>
            </>
          )}
          <Link to="/shop" className="btn btn-dark mt-10">{tr("Continue shopping")}</Link>
        </div>
      </section>
    </div>
  );
}
