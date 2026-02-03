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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground mt-1">Beheer je medewerkers en hun vaardigheden</p>
      </div>

      <AddStaffForm salonId={salon.id} services={services} />

      {staff.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center">
          <div className="text-5xl mb-4 opacity-40">👥</div>
          <h3 className="font-bold text-lg mb-1">Nog geen medewerkers</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Voeg je eerste medewerker toe om te beginnen met boekingen
          </p>
        </div>
      ) : (
        <StaffList staff={staff} services={services} salonId={salon.id} />
      )}
    </div>
  );
}
