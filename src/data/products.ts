// Bloom affiliate product catalog.
// Edit entries here to update the Shop page — no UI changes needed.

export type ProductCategory =
  | "Maternity Wear"
  | "Nursery"
  | "Postpartum Care"
  | "By Trimester";

export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // emoji or image URL — cards render emoji if it looks like one
  price: string; // display price, e.g. "$24.99"
  category: ProductCategory;
  affiliateUrl: string;
  // Optional: recommended trimesters (1, 2, 3). Used for "By Trimester" filter
  // and for week-based recommendations on the Shop page.
  trimesters?: Array<1 | 2 | 3>;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Maternity Wear",
  "Nursery",
  "Postpartum Care",
  "By Trimester",
];

export const products: Product[] = [
  // Maternity Wear
  {
    id: "mw-1",
    name: "Soft Maternity Leggings",
    description: "Over-the-belly stretch leggings for all-day comfort.",
    imageUrl: "🩲",
    price: "$32.00",
    category: "Maternity Wear",
    affiliateUrl: "https://www.amazon.com/s?k=maternity+leggings",
    trimesters: [2, 3],
  },
  {
    id: "mw-2",
    name: "Ruched Maternity Dress",
    description: "Flattering side-ruched dress that grows with your bump.",
    imageUrl: "👗",
    price: "$48.00",
    category: "Maternity Wear",
    affiliateUrl: "https://www.amazon.com/s?k=maternity+dress",
    trimesters: [2, 3],
  },
  {
    id: "mw-3",
    name: "Nursing-Ready Bra",
    description: "Wire-free support with easy nursing clips for later.",
    imageUrl: "🎽",
    price: "$28.00",
    category: "Maternity Wear",
    affiliateUrl: "https://www.amazon.com/s?k=nursing+bra",
    trimesters: [1, 2, 3],
  },

  // Nursery
  {
    id: "nu-1",
    name: "Convertible Crib",
    description: "Grows from crib to toddler bed. Non-toxic finish.",
    imageUrl: "🛏️",
    price: "$249.00",
    category: "Nursery",
    affiliateUrl: "https://www.amazon.com/s?k=convertible+crib",
    trimesters: [2, 3],
  },
  {
    id: "nu-2",
    name: "Ultra-Soft Swaddle Set",
    description: "Bamboo swaddles — breathable and gentle on newborn skin.",
    imageUrl: "🧣",
    price: "$34.00",
    category: "Nursery",
    affiliateUrl: "https://www.amazon.com/s?k=bamboo+swaddle",
    trimesters: [3],
  },
  {
    id: "nu-3",
    name: "White Noise Sound Machine",
    description: "Helps baby sleep with soothing, consistent sound.",
    imageUrl: "🔊",
    price: "$39.00",
    category: "Nursery",
    affiliateUrl: "https://www.amazon.com/s?k=baby+sound+machine",
    trimesters: [3],
  },

  // Postpartum Care
  {
    id: "pp-1",
    name: "Postpartum Recovery Kit",
    description: "Peri bottle, pads, and soothing spray for the first weeks.",
    imageUrl: "🧺",
    price: "$45.00",
    category: "Postpartum Care",
    affiliateUrl: "https://www.amazon.com/s?k=postpartum+recovery+kit",
    trimesters: [3],
  },
  {
    id: "pp-2",
    name: "Nipple Balm",
    description: "Lanolin-free, safe for baby — soothes tender skin.",
    imageUrl: "🧴",
    price: "$14.00",
    category: "Postpartum Care",
    affiliateUrl: "https://www.amazon.com/s?k=nipple+balm",
    trimesters: [3],
  },
  {
    id: "pp-3",
    name: "Belly Support Wrap",
    description: "Gentle compression for postpartum recovery.",
    imageUrl: "🎗️",
    price: "$36.00",
    category: "Postpartum Care",
    affiliateUrl: "https://www.amazon.com/s?k=postpartum+belly+wrap",
    trimesters: [3],
  },

  // Trimester-focused essentials
  {
    id: "tr-1",
    name: "Prenatal Vitamins",
    description: "Folate, DHA, and iron — foundational first-trimester care.",
    imageUrl: "💊",
    price: "$26.00",
    category: "By Trimester",
    affiliateUrl: "https://www.amazon.com/s?k=prenatal+vitamins",
    trimesters: [1, 2, 3],
  },
  {
    id: "tr-2",
    name: "Pregnancy Pillow",
    description: "Full-body U-shape pillow for second/third trimester sleep.",
    imageUrl: "🛌",
    price: "$59.00",
    category: "By Trimester",
    affiliateUrl: "https://www.amazon.com/s?k=pregnancy+pillow",
    trimesters: [2, 3],
  },
  {
    id: "tr-3",
    name: "Stretch Mark Butter",
    description: "Shea + cocoa butter to nourish your growing belly.",
    imageUrl: "🧈",
    price: "$22.00",
    category: "By Trimester",
    affiliateUrl: "https://www.amazon.com/s?k=stretch+mark+cream",
    trimesters: [2, 3],
  },
  {
    id: "tr-4",
    name: "Hospital Bag Checklist Set",
    description: "Everything you need packed and ready for delivery day.",
    imageUrl: "🎒",
    price: "$65.00",
    category: "By Trimester",
    affiliateUrl: "https://www.amazon.com/s?k=hospital+bag+maternity",
    trimesters: [3],
  },
];

export function getRecommendedForWeek(week: number): Product[] {
  const trimester: 1 | 2 | 3 = week <= 12 ? 1 : week <= 27 ? 2 : 3;
  return products.filter((p) => p.trimesters?.includes(trimester));
}
