"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart, ShoppingCart, User, Search, Store, X,
  Sparkles, Palette, MessageSquare, LogOut, Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/products",    label: "Shop" },
  { href: "/designer",    label: "AI Designer" },
  { href: "/customizer",  label: "Customizer" },
];

const PILL_ITEMS = [
  { href: "/designer",   label: "Designer",  icon: Sparkles },
  { href: "/customizer", label: "Customize", icon: Palette },
  { href: "/messages",   label: "Chat",      icon: MessageSquare },
] as const;

const iconBtn =
  "relative p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 " +
  "transition-colors motion-reduce:transition-none focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2";

export function Navbar() {
  const pathname                  = usePathname();
  const router                    = useRouter();
  const [userOpen, setUserOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]         = useState("");
  const { user, logout }          = useAuthStore();
  const { toggleCart, itemCount } = useCartStore();
  const userMenuRef               = useRef<HTMLDivElement>(null);
  const searchRef                 = useRef<HTMLDivElement>(null);
  const searchInputRef            = useRef<HTMLInputElement>(null);
  const searchToggleRef           = useRef<HTMLButtonElement>(null);

  const count = itemCount();

  // Close user dropdown on outside click / Escape
  useEffect(() => {
    if (!userOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  // Search bar: autofocus on open, close on outside click / Escape
  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();

    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    searchToggleRef.current?.focus();
  }

  function submitSearch() {
    const q = query.trim();
    setSearchOpen(false);
    setQuery("");
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* Logo — hidden on mobile while search is open, to give the input full width */}
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
                searchOpen && "hidden md:flex"
              )}
            >
              <span className="font-display text-xl text-stone-900">Decor</span>
              <span className="text-xs text-gold-500 font-semibold tracking-widest uppercase">
                Platform
              </span>
            </Link>

            {/* Desktop nav — stays visible even while searching, there's room */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname.startsWith(href) ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors motion-reduce:transition-none rounded-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
                    pathname.startsWith(href)
                      ? "text-gold-600"
                      : "text-stone-600 hover:text-stone-900"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-1 md:flex-initial justify-end min-w-0">
              {searchOpen ? (
                <div
                  ref={searchRef}
                  className={cn(
                    "flex items-center gap-2 w-full md:w-64",
                    "animate-in fade-in slide-in-from-top-1 md:slide-in-from-right-2 duration-200",
                    "motion-reduce:animate-none"
                  )}
                >
                  <div className="relative flex-1 min-w-0">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                      placeholder="Search products…"
                      aria-label="Search products"
                      className={cn(
                        "w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-stone-200 bg-stone-50 text-stone-900",
                        "placeholder:text-stone-400 outline-none transition-shadow shadow-card",
                        "focus:ring-2 focus:ring-gold-400/40 focus:border-gold-400 focus:bg-white"
                      )}
                    />
                  </div>
                  <button onClick={closeSearch} aria-label="Close search" className={iconBtn}>
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Shop / Home — mobile only, desktop already has it as a text link */}
                  <Link href="/products" aria-label="Shop" className={cn(iconBtn, "md:hidden")}>
                    <Store size={18} />
                  </Link>

                  <button ref={searchToggleRef} onClick={openSearch} aria-label="Search products" className={iconBtn}>
                    <Search size={18} />
                  </button>

                  <Link href="/wishlist" aria-label="Wishlist" className={iconBtn}>
                    <Heart size={18} />
                  </Link>

                  {/* Cart — desktop icon only; mobile uses the bottom pill */}
                  <button
                    onClick={toggleCart}
                    aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
                    className={cn(iconBtn, "hidden md:inline-flex")}
                  >
                    <ShoppingCart size={18} />
                    {count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </button>

                  {/* Messages — desktop icon only; mobile uses the bottom pill */}
                  <Link href="/messages" aria-label="Messages" className={cn(iconBtn, "hidden md:inline-flex")}>
                    <MessageSquare size={18} />
                  </Link>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserOpen((o) => !o)}
                      aria-label={user ? "Account menu" : "Sign in"}
                      aria-expanded={userOpen}
                      className={iconBtn}
                    >
                      {user ? (
                        <div className="w-6 h-6 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center">
                          {user.fullName.charAt(0)}
                        </div>
                      ) : (
                        <User size={18} />
                      )}
                    </button>

                    <div
                      className={cn(
                        "absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-stone-200 shadow-modal overflow-hidden origin-top-right",
                        "transition-[opacity,transform] duration-150 motion-reduce:transition-none",
                        userOpen
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      )}
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-stone-100">
                            <p className="text-sm font-medium text-stone-800 truncate">{user.fullName}</p>
                            <p className="text-xs text-stone-400 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            {user.role === "ADMIN" && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                                onClick={() => setUserOpen(false)}
                              >
                                <Settings size={14} /> Admin Panel
                              </Link>
                            )}
                            <Link
                              href="/account"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                              onClick={() => setUserOpen(false)}
                            >
                              <User size={14} /> My Account
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                              onClick={() => setUserOpen(false)}
                            >
                              <ShoppingCart size={14} /> My Orders
                            </Link>
                            <button
                              onClick={() => { logout(); setUserOpen(false); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                              <LogOut size={14} /> Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-1">
                          <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                            onClick={() => setUserOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/register"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gold-600 font-medium hover:bg-gold-50"
                            onClick={() => setUserOpen(false)}
                          >
                            Create Account
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile floating pill nav */}
      <nav
        aria-label="Primary"
        className={cn(
          "md:hidden fixed left-1/2 -translate-x-1/2 z-50",
          "bottom-[calc(12px+env(safe-area-inset-bottom))]",
          "w-[calc(100%-24px)] max-w-sm flex items-stretch gap-1 p-1.5",
          "rounded-2xl border border-white/10 bg-stone-900/85 shadow-modal",
          "[backdrop-filter:blur(16px)_saturate(160%)]",
          "[-webkit-backdrop-filter:blur(16px)_saturate(160%)]"
        )}
      >
        {PILL_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl",
                "transition-colors motion-reduce:transition-none active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
                active ? "bg-white/10 text-gold-400" : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}

        <Link
          href="/cart"
          aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          aria-current={pathname.startsWith("/cart") ? "page" : undefined}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl",
            "transition-colors motion-reduce:transition-none active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400",
            pathname.startsWith("/cart") ? "bg-white/10 text-gold-400" : "text-white/70 hover:text-white hover:bg-white/5"
          )}
        >
          <ShoppingCart size={20} />
          {count > 0 && (
            <span className="absolute top-1 right-[22%] w-4 h-4 bg-gold-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
          <span className="text-[10px] font-semibold leading-none">Cart</span>
        </Link>
      </nav>
    </>
  );
}