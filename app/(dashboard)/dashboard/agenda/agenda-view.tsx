"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays, parseISO, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { nl } from "date-fns/locale";
import { NewBookingModal } from "./new-booking-modal";

type Staff = {
  id: string;
  displayName: string;
  color: string | null;
};

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: string;
  guestName: string | null;
  guestPhone: string | null;
  notes: string | null;
  service: { id: string; name: string };
  staff: { id: string; displayName: string; color: string | null };
  customer: { id: string; name: string; phone: string | null } | null;
};

type OpeningHours = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  staff: { staff: Staff }[];
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

export function AgendaView({
  salonId,
  currentDate,
  view,
  staff,
  bookings,
  openingHours,
  services,
}: {
  salonId: string;
  currentDate: string;
  view: string;
  staff: Staff[];
  bookings: Booking[];
  openingHours: OpeningHours[];
  services: Service[];
}) {
  const router = useRouter();
  const date = parseISO(currentDate);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ staffId: string; time: string; date: Date } | null>(null);

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;
    if (view === "week") {
      newDate = direction === "prev" ? subWeeks(date, 1) : addWeeks(date, 1);
    } else {
      newDate = direction === "prev" ? subDays(date, 1) : addDays(date, 1);
    }
    router.push(`/dashboard/agenda?date=${format(newDate, "yyyy-MM-dd")}&view=${view}`);
  };

  const goToToday = () => {
    router.push(`/dashboard/agenda?view=${view}`);
  };

  const toggleView = () => {
    const newView = view === "day" ? "week" : "day";
    router.push(`/dashboard/agenda?date=${format(date, "yyyy-MM-dd")}&view=${newView}`);
  };

  const getBookingsForSlot = (staffId: string, hour: number, targetDate: Date) => {
    return bookings.filter(b => {
      const bookingStart = parseISO(b.startTime);
      const bookingHour = bookingStart.getHours();
      return (
        b.staff.id === staffId &&
        isSameDay(bookingStart, targetDate) &&
        bookingHour === hour
      );
    });
  };

  const isSlotInPast = (targetDate: Date, hour: number) => {
    const slotTime = new Date(targetDate);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < new Date();
  };

  const getOpeningHoursForDay = (dayOfWeek: number) => {
    return openingHours.find(h => h.dayOfWeek === dayOfWeek);
  };

  const handleSlotClick = (staffId: string, hour: number, targetDate: Date) => {
    if (isSlotInPast(targetDate, hour)) return;
    setSelectedSlot({
      staffId,
      time: `${hour.toString().padStart(2, "0")}:00`,
      date: targetDate,
    });
    setShowNewBooking(true);
  };

  const handleBookingClick = (booking: Booking) => {
    // TODO: Open booking details modal
    console.log("Booking clicked:", booking);
  };

  // Generate week days for week view
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            {view === "week"
              ? `Week ${format(date, "w")} - ${format(weekStart, "d MMM", { locale: nl })} t/m ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: nl })}`
              : format(date, "EEEE d MMMM yyyy", { locale: nl })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate("prev")}
            className="p-2 rounded-md border hover:bg-accent transition"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 rounded-md border hover:bg-accent transition text-sm"
          >
            Vandaag
          </button>
          <button
            onClick={() => navigateDate("next")}
            className="p-2 rounded-md border hover:bg-accent transition"
          >
            →
          </button>
          <button
            onClick={toggleView}
            className="px-3 py-2 rounded-md border hover:bg-accent transition text-sm ml-2"
          >
            {view === "day" ? "Week" : "Dag"}
          </button>
          <button
            onClick={() => setShowNewBooking(true)}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition ml-2"
          >
            + Afspraak
          </button>
        </div>
      </div>

      {/* Day View */}
      {view === "day" && (
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Staff Header */}
          <div className="grid border-b" style={{ gridTemplateColumns: `60px repeat(${staff.length}, 1fr)` }}>
            <div className="p-2 border-r bg-muted" />
            {staff.map((member) => (
              <div
                key={member.id}
                className="p-2 text-center border-r last:border-r-0"
                style={{ borderTopColor: member.color || "#8B5CF6", borderTopWidth: 3 }}
              >
                <p className="font-medium text-sm truncate">{member.displayName}</p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => {
              const hours = getOpeningHoursForDay(date.getDay());
              const isClosed = hours?.isClosed ?? true;
              const [openHour] = (hours?.openTime || "09:00").split(":").map(Number);
              const [closeHour] = (hours?.closeTime || "17:00").split(":").map(Number);
              const isOutsideHours = isClosed || hour < openHour || hour >= closeHour;

              return (
                <div
                  key={hour}
                  className="grid border-b last:border-b-0"
                  style={{ gridTemplateColumns: `60px repeat(${staff.length}, 1fr)` }}
                >
                  {/* Time Label */}
                  <div className="p-2 border-r bg-muted text-xs text-muted-foreground text-right pr-3">
                    {hour}:00
                  </div>

                  {/* Staff Columns */}
                  {staff.map((member) => {
                    const slotBookings = getBookingsForSlot(member.id, hour, date);
                    const isPast = isSlotInPast(date, hour);

                    return (
                      <div
                        key={member.id}
                        className={`relative min-h-[60px] border-r last:border-r-0 ${
                          isOutsideHours
                            ? "bg-muted/50"
                            : isPast
                            ? "bg-muted/30"
                            : "hover:bg-accent/50 cursor-pointer"
                        }`}
                        onClick={() => !isOutsideHours && slotBookings.length === 0 && handleSlotClick(member.id, hour, date)}
                      >
                        {slotBookings.map((booking) => (
                          <div
                            key={booking.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookingClick(booking);
                            }}
                            className="absolute inset-x-1 top-1 rounded p-1.5 text-white text-xs cursor-pointer hover:opacity-90 transition overflow-hidden"
                            style={{
                              backgroundColor: booking.staff.color || "#8B5CF6",
                              height: `${(booking.duration / 60) * 60 - 8}px`,
                              minHeight: "52px",
                            }}
                          >
                            <p className="font-medium truncate">
                              {booking.customer?.name || booking.guestName}
                            </p>
                            <p className="opacity-80 truncate">{booking.service.name}</p>
                            <p className="opacity-80">
                              {format(parseISO(booking.startTime), "HH:mm")} - {format(parseISO(booking.endTime), "HH:mm")}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="bg-card rounded-lg border overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 border-r bg-muted" />
              {weekDays.map((day) => {
                const hours = getOpeningHoursForDay(day.getDay());
                const isClosed = hours?.isClosed ?? true;
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center border-r last:border-r-0 ${
                      isClosed ? "bg-muted/50" : isToday ? "bg-primary/10" : ""
                    }`}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: nl })}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Simplified week grid - show bookings per day */}
            <div className="max-h-[500px] overflow-y-auto">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-2 border-r bg-muted text-xs text-muted-foreground text-right pr-3">
                    {hour}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayBookings = bookings.filter(b => {
                      const start = parseISO(b.startTime);
                      return isSameDay(start, day) && start.getHours() === hour;
                    });
                    const hours = getOpeningHoursForDay(day.getDay());
                    const isClosed = hours?.isClosed ?? true;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`relative min-h-[40px] border-r last:border-r-0 ${
                          isClosed ? "bg-muted/50" : ""
                        }`}
                      >
                        {dayBookings.slice(0, 2).map((booking, i) => (
                          <div
                            key={booking.id}
                            className="text-xs p-1 m-0.5 rounded truncate text-white"
                            style={{ backgroundColor: booking.staff.color || "#8B5CF6" }}
                          >
                            {format(parseISO(booking.startTime), "HH:mm")} {booking.customer?.name || booking.guestName}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayBookings.length - 2} meer
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {staff.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: member.color || "#8B5CF6" }}
            />
            <span>{member.displayName}</span>
          </div>
        ))}
      </div>

      {/* New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal
          salonId={salonId}
          staff={staff}
          services={services}
          preselectedSlot={selectedSlot}
          onClose={() => {
            setShowNewBooking(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            setShowNewBooking(false);
            setSelectedSlot(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
