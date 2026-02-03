import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, parse, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");
    const serviceId = searchParams.get("serviceId");
    const dateStr = searchParams.get("date");
    const staffId = searchParams.get("staffId"); // Optional: specific staff

    if (!salonId || !serviceId || !dateStr) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Parse date
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    const dayOfWeek = date.getDay();

    // Get salon with opening hours
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        openingHours: { where: { dayOfWeek } },
        closedDays: { where: { date: startOfDay(date) } },
      },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Check if closed
    const openingHours = salon.openingHours[0];
    if (!openingHours || openingHours.isClosed || salon.closedDays.length > 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        staff: {
          where: staffId ? { staffId } : undefined,
          include: {
            staff: {
              include: {
                schedule: { where: { dayOfWeek } },
                vacations: {
                  where: {
                    startDate: { lte: date },
                    endDate: { gte: date },
                  },
                },
                sickLeaves: {
                  where: {
                    startDate: { lte: date },
                    OR: [
                      { endDate: null },
                      { endDate: { gte: date } },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get existing bookings for this day
    const existingBookings = await prisma.booking.findMany({
      where: {
        salonId,
        startTime: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    // Calculate available slots
    const slots: { time: string; staffId: string; staffName: string }[] = [];
    const slotDuration = 15; // 15-minute intervals
    const serviceDuration = service.duration;
    const buffer = salon.bufferMinutes;

    // Parse opening hours
    const [openHour, openMin] = openingHours.openTime.split(":").map(Number);
    const [closeHour, closeMin] = openingHours.closeTime.split(":").map(Number);
    
    const openTime = new Date(date);
    openTime.setHours(openHour, openMin, 0, 0);
    
    const closeTime = new Date(date);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    // For each staff member who can do this service
    for (const staffService of service.staff) {
      const staffMember = staffService.staff;
      
      // Skip if not active
      if (!staffMember.isActive) continue;
      
      // Skip if on vacation or sick
      if (staffMember.vacations.length > 0 || staffMember.sickLeaves.length > 0) continue;
      
      // Get staff schedule for this day
      const staffSchedule = staffMember.schedule[0];
      if (!staffSchedule || !staffSchedule.isWorking) continue;

      // Parse staff working hours
      const [staffStartHour, staffStartMin] = staffSchedule.startTime.split(":").map(Number);
      const [staffEndHour, staffEndMin] = staffSchedule.endTime.split(":").map(Number);
      
      const staffStart = new Date(date);
      staffStart.setHours(staffStartHour, staffStartMin, 0, 0);
      
      const staffEnd = new Date(date);
      staffEnd.setHours(staffEndHour, staffEndMin, 0, 0);

      // Effective start/end (intersection of salon and staff hours)
      const effectiveStart = isAfter(staffStart, openTime) ? staffStart : openTime;
      const effectiveEnd = isBefore(staffEnd, closeTime) ? staffEnd : closeTime;

      // Generate slots
      let slotStart = new Date(effectiveStart);
      
      while (true) {
        const slotEnd = addMinutes(slotStart, serviceDuration);
        
        // Check if slot fits within working hours
        if (isAfter(slotEnd, effectiveEnd)) break;
        
        // Check if slot is in the past (for today)
        const now = new Date();
        if (isBefore(slotStart, now)) {
          slotStart = addMinutes(slotStart, slotDuration);
          continue;
        }

        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          if (booking.staffId !== staffMember.id) return false;
          
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          // Add buffer
          const bufferedStart = addMinutes(bookingStart, -buffer);
          const bufferedEnd = addMinutes(bookingEnd, buffer);
          
          // Check overlap
          return (
            (slotStart >= bufferedStart && slotStart < bufferedEnd) ||
            (slotEnd > bufferedStart && slotEnd <= bufferedEnd) ||
            (slotStart <= bufferedStart && slotEnd >= bufferedEnd)
          );
        });

        if (!hasConflict) {
          slots.push({
            time: format(slotStart, "HH:mm"),
            staffId: staffMember.id,
            staffName: staffMember.displayName,
          });
        }

        slotStart = addMinutes(slotStart, slotDuration);
      }
    }

    // Sort by time, then by staff name
    slots.sort((a, b) => {
      if (a.time !== b.time) return a.time.localeCompare(b.time);
      return a.staffName.localeCompare(b.staffName);
    });

    // Remove duplicates (keep first staff for each time if "any staff" mode)
    const uniqueSlots = staffId
      ? slots
      : slots.filter((slot, index, self) => 
          index === self.findIndex(s => s.time === slot.time)
        );

    return NextResponse.json({ slots: uniqueSlots });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Failed to get availability" },
      { status: 500 }
    );
  }
}
