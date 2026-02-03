import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { nl } from "date-fns/locale";
import { sendBookingReminder } from "@/lib/email";

// This endpoint should be called daily by Vercel Cron
// Sends reminders for appointments tomorrow

export async function GET(req: NextRequest) {
  // Verify cron secret (set in Vercel)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Get tomorrow's date range
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    // Find all confirmed bookings for tomorrow that haven't been reminded
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: { gte: tomorrowStart, lte: tomorrowEnd },
        status: "CONFIRMED",
        // Could add a reminderSent field to track this
      },
      include: {
        salon: true,
        service: true,
        staff: true,
        customer: true,
      },
    });

    console.log(`[Cron] Found ${bookings.length} bookings for tomorrow`);

    let sent = 0;
    let failed = 0;

    for (const booking of bookings) {
      const email = booking.customer?.email || booking.guestEmail;
      const name = booking.customer?.name || booking.guestName;

      if (!email || !name) {
        console.log(`[Cron] Skipping booking ${booking.id}: no email`);
        continue;
      }

      const result = await sendBookingReminder({
        customerName: name,
        customerEmail: email,
        salonName: booking.salon.name,
        serviceName: booking.service.name,
        staffName: booking.staff.displayName,
        date: format(booking.startTime, "EEEE d MMMM", { locale: nl }),
        time: format(booking.startTime, "HH:mm"),
        duration: booking.duration,
        price: `€${Number(booking.price).toFixed(2)}`,
        bookingId: booking.id,
        salonSlug: booking.salon.slug,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      date: format(tomorrow, "yyyy-MM-dd"),
      total: bookings.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
