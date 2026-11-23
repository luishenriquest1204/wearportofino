import { SITE, STORE } from "./store";

/**
 * Launch readiness — a factual inventory of what exists in this codebase today.
 * Update an item's status ONLY after it is implemented AND tested. The launch panel and
 * the OFFICIAL LAUNCH PROTOCOL refuse to activate sales while any critical item is not "ready".
 */
export type Status = "ready" | "prepared" | "pending" | "missing";
export type Item = { id: string; area: string; label: string; status: Status; critical: boolean; note: string };

const configured = (v: string): Status => (v ? "ready" : "pending");

export const READINESS: Item[] = [
  { id: "catalog", area: "Catalogue", label: "Products, photos, prices, categories", status: "ready", critical: true, note: "Served from src/data/catalog.ts. Creator edits are not saved to a database yet." },
  { id: "state", area: "Control", label: "Central commerce switch (frontend)", status: "ready", critical: true, note: `src/config/store.ts — current mode: ${STORE.MODE}.` },
  { id: "bag", area: "Commerce", label: "Shopping bag", status: "prepared", critical: true, note: "Built and gated by COMMERCE_ENABLED. Stored only in the visitor's browser." },
  { id: "checkout", area: "Commerce", label: "Checkout screens", status: "prepared", critical: true, note: "Information, shipping and payment steps exist; they are not connected to a payment provider." },
  { id: "backend", area: "Backend", label: "Commerce backend + server-side guard", status: "missing", critical: true, note: "No server exists. It must check STORE_MODE with resolveStoreState() on every order/payment request." },
  { id: "payments", area: "Payments", label: "Payment gateway (e.g. Mercado Pago: Pix + card)", status: "missing", critical: true, note: "No integration and no credentials. Card data must stay on the provider's page." },
  { id: "webhooks", area: "Payments", label: "Payment confirmations and failures (webhooks)", status: "missing", critical: true, note: "Needed to mark orders paid, refused or refunded." },
  { id: "orders", area: "Orders", label: "Order creation and processing (database)", status: "missing", critical: true, note: "Orders currently exist only as fictional data in the Creator." },
  { id: "stock", area: "Orders", label: "Stock decrement on payment", status: "missing", critical: true, note: "Stock lives in code; nothing is reserved or decremented." },
  { id: "shipping", area: "Orders", label: "Shipping rates", status: "pending", critical: true, note: "Fixed table in the site (R$35 standard, R$69 express, free over R$1.500) — confirm or connect Correios/Melhor Envio." },
  { id: "emails", area: "Notifications", label: "Order and payment emails", status: "missing", critical: true, note: "No email service connected." },
  { id: "admin-auth", area: "Admin", label: "Admin login and permissions", status: "missing", critical: true, note: "The Creator has no authentication; it is kept out of the public build and published only privately." },
  { id: "admin-data", area: "Admin", label: "Creator connected to real sales", status: "missing", critical: true, note: "Dashboard, orders and customers show fictional data." },
  { id: "legal", area: "Content", label: "Legal texts reviewed (privacy/LGPD, terms, returns)", status: "pending", critical: true, note: "Current texts were drafted for the site and need the owner's/legal review." },
  { id: "domain", area: "Publishing", label: "Official domain + HTTPS hosting", status: configured(SITE.url) === "ready" ? "ready" : "missing", critical: true, note: SITE.url || "VITE_SITE_URL not set; no hosting chosen yet." },
  { id: "accounts", area: "Customers", label: "Customer accounts and order history", status: "prepared", critical: false, note: "Screens exist; real sign-in needs the backend. Guest checkout can launch without it." },
  { id: "contact", area: "Content", label: "Contact email", status: configured(SITE.contactEmail), critical: false, note: SITE.contactEmail || "VITE_CONTACT_EMAIL not set — the contact page says channels open at launch." },
  { id: "instagram", area: "Content", label: "Instagram profile link", status: configured(SITE.instagram), critical: false, note: SITE.instagram || "VITE_INSTAGRAM_URL not set — Instagram links are hidden." },
  { id: "newsletter", area: "Content", label: "Newsletter list", status: configured(SITE.newsletterEndpoint), critical: false, note: SITE.newsletterEndpoint || "VITE_NEWSLETTER_ENDPOINT not set — sign-up form is replaced by a follow invitation." },
  { id: "photos", area: "Content", label: "Missing product photography", status: "pending", critical: false, note: "Liguria Blouse in Celeste has no photo." },
];

export const blocking = () => READINESS.filter((i) => i.critical && i.status !== "ready");
