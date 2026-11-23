import { Link } from "react-router";
import { tr } from "../i18n";
import { Dept, Lockup } from "./Marks";
import { LangSwitch } from "./LangSwitch";

const COLS = [
  { title: "Portofino", links: [["About Us", "/about"], ["Our Philosophy", "/info/philosophy"], ["Contact", "/info/contact"], ["Newsletter", "/newsletter"], ["Instagram", "https://instagram.com"]] },
  { title: "Customer Care", links: [["Shipping", "/info/shipping"], ["Returns", "/info/returns"], ["FAQ", "/info/faq"], ["Size Guide", "/info/size-guide"]] },
  { title: "Information", links: [["Privacy Policy", "/info/privacy"], ["Terms & Conditions", "/info/terms"], ["Payment Methods", "/info/payments"]] },
] as const;

/** Footer from the reference: hairline, signature + statement left, script-titled columns right, giant lockup bleeding off the bottom. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink bg-white text-ink">
      <div className="gutter grid grid-cols-1 gap-14 pb-[clamp(80px,13vw,260px)] pt-[clamp(64px,10vw,200px)] md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5 md:pl-[2.3vw]">
          <Dept className="w-[clamp(220px,21.5vw,430px)]" label="Portofino Dept." />
          <p className="mt-4 max-w-[520px] t-caps text-[clamp(12px,0.85vw,16px)] leading-[1.6]">{tr("A maison of 100% linen. Quiet luxury by the Mediterranean, made to last. Since MMXXVI")}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:col-span-7 md:col-start-6 md:pl-[3vw]">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="t-script text-[clamp(30px,2.5vw,50px)]">{tr(c.title)}</p>
              <ul className="mt-5 space-y-[clamp(10px,1.3vw,22px)] t-caps text-[clamp(12px,0.85vw,16px)]">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("http") ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="u-reveal">{tr(label)}</a>
                    ) : (
                      <Link to={href} className="u-reveal">{tr(label)}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[clamp(72px,15.2vw,310px)] overflow-hidden" aria-hidden>
        <div data-lockup>
          <Lockup className="w-full" />
        </div>
      </div>
      <div className="gutter flex flex-col gap-2 border-t border-hair py-4 text-[11px] uppercase tracking-[0.08em] text-mute md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Portofino · {tr("Since MMXXVI")}</span>
        <LangSwitch className="-my-3 text-[11px]" />
        <span>{tr("Demonstration website — no real transactions")}</span>
      </div>
    </footer>
  );
}
