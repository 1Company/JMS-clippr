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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Behandelingen</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer je diensten en prijzen</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">{services.length} behandeling{services.length !== 1 ? "en" : ""}</p>
      </div>

      <AddServiceForm salonId={salon.id} categories={categories} staff={staff} />

      {services.length === 0 ? (
        <div className="bg-white rounded-xl border border-border/40 p-10 sm:p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Nog geen behandelingen</h3>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
            Voeg je eerste behandeling toe zodat klanten kunnen boeken
          </p>
        </div>
      ) : (
        <ServiceList services={services} salonId={salon.id} />
      )}
    </div>
  );
}
