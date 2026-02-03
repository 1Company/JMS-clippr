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
    const { startDate, endDate, expectedReturn, notes } = body;

    // Verify ownership
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { salon: true },
    });

    if (!staff || staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get affected bookings for today and onwards
    const affectedBookings = await prisma.booking.findMany({
      where: {
        staffId,
        status: "CONFIRMED",
        startTime: { gte: new Date(startDate) },
        ...(endDate && { startTime: { lte: new Date(endDate) } }),
      },
      include: { service: true, customer: true },
    });

    // Create sick leave
    const sickLeave = await prisma.sickLeave.create({
      data: {
        staffId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
        notes,
      },
    });

    return NextResponse.json({
      ...sickLeave,
      affectedBookings: affectedBookings.length,
      bookings: affectedBookings.map(b => ({
        id: b.id,
        startTime: b.startTime,
        service: b.service.name,
        customer: b.customer?.name || b.guestName,
      })),
    });
  } catch (error) {
    console.error("Create sick leave error:", error);
    return NextResponse.json(
      { error: "Failed to create sick leave" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sickLeaveId = searchParams.get("sickLeaveId");
    const body = await req.json();

    if (!sickLeaveId) {
      return NextResponse.json({ error: "Missing sickLeaveId" }, { status: 400 });
    }

    // Verify ownership
    const sickLeave = await prisma.sickLeave.findUnique({
      where: { id: sickLeaveId },
      include: { staff: { include: { salon: true } } },
    });

    if (!sickLeave || sickLeave.staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.sickLeave.update({
      where: { id: sickLeaveId },
      data: {
        endDate: body.endDate ? new Date(body.endDate) : null,
        expectedReturn: body.expectedReturn ? new Date(body.expectedReturn) : null,
        notes: body.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update sick leave error:", error);
    return NextResponse.json(
      { error: "Failed to update sick leave" },
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
    const sickLeaveId = searchParams.get("sickLeaveId");

    if (!sickLeaveId) {
      return NextResponse.json({ error: "Missing sickLeaveId" }, { status: 400 });
    }

    // Verify ownership
    const sickLeave = await prisma.sickLeave.findUnique({
      where: { id: sickLeaveId },
      include: { staff: { include: { salon: true } } },
    });

    if (!sickLeave || sickLeave.staff.salon.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.sickLeave.delete({
      where: { id: sickLeaveId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sick leave error:", error);
    return NextResponse.json(
      { error: "Failed to delete sick leave" },
      { status: 500 }
    );
  }
}
