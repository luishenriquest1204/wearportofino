import { Link } from "react-router";
import { tr } from "../i18n";
import { useState } from "react";
import { useAccount } from "../store/shop";

export default function Account() {
  const { user, signIn, signOut } = useAccount();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [section, setSection] = useState("Overview");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email.");
    if (pw.length < 6) return setErr("The password needs at least 6 characters.");
    if (tab === "up" && !name.trim()) return setErr("Enter your name.");
    setErr("");
    signIn(tab === "up" ? name.trim() : email.split("@")[0], email);
  };

  return (
    <div className="pt-header">
      <div className="bg-offwhite py-2 text-center text-[11px] uppercase tracking-[0.14em] text-ink/70">{tr("Account area — interface demonstration only, nothing leaves this browser tab")}</div>
      {!user ? (
        <section className="gutter grid gap-16 pb-[clamp(64px,8vw,160px)] pt-[clamp(36px,4.5vw,90px)] lg:grid-cols-2">
          <div>
            <h1 className="t-display text-[clamp(40px,5.2vw,104px)]">{tr("Account")}</h1>
            <p className="t-italic-thin mt-3 max-w-[420px] text-[17px]">{tr("Follow your orders, save your addresses and keep your sizes for next time.")}</p>
            <div className="mt-12 hidden aspect-[4/3] overflow-hidden lg:block"><img src="img/ferry-wood.webp" alt="" className="h-full w-full object-cover" /></div>
          </div>
          <div className="lg:pt-6">
            <div className="flex gap-8 border-b border-hair" role="tablist">
              {([["in", "Sign in"], ["up", "Create account"]] as const).map(([k, t]) => (
                <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => { setTab(k); setErr(""); }} className={`-mb-px border-b pb-3 text-[13px] uppercase tracking-[0.06em] ${tab === k ? "border-ink" : "border-transparent text-mute"}`}>{tr(t)}</button>
              ))}
            </div>
            <form onSubmit={submit} noValidate className="mt-10 max-w-[460px] space-y-7">
              {tab === "up" ? (
                <div><label htmlFor="a-n" className="field-label">{tr("Name")}</label><input id="a-n" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="field" /></div>
              ) : null}
              <div><label htmlFor="a-e" className="field-label">{tr("Email")}</label><input id="a-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="field" /></div>
              <div><label htmlFor="a-p" className="field-label">{tr("Password")}</label><input id="a-p" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={tab === "in" ? "current-password" : "new-password"} className="field" /></div>
              {err ? <p role="alert" className="text-[12px] text-brown">{tr(err)}</p> : null}
              <button className="btn btn-dark w-full">{tab === "in" ? tr("Sign in") : tr("Create account")}</button>
              <p className="text-[12px] font-light text-mute">{tr("Demo: any email and a password of 6+ characters will open the account area. No credentials are checked or stored.")}</p>
            </form>
          </div>
        </section>
      ) : (
        <section className="gutter pb-[clamp(64px,8vw,160px)] pt-[clamp(36px,4.5vw,90px)]">
          <p className="t-script text-[clamp(36px,3vw,56px)] text-brown">{tr("Ciao,")}</p>
          <h1 className="t-display text-[clamp(40px,5.2vw,104px)]">{user.name}</h1>
          <div className="mt-14 grid gap-12 lg:grid-cols-[240px_1fr]">
            <nav aria-label={tr("Account")} className="flex gap-6 overflow-x-auto lg:flex-col lg:gap-4">
              {["Overview", "Orders", "Addresses", "Details"].map((s) => (
                <button key={s} type="button" onClick={() => setSection(s)} aria-current={section === s ? "page" : undefined} className="t-nav u-reveal w-fit whitespace-nowrap text-left text-[13px]">{tr(s)}</button>
              ))}
              <button type="button" onClick={signOut} className="t-nav w-fit text-left text-[13px] text-mute hover:text-ink">{tr("Sign out")}</button>
            </nav>
            <div className="border-t border-hair pt-8">
              {section === "Overview" ? (
                <div className="grid gap-8 md:grid-cols-3">
                  {[["Orders", "0", "No orders yet"], ["Addresses", "0", "Add one at checkout"], ["Email", "✓", user.email]].map(([t, n, d]) => (
                    <div key={t} className="bg-offwhite p-6"><p className="field-label">{tr(t)}</p><p className="t-display mt-4 text-[40px]">{n}</p><p className="mt-1 truncate text-[12px] font-light text-mute">{tr(d)}</p></div>
                  ))}
                </div>
              ) : null}
              {section === "Orders" ? (
                <div className="py-10 text-center"><p className="t-italic-thin text-[18px]">{tr("You have no orders yet.")}</p><Link to="/shop" className="btn btn-line mt-6">{tr("Discover the collection")}</Link></div>
              ) : null}
              {section === "Addresses" ? <p className="py-10 text-[14px] font-light">{tr("No saved addresses. In a live store, addresses entered at checkout would appear here.")}</p> : null}
              {section === "Details" ? (
                <dl className="max-w-[480px] divide-y divide-hair text-[14px]">
                  <div className="flex justify-between py-4"><dt className="field-label">{tr("Name")}</dt><dd>{user.name}</dd></div>
                  <div className="flex justify-between py-4"><dt className="field-label">{tr("Email")}</dt><dd>{user.email}</dd></div>
                </dl>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
