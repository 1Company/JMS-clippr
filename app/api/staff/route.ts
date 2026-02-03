import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { salonId, displayName, phone, color, serviceIds, schedule } = body;

    // Verify salon ownership
    const salon = await prisma.salon.findFirst({
      where: { id: salonId, ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get max sortOrder
    const maxSort = await prisma.staff.aggregate({
      where: { salonId },
      _max: { sortOrder: true },
    });

    // Create staff member with schedule
    const staff = await prisma.staff.create({
      data: {
        salonId,
        displayName,
        phone,
        color,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        // Create schedule entries
        schedule: {
          create: schedule
            .filter((s: any) => s.isWorking)
            .map((s: any) => ({
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              isWorking: true,
            })),
        },
        // Link services
        services: {
          create: (serviceIds || []).map((serviceId: string) => ({
            serviceId,
          })),
        },
      },
      include: {
        schedule: true,
        services: true,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: "Failed to create staff" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    const staff = await prisma.staff.findMany({
      where: { salonId: salon.id },
      include: {
        services: { include: { service: true } },
        schedule: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { error: "Failed to get staff" },
      { status: 500 }
    );
  }
}
