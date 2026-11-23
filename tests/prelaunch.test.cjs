/**
 * PORTOFINO — pre-launch test suite (navigation, commerce block, integrity, security).
 *
 *   npm run build && npm run build:admin
 *   npx vite preview --port 4173 &                       (public build)
 *   npx vite preview --outDir dist-admin --port 4174 &   (private admin build, optional)
 *   npm run test:prelaunch
 *
 * BASE_URL / ADMIN_URL override the defaults. Results go to tests/results/prelaunch.json and are
 * copied into src/admin/launch-tests.json so the Creator → Launch page shows the last run.
 */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE = (process.env.BASE_URL || "http://localhost:4173/").replace(/\/?$/, "/");
const ADMIN = (process.env.ADMIN_URL || "http://localhost:4174/").replace(/\/?$/, "/");
const H = (route) => `${BASE}#${route}`;

const suites = [];
let current;
const suite = (name) => suites.push((current = { name, passed: 0, failed: 0, cases: [] }));
function check(name, ok, detail) {
  current.cases.push({ name, ok: !!ok, ...(detail ? { detail: String(detail).slice(0, 220) } : {}) });
  ok ? current.passed++ : current.failed++;
  console.log(`${ok ? "  ✓" : "  ✕"} ${name}${detail ? ` — ${detail}` : ""}`);
}

// Expected catalogue, read from the source of truth.
const catalogSrc = fs.readFileSync(path.join(ROOT, "src/data/catalog.ts"), "utf8");
const PRODUCTS = [...catalogSrc.matchAll(/slug: "([^"]+)",\s*name: "([^"]+)",\s*category: "([^"]+)",\s*price: (\d+),\s*compareAt: (\d+|null)/g)].map((m) => ({ slug: m[1], name: m[2], category: m[3], price: +m[4], compareAt: m[5] === "null" ? null : +m[5] }));
const brl = (c) => "R$" + (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: c % 100 ? 2 : 0 });

const ROUTES = ["/", "/shop", "/shop/shirts", "/shop/blouses", "/shop/trousers", "/shop/shorts", "/new-in", "/essentials", ...PRODUCTS.map((p) => `/product/${p.slug}`), "/about", "/search", "/search?q=linen", "/newsletter", "/info/shipping", "/info/returns", "/info/faq", "/info/contact", "/info/philosophy", "/info/size-guide", "/info/privacy", "/info/terms", "/info/payments"];
const COMMERCE_ROUTES = ["/bag", "/checkout", "/checkout/confirmation", "/account"];

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("pf-intro", "1"); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("request", (r) => requests.push(r.url()));
  return { ctx, page, errors, requests };
}
async function visit(page, route) {
  await page.goto("about:blank");
  await page.goto(H(route), { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
}
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();

  // ─────────────────────────── NAVIGATION ───────────────────────────
  suite("Navigation");
  {
    const { page, errors, requests } = await newPage(browser);
    const links = new Set();
    for (const r of ROUTES) {
      errors.length = 0;
      await visit(page, r);
      await scrollThrough(page);
      const info = await page.evaluate(() => ({
        h1: document.querySelector("main h1, main h2")?.textContent?.trim() || "",
        notFound: document.body.innerText.toUpperCase().includes("LOST AT SEA"),
        broken: [...document.querySelectorAll("main img")].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")),
        links: [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute("href")),
      }));
      info.links.forEach((l) => links.add(l.slice(1)));
      check(`${r} renders`, info.h1 && !info.notFound && !errors.length, errors[0] || (info.notFound ? "showed 404" : ""));
      if (info.broken.length) check(`${r} images load`, false, info.broken.join(", "));
    }
    check("All images on public pages load", !current.cases.some((c) => c.name.endsWith("images load")));
    // Every internal link found on the site resolves to a real page.
    const dead = [];
    for (const l of links) {
      if (ROUTES.includes(l) || COMMERCE_ROUTES.includes(l)) continue;
      await visit(page, l);
      if (await page.evaluate(() => document.body.innerText.toUpperCase().includes("LOST AT SEA"))) dead.push(l);
    }
    check(`Internal links (${links.size}) resolve`, !dead.length, dead.join(", "));
    const external = [...new Set(requests.filter((u) => !u.startsWith(BASE) && !u.startsWith("about:") && !u.startsWith("data:")).map((u) => new URL(u).host))];
    check("No third-party requests (fonts and images self-hosted)", !external.length, external.join(", "));
    await page.context().close();

    for (const d of ["iPhone 13", "iPhone SE", "Pixel 7", "iPad Mini", "iPad Pro 11 landscape"]) {
      const { ctx, page: p } = await newPage(browser, { ...devices[d] });
      const over = [];
      for (const r of ["/", "/shop", "/product/portofino-shirt", "/about", "/checkout", "/info/size-guide"]) {
        await visit(p, r);
        await p.waitForTimeout(1800); // let entrance animations settle
        const x = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (x > 0) over.push(`${r} +${x}px`);
      }
      check(`Responsive: ${d} has no horizontal scroll`, !over.length, over.join(", "));
      await ctx.close();
    }
  }

  // ─────────────────────────── COMMERCE BLOCK ───────────────────────────
  suite("Commerce block");
  {
    const { page, requests } = await newPage(browser);
    for (const p of PRODUCTS) {
      await visit(page, `/product/${p.slug}`);
      const s = await page.evaluate(() => ({
        add: [...document.querySelectorAll("button")].some((b) => /add to bag|adicionar/i.test(b.textContent)),
        soon: document.body.innerText.toUpperCase().includes("OFFICIAL LAUNCH SOON"),
        qty: !!document.querySelector('[aria-label="Quantity"]'),
      }));
      check(`${p.name}: no add-to-bag or quantity control, launch notice shown`, !s.add && !s.qty && s.soon);
    }
    await visit(page, "/product/portofino-shirt");
    await page.getByRole("radio", { name: /^M/ }).click();
    const bagBtn = await page.locator("header button", { hasText: /bag/i }).count();
    check("Header has no bag button (cannot open a bag)", bagBtn === 0);
    check("Bag drawer is not mounted", (await page.locator('[aria-label="Shopping bag"]').count()) === 0);

    for (const r of COMMERCE_ROUTES) {
      await visit(page, r);
      const s = await page.evaluate(() => ({ soon: document.body.innerText.toUpperCase().includes("OFFICIAL LAUNCH SOON"), fields: document.querySelectorAll("main input, main select").length }));
      check(`Direct URL ${r} is blocked`, s.soon && s.fields === 0, `${s.fields} form fields`);
    }

    // Forged state: lines injected into storage, mode flags set in storage and URL.
    await page.evaluate(() => {
      sessionStorage.setItem("pf-bag", JSON.stringify({ state: { lines: [{ productId: "p-shirt", color: "Bianco", size: "M", qty: 2 }] }, version: 0 }));
      sessionStorage.setItem("pf-account", JSON.stringify({ state: { user: { name: "x", email: "x@example.com" } }, version: 0 }));
      localStorage.setItem("VITE_STORE_MODE", "live");
      localStorage.setItem("COMMERCE_ENABLED", "true");
    });
    for (const r of ["/bag?mode=live&COMMERCE_ENABLED=true", "/checkout?VITE_STORE_MODE=live", "/account"]) {
      await page.goto(H(r)); await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(500);
      const blocked = await page.evaluate(() => document.body.innerText.toUpperCase().includes("OFFICIAL LAUNCH SOON") && !document.querySelector("main input"));
      check(`Forged storage/URL flags do not unlock ${r.split("?")[0]}`, blocked);
    }
    await visit(page, "/product/portofino-shirt");
    check("Injected bag lines are not shown anywhere", !(await page.evaluate(() => /BAG \(\d+\)|SACOLA \(\d+\)/i.test(document.querySelector("header").innerText))));

    // Commercial endpoints: none exist on the site; requests must not succeed.
    for (const ep of ["api/orders", "api/checkout", "api/payments", "api/payments/webhook"]) {
      const res = await page.request.post(BASE + ep, { data: { productId: "p-shirt", qty: 1, amount: 34200 }, failOnStatusCode: false });
      const ct = res.headers()["content-type"] || "";
      check(`POST /${ep} cannot create an order or charge`, !(res.ok() && ct.includes("json")), `HTTP ${res.status()} ${ct.split(";")[0] || "no body type"}`);
    }
    const payHosts = requests.filter((u) => /mercadopago|stripe|pagseguro|pagar\.me|paypal|adyen|cielo/i.test(u));
    check("No request to any payment provider", !payHosts.length, payHosts[0]);
    await page.context().close();
  }

  // ─────────────────────────── INTEGRITY ───────────────────────────
  suite("Integrity");
  {
    const { page } = await newPage(browser);
    check(`Catalogue source has ${PRODUCTS.length} products`, PRODUCTS.length === 4, PRODUCTS.map((p) => p.name).join(", "));
    await visit(page, "/shop");
    const shop = await page.evaluate(() => [...document.querySelectorAll("main article")].map((a) => a.innerText.replace(/\s+/g, " ")));
    check("Shop lists every product", shop.length === PRODUCTS.length, `${shop.length} cards`);
    for (const p of PRODUCTS) {
      const card = shop.find((t) => t.toUpperCase().includes(p.name.toUpperCase())) || "";
      check(`${p.name}: price ${brl(p.price)} on the shop card`, card.includes(brl(p.price)) && (!p.compareAt || card.includes(brl(p.compareAt))), card);
      await visit(page, `/product/${p.slug}`);
      const t = await page.evaluate(() => document.querySelector("main").innerText.replace(/\s+/g, " "));
      check(`${p.name}: product page shows name, price, description and sizes`, t.toUpperCase().includes(p.name.toUpperCase()) && t.includes(brl(p.price)) && /PP .*\bP\b.*\bM\b.*\bG\b.*GG/.test(t));
    }
    for (const c of ["shirts", "blouses", "trousers", "shorts"]) {
      await visit(page, `/shop/${c}`);
      const n = await page.locator("main article").count();
      const expected = PRODUCTS.filter((p) => p.category === c).length;
      check(`Category ${c} shows ${expected} piece(s)`, n === expected, `${n} shown`);
    }
    // Portuguese keeps the same products and prices.
    await page.evaluate(() => localStorage.setItem("pf-lang", JSON.stringify({ state: { lang: "pt" }, version: 0 })));
    await visit(page, "/shop");
    const pt = await page.evaluate(() => document.querySelector("main").innerText);
    check("Portuguese version shows the same prices", PRODUCTS.every((p) => pt.includes(brl(p.price))) && pt.toUpperCase().includes("VER TUDO"));
    await visit(page, "/product/portofino-shirt");
    check("Portuguese launch notice shown on product page", (await page.evaluate(() => document.body.innerText.toUpperCase())).includes("LANÇAMENTO OFICIAL EM BREVE"));
    await page.context().close();

    // Private admin build (optional server).
    const { page: a, errors } = await newPage(browser);
    let adminUp = true;
    try { await a.goto(`${ADMIN}#/admin`, { waitUntil: "networkidle", timeout: 8000 }); } catch { adminUp = false; }
    if (adminUp) {
      await a.waitForTimeout(800);
      check("Admin (private build): dashboard loads", (await a.locator("h1", { hasText: "Dashboard" }).count()) === 1 && !errors.length, errors[0]);
      await a.goto(`${ADMIN}#/admin/products`); await a.waitForTimeout(600);
      check("Admin: products table lists the catalogue", (await a.locator("tbody tr").count()) === PRODUCTS.length);
      await a.goto(`${ADMIN}#/admin/launch`); await a.waitForTimeout(600);
      const l = await a.evaluate(() => ({ t: document.body.innerText, disabled: document.querySelector("#confirm-launch")?.disabled }));
      check("Admin: launch panel reports pre-launch state", l.t.includes("Pre-launch") && l.t.includes("COMMERCE_ENABLED"));
      check("Admin: activation is locked while critical items are pending", l.disabled === true);
    } else {
      check("Admin (private build) checks", false, `admin preview not reachable at ${ADMIN}`);
    }
    await a.context().close();
  }

  // ─────────────────────────── SECURITY ───────────────────────────
  suite("Security");
  {
    const dist = path.join(ROOT, "dist");
    const files = [];
    (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(dist);
    const text = files.filter((f) => /\.(js|css|html|txt|svg|json)$/.test(f)).map((f) => [path.relative(dist, f), fs.readFileSync(f, "utf8")]);
    check("Public build contains no admin code", !files.some((f) => /Admin-/.test(f)) && !text.some(([, s]) => s.includes("PORTOFINO Creator") || s.includes("Launch control")));
    check("Public build contains no fictional customer data", !text.some(([, s]) => /@example\.com/.test(s) || s.includes("buildOrders")));
    const secretRx = /(sk_(live|test)_[A-Za-z0-9]{8,}|APP_USR-[0-9a-f-]{10,}|TEST-[0-9]{6,}-|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|eyJhbGciOi[A-Za-z0-9_-]{20,})/;
    const leaks = text.filter(([, s]) => secretRx.test(s)).map(([f]) => f);
    check("No keys, tokens or private keys in the public build", !leaks.length, leaks.join(", "));
    const env = fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n").filter((l) => l && !l.startsWith("#"));
    check(".env holds only public VITE_ settings", env.every((l) => /^VITE_[A-Z_]+=/.test(l) && !secretRx.test(l)), env.join(" | "));
    check("Store mode is compiled in as pre-launch", text.some(([, s]) => s.includes("prelaunch")));

    const { page, ctx } = await newPage(browser);
    await visit(page, "/admin");
    check("/admin on the public site is a 404", await page.evaluate(() => document.body.innerText.toUpperCase().includes("LOST AT SEA")));
    await visit(page, "/");
    check("No cookies set by the site", (await ctx.cookies()).length === 0);
    const stored = await page.evaluate(() => ({ ls: Object.keys(localStorage), ss: Object.keys(sessionStorage) }));
    check("Browser storage holds no personal data", ![...stored.ls, ...stored.ss].some((k) => /account|email|card/i.test(k) && k !== "pf-account"), JSON.stringify(stored));
    await ctx.close();
  }

  await browser.close();
  const passed = suites.reduce((s, x) => s + x.passed, 0);
  const failed = suites.reduce((s, x) => s + x.failed, 0);
  const report = { generatedAt: new Date().toISOString(), baseUrl: BASE, summary: `${passed} passed, ${failed} failed across ${suites.length} suites (navigation, commerce block, integrity, security).`, suites };
  fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "results/prelaunch.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(ROOT, "src/admin/launch-tests.json"), JSON.stringify({ ...report, baseUrl: undefined }, null, 2));
  console.log(`\n${report.summary}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
