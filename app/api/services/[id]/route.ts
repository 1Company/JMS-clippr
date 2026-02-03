import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const serviceId = params.id;

    // Verify ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });

    if (!service || service.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: body.name ?? undefined,
        description: body.description ?? undefined,
        duration: body.duration ?? undefined,
        price: body.price ?? undefined,
        isActive: body.isActive ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update service error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceId = params.id;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { salon: true },
    });

    if (!service || service.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check for future bookings
    const futureBookings = await prisma.booking.count({
      where: {
        serviceId,
        startTime: { gte: new Date() },
        status: "CONFIRMED",
      },
    });

    if (futureBookings > 0) {
      return NextResponse.json(
        { error: `Deze behandeling heeft nog ${futureBookings} toekomstige afspraken` },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
