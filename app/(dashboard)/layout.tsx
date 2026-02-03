import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Haal salon op
  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="font-bold text-xl">
                <span className="text-primary">✂️</span> Clippr
              </Link>
              
              {salon && (
                <nav className="hidden md:flex items-center gap-4 text-sm">
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/agenda" className="text-muted-foreground hover:text-foreground transition">
                    Agenda
                  </Link>
                  <Link href="/dashboard/team" className="text-muted-foreground hover:text-foreground transition">
                    Team
                  </Link>
                  <Link href="/dashboard/services" className="text-muted-foreground hover:text-foreground transition">
                    Behandelingen
                  </Link>
                  <Link href="/dashboard/customers" className="text-muted-foreground hover:text-foreground transition">
                    Klanten
                  </Link>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {salon && (
                <span className="text-sm text-muted-foreground hidden md:block">
                  {salon.name}
                </span>
              )}
              <Link
                href="/api/auth/signout"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Uitloggen
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
