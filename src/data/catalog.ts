/**
 * PORTOFINO catalogue — the four pieces shown in the reference artwork.
 * Product images are the studio renders supplied in the references. Colours
 * without photography are flagged (`image: null`) and the UI says so: no image
 * is ever shown as a colour it is not.
 */
export type Size = "PP" | "P" | "M" | "G" | "GG";
export const SIZES: Size[] = ["PP", "P", "M", "G", "GG"];
export const SIZE_INTL: Record<Size, string> = { PP: "XS", P: "S", M: "M", G: "L", GG: "XL" };

export type CategorySlug = "shirts" | "blouses" | "trousers" | "shorts";
export type Category = { slug: CategorySlug; name: string; namePt: string; caption: string; image: string };

export const CATEGORIES: Category[] = [
  { slug: "shirts", name: "Shirts", namePt: "Camisas", caption: "Collared linen shirts, from the house classic to the open collar", image: "img/product-shirt.webp" },
  { slug: "blouses", name: "Blouses", namePt: "Batas", caption: "Band-collar linen batas with a short buttoned placket", image: "img/product-blouse.webp" },
  { slug: "trousers", name: "Trousers", namePt: "Calças", caption: "Tailored linen trousers with a clean, straight leg", image: "img/product-trouser.webp" },
  { slug: "shorts", name: "Shorts", namePt: "Bermudas", caption: "Tailored linen bermudas for long Mediterranean afternoons", image: "img/product-shorts.webp" },
];

export type Color = { name: string; hex: string; image: string | null };
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number; // cents
  compareAt: number | null;
  isNew: boolean;
  published: boolean;
  colors: Color[];
  stock: Record<string, Record<Size, number>>; // colour name → size → units
  cost: number;
  sku: string;
  description: string;
  details: string[];
  fit: string;
  gallery: Array<{ src: string; alt: string; kind: "studio" | "detail" | "worn" }>;
};

const CARE = "Machine wash cold on a gentle cycle. Dry in the shade. Iron while slightly damp — linen softens with every wash.";
export const CARE_TEXT = CARE;

export const PRODUCTS: Product[] = [
  {
    id: "p-shirt",
    slug: "portofino-shirt",
    name: "Portofino Shirt",
    category: "shirts",
    price: 34200,
    compareAt: 38000,
    isNew: true,
    published: true,
    colors: [
      { name: "Bianco", hex: "#FFFFFF", image: "img/product-shirt.webp" },
      { name: "Celeste", hex: "#B0C1D3", image: "img/shirt-celeste.webp" },
    ],
    stock: { Bianco: { PP: 4, P: 8, M: 10, G: 6, GG: 2 }, Celeste: { PP: 0, P: 5, M: 7, G: 4, GG: 1 } },
    cost: 11800,
    sku: "PF-SH-01",
    description: "The house shirt in washed 100% linen: a soft point collar, a clean front placket, single-button cuffs and a gently curved hem.",
    details: ["Point collar", "Woven PORTOFINO label", "Single-button cuffs", "Curved shirttail hem"],
    fit: "Regular fit. True to size.",
    gallery: [
      { src: "img/product-shirt.webp", alt: "Portofino Shirt in Bianco, front", kind: "studio" },
    ],
  },
  {
    id: "p-blouse",
    slug: "liguria-blouse",
    name: "Liguria Blouse",
    category: "blouses",
    price: 34200,
    compareAt: 38000,
    isNew: true,
    published: true,
    colors: [
      { name: "Bianco", hex: "#FFFFFF", image: "img/product-blouse.webp" },
      { name: "Celeste", hex: "#B9C7D9", image: null },
    ],
    stock: { Bianco: { PP: 3, P: 6, M: 8, G: 5, GG: 2 }, Celeste: { PP: 2, P: 4, M: 0, G: 3, GG: 1 } },
    cost: 11200,
    sku: "PF-BL-01",
    description: "A linen bata with a band collar and a short three-button placket, finished with a curved hem that falls just below the hip.",
    details: ["Band collar", "Three-button placket", "Long sleeves with cuffs", "Curved hem"],
    fit: "Relaxed fit. Take your usual size.",
    gallery: [{ src: "img/product-blouse.webp", alt: "Liguria Blouse in Bianco, front", kind: "studio" }],
  },
  {
    id: "p-shorts",
    slug: "santa-margherita-shorts",
    name: "Santa Margherita Shorts",
    category: "shorts",
    price: 34200,
    compareAt: 38000,
    isNew: true,
    published: true,
    colors: [{ name: "Bianco", hex: "#FFFFFF", image: "img/product-shorts.webp" }],
    stock: { Bianco: { PP: 2, P: 5, M: 9, G: 6, GG: 3 } },
    cost: 9800,
    sku: "PF-SO-01",
    description: "Tailored linen bermudas with a flat waistband, belt loops, front pockets and a clean hem above the knee.",
    details: ["Flat waistband with belt loops", "Zip fly with button", "Slant front pockets", "Above-the-knee length"],
    fit: "Regular rise, straight leg.",
    gallery: [{ src: "img/product-shorts.webp", alt: "Santa Margherita Shorts in Bianco, front", kind: "studio" }],
  },
  {
    id: "p-trouser",
    slug: "riviera-trouser",
    name: "Riviera Trouser",
    category: "trousers",
    price: 34200,
    compareAt: 38000,
    isNew: true,
    published: true,
    colors: [{ name: "Bianco", hex: "#FFFFFF", image: "img/product-trouser.webp" }],
    stock: { Bianco: { PP: 1, P: 4, M: 6, G: 5, GG: 0 } },
    cost: 12400,
    sku: "PF-TR-01",
    description: "A tailored linen trouser with an extended waistband tab, belt loops and a long, straight leg.",
    details: ["Extended waistband tab", "Belt loops", "Pressed front crease", "Straight leg"],
    fit: "Regular rise, straight leg. Full length.",
    gallery: [{ src: "img/product-trouser.webp", alt: "Riviera Trouser in Bianco, front", kind: "studio" }],
  },
];

export const SIZE_CHART: Record<CategorySlug, Array<{ label: string; values: number[] }>> = {
  shirts: [{ label: "Chest (½)", values: [54, 57, 60, 63, 66] }, { label: "Length", values: [72, 74, 76, 78, 80] }, { label: "Sleeve", values: [60, 62, 64, 65, 66] }],
  blouses: [{ label: "Chest (½)", values: [53, 56, 59, 62, 65] }, { label: "Length", values: [76, 78, 80, 82, 84] }, { label: "Sleeve", values: [59, 61, 63, 64, 65] }],
  trousers: [{ label: "Waist (½)", values: [38, 40, 42, 44, 46] }, { label: "Hip (½)", values: [50, 52, 54, 56, 58] }, { label: "Inseam", values: [78, 79, 80, 81, 82] }],
  shorts: [{ label: "Waist (½)", values: [38, 40, 42, 44, 46] }, { label: "Hip (½)", values: [50, 52, 54, 56, 58] }, { label: "Inseam", values: [20, 21, 22, 23, 24] }],
};

export function formatBRL(cents: number) {
  return "R$" + (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
}
export function formatBRLFull(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
