/** Default homepage content — editable live in PORTOFINO Creator → Content Manager. */
export type SectionKey = "hero" | "split" | "statement" | "linen" | "collections" | "featured" | "campaign" | "newsletter";

export type HomeContent = {
  order: SectionKey[];
  hidden: SectionKey[];
  hero: { image: string; caption: string; tagline: string; cta: string };
  split: Array<{ image: string; title: string; cta: string; href: string }>;
  statement: { image: string; title: string; body: string };
  linen: { image: string; productIds: string[]; title: string; body: string };
  collections: { title: string };
  featured: { productIds: string[] };
  campaign: { image: string; detail: string; caption: string; title: string };
  newsletter: { title: string; body: string };
};

export const DEFAULT_CONTENT: HomeContent = {
  order: ["hero", "split", "statement", "linen", "collections", "featured", "campaign", "newsletter"],
  hidden: [],
  hero: { image: "img/hero-window.webp", caption: "Collection — The Private 2026", tagline: "A new destination awaits.", cta: "Discover more" },
  split: [
    { image: "img/door-portrait.webp", title: "For the moment", cta: "Shop now", href: "/new-in" },
    { image: "img/building.webp", title: "Timeless essentials", cta: "Shop now", href: "/essentials" },
  ],
  statement: { image: "img/ferry-interior.webp", title: "The art of slow living.", body: "Inspired by distant days, sunlit afternoons and the freedom of living well." },
  linen: { image: "img/bench-sunset.webp", productIds: ["p-shirt", "p-trouser"], title: "The art of linen", body: "One material, grown slowly, softened by every wash." },
  collections: { title: "Dressed in linen.\nFrom collar to hem." },
  featured: { productIds: ["p-shirt", "p-blouse", "p-shorts", "p-trouser"] },
  campaign: { image: "img/courtyard-portrait.webp", detail: "img/collar-detail.webp", caption: "The Private — Collection 01", title: "Linen in the sun, the sea at the end of the street." },
  newsletter: { title: "A note from Portofino", body: "Discover new arrivals, exclusive releases and stories from our world." },
};

export const IMAGE_LIBRARY = [
  "img/hero-window.webp",
  "img/door-portrait.webp",
  "img/building.webp",
  "img/ferry-interior.webp",
  "img/ferry-wood.webp",
  "img/bench-sunset.webp",
  "img/courtyard-portrait.webp",
  "img/collar-detail.webp",
  "img/product-shirt.webp",
  "img/shirt-celeste.webp",
  "img/product-blouse.webp",
  "img/product-shorts.webp",
  "img/product-trouser.webp",
];
