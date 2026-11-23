import { Link } from "react-router";
import { STORE, SITE } from "../config/store";
import { tr } from "../i18n";
import { Monogram } from "./Marks";
import { useMeta } from "../lib/meta";

type Kind = "bag" | "checkout" | "account";

/** Commercial routes (bag, checkout, confirmation, account) render the notice while commerce is off — direct URLs included. */
export function CommerceRoute({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  return STORE.COMMERCE_ENABLED ? <>{children}</> : <PrelaunchNotice kind={kind} />;
}

const COPY: Record<Kind, string> = {
  bag: "The shopping bag opens with our official launch. Until then, every piece, price and detail is here to discover.",
  checkout: "Purchases open with our official launch. Until then, every piece, price and detail is here to discover.",
  account: "Customer accounts open with our official launch: order history, saved addresses and your sizes, in one place.",
};

export function PrelaunchNotice({ kind }: { kind: Kind }) {
  useMeta(tr("Official launch soon"));
  return (
    <div className="pt-header">
      <section className="grid min-h-[72vh] place-items-center px-4 py-24 text-center" aria-labelledby="soon">
        <div className="max-w-[560px]">
          <Monogram className="mx-auto w-14 text-navy" />
          <p className="t-micro mt-10 text-mute">{tr("Coming soon")}</p>
          <h1 id="soon" className="t-display mt-4 text-[clamp(34px,4vw,68px)]">{tr("Official launch soon")}</h1>
          <p className="mt-5 text-[14px] font-light leading-[1.8] text-ink/85">{tr(COPY[kind])}</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link to="/shop" className="btn btn-dark">{tr("Discover our collection")}</Link>
            <FollowLink />
          </div>
        </div>
      </section>
    </div>
  );
}

/** "Be part of what's next" — links to Instagram only when the real profile is configured. */
export function FollowLink({ className = "" }: { className?: string }) {
  if (!SITE.instagram) return null;
  return (
    <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className={`u-line t-micro ${className}`}>
      {tr("Be part of what’s next — follow us on Instagram")}
    </a>
  );
}

/** Buy box while commerce is off: price stays visible above it; no purchase control is rendered. */
export function PrelaunchBuyBox() {
  return (
    <div className="mt-8 border-y border-hair py-6" role="status">
      <p className="t-label text-[11px]">{tr("Coming soon")}</p>
      <p className="t-display mt-3 text-[24px]">{tr("Official launch soon")}</p>
      <p className="mt-2 text-[13px] font-light leading-[1.7] text-ink/80">{tr("This piece will be available to order at our official launch. Prices shown are the launch prices.")}</p>
      <FollowLink className="mt-4 inline-block" />
    </div>
  );
}
