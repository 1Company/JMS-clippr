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
    { label: "Vandaag", value: todayBookings, icon: "📅", gradient: "from-violet-500 to-purple-600" },
    { label: "Medewerkers", value: salon.staff.length, icon: "👥", gradient: "from-blue-500 to-indigo-600" },
    { label: "Behandelingen", value: salon.services.length, icon: "✨", gradient: "from-emerald-500 to-teal-600" },
    { label: "Openstaand", value: salon._count.bookings, icon: "📋", gradient: "from-amber-500 to-orange-600" },
  ];

  const setupSteps = [
    { done: salon.staff.length > 0, label: "Voeg medewerkers toe", href: "/dashboard/team", icon: "👥", desc: "Maak profielen voor je team" },
    { done: salon.services.length > 0, label: "Stel behandelingen in", href: "/dashboard/services", icon: "✨", desc: "Diensten, prijzen en duur" },
  ];
  const setupComplete = setupSteps.every(s => s.done);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welkom terug 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{salon.name}</p>
        </div>
        {setupComplete && salon.slug && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Booking link:</span>
            <code className="bg-muted/80 px-2.5 py-1 rounded-lg font-mono text-violet-700">clippr.nl/book/{salon.slug}</code>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative bg-white rounded-xl border border-border/40 p-4 sm:p-5 hover:shadow-medium hover:border-border/60 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl sm:text-2xl">{stat.icon}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Setup Checklist */}
      {!setupComplete && (
        <div className="bg-white rounded-xl border border-violet-200/60 p-5 sm:p-6 animate-fade-in-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-sm shrink-0 shadow-sm shadow-violet-500/20">
              🚀
            </div>
            <div>
              <h2 className="font-semibold">Aan de slag</h2>
              <p className="text-sm text-muted-foreground">Voltooi deze stappen om klanten te laten boeken</p>
            </div>
          </div>
          <div className="space-y-2">
            {setupSteps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all group ${
                  step.done 
                    ? "bg-muted/30" 
                    : "bg-violet-50/50 hover:bg-violet-50 border border-violet-100/60 hover:border-violet-200/80"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step.done
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-violet-100 text-violet-600"
                }`}>
                  {step.done ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  ) : step.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`text-sm font-medium block ${step.done ? "line-through text-muted-foreground" : ""}`}>
                    {step.label}
                  </span>
                  {!step.done && (
                    <span className="text-xs text-muted-foreground">{step.desc}</span>
                  )}
                </div>
                {!step.done && (
                  <svg className="w-4 h-4 text-violet-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-border/40">
          <div>
            <h2 className="font-semibold">Komende afspraken</h2>
            <p className="text-xs text-muted-foreground mt-0.5">De eerstvolgende boekingen</p>
          </div>
          <Link
            href="/dashboard/agenda"
            className="text-xs font-medium text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors flex items-center gap-1"
          >
            Agenda
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="p-10 sm:p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Nog geen afspraken</h3>
            <p className="text-muted-foreground text-sm mb-5 max-w-[260px] mx-auto">
              Deel je booking link zodat klanten kunnen reserveren
            </p>
            <code className="bg-muted/60 px-4 py-2 rounded-xl text-sm font-mono text-violet-700 border border-border/40">
              clippr.nl/book/{salon.slug}
            </code>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 hover:bg-muted/20 transition-colors">
                <div className="text-center min-w-[52px] py-1.5 px-2 bg-violet-50/80 rounded-xl border border-violet-100/50">
                  <p className="text-base font-bold text-violet-700 tabular-nums">
                    {new Date(booking.startTime).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-violet-600/70 font-medium uppercase tracking-wide">
                    {new Date(booking.startTime).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{booking.guestName || "Klant"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.service.name} · {booking.staff.displayName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm tabular-nums">€{Number(booking.price).toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{booking.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { href: "/dashboard/agenda?action=new", icon: "📅", label: "Nieuwe afspraak", desc: "Handmatig inplannen" },
          { href: "/dashboard/team", icon: "👥", label: "Team beheren", desc: "Medewerkers & roosters" },
          { href: "/dashboard/services", icon: "✨", label: "Behandelingen", desc: "Diensten & prijzen" },
          { href: `/book/${salon.slug}`, icon: "🔗", label: "Boekingspagina", desc: "Bekijk als klant" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white rounded-xl border border-border/40 p-4 sm:p-5 hover:shadow-medium hover:border-border/60 hover:-translate-y-px transition-all duration-200"
          >
            <span className="text-xl block mb-2.5 group-hover:scale-110 transition-transform origin-bottom-left">{action.icon}</span>
            <p className="font-medium text-sm">{action.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
