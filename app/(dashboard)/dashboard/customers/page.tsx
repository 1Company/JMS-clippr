import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerList } from "./customer-list";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const salon = await prisma.salon.findFirst({ where: { ownerId: session.user.id } });
  if (!salon) redirect("/onboarding");

  const customers = await prisma.customer.findMany({
    where: { salonId: salon.id },
    include: {
      bookings: {
        orderBy: { startTime: "desc" },
        take: 1,
        select: { startTime: true, service: { select: { name: true } } },
      },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Klanten</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overzicht van al je klanten</p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">{customers.length} klant{customers.length !== 1 ? "en" : ""}</p>
      </div>

      {customers.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Nog geen klanten</h3>
          <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
            Klanten worden automatisch aangemaakt wanneer ze een afspraak boeken
          </p>
        </Card>
      ) : (
        <CustomerList customers={customers} />
      )}
    </div>
  );
}
