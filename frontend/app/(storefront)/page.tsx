"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Palette, MessageSquare, Star } from "lucide-react";
import { api } from "@/lib/api-client";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { name: "Curtains",          slug: "curtains",             emoji: "🪟" },
  { name: "Throw Pillows",     slug: "throw-pillows",        emoji: "🛋️" },
  { name: "Mosquito Nets",     slug: "mosquito-nets",        emoji: "🪲" },
  { name: "Bedding",           slug: "bedding-accessories",  emoji: "🛏️" },
  { name: "Home Décor",        slug: "home-decor-items",     emoji: "🏠" },
];

const FEATURES = [
  {
    icon: <Sparkles size={22} className="text-gold-500" />,
    title: "AI Interior Designer",
    desc: "Upload a photo of your room and get an AI-generated redesign with product recommendations.",
    href: "/designer",
  },
  {
    icon: <Palette size={22} className="text-gold-500" />,
    title: "Custom Products",
    desc: "Design your own curtains, pillow covers, and more with our AI-powered customizer.",
    href: "/customizer",
  },
  {
    icon: <MessageSquare size={22} className="text-gold-500" />,
    title: "Live Support",
    desc: "Chat directly with our décor experts for personalised advice and quotes.",
    href: "/messages",
  },
];

export default function LandingPage() {
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await api.get("/api/products?pageSize=8&sort=newest");
      return data;
    },
  });

  const { data: bestData, isLoading: bestLoading } = useQuery({
    queryKey: ["products", "best-sellers"],
    queryFn: async () => {
      const { data } = await api.get("/api/products?sort=best_selling&pageSize=4");
      return data;
    },
  });

  const featured   = featuredData?.items  ?? [];
  const bestSellers = bestData?.items     ?? [];

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent z-10" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40">
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Premium Home Décor · Nairobi, Kenya
          </p>
          <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight max-w-2xl mb-6">
            Transform Your
            <span className="text-gold-400"> Home</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-xl leading-relaxed mb-10">
            Handpicked curtains, pillows, bedding and more — or let our AI designer
            reimagine your space entirely.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-gold-500 hover:bg-gold-600 border-gold-500">
                Shop Now <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/designer">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Sparkles size={16} /> Try AI Designer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category strip ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(({ name, slug, emoji }) => (
              <Link
                key={slug}
                href={`/products?category=${slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-100 group-hover:bg-gold-50 transition-colors flex items-center justify-center text-2xl">
                  {emoji}
                </div>
                <p className="text-xs text-stone-600 group-hover:text-gold-600 font-medium text-center transition-colors">
                  {name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-gold-500 font-semibold tracking-widest uppercase mb-1">
                New Arrivals
              </p>
              <h2 className="font-display text-3xl font-bold text-stone-900">
                Fresh Picks
              </h2>
            </div>
            <Link href="/products" className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map((p: any) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── AI Features banner ───────────────────────────────────────────── */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Powered by AI
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold">
              Design Smarter
            </h2>
            <p className="text-stone-400 mt-3 max-w-xl mx-auto">
              Our AI tools help you visualise, customise, and create the perfect home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc, href }) => (
              <Link key={title} href={href}>
                <div className="bg-stone-800 hover:bg-stone-700 rounded-2xl p-6 transition-colors h-full">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
                  <p className="text-gold-400 text-sm font-medium mt-4 flex items-center gap-1">
                    Try it free <ArrowRight size={13} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best sellers ─────────────────────────────────────────────────── */}
      {(bestLoading || bestSellers.length > 0) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs text-gold-500 font-semibold tracking-widest uppercase mb-1">
                  Customer Favourites
                </p>
                <h2 className="font-display text-3xl font-bold text-stone-900 flex items-center gap-2">
                  <Star size={22} className="text-gold-500 fill-gold-400" />
                  Best Sellers
                </h2>
              </div>
              <Link href="/products?sort=best_selling" className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {bestLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : bestSellers.map((p: any) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gold-50 border-t border-gold-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">
            Stay Inspired
          </h2>
          <p className="text-stone-500 mb-8">
            Get décor tips, new arrivals, and exclusive offers delivered to your inbox.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-gold-200 bg-white outline-none focus:ring-2 focus:ring-gold-400/30 text-sm"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>

    </div>
  );
}