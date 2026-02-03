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
    const staffId = params.id;

    // Verify ownership through salon
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { salon: true },
    });

    if (!staff || staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update staff
    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        displayName: body.displayName ?? undefined,
        phone: body.phone ?? undefined,
        color: body.color ?? undefined,
        isActive: body.isActive ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update staff error:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
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

    const staffId = params.id;

    // Verify ownership through salon
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { salon: true },
    });

    if (!staff || staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check for future bookings
    const futureBookings = await prisma.booking.count({
      where: {
        staffId,
        startTime: { gte: new Date() },
        status: "CONFIRMED",
      },
    });

    if (futureBookings > 0) {
      return NextResponse.json(
        { error: `Deze medewerker heeft nog ${futureBookings} toekomstige afspraken` },
        { status: 400 }
      );
    }

    // Delete staff (cascades to schedule and service links)
    await prisma.staff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}
