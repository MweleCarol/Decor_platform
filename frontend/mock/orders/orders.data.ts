import { PRODUCTS } from "@/mock/product";
import type { AdminOrder } from "@/hooks/use-admin";

function bySlug(slug: string) {
  const p = PRODUCTS.find((p) => p.slug === slug);
  if (!p)
    throw new Error(`Mock order references unknown product slug: ${slug}`);
  return p;
}

interface OrderSeed {
  customer: { fullName: string; email: string } | null; // null = guest checkout
  guestName?: string;
  guestEmail?: string;
  items: { slug: string; qty: number; variantIndex?: number }[];
  status: AdminOrder["status"];
  daysAgo: number;
}

const SEEDS: OrderSeed[] = [
  {
    customer: { fullName: "Carolyne Mwikali", email: "customer@decor.test" },
    items: [
      { slug: "belgian-linen-blackout-curtains", qty: 2, variantIndex: 0 },
    ],
    status: "DELIVERED",
    daysAgo: 34,
  },
  {
    customer: { fullName: "Faith Njeri", email: "faith.njeri@example.com" },
    items: [
      { slug: "egyptian-cotton-duvet-set", qty: 1, variantIndex: 1 },
      { slug: "waffle-weave-throw-blanket", qty: 1 },
    ],
    status: "DELIVERED",
    daysAgo: 30,
  },
  {
    customer: null,
    guestName: "Brian Otieno",
    guestEmail: "brian.o@example.com",
    items: [{ slug: "boucle-textured-cushion-cover", qty: 3, variantIndex: 0 }],
    status: "SHIPPED",
    daysAgo: 21,
  },
  {
    customer: { fullName: "Diana Achieng", email: "diana.a@example.com" },
    items: [{ slug: "jute-wool-blend-area-rug", qty: 1, variantIndex: 0 }],
    status: "SHIPPED",
    daysAgo: 19,
  },
  {
    customer: null,
    guestName: "Kevin Mwangi",
    guestEmail: "kevin.mwangi@example.com",
    items: [{ slug: "velvet-pinch-pleat-curtains", qty: 1, variantIndex: 2 }],
    status: "PROCESSING",
    daysAgo: 14,
  },
  {
    customer: { fullName: "Grace Wambui", email: "grace.w@example.com" },
    items: [
      { slug: "rattan-pendant-light-shade", qty: 2 },
      { slug: "ceramic-table-lamp-terracotta-glaze", qty: 1 },
    ],
    status: "PROCESSING",
    daysAgo: 13,
  },
  {
    customer: { fullName: "Samuel Kiprop", email: "samuel.k@example.com" },
    items: [{ slug: "kikoy-print-floor-cushion", qty: 2 }],
    status: "PROCESSING",
    daysAgo: 11,
  },
  {
    customer: null,
    guestName: "Halima Yusuf",
    guestEmail: "halima.y@example.com",
    items: [{ slug: "moroccan-shag-rug", qty: 1, variantIndex: 1 }],
    status: "PAID",
    daysAgo: 9,
  },
  {
    customer: { fullName: "Otieno Ochieng", email: "otieno.o@example.com" },
    items: [{ slug: "linen-fitted-bedsheet-set", qty: 1, variantIndex: 0 }],
    status: "PAID",
    daysAgo: 8,
  },
  {
    customer: { fullName: "Anne Mbeki", email: "anne.mbeki@example.com" },
    items: [
      { slug: "abstract-canvas-wall-art-set", qty: 1 },
      { slug: "african-print-framed-wall-art", qty: 1 },
    ],
    status: "PAID",
    daysAgo: 7,
  },
  {
    customer: null,
    guestName: "Daniel Kimani",
    guestEmail: "daniel.k@example.com",
    items: [{ slug: "sheer-voile-curtain-panel", qty: 4, variantIndex: 1 }],
    status: "PAID",
    daysAgo: 6,
  },
  {
    customer: { fullName: "Sarah Mumbi", email: "sarah.mumbi@example.com" },
    items: [{ slug: "velvet-lumbar-pillow", qty: 2, variantIndex: 0 }],
    status: "PENDING",
    daysAgo: 5,
  },
  {
    customer: { fullName: "Peter Mutua", email: "peter.mutua@example.com" },
    items: [{ slug: "sisal-natural-fiber-runner", qty: 1 }],
    status: "PENDING",
    daysAgo: 4,
  },
  {
    customer: null,
    guestName: "Njoki Kamau",
    guestEmail: "njoki.k@example.com",
    items: [{ slug: "jute-wool-blend-area-rug", qty: 1, variantIndex: 1 }],
    status: "PENDING",
    daysAgo: 3,
  },
  {
    customer: { fullName: "Mercy Chebet", email: "mercy.chebet@example.com" },
    items: [{ slug: "boucle-textured-cushion-cover", qty: 4, variantIndex: 2 }],
    status: "PENDING",
    daysAgo: 2,
  },
  {
    customer: { fullName: "James Karanja", email: "james.k@example.com" },
    items: [{ slug: "egyptian-cotton-duvet-set", qty: 1, variantIndex: 0 }],
    status: "PENDING",
    daysAgo: 1,
  },
  {
    customer: null,
    guestName: "Lucy Adhiambo",
    guestEmail: "lucy.a@example.com",
    items: [{ slug: "velvet-pinch-pleat-curtains", qty: 1, variantIndex: 0 }],
    status: "PENDING",
    daysAgo: 0,
  },
  {
    customer: { fullName: "Victor Njuguna", email: "victor.n@example.com" },
    items: [{ slug: "abstract-canvas-wall-art-set", qty: 1 }],
    status: "CANCELLED",
    daysAgo: 16,
  },
  {
    customer: { fullName: "Esther Wairimu", email: "esther.w@example.com" },
    items: [{ slug: "african-print-framed-wall-art", qty: 1 }],
    status: "CANCELLED",
    daysAgo: 10,
  },
  {
    customer: { fullName: "Collins Barasa", email: "collins.b@example.com" },
    items: [{ slug: "rattan-pendant-light-shade", qty: 1 }],
    status: "DELIVERED",
    daysAgo: 40,
  },
  {
    customer: null,
    guestName: "Naomi Achieng",
    guestEmail: "naomi.a@example.com",
    items: [{ slug: "ceramic-table-lamp-terracotta-glaze", qty: 2 }],
    status: "DELIVERED",
    daysAgo: 45,
  },
  {
    customer: { fullName: "Tom Kiplagat", email: "tom.k@example.com" },
    items: [
      { slug: "waffle-weave-throw-blanket", qty: 2 },
      { slug: "kikoy-print-floor-cushion", qty: 1 },
    ],
    status: "SHIPPED",
    daysAgo: 24,
  },
  {
    customer: { fullName: "Amina Wanjiru", email: "amina.w@example.com" },
    items: [
      { slug: "belgian-linen-blackout-curtains", qty: 1, variantIndex: 1 },
    ],
    status: "PROCESSING",
    daysAgo: 12,
  },
  {
    customer: null,
    guestName: "Faith Njeri",
    guestEmail: "faith.njeri2@example.com",
    items: [{ slug: "moroccan-shag-rug", qty: 1, variantIndex: 0 }],
    status: "PAID",
    daysAgo: 5,
  },
];

function buildOrder(seed: OrderSeed, index: number): AdminOrder {
  const items = seed.items.map(({ slug, qty, variantIndex }) => {
    const product = bySlug(slug);
    const variant =
      variantIndex !== undefined ? product.variants[variantIndex] : undefined;
    const unitPrice = product.basePrice + (variant?.priceDelta ?? 0);
    return {
      productId: product.id,
      quantity: qty,
      unitPrice,
      product: { name: product.name },
      variant: variant
        ? { color: variant.color, size: variant.size }
        : undefined,
    };
  });

  const totalAmount = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const createdAt = new Date(
    Date.now() - seed.daysAgo * 86_400_000,
  ).toISOString();

  return {
    id: `order-${String(index + 1).padStart(4, "0")}-${Math.random().toString(36).slice(2, 8)}`,
    status: seed.status,
    totalAmount,
    createdAt,
    user: seed.customer ?? undefined,
    guestName: seed.guestName,
    guestEmail: seed.guestEmail,
    items,
  };
}

export const ORDERS: AdminOrder[] = SEEDS.map(buildOrder);
