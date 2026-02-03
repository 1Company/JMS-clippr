"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export function SidebarNav({
  items,
  salonName,
  salonSlug,
  userEmail,
}: {
  items: NavItem[];
  salonName: string;
  salonSlug: string;
  userEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border/30 shrink-0">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
          <span className="gradient-text">✂️ Clippr</span>
        </Link>
      </div>

      {/* Salon info */}
      <div className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-violet-500/20 shrink-0">
            {salonName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{salonName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border/30 shrink-0 space-y-1">
        {salonSlug && (
          <Link
            href={`/book/${salonSlug}`}
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <span>🔗</span>
            <span className="truncate">Boekingspagina</span>
            <svg className="w-3 h-3 ml-auto shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        )}
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Uitloggen
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - fixed */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-white border-r border-border/40 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger button (portal into the top bar) */}
      <div className="lg:hidden fixed top-0 right-0 z-40 h-14 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg hover:bg-muted/60 flex items-center justify-center"
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          <div className="w-4 flex flex-col gap-1">
            <span
              className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${
                mobileOpen ? "rotate-45 translate-y-[5.5px]" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${
                mobileOpen ? "opacity-0 scale-0" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ${
                mobileOpen ? "-rotate-45 -translate-y-[5.5px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Sidebar - slide in from left */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-border/40 z-50 flex flex-col animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
