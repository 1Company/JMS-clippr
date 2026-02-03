import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "📅" },
  { href: "/dashboard/team", label: "Team", icon: "👥" },
  { href: "/dashboard/services", label: "Behandelingen", icon: "✨" },
  { href: "/dashboard/customers", label: "Klanten", icon: "💜" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="font-bold text-xl tracking-tight">
                <span className="gradient-text">✂️ Clippr</span>
              </Link>
              
              {salon && (
                <nav className="hidden lg:flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {salon && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {salon.name.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium leading-none">{salon.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{session.user.email}</p>
                  </div>
                </div>
              )}
              <Link
                href="/api/auth/signout"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                Uitloggen
              </Link>
              
              {/* Mobile menu */}
              <MobileNav items={navItems} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
