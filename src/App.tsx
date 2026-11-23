import { HashRouter, Route, Routes } from "react-router";
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

const Admin = lazy(() => import("./admin/Admin"));

export default function App() {
  return (
    <HashRouter>
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
          <Route path="account" element={<Account />} />
          <Route path="bag" element={<Bag />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/confirmation" element={<Confirmation />} />
          <Route path="info/:slug" element={<Info />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<div className="grid h-screen place-items-center text-[12px] uppercase tracking-[0.2em] text-mute">PORTOFINO Creator</div>}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </HashRouter>
  );
}
