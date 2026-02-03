import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "./sidebar-nav";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "📅" },
  { href: "/dashboard/team", label: "Team", icon: "👥" },
  { href: "/dashboard/services", label: "Behandelingen", icon: "✨" },
  { href: "/dashboard/customers", label: "Klanten", icon: "🤝" },
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar (client component for mobile toggle) */}
      <SidebarNav
        items={navItems}
        salonName={salon?.name || "Mijn Salon"}
        salonSlug={salon?.slug || ""}
        userEmail={session.user.email || ""}
      />

      {/* Main content - offset by sidebar on desktop */}
      <main className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border/40 bg-white/80 backdrop-blur-xl">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          {/* Mobile menu button is rendered inside SidebarNav */}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
