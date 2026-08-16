import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export const metadata = { title: "Shop" };

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category, search } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-stone-900">
          {category
            ? category
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "All Products"}
        </h1>
        {search && (
          <p className="text-stone-500 mt-1">
            Search results for{" "}
            <span className="font-medium text-stone-800">"{search}"</span>
          </p>
        )}
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductGrid initialCategory={category} initialSearch={search} />
      </Suspense>
    </div>
  );
}
