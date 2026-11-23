import { Link } from "react-router";
import { tr } from "../i18n";
import { useOverlayHeader } from "./Home";
import { Dept } from "../components/Marks";

const VALUES = [
  { n: "01", t: "One material", b: "Every piece is cut in 100% linen — breathable, honest and more beautiful with every wash." },
  { n: "02", t: "Slow by design", b: "Small collections, made to be kept. We would rather make less and make it last." },
  { n: "03", t: "For everyone", b: "Shirts, batas, trousers and bermudas with relaxed lines, designed to be worn by anyone." },
  { n: "04", t: "Mediterranean light", b: "A palette of chalk, sand and sea, borrowed from harbour walls and late afternoons." },
];

export default function About() {
  useOverlayHeader();
  return (
    <>
      <section className="relative h-[100svh] min-h-[560px] overflow-hidden bg-ink text-white" aria-labelledby="about-t">
        <div className="absolute inset-0" data-r="img">
          <div data-speed="8" className="absolute inset-x-0 -bottom-[8%] -top-[8%]">
            <img data-inner src="img/ferry-wood.webp" alt={tr("A wooden ferry deck in the late Mediterranean sun")} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/25" aria-hidden />
        <div className="gutter absolute inset-x-0 bottom-[clamp(40px,7vw,120px)]">
          <p className="t-micro" data-r="up">{tr("About us")}</p>
          <h1 id="about-t" className="t-display mt-4 max-w-[14ch] text-[clamp(40px,5.6vw,112px)]" data-r="lines">{tr("A maison of linen")}</h1>
        </div>
      </section>

      <section className="gutter grid gap-12 py-[clamp(80px,10vw,200px)] md:grid-cols-[1fr_1.3fr]">
        <p className="t-script text-[clamp(44px,4.6vw,88px)] text-brown" data-r="fade">{tr("Portofino")}</p>
        <div>
          <p className="text-[clamp(18px,1.6vw,28px)] font-extralight uppercase leading-[1.45]" data-r="words">
            {tr("Portofino was born from a feeling more than a place: the slow hours of a summer by the sea, a white shirt drying in the sun, the freedom of living well.")}
          </p>
          <p className="mt-10 max-w-[560px] text-[14px] font-light leading-[1.85] text-ink/85" data-r="up">
            {tr("We make a single, considered wardrobe in pure linen — the shirt, the bata, the trouser and the bermuda — and refine it season after season. Unisex by nature, quiet in tone, made to travel and made to last. No logos to shout, no trends to chase: just the right cut, the right weight of cloth, and the time to get them right.")}
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-2" aria-label={tr("Images")}>
        <div className="aspect-[1000/1300] overflow-hidden" data-r="img"><img data-inner src="img/building.webp" alt={tr("Sunlit façade with green shutters")} loading="lazy" className="h-full w-full object-cover" /></div>
        <div className="aspect-[1000/1300] overflow-hidden" data-r="img"><img data-inner src="img/door-portrait.webp" alt={tr("A linen shirt in the light of an open door")} loading="lazy" className="h-full w-full object-cover" /></div>
      </section>

      <section className="gutter py-[clamp(80px,10vw,200px)]" aria-labelledby="values">
        <h2 id="values" className="t-display text-[clamp(30px,3vw,60px)]" data-r="lines">{tr("What we hold on to")}</h2>
        <ol className="mt-[clamp(40px,5vw,100px)] grid border-t border-hair md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <li key={v.n} className={`border-b border-hair py-8 lg:border-b-0 lg:py-10 ${i ? "lg:border-l lg:pl-8" : ""} lg:pr-8`} data-r="up" data-delay={String(i * 0.08)}>
              <span className="text-[13px] font-light tabular-nums">{v.n}</span>
              <h3 className="t-display mt-6 text-[clamp(22px,1.8vw,32px)]">{tr(v.t)}</h3>
              <p className="mt-4 text-[13px] font-light leading-[1.8] text-ink/80">{tr(v.b)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-offwhite px-4 py-[clamp(80px,10vw,200px)] text-center" aria-label={tr("Signature")}>
        <Dept className="mx-auto w-[clamp(180px,16vw,300px)]" />
        <p className="t-italic-thin mx-auto mt-12 max-w-[680px] text-[clamp(18px,1.6vw,26px)] leading-[1.5]" data-r="up">
          {tr("“Inspired by distant days, sunlit afternoons and the freedom of living well.”")}
        </p>
        <p className="t-script mt-8 text-[clamp(36px,3vw,56px)] text-brown" data-r="fade">{tr("with love, Portofino")}</p>
        <Link to="/shop" className="btn btn-dark mt-12">{tr("Discover the collection")}</Link>
      </section>
    </>
  );
}
