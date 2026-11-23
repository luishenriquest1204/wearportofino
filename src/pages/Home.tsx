import { useMeta } from "../lib/meta";
import { Link } from "react-router";
import { plural, tr, useLang } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { useContent } from "../store/content";
import { useCatalog } from "../store/catalog";
import { useUi } from "../store/shop";
import { CATEGORIES, type Product } from "../data/catalog";
import type { HomeContent, SectionKey } from "../data/content";
import { Lockup, Monogram } from "../components/Marks";
import { ProductCard } from "../components/ProductCard";
import { afterIntro } from "../components/Intro";
import { loadMotion, reduced } from "../lib/motion";
import { NewsletterForm } from "../components/Newsletter";

/** Pages whose first section is a full-bleed photograph make the header transparent. */
export function useOverlayHeader() {
  const set = useUi((s) => s.setOverlay);
  useEffect(() => {
    set(true);
    return () => set(false);
  }, [set]);
}

export default function Home() {
  useOverlayHeader();
  useMeta();
  const content = useContent((s) => s.content);
  const products = useCatalog((s) => s.products);
  const byId = (ids: string[]) => ids.map((id) => products.find((p) => p.id === id && p.published)).filter(Boolean) as Product[];
  const render: Record<SectionKey, () => React.ReactNode> = {
    hero: () => <Hero c={content.hero} />,
    split: () => <Split c={content.split} />,
    statement: () => <Statement c={content.statement} />,
    linen: () => <Linen c={content.linen} products={byId(content.linen.productIds)} />,
    collections: () => <Collections c={content.collections} count={(slug) => products.filter((p) => p.published && p.category === slug).length} />,
    featured: () => <Featured products={byId(content.featured.productIds)} />,
    campaign: () => <Campaign c={content.campaign} />,
    newsletter: () => <Newsletter c={content.newsletter} />,
  };
  return (
    <>
      {content.order
        .filter((k) => !content.hidden.includes(k))
        .map((k) => (
          <div key={k}>{render[k]()}</div>
        ))}
    </>
  );
}

/* ─────────────────────────── HERO — full-bleed window view, giant lockup ─────────────────────────── */
function Hero({ c }: { c: HomeContent["hero"] }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    let dead = false;
    let off = () => {};
    let revert = () => {};
    loadMotion().then(({ gsap, SplitText }) => {
      if (dead) return;
      const ctx = gsap.context(() => {}, el);
      revert = () => ctx.revert();
      off = afterIntro(() =>
        ctx.add(() => {
          const lines = window.innerWidth > 767 ? SplitText.create("[data-hero='lines']", { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" }).lines : ["[data-hero='lines']"];
          gsap.set("[data-hero='lines']", { visibility: "visible" });
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .to("[data-hero='mask']", { clipPath: "inset(0% 0% 0% 0%)", duration: 2.1, ease: "expo.inOut" })
            .to("[data-hero='img']", { scale: 1, duration: 2.8 }, 0.1)
            .to("[data-hero='mark']", { y: 0, yPercent: 0, opacity: 1, duration: 1.8 }, 0.95)
            .from(lines, { yPercent: 110, opacity: 0, duration: 1.3, stagger: 0.12 }, 1.25)
            .to("[data-hero='fade']", { opacity: 1, duration: 1.4, stagger: 0.15 }, 1.45);
        }),
      );
      ctx.add(() => gsap.to("[data-hero='plx']", { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } }));
    });
    return () => {
      dead = true;
      off();
      revert();
    };
  }, []);
  return (
    <section ref={root} aria-label={tr("PORTOFINO")} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-white">
      <div data-hero="mask" className="absolute inset-0 overflow-hidden">
        <div data-hero="plx" className="absolute inset-0">
          <img data-hero="img" src={c.image} alt={tr("Through a window: a ferry crossing the bay in the late sun")} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[50%_58%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35" aria-hidden />
      </div>
      <p data-hero="fade" className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(12px,1.13vw,17px)] font-extralight uppercase tracking-[0.02em]">{tr(c.caption)}</p>
      <div className="gutter absolute inset-x-0 bottom-[calc(16vw+18px)] flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <h1 data-hero="lines" className="t-display max-w-[19ch] text-[clamp(26px,2.55vw,40px)]">
          {tr(c.tagline)}
        </h1>
        <Link data-hero="fade" to="/shop" className="u-line self-start text-[clamp(12px,1.13vw,17px)] font-light uppercase md:self-auto">{tr(c.cta)}</Link>
      </div>
      <div data-hero="mark" className="absolute inset-x-0 bottom-0 opacity-90">
        <Lockup className="w-full" />
      </div>
    </section>
  );
}

/* ─────────────────────────── SPLIT — two portraits with centred labels ─────────────────────────── */
function Split({ c }: { c: HomeContent["split"] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2" aria-label={tr("Editorial")}>
      {c.map((b) => (
        <Link key={tr(b.title)} to={b.href} className="group relative block aspect-[1000/1300] overflow-hidden bg-ink text-white">
          <div data-r="img" className="absolute inset-0 overflow-hidden">
            <img data-inner src={b.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1800ms] ease-[var(--ease-expo)] group-hover:scale-[1.03]" />
          </div>
          <div className="absolute inset-0 bg-black/10" aria-hidden />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="text-[clamp(13px,1.05vw,21px)] font-normal uppercase tracking-[0.16em]" data-r="up">{tr(b.title)}</p>
            <p className="mt-[clamp(14px,1.8vw,36px)] text-[clamp(12px,0.85vw,17px)] font-extralight uppercase" data-r="up" data-delay="0.12">{tr(b.cta)}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}

/* ─────────────────────────── STATEMENT — full-bleed ferry interior ─────────────────────────── */
function Statement({ c }: { c: HomeContent["statement"] }) {
  return (
    <section className="relative aspect-[3/4] overflow-hidden bg-ink text-white md:aspect-[1500/975]" aria-labelledby="statement">
      <div className="absolute inset-0 overflow-hidden" data-r="img">
        <div data-speed="5" className="absolute inset-x-0 -bottom-[6%] -top-[6%]">
          <img data-inner src={c.image} alt={tr("Late sun inside a ferry, the sea beyond the windows")} loading="lazy" className="h-full w-full object-cover object-[30%_50%]" />
        </div>
      </div>
      <div className="absolute bottom-[clamp(28px,12.5%,140px)] left-[clamp(16px,3vw,45px)] max-w-[min(88%,560px)] md:max-w-[34%]">
        <h2 id="statement" className="text-[clamp(14px,1.13vw,18px)] font-normal uppercase" data-r="up">{tr(c.title)}</h2>
        <p className="mt-1.5 text-[clamp(12px,0.93vw,15px)] font-extralight uppercase leading-[1.65] tracking-[0.02em]" data-r="up" data-delay="0.1">{tr(c.body)}</p>
      </div>
    </section>
  );
}

/* ─────────────────────────── THE ART OF LINEN — photograph + two products + note ─────────────────────────── */
function Linen({ c, products }: { c: HomeContent["linen"]; products: Product[] }) {
  return (
    <section className="grid grid-cols-1 bg-white md:grid-cols-[48.6%_1fr]" aria-labelledby="linen">
      <div className="relative aspect-[972/1300] overflow-hidden" data-r="img">
        <img data-inner src={c.image} alt={tr("Looking out over the water from a ferry bench at sunset")} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-between px-[clamp(16px,2.9vw,58px)] pb-[clamp(40px,5vw,100px)] pt-[clamp(28px,2.55vw,51px)] md:pl-[2.9vw] md:pr-[2.55vw]">
        <div className="grid grid-cols-2 gap-[clamp(12px,1.35vw,27px)]" data-stagger>
          {products.slice(0, 2).map((p) => (
            <ProductCard key={p.id} product={p} showSwatches={false} />
          ))}
        </div>
        <div className="mt-16 max-w-[440px] md:mt-0">
          <h2 id="linen" className="text-[clamp(13px,0.95vw,19px)] font-normal uppercase" data-r="up">{tr(c.title)}</h2>
          <p className="mt-1.5 text-[clamp(13px,0.95vw,19px)] font-light uppercase leading-[1.65]" data-r="up" data-delay="0.1">{tr(c.body)}</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── COLLECTIONS — numbered index + changing image ─────────────────────────── */
function Collections({ c, count }: { c: HomeContent["collections"]; count: (slug: string) => number }) {
  const [active, setActive] = useState(0);
  const cat = CATEGORIES[active];
  return (
    <section className="gutter grid grid-cols-1 gap-12 bg-white pb-[clamp(60px,6vw,120px)] pt-[clamp(60px,6vw,114px)] md:grid-cols-[40.25%_1fr] md:gap-0" aria-labelledby="collections">
      <div>
        <h2 id="collections" className="t-display text-[clamp(30px,3vw,60px)]" data-r="lines">
          {c.title.split("\n").map((l) => (
            <span key={l} className="block">{tr(l)}</span>
          ))}
        </h2>
        <ul className="mt-[clamp(40px,5vw,110px)] border-t border-hair" onMouseLeave={() => undefined}>
          {CATEGORIES.map((k, i) => (
            <li key={k.slug} className={i === 1 || i === 3 ? "border-b border-hair" : ""}>
              <Link
                to={`/shop/${k.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group grid h-[92px] grid-cols-[38px_1fr_auto] items-center md:h-[clamp(72px,5.75vw,115px)] md:grid-cols-[clamp(38px,3.8vw,76px)_1fr_auto]"
              >
                <span className="self-end pb-[clamp(16px,1.3vw,26px)] text-[clamp(13px,0.9vw,18px)] font-light tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className={`transition-[transform,opacity] duration-700 ease-[var(--ease-expo)] ${active === i ? "md:translate-x-2 md:opacity-100" : "md:opacity-70 md:group-hover:opacity-100"}`}>
                  <span className="t-display text-[34px] leading-none md:text-[clamp(32px,3vw,60px)]">{tr(k.name)}</span>
                  <span className="t-italic-thin text-[clamp(10px,0.85vw,17px)] uppercase">{useLang.getState().lang === "pt" ? k.name : k.namePt}</span>
                </span>
                <span className={`hidden text-[11px] uppercase tracking-[0.22em] transition-opacity duration-500 md:inline ${active === i ? "opacity-100" : "opacity-0"}`}>{tr("Explore")}</span>
                <span className="block h-[68px] w-[58px] overflow-hidden bg-studio md:hidden" aria-hidden><img src={k.image} alt="" loading="lazy" className="h-full w-full object-cover" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden md:block md:pl-[clamp(0px,7.4vw,148px)]">
        <Link to={`/shop/${cat.slug}`} className="relative block aspect-[911/1072] overflow-hidden bg-studio" data-r="img">
          {CATEGORIES.map((k, i) => (
            <img
              key={k.slug}
              src={k.image}
              alt={i === active ? `${tr(k.name)} — ${tr(k.caption)}` : ""}
              loading="lazy"
              data-inner={i === 0 ? true : undefined}
              className={`absolute inset-0 h-full w-full object-cover transition-[clip-path,transform] duration-[1100ms] ease-[var(--ease-expo)] ${active === i ? "scale-100 [clip-path:inset(0_0_0_0)]" : "scale-[1.05] [clip-path:inset(0_0_100%_0)]"}`}
            />
          ))}
        </Link>
        <div className="mt-3 flex justify-between gap-6 text-[clamp(10px,0.65vw,13px)] font-light uppercase tracking-[0.14em]">
          <span>{tr(cat.caption)}</span>
          <span className="shrink-0">{plural(count(cat.slug), "{n} piece", "{n} pieces")}</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FEATURED — four cells ─────────────────────────── */
function Featured({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-white px-[clamp(16px,1.35vw,27px)] py-[clamp(64px,9.4vw,188px)]" aria-label={tr("Selected pieces")}>
      <div className="grid grid-cols-2 gap-x-[clamp(12px,3.9vw,78px)] gap-y-12 lg:grid-cols-4" data-stagger>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── CAMPAIGN — portrait + detail + headline ─────────────────────────── */
function Campaign({ c }: { c: HomeContent["campaign"] }) {
  return (
    <section className="grid grid-cols-1 bg-white md:grid-cols-2" aria-labelledby="campaign">
      <div className="relative aspect-[1000/1300] overflow-hidden bg-ink" data-r="img">
        <div data-speed="6" className="absolute inset-x-0 -bottom-[6%] -top-[6%]">
          <img data-inner src={c.image} alt={tr("A man in a white linen shirt in a sunlit courtyard")} loading="lazy" className="h-full w-full object-cover brightness-[0.82]" />
        </div>
      </div>
      <div className="relative flex flex-col justify-between px-[clamp(16px,5.55vw,111px)] pb-[clamp(48px,11vw,220px)] pt-[clamp(40px,10.5vw,211px)]">
        <div className="w-[min(100%,42.7%)] min-w-[200px]">
          <div className="aspect-[427/501] overflow-hidden bg-studio" data-r="img" data-speed="-6">
            <img data-inner src={c.detail} alt={tr("Detail of the open linen collar")} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <p className="mt-[clamp(12px,1.3vw,26px)] text-[clamp(11px,0.85vw,17px)] font-light uppercase" data-r="fade">{tr(c.caption)}</p>
        </div>
        <h2 id="campaign" className="t-display mt-16 max-w-[13.5em] text-[clamp(30px,3vw,60px)] md:mt-0" data-r="lines">{tr(c.title)}</h2>
      </div>
    </section>
  );
}

/* ─────────────────────────── NEWSLETTER — sketch of Portofino ─────────────────────────── */
export function Newsletter({ c }: { c: HomeContent["newsletter"] }) {
  return (
    <section id="newsletter" className="relative overflow-hidden bg-white px-4 py-[clamp(80px,10vw,200px)] text-center" aria-labelledby="note">
      <img src="img/portofino-sketch.webp" alt="" aria-hidden loading="lazy" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="relative mx-auto max-w-[900px]">
        <Monogram className="mx-auto w-[clamp(64px,5.25vw,105px)]" />
        <h2 id="note" className="t-display mt-[clamp(48px,6.5vw,130px)] text-[clamp(30px,3.6vw,72px)]" data-r="lines">{tr(c.title)}</h2>
        <p className="mx-auto mt-2 max-w-[600px] text-[clamp(12px,0.9vw,18px)] font-light uppercase leading-[1.5]" data-r="up">{tr(c.body)}</p>
        <div className="mt-[clamp(48px,6.5vw,130px)]" data-r="up" data-delay="0.1">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
