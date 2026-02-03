import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingWizard } from "./booking-wizard";
import Link from "next/link";

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

  const availableStaff = salon.staff.filter(s => s.services.length > 0);

  const servicesByCategory = salon.services.reduce((acc, service) => {
    const catName = service.category?.name || "Overig";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {} as Record<string, typeof salon.services>);

  return (
    <main className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20">
              {salon.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">{salon.name}</h1>
              {salon.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  📍 {salon.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking Wizard */}
      <div className="max-w-2xl mx-auto px-4 py-8">
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
      <footer className="border-t py-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Powered by <span className="gradient-text font-semibold">✂️ Clippr</span>
        </Link>
      </footer>
    </main>
  );
}
