import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
    include: {
      staff: { where: { isActive: true } },
      services: { where: { isActive: true } },
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

  if (!salon) redirect("/onboarding");

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
    include: { service: true, staff: true },
    orderBy: { startTime: "asc" },
    take: 5,
  });

  const stats = [
    { label: "Vandaag", value: todayBookings, icon: "📅", color: "from-violet-500 to-purple-600" },
    { label: "Medewerkers", value: salon.staff.length, icon: "👥", color: "from-blue-500 to-indigo-600" },
    { label: "Behandelingen", value: salon.services.length, icon: "✨", color: "from-emerald-500 to-teal-600" },
    { label: "Openstaand", value: salon._count.bookings, icon: "📋", color: "from-amber-500 to-orange-600" },
  ];

  const setupSteps = [
    { done: salon.staff.length > 0, label: "Voeg medewerkers toe", href: "/dashboard/team", icon: "👥" },
    { done: salon.services.length > 0, label: "Stel behandelingen in", href: "/dashboard/services", icon: "✨" },
  ];
  const setupComplete = setupSteps.every(s => s.done);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welkom terug! 👋
        </h1>
        <p className="text-muted-foreground mt-1">{salon.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden bg-white rounded-2xl border p-5 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Setup Checklist */}
      {!setupComplete && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-6 animate-fade-in">
          <h2 className="font-semibold text-lg mb-1">🚀 Aan de slag</h2>
          <p className="text-sm text-muted-foreground mb-4">Voltooi deze stappen om klanten te laten boeken</p>
          <div className="space-y-3">
            {setupSteps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  step.done ? "bg-white/60" : "bg-white hover:bg-white/80 shadow-sm"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.done
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-violet-300 text-violet-400"
                }`}>
                  {step.done ? "✓" : step.icon}
                </div>
                <span className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>
                  {step.label}
                </span>
                {!step.done && <span className="ml-auto text-violet-500 text-sm">→</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">Komende afspraken</h2>
            <p className="text-sm text-muted-foreground">De eerstvolgende boekingen</p>
          </div>
          <Link
            href="/dashboard/agenda"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-50"
          >
            Bekijk agenda →
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4 opacity-40">📅</div>
            <h3 className="font-semibold text-lg mb-1">Nog geen afspraken</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Deel je booking link zodat klanten kunnen reserveren
            </p>
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-xl text-sm font-mono">
              clippr.nl/book/{salon.slug}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="text-center min-w-[56px] py-1.5 px-2 bg-violet-50 rounded-xl">
                  <p className="text-lg font-bold text-violet-700">
                    {new Date(booking.startTime).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-violet-600/70 font-medium uppercase">
                    {new Date(booking.startTime).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.guestName || "Klant"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {booking.service.name} · {booking.staff.displayName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">€{Number(booking.price).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{booking.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/agenda?action=new", icon: "📅", label: "Nieuwe afspraak", desc: "Handmatig inplannen" },
          { href: "/dashboard/team", icon: "👥", label: "Team beheren", desc: "Medewerkers & roosters" },
          { href: "/dashboard/services", icon: "✨", label: "Behandelingen", desc: "Diensten & prijzen" },
          { href: "/dashboard/settings", icon: "⚙️", label: "Instellingen", desc: "Salon configuratie" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white rounded-2xl border p-5 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-0.5 transition-all duration-300"
          >
            <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform">{action.icon}</span>
            <p className="font-semibold text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
