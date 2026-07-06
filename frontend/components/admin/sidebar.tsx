"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Sparkles,
  BarChart3,
  Tag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const NAV_ITEMS = [
  { href: "/admin",           label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/orders",    label: "Orders",       icon: ShoppingCart },
  { href: "/admin/products",  label: "Products",     icon: Package },
  { href: "/admin/categories",label: "Categories",   icon: Tag },
  { href: "/admin/users",     label: "Customers",    icon: Users },
  { href: "/admin/chats",     label: "Messages",     icon: MessageSquare },
  { href: "/admin/designs",   label: "AI Designs",   icon: Sparkles },
  { href: "/admin/analytics", label: "Analytics",    icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname  = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-stone-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-800">
        <p className="font-display text-xl text-white tracking-wide">Decor</p>
        <p className="text-xs text-gold-400 font-medium tracking-widest uppercase mt-0.5">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-gold-500 text-white font-medium"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-stone-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
           onClick={() => {
            logout().catch(() => {});
          }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}