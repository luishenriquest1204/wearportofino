import { Link, NavLink, Route, Routes, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { BarChart3, Boxes, Check, Rocket, ExternalLink, LayoutDashboard, LayoutTemplate, Menu, Package, ShoppingBag, Users, Wallet, X } from "lucide-react";
import { Monogram } from "../components/Marks";
import { useAdmin } from "./store";
import Dashboard from "./Dashboard";
import Products, { ProductEditor } from "./Products";
import Inventory from "./Inventory";
import Orders from "./Orders";
import Customers from "./Customers";
import Financial from "./Financial";
import ContentManager from "./Content";
import Analytics from "./Analytics";
import Launch from "./Launch";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/financial", label: "Financial", icon: Wallet },
  { to: "/admin/content", label: "Content", icon: LayoutTemplate },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/launch", label: "Launch", icon: Rocket },
];

export default function Admin() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toast = useAdmin((s) => s.toast);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    document.title = "PORTOFINO Creator — demo";
    document.documentElement.classList.remove("motion");
    return () => {
      document.title = "PORTOFINO — A new destination awaits";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[13px] text-ink">
      <div className="sticky top-0 z-40 flex h-9 items-center justify-center gap-2 bg-navy px-4 text-center text-[11px] tracking-[0.04em] text-white">
        <span className="rounded-full border border-white/50 px-2 py-px text-[10px] uppercase tracking-[0.12em]">Demo</span>
        Fictional data · changes live only in this browser tab and reset when it is closed
      </div>
      <aside className={`fixed bottom-0 left-0 top-9 z-30 flex w-[232px] flex-col border-r border-hair bg-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-[#efeeeb] px-5">
          <Monogram className="w-7 text-navy" />
          <div className="leading-tight">
            <p className="text-[12px] tracking-[0.14em]">PORTOFINO</p>
            <p className="text-[11px] text-mute">Creator</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Creator">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive ? "bg-[#f1f0ed] text-ink" : "text-ink/65 hover:bg-[#f7f6f3] hover:text-ink"}`}>
              <Icon size={16} strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#efeeeb] p-3">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink/65 hover:bg-[#f7f6f3] hover:text-ink">
            <ExternalLink size={16} strokeWidth={1.5} aria-hidden /> View store
          </Link>
          <div className="mt-2 flex items-center gap-3 px-3 py-2">
            <span className="grid size-7 place-items-center rounded-full bg-beige text-[11px]">PF</span>
            <div className="leading-tight"><p className="text-[12px]">Demo admin</p><p className="text-[11px] text-mute">admin@example.com</p></div>
          </div>
        </div>
      </aside>
      {open ? <div className="fixed inset-0 z-20 bg-ink/20 lg:hidden" onClick={() => setOpen(false)} aria-hidden /> : null}

      <div className="lg:pl-[232px]">
        <div className="sticky top-9 z-10 flex h-14 items-center gap-3 border-b border-hair bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} className="rounded-lg p-1.5 hover:bg-[#f1f0ed]">{open ? <X size={18} /> : <Menu size={18} />}</button>
          <p className="text-[12px] tracking-[0.14em]">PORTOFINO <span className="tracking-normal text-mute">Creator</span></p>
        </div>
        <main className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/:id" element={<ProductEditor />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="financial" element={<Financial />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="launch" element={<Launch />} />
            <Route path="*" element={<div className="py-24 text-center"><p className="text-[18px]">Page not found</p><Link to="/admin" className="mt-3 inline-block underline">Back to dashboard</Link></div>} />
          </Routes>
        </main>
      </div>

      <div role="status" aria-live="polite" className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-[12px] text-white shadow-lg transition-all duration-300 ${toast ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        <Check size={13} className="mr-2 inline -translate-y-px" aria-hidden />{toast}
      </div>
    </div>
  );
}
