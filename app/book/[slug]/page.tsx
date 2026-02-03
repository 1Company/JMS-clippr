import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingWizard } from "./booking-wizard";

export default async function BookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const salon = await prisma.salon.findUnique({
    where: { slug: params.slug },
    include: {
      services: {
        where: { isActive: true },
        include: {
          category: true,
          staff: {
            where: { staff: { isActive: true } },
            include: { staff: true },
          },
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      },
      staff: {
        where: { isActive: true },
        include: {
          services: true,
          schedule: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      openingHours: true,
    },
  });

  if (!salon || !salon.isActive) {
    notFound();
  }

  // Filter staff who have at least one service
  const availableStaff = salon.staff.filter(s => s.services.length > 0);

  // Group services by category
  const servicesByCategory = salon.services.reduce((acc, service) => {
    const catName = service.category?.name || "Overig";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {} as Record<string, typeof salon.services>);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {salon.logo ? (
              <img src={salon.logo} alt={salon.name} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {salon.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-bold">{salon.name}</h1>
              {salon.city && (
                <p className="text-sm text-muted-foreground">{salon.city}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking Wizard */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <BookingWizard
          salon={{
            id: salon.id,
            name: salon.name,
            slug: salon.slug,
            timezone: salon.timezone,
            bufferMinutes: salon.bufferMinutes,
          }}
          servicesByCategory={servicesByCategory}
          staff={availableStaff}
          openingHours={salon.openingHours}
        />
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 text-center text-sm text-muted-foreground">
        Powered by <span className="text-primary font-medium">✂️ Clippr</span>
      </footer>
    </main>
  );
}
