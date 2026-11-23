import { useMeta } from "../lib/meta";
import { Link, useParams } from "react-router";
import { tr, useLang } from "../i18n";
import { SITE, STORE } from "../config/store";
import { CATEGORIES, SIZE_CHART, SIZES, SIZE_INTL } from "../data/catalog";
import NotFound from "./NotFound";

type Page = { title: string; kicker: string; body: React.ReactNode };
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-5 text-[14px] font-light leading-[1.85] text-ink/85">{children}</p>;
const H = ({ children }: { children: React.ReactNode }) => <h2 className="t-nav mt-12 text-[13px]">{children}</h2>;
const demo = () => (STORE.PRELAUNCH ? <p className="mt-12 border-t border-hair pt-5 text-[12px] font-light text-mute">{tr("Sales open with our official launch. These conditions apply to orders placed from that date.")}</p> : null);

const FAQ = [
  ["How does linen fit?", "Our pieces are cut for a relaxed, unisex fit. Linen softens and relaxes slightly with wear; if you are between sizes, choose the smaller for a closer fit."],
  ["Will my linen shrink?", "Our linen is pre-washed. Wash cold on a gentle cycle and dry in the shade to keep its shape."],
  ["Are the pieces unisex?", "Yes. Each piece is designed to be worn by anyone — the size guide gives garment measurements rather than body measurements."],
  ["How long does delivery take?", "Standard delivery takes 5–8 working days; express takes 1–3 working days across Brazil."],
  ["Can I exchange a size?", "Yes, free of charge within 30 days, as long as the piece is unworn and with its labels."],
];

const pages = (): Record<string, Page> => ({
  shipping: { title: "Shipping", kicker: "Customer care", body: (<><P>{tr("We ship across Brazil from our atelier. Every order is folded by hand, wrapped in tissue and sent in a recyclable box.")}</P><H>{tr("Methods")}</H><P>{tr("Standard — 5 to 8 working days — R$35, complimentary on orders over R$1.500.")}<br />{tr("Express — 1 to 3 working days — R$69.")}</P><H>{tr("Tracking")}</H><P>{tr("A tracking link is sent by email as soon as your order leaves the atelier.")}</P>{demo()}</>) },
  returns: { title: "Returns", kicker: "Customer care", body: (<><P>{tr("You have 30 days from delivery to return or exchange any piece, unworn, unwashed and with its labels attached.")}</P><H>{tr("Exchanges")}</H><P>{tr("Size exchanges are free of charge. We send the new size as soon as the original is on its way back.")}</P><H>{tr("Refunds")}</H><P>{tr("Refunds are issued to the original payment method within 10 working days of receiving the return.")}</P>{demo()}</>) },
  faq: { title: "FAQ", kicker: "Customer care", body: (<><div className="mt-6 border-t border-hair">{FAQ.map(([q, a]) => (<details key={q} className="group border-b border-hair"><summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[13px] uppercase [&::-webkit-details-marker]:hidden">{tr(q)}<span className="text-lg font-extralight transition-transform group-open:rotate-45" aria-hidden>+</span></summary><p className="pb-6 text-[14px] font-light leading-[1.8] text-ink/85">{tr(a)}</p></details>))}</div>{demo()}</>) },
  contact: { title: "Contact", kicker: "Portofino", body: (<><P>{tr("We are happy to help with sizing, orders or anything else.")}</P><H>{tr("Client service")}</H><P>{tr("Monday to Friday, 9am – 6pm (Brasília time).")}{SITE.contactEmail ? <><br /><span className="select-all">{SITE.contactEmail}</span></> : null}{SITE.instagram ? <><br /><a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="u-line">Instagram</a></> : null}{!SITE.contactEmail && !SITE.instagram ? <><br />{tr("Our contact channels open with the official launch.")}</> : null}</P><H>{tr("Atelier")}</H><P>{tr("Visits by appointment only.")}</P>{demo()}</>) },
  philosophy: { title: "Our philosophy", kicker: "Portofino", body: (<><p className="t-script mt-6 text-[48px] text-brown">{tr("slow living")}</p><P>{tr("We believe in fewer, better things. One material — linen — chosen for how it breathes, how it ages and how it feels on a warm afternoon.")}</P><P>{tr("Our collections are small and considered: the shirt, the bata, the trouser, the bermuda. Each is refined season after season rather than replaced.")}</P><Link to="/about" className="btn btn-line mt-10">{tr("About us")}</Link></>) },
  "size-guide": {
    title: "Size guide",
    kicker: "Customer care",
    body: (
      <>
        <P>{tr("Garment measurements in centimetres, measured flat. Our sizes follow Brazilian sizing (PP to GG).")}</P>
        {CATEGORIES.map((c) => (
          <div key={c.slug} className="mt-12">
            <h2 className="t-display text-[26px]">{tr(c.name)} <span className="t-italic-thin font-sans text-[13px] normal-case">{useLang.getState().lang === "pt" ? c.name : c.namePt}</span></h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[440px] text-[13px] tabular-nums">
                <thead><tr className="border-b border-ink"><th className="py-3 text-left font-normal uppercase">{tr("Size")}</th>{SIZES.map((s) => <th key={s} className="py-3 font-normal">{s} <span className="text-[10px] text-mute">{SIZE_INTL[s]}</span></th>)}</tr></thead>
                <tbody>{SIZE_CHART[c.slug].map((r) => <tr key={r.label} className="border-b border-hair"><th scope="row" className="py-3 text-left font-light">{tr(r.label)}</th>{r.values.map((v, i) => <td key={i} className="py-3 text-center font-light">{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        ))}
      </>
    ),
  },
  privacy: { title: "Privacy policy", kicker: "Information", body: (<><P>{tr("During the pre-launch period this website does not collect or store personal data on any server. Your language preference is kept only in your own browser.")}</P><H>{tr("Cookies")}</H><P>{tr("No tracking or advertising cookies are used.")}</P>{demo()}</>) },
  terms: { title: "Terms of use", kicker: "Information", body: (<><P>{tr("All prices are shown in Brazilian reais (BRL). Product photography is indicative; colours may vary slightly from screen to screen.")}</P><P>{tr("Purchases open with our official launch.")}</P>{demo()}</>) },
  payments: { title: "Payments", kicker: "Information", body: (<><P>{tr("PORTOFINO will accept Pix and major credit cards.")}</P><P>{tr("Card details are entered only on the payment provider’s secure page and are never stored by PORTOFINO.")}</P>{demo()}</>) },
});

export default function Info() {
  const { slug = "" } = useParams();
  const PAGES = pages();
  const page = PAGES[slug];
  useMeta(page ? tr(page.title) : undefined);
  if (!page) return <NotFound />;
  const siblings = Object.entries(PAGES).filter(([, p]) => p.kicker === page.kicker);
  return (
    <div className="pt-header">
      <section className="gutter grid gap-12 pb-[clamp(64px,8vw,160px)] pt-[clamp(36px,4.5vw,90px)] lg:grid-cols-[1fr_2fr] [&>*]:min-w-0">
        <aside>
          <p className="t-micro text-mute">{tr(page.kicker)}</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 lg:flex-col">
            {siblings.map(([s, p]) => <li key={s}><Link to={`/info/${s}`} className="t-nav u-reveal text-[12px]" aria-current={s === slug ? "page" : undefined}>{tr(p.title)}</Link></li>)}
          </ul>
        </aside>
        <article className="max-w-[720px]">
          <h1 className="t-display text-[clamp(40px,4.6vw,88px)]" data-r="lines">{tr(page.title)}</h1>
          {page.body}
        </article>
      </section>
    </div>
  );
}
