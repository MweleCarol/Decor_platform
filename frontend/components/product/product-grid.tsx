"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategories, useProducts } from "@/hooks/use-products";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "best_selling", label: "Best Selling" },
];

interface ProductGridProps {
  initialCategory?: string;
  initialSearch?: string;
}

export function ProductGrid({
  initialCategory,
  initialSearch,
}: ProductGridProps) {
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({
    search,
    category,
    sort,
    page,
    pageSize: 12,
  });

  const products = data?.items ?? [];
  const pagination = data?.pagination;
  return (
    <div className="flex gap-8">
      {/* Sidebar filters — desktop */}
      <aside className={cn("shrink-0 w-56 space-y-6", "hidden lg:block")}>
        <FilterPanel
          categories={categories}
          category={category}
          setCategory={(c) => {
            setCategory(c);
            setPage(1);
          }}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="lg:hidden flex items-center gap-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg px-3 py-2"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <p className="text-sm text-stone-500">
              {pagination?.total ?? 0} products
              {category && (
                <span>
                  {" "}
                  in{" "}
                  <span className="font-medium text-stone-700 capitalize">
                    {category.replace("-", " ")}
                  </span>
                </span>
              )}
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-gold-400/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <p className="text-stone-400 text-sm">No products found</p>
              {category && (
                <button
                  onClick={() => setCategory("")}
                  className="mt-2 text-sm text-gold-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            products.map((p: any) => <ProductCard key={p.id} product={p} />)
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                    p === page
                      ? "bg-gold-500 text-white"
                      : "border border-stone-200 text-stone-600 hover:bg-stone-50",
                  )}
                >
                  {p}
                </button>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-stone-800">Filters</p>
              <button onClick={() => setShowFilters(false)}>
                <X size={18} className="text-stone-500" />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              category={category}
              setCategory={(c) => {
                setCategory(c);
                setPage(1);
                setShowFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  category,
  setCategory,
}: {
  categories: any[];
  category: string;
  setCategory: (c: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory("")}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                !category
                  ? "bg-gold-50 text-gold-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              All Products
            </button>
          </li>
          {categories.map((cat: any) => (
            <li key={cat.id}>
              <button
                onClick={() => setCategory(cat.slug)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  category === cat.slug
                    ? "bg-gold-50 text-gold-700 font-medium"
                    : "text-stone-600 hover:bg-stone-50",
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
