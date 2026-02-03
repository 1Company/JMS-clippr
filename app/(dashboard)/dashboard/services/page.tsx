import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceList } from "./service-list";
import { AddServiceForm } from "./add-service-form";

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!salon) redirect("/onboarding");

  const services = await prisma.service.findMany({
    where: { salonId: salon.id },
    include: {
      category: true,
      staff: {
        include: { staff: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const categories = await prisma.serviceCategory.findMany({
    where: { salonId: salon.id },
    orderBy: { sortOrder: "asc" },
  });

  const staff = await prisma.staff.findMany({
    where: { salonId: salon.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Behandelingen</h1>
        <p className="text-muted-foreground">Beheer je diensten en prijzen</p>
      </div>

      {/* Add Service Form */}
      <AddServiceForm salonId={salon.id} categories={categories} staff={staff} />

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <p className="text-3xl mb-4">✨</p>
          <h3 className="font-semibold mb-2">Nog geen behandelingen</h3>
          <p className="text-muted-foreground text-sm">
            Voeg je eerste behandeling toe zodat klanten kunnen boeken
          </p>
        </div>
      ) : (
        <ServiceList services={services} salonId={salon.id} />
      )}
    </div>
  );
}
