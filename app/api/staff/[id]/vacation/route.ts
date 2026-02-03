import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = params.id;
    const body = await req.json();
    const { startDate, endDate, reason } = body;

    // Verify ownership
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { salon: true },
    });

    if (!staff || staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check for booking conflicts
    const conflictingBookings = await prisma.booking.count({
      where: {
        staffId,
        status: "CONFIRMED",
        startTime: { gte: new Date(startDate), lte: new Date(endDate) },
      },
    });

    // Create vacation
    const vacation = await prisma.vacation.create({
      data: {
        staffId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    return NextResponse.json({
      ...vacation,
      conflictingBookings,
      warning: conflictingBookings > 0 
        ? `Let op: ${conflictingBookings} afspraken vallen binnen deze vakantieperiode`
        : null,
    });
  } catch (error) {
    console.error("Create vacation error:", error);
    return NextResponse.json(
      { error: "Failed to create vacation" },
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

    const { searchParams } = new URL(req.url);
    const vacationId = searchParams.get("vacationId");

    if (!vacationId) {
      return NextResponse.json({ error: "Missing vacationId" }, { status: 400 });
    }

    // Verify ownership
    const vacation = await prisma.vacation.findUnique({
      where: { id: vacationId },
      include: { staff: { include: { salon: true } } },
    });

    if (!vacation || vacation.staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.vacation.delete({
      where: { id: vacationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete vacation error:", error);
    return NextResponse.json(
      { error: "Failed to delete vacation" },
      { status: 500 }
    );
  }
}
