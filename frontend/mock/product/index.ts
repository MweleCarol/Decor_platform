// mock/products/index.ts
//
// Mimics the shape and behavior of the real product API endpoints
// (search, category filter, sort, pagination) so the hooks/grid can
// swap this out for `api.get(...)` later with no structural changes.

import { PRODUCTS } from "./products.data";
import { CATEGORIES } from "./categories.data";
import {
  Product,
  Category,
  ProductQueryParams,
  PaginatedProducts,
  SortOption,
} from "./types";

export * from "./types";
export { PRODUCTS } from "./products.data";
export { CATEGORIES } from "./categories.data";

interface SaveProductVariantInput {
  color?: string;
  size?: string;
  sku?: string;
  priceDelta: number;
  stock: number;
}

interface SaveProductInput {
  name: string;
  description: string;
  basePrice: number;
  material?: string;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  variants: SaveProductVariantInput[];
  images?: { url: string; altText?: string }[];
}

/** Mirrors POST /api/products */
export async function createMockProduct(input: SaveProductInput): Promise<Product> {
  const category = CATEGORIES.find((c) => c.id === input.categoryId) ?? CATEGORIES[0];
  const id = `prod-${Date.now()}`;

  const product: Product = {
    id,
    slug: slugify(input.name),
    name: input.name,
    description: input.description,
    basePrice: input.basePrice,
    material: input.material || undefined,
    rating: 0,
    reviewCount: 0,
    isBestSeller: input.isBestSeller,
    isFeatured: input.isFeatured,
    category,
    images: input.images ?? [],
    variants: input.variants.map((v, i) => ({
      id: `${id}-v${i + 1}`,
      color: v.color || undefined,
      size: v.size || undefined,
      sku: v.sku || undefined,
      priceDelta: v.priceDelta,
      stock: v.stock,
    })),
    reviews: [],
    createdAt: new Date().toISOString(),
  };

  PRODUCTS.unshift(product);
  return delay(product);
}

/** Mirrors PATCH /api/products/:id */
export async function updateMockProduct(id: string, input: SaveProductInput): Promise<Product> {
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");

  const existing = PRODUCTS[idx];
  const category = CATEGORIES.find((c) => c.id === input.categoryId) ?? existing.category;

  const updated: Product = {
    ...existing,
    name: input.name || existing.name,
    description: input.description || existing.description,
    basePrice: input.basePrice,
    material: input.material || existing.material,
    isFeatured: input.isFeatured,
    isBestSeller: input.isBestSeller,
    category,
    images: input.images ?? existing.images,
    variants: input.variants.map((v, i) => ({
      id: existing.variants[i]?.id ?? `${id}-v${i + 1}`,
      color: v.color || undefined,
      size: v.size || undefined,
      sku: v.sku || undefined,
      priceDelta: v.priceDelta,
      stock: v.stock,
    })),
  };

  PRODUCTS[idx] = updated;
  return delay(updated);
}

/** Mirrors DELETE /api/products/:id */
export async function deleteMockProduct(id: string): Promise<void> {
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx !== -1) PRODUCTS.splice(idx, 1);
  return delay(undefined);
}

// Simulated network latency so loading states are actually visible
// during development, instead of resolving instantly.
const MOCK_DELAY_MS = 400;

function delay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.basePrice - b.basePrice);
    case "price_desc":
      return sorted.sort((a, b) => b.basePrice - a.basePrice);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "best_selling":
      return sorted.sort((a, b) => {
        if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
        return b.reviewCount - a.reviewCount;
      });
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

/**
 * Mirrors GET /api/products?search=&category=&sort=&page=&pageSize=
 */
export async function getMockProducts(
  params: ProductQueryParams = {}
): Promise<PaginatedProducts> {
  const {
    search = "",
    category = "",
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  let results = [...PRODUCTS];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
    );
  }

  if (category) {
    results = results.filter((p) => p.category.slug === category);
  }

  results = sortProducts(results, sort);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return delay({
    items,
    pagination: { page: safePage, pageSize, total, totalPages },
  });
}

/**
 * Mirrors GET /api/products/:slug
 */
export async function getMockProductBySlug(
  slug: string
): Promise<Product | null> {
  const product = PRODUCTS.find((p) => p.slug === slug) ?? null;
  return delay(product);
}

/**
 * Mirrors GET /api/categories
 */
export async function getMockCategories(): Promise<Category[]> {
  return delay(CATEGORIES);
}


function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Mirrors POST /api/categories */
export async function createMockCategory(input: { name: string; imageUrl?: string }) {
  const category = {
    id: `cat-${Date.now()}`,
    slug: slugify(input.name),
    name: input.name.trim(),
    imageUrl: input.imageUrl || undefined,
  };
  CATEGORIES.push(category);
  return delay(category);
}

/**
 * Mirrors DELETE /api/categories/:id
 * Note: mock products keep their own embedded category snapshot rather
 * than a live reference, so deleting a category here won't retroactively
 * change what PRODUCTS shows — fine for testing this page in isolation,
 * but worth knowing it doesn't cascade the way the real backend's
 * "unlinks all products" behavior (per the delete-confirm copy) would.
 */
export async function deleteMockCategory(id: string) {
  const idx = CATEGORIES.findIndex((c) => c.id === id);
  if (idx !== -1) CATEGORIES.splice(idx, 1);
  return delay(undefined);
}