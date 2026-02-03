import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceList } from "./service-list";
import { AddServiceForm } from "./add-service-form";

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({ where: { ownerId: session.user.id } });
  if (!salon) redirect("/onboarding");

  const services = await prisma.service.findMany({
    where: { salonId: salon.id },
    include: {
      category: true,
      staff: { include: { staff: true } },
      _count: { select: { bookings: true } },
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Behandelingen</h1>
        <p className="text-muted-foreground mt-1">Beheer je diensten en prijzen</p>
      </div>

      <AddServiceForm salonId={salon.id} categories={categories} staff={staff} />

      {services.length === 0 ? (
        <div className="bg-white rounded-3xl border p-12 text-center">
          <div className="text-5xl mb-4 opacity-40">✨</div>
          <h3 className="font-bold text-lg mb-1">Nog geen behandelingen</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Voeg je eerste behandeling toe zodat klanten kunnen boeken
          </p>
        </div>
      ) : (
        <ServiceList services={services} salonId={salon.id} />
      )}
    </div>
  );
}
