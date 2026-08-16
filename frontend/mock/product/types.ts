// Shared type definitions for mock product data.
// Once wired in, these should be the single source of truth for
// Product/Category shapes across product-card.tsx, product-grid.tsx,
// and the product detail page — replacing their local/loose `any` types.

export interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  priceDelta: number;
  stock: number;
  sku?: string;
}

export interface ProductReview {
  id: string;
  user: { fullName: string };
  rating: number; // 1–5
  comment?: string;
  createdAt: string; // ISO date string
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  material?: string;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  createdAt: string; // ISO date string, used for "newest" sort
}

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "best_selling";

export interface ProductQueryParams {
  search?: string;
  category?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  items: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}