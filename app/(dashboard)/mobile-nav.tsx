"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export function MobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg hover:bg-muted/60 flex items-center justify-center"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <div className="w-4 flex flex-col gap-1">
          <span className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${isOpen ? "rotate-45 translate-y-[5.5px]" : ""}`} />
          <span className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${isOpen ? "opacity-0 scale-0" : ""}`} />
          <span className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${isOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`} />
        </div>
      </button>

      {/* Overlay + Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 bg-white/95 backdrop-blur-xl border-b shadow-elevated z-50 animate-slide-down">
            <nav className="p-3 space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
