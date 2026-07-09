import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "Curtains",     href: "/products?category=curtains" },
    { label: "Throw Pillows",href: "/products?category=throw-pillows" },
    { label: "Mosquito Nets",href: "/products?category=mosquito-nets" },
    { label: "Bedding",      href: "/products?category=bedding-accessories" },
    { label: "Home Décor",   href: "/products?category=home-decor-items" },
  ],
  Features: [
    { label: "AI Interior Designer", href: "/designer" },
    { label: "AI Product Customizer",href: "/customizer" },
    { label: "Live Chat",            href: "/messages" },
  ],
  Help: [
    { label: "My Orders",    href: "/orders" },
    { label: "My Account",   href: "/account" },
    { label: "Wishlist",     href: "/wishlist" },
    { label: "Contact Us",   href: "/messages" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl text-white mb-2">Decor Platform</p>
            <p className="text-sm leading-relaxed mb-6">
              Premium home décor for every Kenyan home — from curtains to custom creations.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-gold-500 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} className="text-stone-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-800 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Decor Platform. All rights reserved.</p>
          <p>Nairobi, Kenya 🇰🇪</p>
        </div>
      </div>
    </footer>
  );
}