"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart, ShoppingCart, User, Search, Menu, X,
  Sparkles, MessageSquare, LogOut, Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/products",    label: "Shop" },
  { href: "/designer",    label: "AI Designer" },
  { href: "/customizer",  label: "Customizer" },
];

export function Navbar() {
  const pathname                = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, logout }        = useAuthStore();
  const { toggleCart, itemCount } = useCartStore();

  const count = itemCount();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl text-stone-900">Decor</span>
            <span className="text-xs text-gold-500 font-semibold tracking-widest uppercase">
              Platform
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors",
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
          <div className="flex items-center gap-1">
            <Link
              href="/products"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/wishlist"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* AI Chat */}
            <Link
              href="/messages"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <MessageSquare size={18} />
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserOpen((o) => !o)}
                className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                {user ? (
                  <div className="w-6 h-6 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center">
                    {user.fullName.charAt(0)}
                  </div>
                ) : (
                  <User size={18} />
                )}
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
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
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}