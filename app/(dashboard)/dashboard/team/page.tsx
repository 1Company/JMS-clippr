import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StaffList } from "./staff-list";
import { AddStaffForm } from "./add-staff-form";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!salon) redirect("/onboarding");

  const staff = await prisma.staff.findMany({
    where: { salonId: salon.id },
    include: {
      services: {
        include: { service: true },
      },
      schedule: true,
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
    orderBy: { sortOrder: "asc" },
  });

  const services = await prisma.service.findMany({
    where: { salonId: salon.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Beheer je medewerkers en hun vaardigheden</p>
        </div>
      </div>

      {/* Add Staff Form */}
      <AddStaffForm salonId={salon.id} services={services} />

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <p className="text-3xl mb-4">👥</p>
          <h3 className="font-semibold mb-2">Nog geen medewerkers</h3>
          <p className="text-muted-foreground text-sm">
            Voeg je eerste medewerker toe om te beginnen met boekingen
          </p>
        </div>
      ) : (
        <StaffList staff={staff} services={services} salonId={salon.id} />
      )}
    </div>
  );
}
