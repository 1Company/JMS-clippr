import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse, addMinutes } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { salonId, serviceId, staffId, date, time, name, email, phone, notes } = body;

    if (!salonId || !serviceId || !staffId || !date || !time || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get service for duration and price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Calculate start and end time
    const startTime = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
    const endTime = addMinutes(startTime, service.duration);

    // Check for conflicts (double booking)
    const conflict = await prisma.booking.findFirst({
      where: {
        staffId,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Dit tijdslot is helaas niet meer beschikbaar" },
        { status: 409 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { salonId, email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          salonId,
          email,
          name,
          phone,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        salonId,
        serviceId,
        staffId,
        customerId: customer.id,
        startTime,
        endTime,
        duration: service.duration,
        price: service.price,
        status: "CONFIRMED",
        source: "ONLINE",
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        notes,
      },
      include: {
        service: true,
        staff: true,
        salon: true,
      },
    });

    // TODO: Send confirmation email

    return NextResponse.json({
      id: booking.id,
      service: booking.service.name,
      staff: booking.staff.displayName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.price,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
