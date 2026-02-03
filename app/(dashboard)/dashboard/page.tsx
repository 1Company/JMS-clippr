import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Haal salon op
  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
    include: {
      staff: true,
      services: true,
      _count: {
        select: {
          bookings: {
            where: {
              startTime: { gte: new Date() },
              status: "CONFIRMED",
            },
          },
        },
      },
    },
  });

  // Geen salon? → Onboarding
  if (!salon) {
    redirect("/onboarding");
  }

  // Stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayBookings = await prisma.booking.count({
    where: {
      salonId: salon.id,
      startTime: { gte: todayStart, lte: todayEnd },
      status: "CONFIRMED",
    },
  });

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      salonId: salon.id,
      startTime: { gte: new Date() },
      status: "CONFIRMED",
    },
    include: {
      service: true,
      staff: true,
    },
    orderBy: { startTime: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welkom terug! 👋</h1>
        <p className="text-muted-foreground">{salon.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Vandaag</p>
          <p className="text-2xl font-bold">{todayBookings}</p>
          <p className="text-xs text-muted-foreground">afspraken</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Medewerkers</p>
          <p className="text-2xl font-bold">{salon.staff.length}</p>
          <p className="text-xs text-muted-foreground">actief</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Behandelingen</p>
          <p className="text-2xl font-bold">{salon.services.length}</p>
          <p className="text-xs text-muted-foreground">beschikbaar</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Openstaand</p>
          <p className="text-2xl font-bold">{salon._count.bookings}</p>
          <p className="text-xs text-muted-foreground">afspraken</p>
        </div>
      </div>

      {/* Setup Checklist (als niet alles is ingesteld) */}
      {(salon.staff.length === 0 || salon.services.length === 0) && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h2 className="font-semibold mb-3">🚀 Aan de slag</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${salon.staff.length > 0 ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {salon.staff.length > 0 && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <Link href="/dashboard/team" className="text-sm hover:underline">
                Voeg medewerkers toe
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${salon.services.length > 0 ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {salon.services.length > 0 && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <Link href="/dashboard/services" className="text-sm hover:underline">
                Stel behandelingen in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Komende afspraken</h2>
          <Link href="/dashboard/agenda" className="text-sm text-primary hover:underline">
            Bekijk agenda →
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nog geen afspraken</p>
            <p className="text-sm mt-1">
              Deel je booking link: <code className="bg-muted px-2 py-0.5 rounded">clippr.nl/{salon.slug}</code>
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-4 flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-bold">
                    {new Date(booking.startTime).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.startTime).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{booking.guestName || "Klant"}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service.name} • {booking.staff.displayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{Number(booking.price).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{booking.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/agenda?action=new" className="bg-card rounded-lg border p-4 hover:border-primary transition text-center">
          <span className="text-2xl">📅</span>
          <p className="text-sm font-medium mt-2">Nieuwe afspraak</p>
        </Link>
        <Link href="/dashboard/team" className="bg-card rounded-lg border p-4 hover:border-primary transition text-center">
          <span className="text-2xl">👥</span>
          <p className="text-sm font-medium mt-2">Team beheren</p>
        </Link>
        <Link href="/dashboard/services" className="bg-card rounded-lg border p-4 hover:border-primary transition text-center">
          <span className="text-2xl">✨</span>
          <p className="text-sm font-medium mt-2">Behandelingen</p>
        </Link>
        <Link href="/dashboard/settings" className="bg-card rounded-lg border p-4 hover:border-primary transition text-center">
          <span className="text-2xl">⚙️</span>
          <p className="text-sm font-medium mt-2">Instellingen</p>
        </Link>
      </div>
    </div>
  );
}
