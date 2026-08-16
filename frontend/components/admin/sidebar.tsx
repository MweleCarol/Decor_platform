"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ShieldCheck,
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
  const router    = useRouter();
  const { user, logout } = useAuthStore();

  async function handleSignOut() {
    await logout().catch(() => {});
    router.push("/login");
  }

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

      {/* Account card + sign out */}
      <div className="px-3 py-3 border-t border-stone-800">
        <div className="bg-stone-800/60 rounded-xl p-3 mb-1">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.fullName?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide bg-gold-500/15 text-gold-400 px-2 py-0.5 rounded-full">
            <ShieldCheck size={11} />
            {user?.role === "ADMIN" ? "Admin" : "Staff"}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-stone-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}