"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays, parseISO, isSameDay, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { nl } from "date-fns/locale";
import { NewBookingModal } from "./new-booking-modal";

type Staff = { id: string; displayName: string; color: string | null };
type Booking = {
  id: string; startTime: string; endTime: string; duration: number; price: number; status: string;
  guestName: string | null; guestPhone: string | null; notes: string | null;
  service: { id: string; name: string }; staff: { id: string; displayName: string; color: string | null };
  customer: { id: string; name: string; phone: string | null } | null;
};
type OpeningHours = { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean };
type Service = { id: string; name: string; duration: number; price: number; staff: { staff: Staff }[] };

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

export function AgendaView({
  salonId, currentDate, view, staff, bookings, openingHours, services,
}: {
  salonId: string; currentDate: string; view: string; staff: Staff[]; bookings: Booking[]; openingHours: OpeningHours[]; services: Service[];
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

  const goToToday = () => router.push(`/dashboard/agenda?view=${view}`);

  const toggleView = () => {
    const newView = view === "day" ? "week" : "day";
    router.push(`/dashboard/agenda?date=${format(date, "yyyy-MM-dd")}&view=${newView}`);
  };

  const getBookingsForSlot = (staffId: string, hour: number, targetDate: Date) => {
    return bookings.filter(b => {
      const bookingStart = parseISO(b.startTime);
      return b.staff.id === staffId && isSameDay(bookingStart, targetDate) && bookingStart.getHours() === hour;
    });
  };

  const isSlotInPast = (targetDate: Date, hour: number) => {
    const slotTime = new Date(targetDate);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < new Date();
  };

  const getOpeningHoursForDay = (dayOfWeek: number) => openingHours.find(h => h.dayOfWeek === dayOfWeek);

  const handleSlotClick = (staffId: string, hour: number, targetDate: Date) => {
    if (isSlotInPast(targetDate, hour)) return;
    setSelectedSlot({ staffId, time: `${hour.toString().padStart(2, "0")}:00`, date: targetDate });
    setShowNewBooking(true);
  };

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            {view === "week"
              ? `Week ${format(date, "w")} · ${format(weekStart, "d MMM", { locale: nl })} – ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: nl })}`
              : format(date, "EEEE d MMMM yyyy", { locale: nl })}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Navigation */}
          <div className="flex items-center bg-white border border-border/40 rounded-lg overflow-hidden">
            <button onClick={() => navigateDate("prev")} className="px-2.5 py-2 hover:bg-muted/50 transition-colors border-r border-border/40" aria-label="Vorige">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={goToToday} className="px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
              Vandaag
            </button>
            <button onClick={() => navigateDate("next")} className="px-2.5 py-2 hover:bg-muted/50 transition-colors border-l border-border/40" aria-label="Volgende">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex bg-white border border-border/40 rounded-lg overflow-hidden">
            <button
              onClick={() => view !== "day" && toggleView()}
              className={`px-3 py-2 text-xs font-medium transition-colors ${view === "day" ? "bg-teal-50 text-teal-700" : "hover:bg-muted/50"}`}
            >
              Dag
            </button>
            <button
              onClick={() => view !== "week" && toggleView()}
              className={`px-3 py-2 text-xs font-medium transition-colors border-l border-border/40 ${view === "week" ? "bg-teal-50 text-teal-700" : "hover:bg-muted/50"}`}
            >
              Week
            </button>
          </div>

          {/* New booking */}
          <button
            onClick={() => setShowNewBooking(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 shadow-sm shadow-teal-500/20 hover:-translate-y-px active:translate-y-0 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Afspraak
          </button>
        </div>
      </div>

      {/* Staff Legend */}
      {staff.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: member.color || "#8B5CF6" }} />
              <span className="text-muted-foreground">{member.displayName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="bg-white rounded-xl border border-border/40 overflow-hidden">
          {/* Staff Header */}
          <div className="grid border-b border-border/40" style={{ gridTemplateColumns: `56px repeat(${staff.length}, 1fr)` }}>
            <div className="p-2 bg-muted/20 border-r border-border/30" />
            {staff.map((member) => (
              <div key={member.id} className="px-2 py-2.5 text-center border-r border-border/30 last:border-r-0 bg-muted/10">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color || "#8B5CF6" }} />
                  <p className="font-medium text-xs truncate">{member.displayName}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {HOURS.map((hour) => {
              const hours = getOpeningHoursForDay(date.getDay());
              const isClosed = hours?.isClosed ?? true;
              const [openHour] = (hours?.openTime || "09:00").split(":").map(Number);
              const [closeHour] = (hours?.closeTime || "17:00").split(":").map(Number);
              const isOutsideHours = isClosed || hour < openHour || hour >= closeHour;

              return (
                <div key={hour} className="grid border-b border-border/20 last:border-b-0" style={{ gridTemplateColumns: `56px repeat(${staff.length}, 1fr)` }}>
                  <div className="px-2 py-1 border-r border-border/30 bg-muted/10 flex items-start justify-end pt-2">
                    <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{hour}:00</span>
                  </div>

                  {staff.map((member) => {
                    const slotBookings = getBookingsForSlot(member.id, hour, date);
                    const isPast = isSlotInPast(date, hour);

                    return (
                      <div
                        key={member.id}
                        className={`relative min-h-[56px] border-r border-border/20 last:border-r-0 transition-colors ${
                          isOutsideHours ? "bg-muted/30" : isPast ? "bg-muted/10" : "hover:bg-teal-50/30 cursor-pointer"
                        }`}
                        onClick={() => !isOutsideHours && slotBookings.length === 0 && handleSlotClick(member.id, hour, date)}
                      >
                        {slotBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="absolute inset-x-1 top-1 rounded-lg p-2 text-white text-[11px] overflow-hidden hover:brightness-110 transition-all cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: booking.staff.color || "#8B5CF6",
                              height: `${Math.max((booking.duration / 60) * 56 - 8, 44)}px`,
                            }}
                          >
                            <p className="font-semibold truncate leading-tight">{booking.customer?.name || booking.guestName}</p>
                            <p className="opacity-80 truncate leading-tight">{booking.service.name}</p>
                            <p className="opacity-70 tabular-nums">{format(parseISO(booking.startTime), "HH:mm")}–{format(parseISO(booking.endTime), "HH:mm")}</p>
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
        <div className="bg-white rounded-xl border border-border/40 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-border/40">
              <div className="p-2 bg-muted/10 border-r border-border/30" />
              {weekDays.map((day) => {
                const hours = getOpeningHoursForDay(day.getDay());
                const isClosed = hours?.isClosed ?? true;
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={day.toISOString()} className={`px-2 py-2.5 text-center border-r border-border/30 last:border-r-0 ${isClosed ? "bg-muted/20" : isToday ? "bg-teal-50/60" : "bg-muted/5"}`}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{format(day, "EEE", { locale: nl })}</p>
                    <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-teal-600" : isClosed ? "text-muted-foreground/60" : ""}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Week Grid */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border/15 last:border-b-0">
                  <div className="px-2 py-1 border-r border-border/30 bg-muted/10 flex items-start justify-end pt-2">
                    <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{hour}:00</span>
                  </div>
                  {weekDays.map((day) => {
                    const dayBookings = bookings.filter(b => {
                      const start = parseISO(b.startTime);
                      return isSameDay(start, day) && start.getHours() === hour;
                    });
                    const hours = getOpeningHoursForDay(day.getDay());
                    const isClosed = hours?.isClosed ?? true;

                    return (
                      <div key={day.toISOString()} className={`relative min-h-[40px] border-r border-border/15 last:border-r-0 ${isClosed ? "bg-muted/20" : ""}`}>
                        {dayBookings.slice(0, 2).map((booking) => (
                          <div key={booking.id} className="text-[10px] p-1 m-0.5 rounded-md truncate text-white font-medium shadow-sm" style={{ backgroundColor: booking.staff.color || "#8B5CF6" }}>
                            {format(parseISO(booking.startTime), "HH:mm")} {booking.customer?.name || booking.guestName}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[10px] text-muted-foreground px-1 font-medium">+{dayBookings.length - 2}</div>
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

      {/* New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal
          salonId={salonId} staff={staff} services={services} preselectedSlot={selectedSlot}
          onClose={() => { setShowNewBooking(false); setSelectedSlot(null); }}
          onSuccess={() => { setShowNewBooking(false); setSelectedSlot(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
