import { BrowserRouter, HashRouter, Route, Routes } from "react-router";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/Product";
import About from "./pages/About";
import Search from "./pages/Search";
import Account from "./pages/Account";
import Bag from "./pages/Bag";
import Checkout, { Confirmation } from "./pages/Checkout";
import Info from "./pages/Info";
import NewsletterPage from "./pages/NewsletterPage";
import NotFound from "./pages/NotFound";
import { CommerceRoute } from "./components/Prelaunch";
import { SITE } from "./config/store";

// The Creator is compiled only into the private admin build (VITE_INCLUDE_ADMIN=true).
// In the public build this branch is dead code and the admin chunk is not emitted at all.
const Admin = import.meta.env.VITE_INCLUDE_ADMIN === "true" ? lazy(() => import("./admin/Admin")) : null;
const Router = SITE.router === "browser" ? BrowserRouter : HashRouter;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop mode="all" />} />
          <Route path="shop/:category" element={<Shop mode="category" />} />
          <Route path="new-in" element={<Shop mode="new" />} />
          <Route path="essentials" element={<Shop mode="essentials" />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="about" element={<About />} />
          <Route path="search" element={<Search />} />
          <Route path="account" element={<CommerceRoute kind="account"><Account /></CommerceRoute>} />
          <Route path="bag" element={<CommerceRoute kind="bag"><Bag /></CommerceRoute>} />
          <Route path="checkout" element={<CommerceRoute kind="checkout"><Checkout /></CommerceRoute>} />
          <Route path="checkout/confirmation" element={<CommerceRoute kind="checkout"><Confirmation /></CommerceRoute>} />
          <Route path="info/:slug" element={<Info />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {Admin ? (
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<div className="grid h-screen place-items-center text-[12px] uppercase tracking-[0.2em] text-mute">PORTOFINO Creator</div>}>
              <Admin />
            </Suspense>
          }
        />
        ) : null}
      </Routes>
    </Router>
  );
}
