import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AgendaView } from "./agenda-view";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays } from "date-fns";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!salon) redirect("/onboarding");

  // Parse date from query or use today
  const currentDate = searchParams.date 
    ? new Date(searchParams.date) 
    : new Date();
  
  const view = searchParams.view || "day";

  // Calculate date range based on view
  let startDate: Date;
  let endDate: Date;

  if (view === "week") {
    startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  } else {
    startDate = startOfDay(currentDate);
    endDate = endOfDay(currentDate);
  }

  // Fetch staff
  const staff = await prisma.staff.findMany({
    where: { salonId: salon.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch bookings for the date range
  const bookings = await prisma.booking.findMany({
    where: {
      salonId: salon.id,
      startTime: { gte: startDate },
      endTime: { lte: addDays(endDate, 1) },
    },
    include: {
      service: true,
      staff: true,
      customer: true,
    },
    orderBy: { startTime: "asc" },
  });

  // Fetch opening hours
  const openingHours = await prisma.openingHours.findMany({
    where: { salonId: salon.id },
  });

  // Fetch services for new booking modal
  const services = await prisma.service.findMany({
    where: { salonId: salon.id, isActive: true },
    include: {
      staff: { include: { staff: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <AgendaView
        salonId={salon.id}
        currentDate={currentDate.toISOString()}
        view={view}
        staff={staff}
        bookings={bookings.map(b => ({
          ...b,
          startTime: b.startTime.toISOString(),
          endTime: b.endTime.toISOString(),
          price: Number(b.price),
        }))}
        openingHours={openingHours}
        services={services.map(s => ({
          ...s,
          price: Number(s.price),
        }))}
      />
    </div>
  );
}
