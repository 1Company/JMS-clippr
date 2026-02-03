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
    const { salonId, name } = body;

    // Verify salon ownership
    const salon = await prisma.salon.findFirst({
      where: { id: salonId, ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get max sortOrder
    const maxSort = await prisma.serviceCategory.aggregate({
      where: { salonId },
      _max: { sortOrder: true },
    });

    const category = await prisma.serviceCategory.create({
      data: {
        salonId,
        name,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
