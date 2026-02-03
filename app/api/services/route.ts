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
    const { salonId, name, description, duration, price, categoryId, staffIds } = body;

    // Verify salon ownership
    const salon = await prisma.salon.findFirst({
      where: { id: salonId, ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get max sortOrder
    const maxSort = await prisma.service.aggregate({
      where: { salonId },
      _max: { sortOrder: true },
    });

    // Create service
    const service = await prisma.service.create({
      data: {
        salonId,
        name,
        description,
        duration,
        price,
        categoryId: categoryId || null,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        // Link to staff
        staff: {
          create: (staffIds || []).map((staffId: string) => ({
            staffId,
          })),
        },
      },
      include: {
        category: true,
        staff: { include: { staff: true } },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
