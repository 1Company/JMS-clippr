import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingWizard } from "./booking-wizard";
import Link from "next/link";

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const salon = await prisma.salon.findUnique({
    where: { slug: params.slug },
    include: {
      openingHours: true,
      staff: {
        where: { isActive: true },
        include: {
          services: true,
          schedule: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      services: {
        where: { isActive: true },
        include: {
          category: true,
          staff: { include: { staff: true } },
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      },
    },
  });

  if (!salon) notFound();

  // Group services by category
  const servicesByCategory = salon.services.reduce((acc, service) => {
    const catName = service.category?.name || "Overig";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {} as Record<string, typeof salon.services>);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute inset-0 gradient-subtle" />

      <div className="relative max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{salon.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Boek je afspraak online</p>
        </div>

        {/* Wizard */}
        <BookingWizard
          salon={salon}
          servicesByCategory={servicesByCategory}
          staff={salon.staff}
          openingHours={salon.openingHours}
        />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] text-muted-foreground">
            Mogelijk gemaakt door{" "}
            <Link href="/" className="text-teal-600 font-medium hover:text-teal-700 underline underline-offset-2 decoration-teal-200">
              Clippr
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
