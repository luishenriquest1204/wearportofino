import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Monitor, RotateCcw, Smartphone } from "lucide-react";
import { useContent } from "../store/content";
import { useCatalog } from "../store/catalog";
import { IMAGE_LIBRARY, type HomeContent, type SectionKey } from "../data/content";
import { Card, PageHead, btnDark, btnLine, inputCls } from "./ui";
import { Modal } from "./Products";
import { useAdmin } from "./store";

const NAMES: Record<SectionKey, string> = { hero: "Hero banner", split: "Editorial pair", statement: "Statement — slow living", linen: "The art of linen", collections: "Collections index", featured: "Featured products", campaign: "Campaign", newsletter: "Newsletter" };

export default function ContentManager() {
  const { content, set, reset } = useContent();
  const notify = useAdmin((s) => s.notify);
  const [sel, setSel] = useState<SectionKey>("hero");
  const [picker, setPicker] = useState<null | ((src: string) => void)>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const patch = <K extends keyof HomeContent>(k: K, v: HomeContent[K]) => set({ ...content, [k]: v });
  const move = (i: number, d: -1 | 1) => {
    const o = [...content.order];
    const j = i + d;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    patch("order", o);
  };
  const toggle = (k: SectionKey) => patch("hidden", content.hidden.includes(k) ? content.hidden.filter((x) => x !== k) : [...content.hidden, k]);

  return (
    <>
      <PageHead title="Content manager" sub="Edit the homepage — changes appear in the preview and in the store for this session">
        <button type="button" className={btnLine} onClick={() => { reset(); notify("Homepage restored to the original content"); }}><RotateCcw size={14} /> Restore original</button>
        <a href="#/" target="_blank" rel="noreferrer" className={btnDark}>Open homepage</a>
      </PageHead>
      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] [&>*]:min-w-0">
        <Card title="Sections & order" pad={false}>
          <ol>
            {content.order.map((k, i) => {
              const hidden = content.hidden.includes(k);
              return (
                <li key={k} className={`flex items-center gap-1 border-b border-[#efeeeb] px-3 py-2 last:border-0 ${sel === k ? "bg-[#f4f3f0]" : ""}`}>
                  <button type="button" onClick={() => setSel(k)} className={`flex-1 truncate px-1 py-1 text-left ${hidden ? "text-mute line-through" : ""}`} aria-current={sel === k}>
                    <span className="mr-2 text-[11px] text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>{NAMES[k]}
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${NAMES[k]} up`} className="rounded p-1 text-ink/60 hover:bg-white disabled:opacity-25"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === content.order.length - 1} aria-label={`Move ${NAMES[k]} down`} className="rounded p-1 text-ink/60 hover:bg-white disabled:opacity-25"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => toggle(k)} aria-label={hidden ? `Show ${NAMES[k]}` : `Hide ${NAMES[k]}`} aria-pressed={!hidden} className="rounded p-1 text-ink/60 hover:bg-white">{hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </li>
              );
            })}
          </ol>
        </Card>
        <div className="grid min-w-0 gap-4 2xl:grid-cols-[400px_minmax(0,1fr)]">
          <Card title={NAMES[sel]}>
            <SectionForm k={sel} c={content} patch={patch} pick={(cb) => setPicker(() => cb)} />
          </Card>
          <Card title="Live preview" action={
            <div className="flex gap-1">
              <button type="button" aria-pressed={device === "desktop"} aria-label="Desktop preview" onClick={() => setDevice("desktop")} className={`rounded p-1 ${device === "desktop" ? "bg-[#f1f0ed]" : "text-mute"}`}><Monitor size={14} /></button>
              <button type="button" aria-pressed={device === "mobile"} aria-label="Mobile preview" onClick={() => setDevice("mobile")} className={`rounded p-1 ${device === "mobile" ? "bg-[#f1f0ed]" : "text-mute"}`}><Smartphone size={14} /></button>
            </div>
          } pad={false}>
            <Preview device={device} version={JSON.stringify(content)} />
          </Card>
        </div>
      </div>
      {picker ? (
        <Modal title="Choose an image" onClose={() => setPicker(null)} wide>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {IMAGE_LIBRARY.map((src) => <button key={src} type="button" onClick={() => { picker(src); setPicker(null); }} className="aspect-square overflow-hidden rounded-lg bg-studio hover:ring-2 hover:ring-ink/50"><img src={src} alt={src.split("/").pop()} className="h-full w-full object-cover" /></button>)}
          </div>
          <p className="mt-4 text-[11px] text-mute">Library of the photography supplied for PORTOFINO.</p>
        </Modal>
      ) : null}
    </>
  );
}

function Preview({ device, version }: { device: "desktop" | "mobile"; version: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [key, setKey] = useState(version);
  useEffect(() => {
    const t = setTimeout(() => setKey(version), 500);
    return () => clearTimeout(t);
  }, [version]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vw = device === "desktop" ? 1440 : 390;
  const vh = device === "desktop" ? 900 : 844;
  const scale = Math.min(1, (device === "desktop" ? w : Math.min(w, 300)) / vw);
  return (
    <div ref={box} className="bg-[#f1f0ed] p-0">
      <div className="mx-auto overflow-hidden" style={{ width: vw * scale, height: vh * scale }}>
        <iframe key={key + device} title="Homepage preview" src={`${location.pathname}${location.search}#/`} style={{ width: vw, height: vh, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, background: "#fff" }} />
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[12px] text-mute">{label}</span>{children}</label>;
}
function Img({ src, onPick }: { src: string; onPick: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="block h-16 w-14 overflow-hidden rounded bg-studio"><img src={src} alt="" className="h-full w-full object-cover" /></span>
      <button type="button" onClick={onPick} className={btnLine}>Change image</button>
    </div>
  );
}

function SectionForm({ k, c, patch, pick }: { k: SectionKey; c: HomeContent; patch: <K extends keyof HomeContent>(k: K, v: HomeContent[K]) => void; pick: (cb: (src: string) => void) => void }) {
  const products = useCatalog((s) => s.products);
  const txt = (val: string, on: (v: string) => void, area = false) => (area ? <textarea value={val} rows={3} onChange={(e) => on(e.target.value)} className={inputCls} /> : <input value={val} onChange={(e) => on(e.target.value)} className={inputCls} />);
  const productPicker = (ids: string[], on: (ids: string[]) => void, max: number) => (
    <ul className="space-y-1.5">
      {products.map((p) => (
        <li key={p.id}>
          <label className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${ids.includes(p.id) ? "border-ink/40" : "border-hair"}`}>
            <input type="checkbox" className="accent-navy" checked={ids.includes(p.id)} disabled={!ids.includes(p.id) && ids.length >= max} onChange={() => on(ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id])} />
            <span className="flex-1">{p.name}</span>
            {!p.published ? <span className="text-[11px] text-mute">Draft — hidden</span> : null}
          </label>
        </li>
      ))}
      <li className="pt-1 text-[11px] text-mute">Up to {max} products · selected {ids.length}</li>
    </ul>
  );
  const box = "space-y-4";
  switch (k) {
    case "hero":
      return <div className={box}><Img src={c.hero.image} onPick={() => pick((src) => patch("hero", { ...c.hero, image: src }))} /><F label="Caption">{txt(c.hero.caption, (v) => patch("hero", { ...c.hero, caption: v }))}</F><F label="Tagline">{txt(c.hero.tagline, (v) => patch("hero", { ...c.hero, tagline: v }))}</F><F label="Button">{txt(c.hero.cta, (v) => patch("hero", { ...c.hero, cta: v }))}</F></div>;
    case "split":
      return <div className={box}>{c.split.map((b, i) => (<div key={i} className="space-y-3 rounded-lg border border-[#efeeeb] p-3"><p className="text-[12px] text-mute">{i ? "Right" : "Left"} image</p><Img src={b.image} onPick={() => pick((src) => patch("split", c.split.map((x, j) => (j === i ? { ...x, image: src } : x))))} /><F label="Title">{txt(b.title, (v) => patch("split", c.split.map((x, j) => (j === i ? { ...x, title: v } : x))))}</F><F label="Link label">{txt(b.cta, (v) => patch("split", c.split.map((x, j) => (j === i ? { ...x, cta: v } : x))))}</F></div>))}</div>;
    case "statement":
      return <div className={box}><Img src={c.statement.image} onPick={() => pick((src) => patch("statement", { ...c.statement, image: src }))} /><F label="Title">{txt(c.statement.title, (v) => patch("statement", { ...c.statement, title: v }))}</F><F label="Text">{txt(c.statement.body, (v) => patch("statement", { ...c.statement, body: v }), true)}</F></div>;
    case "linen":
      return <div className={box}><Img src={c.linen.image} onPick={() => pick((src) => patch("linen", { ...c.linen, image: src }))} /><F label="Title">{txt(c.linen.title, (v) => patch("linen", { ...c.linen, title: v }))}</F><F label="Text">{txt(c.linen.body, (v) => patch("linen", { ...c.linen, body: v }), true)}</F><F label="Products (2)">{productPicker(c.linen.productIds, (ids) => patch("linen", { ...c.linen, productIds: ids }), 2)}</F></div>;
    case "collections":
      return <div className={box}><F label="Heading (line break with Enter)">{txt(c.collections.title, (v) => patch("collections", { title: v }), true)}</F><p className="text-[12px] text-mute">The index lists the four categories: Shirts, Blouses, Trousers, Shorts.</p></div>;
    case "featured":
      return <div className={box}><F label="Featured products">{productPicker(c.featured.productIds, (ids) => patch("featured", { productIds: ids }), 8)}</F></div>;
    case "campaign":
      return <div className={box}><F label="Main image"><Img src={c.campaign.image} onPick={() => pick((src) => patch("campaign", { ...c.campaign, image: src }))} /></F><F label="Detail image"><Img src={c.campaign.detail} onPick={() => pick((src) => patch("campaign", { ...c.campaign, detail: src }))} /></F><F label="Caption">{txt(c.campaign.caption, (v) => patch("campaign", { ...c.campaign, caption: v }))}</F><F label="Heading">{txt(c.campaign.title, (v) => patch("campaign", { ...c.campaign, title: v }), true)}</F></div>;
    case "newsletter":
      return <div className={box}><F label="Heading">{txt(c.newsletter.title, (v) => patch("newsletter", { ...c.newsletter, title: v }))}</F><F label="Text">{txt(c.newsletter.body, (v) => patch("newsletter", { ...c.newsletter, body: v }), true)}</F></div>;
  }
}
