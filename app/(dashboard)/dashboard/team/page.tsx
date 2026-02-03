import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StaffList } from "./staff-list";
import { AddStaffForm } from "./add-staff-form";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({ where: { ownerId: session.user.id } });
  if (!salon) redirect("/onboarding");

  const staff = await prisma.staff.findMany({
    where: { salonId: salon.id },
    include: {
      services: { include: { service: true } },
      schedule: true,
      vacations: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" } },
      sickLeaves: { where: { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }, orderBy: { startDate: "desc" }, take: 1 },
      _count: { select: { bookings: { where: { startTime: { gte: new Date() }, status: "CONFIRMED" } } } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const services = await prisma.service.findMany({
    where: { salonId: salon.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer je medewerkers en hun vaardigheden</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">{staff.length} medewerker{staff.length !== 1 ? "s" : ""}</p>
      </div>

      <AddStaffForm salonId={salon.id} services={services} />

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-border/40 p-10 sm:p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Nog geen medewerkers</h3>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
            Voeg je eerste medewerker toe om te beginnen met boekingen
          </p>
        </div>
      ) : (
        <StaffList staff={staff} services={services} salonId={salon.id} />
      )}
    </div>
  );
}
