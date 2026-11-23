import { Link, useNavigate, useParams } from "react-router";
import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useCatalog, totalStock } from "../store/catalog";
import { CATEGORIES, formatBRL, SIZES, type CategorySlug, type Product } from "../data/catalog";
import { IMAGE_LIBRARY } from "../data/content";
import { Card, PageHead, Pill, btnDark, btnLine, inputCls } from "./ui";
import { useAdmin } from "./store";

export default function Products() {
  const { products, duplicate, togglePublish, remove, reset } = useCatalog();
  const notify = useAdmin((s) => s.notify);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState<Product | null>(null);
  const list = useMemo(
    () => products.filter((p) => (!q || `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat) && (!status || (status === "live" ? p.published : !p.published))),
    [products, q, cat, status],
  );
  return (
    <>
      <PageHead title="Products" sub={`${products.length} products · ${products.filter((p) => p.published).length} published`}>
        <button type="button" className={btnLine} onClick={() => { reset(); notify("Catalogue restored to the original four pieces"); }}>Reset demo</button>
        <Link to="/admin/products/new" className={btnDark}><Plus size={15} /> New product</Link>
      </PageHead>
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-[#efeeeb] p-4">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Search products</span>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU" className={`${inputCls} pl-8`} />
          </label>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} w-auto`} aria-label="Category">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`} aria-label="Status">
            <option value="">Any status</option><option value="live">Published</option><option value="draft">Draft</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="text-[11px] text-mute"><tr><th className="px-5 py-2.5 font-normal">Product</th><th className="font-normal">Category</th><th className="font-normal">Status</th><th className="font-normal">Price</th><th className="font-normal">Stock</th><th className="font-normal">Colours</th><th className="px-5 text-right font-normal">Actions</th></tr></thead>
            <tbody>
              {list.map((p) => {
                const st = totalStock(p);
                return (
                  <tr key={p.id} className="border-t border-[#efeeeb] hover:bg-[#fafaf8]">
                    <td className="px-5 py-3">
                      <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="block h-12 w-10 shrink-0 overflow-hidden rounded bg-studio">{p.gallery[0] ? <img src={p.gallery[0].src} alt="" className="h-full w-full object-cover" /> : null}</span>
                        <span><span className="block">{p.name}</span><span className="text-[11px] text-mute">{p.sku}</span></span>
                      </Link>
                    </td>
                    <td>{CATEGORIES.find((c) => c.slug === p.category)?.name}</td>
                    <td><Pill tone={p.published ? "good" : "neutral"}>{p.published ? "Published" : "Draft"}</Pill></td>
                    <td className="tabular-nums">{formatBRL(p.price)}{p.compareAt ? <span className="ml-1.5 text-[11px] text-mute line-through">{formatBRL(p.compareAt)}</span> : null}</td>
                    <td className="tabular-nums">{st <= 5 ? <Pill tone={st ? "warn" : "bad"}>{st} units</Pill> : `${st} units`}</td>
                    <td><span className="flex gap-1">{p.colors.map((c) => <span key={c.name} title={c.name} className="size-4 rounded-full border border-ink/30" style={{ background: c.hex }} />)}</span></td>
                    <td className="px-5">
                      <div className="flex justify-end gap-1">
                        <IconBtn label="Edit" onClick={() => nav(`/admin/products/${p.id}`)}><Pencil size={14} /></IconBtn>
                        <IconBtn label={p.published ? "Unpublish" : "Publish"} onClick={() => { togglePublish(p.id); notify(p.published ? `${p.name} unpublished` : `${p.name} published`); }}>{p.published ? <EyeOff size={14} /> : <Eye size={14} />}</IconBtn>
                        <IconBtn label="Duplicate" onClick={() => { duplicate(p.id); notify(`${p.name} duplicated as a draft`); }}><Copy size={14} /></IconBtn>
                        <IconBtn label="Delete" onClick={() => setConfirm(p)}><Trash2 size={14} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!list.length ? <tr><td colSpan={7} className="py-12 text-center text-mute">No products match.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
      {confirm ? (
        <Modal onClose={() => setConfirm(null)} title="Delete product?">
          <p className="text-ink/75">“{confirm.name}” will be removed from the catalogue for this session.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={btnLine} onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className={`${btnDark} bg-[#a33a2b] hover:bg-[#8a2f22]`} onClick={() => { remove(confirm.id); notify(`${confirm.name} deleted`); setConfirm(null); }}>Delete</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-lg text-ink/60 hover:bg-[#f1f0ed] hover:text-ink">{children}</button>;
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className={`relative max-h-[88vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${wide ? "max-w-[720px]" : "max-w-[420px]"}`}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-[15px]">{title}</h2><button type="button" autoFocus onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-[#f1f0ed]"><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}

const blank = (): Product => ({
  id: `p-${Date.now().toString(36)}`, slug: "", name: "", category: "shirts", price: 34200, compareAt: null, isNew: true, published: false,
  colors: [{ name: "Bianco", hex: "#FFFFFF", image: null }], stock: { Bianco: { PP: 0, P: 0, M: 0, G: 0, GG: 0 } }, cost: 0, sku: "", description: "", details: [], fit: "", gallery: [],
});
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const cents = (s: string) => Math.round(parseFloat(s.replace(/\./g, "").replace(",", ".")) * 100) || 0;
const reais = (c: number | null) => (c == null ? "" : (c / 100).toFixed(2).replace(".", ","));

export function ProductEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { products, upsert } = useCatalog();
  const notify = useAdmin((s) => s.notify);
  const existing = products.find((p) => p.id === id);
  const [p, setP] = useState<Product>(() => (existing ? structuredClone(existing) : blank()));
  const [price, setPrice] = useState(reais(p.price));
  const [compare, setCompare] = useState(reais(p.compareAt));
  const [cost, setCost] = useState(reais(p.cost));
  const [picker, setPicker] = useState<null | { kind: "gallery" } | { kind: "color"; i: number }>(null);
  const [err, setErr] = useState("");
  if (id && !existing) return <div className="py-24 text-center">Product not found. <Link to="/admin/products" className="underline">Back</Link></div>;

  const up = (patch: Partial<Product>) => setP((s) => ({ ...s, ...patch }));
  const save = () => {
    if (!p.name.trim()) return setErr("The product needs a name.");
    if (cents(price) <= 0) return setErr("Enter a valid price.");
    if (p.colors.some((c) => !c.name.trim())) return setErr("Every colour needs a name.");
    const slug = p.slug || slugify(p.name);
    if (products.some((x) => x.slug === slug && x.id !== p.id)) return setErr("Another product already uses this URL slug.");
    const gallery = p.gallery.length ? p.gallery : p.colors.filter((c) => c.image).map((c) => ({ src: c.image!, alt: `${p.name} in ${c.name}`, kind: "studio" as const }));
    upsert({ ...p, name: p.name.trim(), slug, sku: p.sku || `PF-${slug.slice(0, 6).toUpperCase()}`, price: cents(price), compareAt: compare ? cents(compare) : null, cost: cents(cost), gallery });
    notify(existing ? "Product saved" : "Product created");
    nav("/admin/products");
  };
  const pick = (src: string) => {
    if (!picker) return;
    if (picker.kind === "gallery") up({ gallery: [...p.gallery, { src, alt: p.name || "Product image", kind: "studio" }] });
    else up({ colors: p.colors.map((c, i) => (i === picker.i ? { ...c, image: src } : c)) });
    setPicker(null);
  };
  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => pick(String(r.result));
    r.readAsDataURL(f);
  };
  const renameColor = (i: number, name: string) => {
    const old = p.colors[i].name;
    const stock = { ...p.stock };
    stock[name] = stock[old] ?? { PP: 0, P: 0, M: 0, G: 0, GG: 0 };
    if (old !== name) delete stock[old];
    up({ colors: p.colors.map((c, j) => (j === i ? { ...c, name } : c)), stock });
  };

  return (
    <>
      <PageHead title={existing ? `Edit — ${existing.name}` : "New product"} sub="Changes apply to the storefront immediately, for this session only">
        <Link to="/admin/products" className={btnLine}>Cancel</Link>
        {existing?.published ? <Link to={`/product/${existing.slug}`} className={btnLine} target="_blank">View in store</Link> : null}
        <button type="button" onClick={save} className={btnDark}>Save product</button>
      </PageHead>
      {err ? <p role="alert" className="mb-4 rounded-lg bg-[#f8e5e1] px-4 py-2.5 text-[#a33a2b]">{err}</p> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card title="Details">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Name" className="md:col-span-2"><input value={p.name} onChange={(e) => up({ name: e.target.value })} className={inputCls} /></F>
              <F label="URL slug"><input value={p.slug} placeholder={slugify(p.name) || "auto"} onChange={(e) => up({ slug: slugify(e.target.value) })} className={inputCls} /></F>
              <F label="SKU"><input value={p.sku} onChange={(e) => up({ sku: e.target.value.toUpperCase() })} className={inputCls} /></F>
              <F label="Description" className="md:col-span-2"><textarea value={p.description} onChange={(e) => up({ description: e.target.value })} rows={4} className={inputCls} /></F>
              <F label="Details (one per line)"><textarea value={p.details.join("\n")} onChange={(e) => up({ details: e.target.value.split("\n") })} rows={4} className={inputCls} /></F>
              <F label="Fit"><textarea value={p.fit} onChange={(e) => up({ fit: e.target.value })} rows={4} className={inputCls} /></F>
            </div>
          </Card>
          <Card title="Images" action={<button type="button" onClick={() => setPicker({ kind: "gallery" })} className="text-[12px] text-mute hover:text-ink">+ Add image</button>}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {p.gallery.map((g, i) => (
                <div key={`${g.src.slice(-40)}${i}`} className="group relative aspect-[428/503] overflow-hidden rounded-lg bg-studio">
                  <img src={g.src} alt={g.alt} className="h-full w-full object-cover" />
                  {i === 0 ? <span className="absolute left-1.5 top-1.5 rounded bg-white/90 px-1.5 text-[10px]">Main</span> : null}
                  <div className="absolute inset-x-1 bottom-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {i > 0 ? <button type="button" onClick={() => { const g2 = [...p.gallery]; [g2[i - 1], g2[i]] = [g2[i], g2[i - 1]]; up({ gallery: g2 }); }} className="rounded bg-white/90 px-1.5 text-[11px]" aria-label="Move earlier">←</button> : null}
                    <button type="button" onClick={() => up({ gallery: p.gallery.filter((_, j) => j !== i) })} className="rounded bg-white/90 px-1.5 text-[11px]" aria-label="Remove image">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setPicker({ kind: "gallery" })} className="grid aspect-[428/503] place-items-center rounded-lg border border-dashed border-hair text-mute hover:border-ink/40 hover:text-ink"><Plus size={18} /></button>
            </div>
            <p className="mt-3 text-[11px] text-mute">Use real product photography only. Uploaded images stay in this tab and are not sent anywhere.</p>
          </Card>
          <Card title="Colours & stock" action={<button type="button" className="text-[12px] text-mute hover:text-ink" onClick={() => { const name = `Colour ${p.colors.length + 1}`; up({ colors: [...p.colors, { name, hex: "#D9CCBA", image: null }], stock: { ...p.stock, [name]: { PP: 0, P: 0, M: 0, G: 0, GG: 0 } } }); }}>+ Add colour</button>}>
            <div className="space-y-4">
              {p.colors.map((c, i) => (
                <div key={i} className="rounded-lg border border-[#efeeeb] p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="color" value={c.hex} onChange={(e) => up({ colors: p.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) })} className="size-9 cursor-pointer rounded border border-hair" aria-label={`Swatch colour for ${c.name}`} />
                    <input value={c.name} onChange={(e) => renameColor(i, e.target.value)} className={`${inputCls} w-40`} aria-label="Colour name" />
                    <button type="button" onClick={() => setPicker({ kind: "color", i })} className="flex items-center gap-2 text-[12px] text-mute hover:text-ink">
                      <span className="block h-9 w-8 overflow-hidden rounded bg-studio">{c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : null}</span>
                      {c.image ? "Change photo" : "No photo — add"}
                    </button>
                    {p.colors.length > 1 ? <button type="button" onClick={() => { const stock = { ...p.stock }; delete stock[c.name]; up({ colors: p.colors.filter((_, j) => j !== i), stock }); }} className="ml-auto text-[12px] text-mute hover:text-[#a33a2b]">Remove</button> : null}
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {SIZES.map((s) => (
                      <label key={s} className="text-[11px] text-mute">{s}
                        <input type="number" min={0} value={p.stock[c.name]?.[s] ?? 0} onChange={(e) => up({ stock: { ...p.stock, [c.name]: { ...(p.stock[c.name] ?? { PP: 0, P: 0, M: 0, G: 0, GG: 0 }), [s]: Math.max(0, +e.target.value || 0) } } })} className={`${inputCls} mt-1 tabular-nums`} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Status">
            <label className="flex items-center justify-between"><span>Published</span><Toggle on={p.published} onChange={(v) => up({ published: v })} /></label>
            <label className="mt-4 flex items-center justify-between"><span>“NEW” badge</span><Toggle on={p.isNew} onChange={(v) => up({ isNew: v })} /></label>
          </Card>
          <Card title="Organisation">
            <F label="Category">
              <select value={p.category} onChange={(e) => up({ category: e.target.value as CategorySlug })} className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name} — {c.namePt}</option>)}</select>
            </F>
            <p className="mt-3 text-[11px] text-mute">Composition: 100% linen (house standard)</p>
          </Card>
          <Card title="Pricing (R$)">
            <div className="space-y-4">
              <F label="Price"><input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputCls} tabular-nums`} /></F>
              <F label="Compare-at price (optional)"><input inputMode="decimal" value={compare} onChange={(e) => setCompare(e.target.value)} className={`${inputCls} tabular-nums`} /></F>
              <F label="Cost per item"><input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} className={`${inputCls} tabular-nums`} /></F>
              {cents(price) > 0 && cents(cost) > 0 ? <p className="text-[12px] text-mute">Margin {(((cents(price) - cents(cost)) / cents(price)) * 100).toFixed(0)}% · profit {formatBRL(cents(price) - cents(cost))}</p> : null}
            </div>
          </Card>
        </div>
      </div>
      {picker ? (
        <Modal title="Choose an image" onClose={() => setPicker(null)} wide>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {IMAGE_LIBRARY.map((src) => (
              <button key={src} type="button" onClick={() => pick(src)} className="aspect-[428/503] overflow-hidden rounded-lg bg-studio ring-ink/50 hover:ring-2"><img src={src} alt={src.split("/").pop()} className="h-full w-full object-cover" /></button>
            ))}
          </div>
          <label className={`${btnLine} mt-5 cursor-pointer`}>Upload from computer<input type="file" accept="image/*" onChange={upload} className="sr-only" /></label>
        </Modal>
      ) : null}
    </>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-[12px] text-mute">{label}</span>{children}</label>;
}
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-navy" : "bg-hair"}`}>
      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}
