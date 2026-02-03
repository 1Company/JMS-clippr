"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: any;
  staff: { staff: { id: string; displayName: string } }[];
};

type Staff = {
  id: string;
  displayName: string;
  color: string | null;
  services: { serviceId: string }[];
  schedule: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[];
};

type OpeningHours = { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean };
type Salon = { id: string; name: string; slug: string; timezone: string; bufferMinutes: number };
type TimeSlot = { time: string; staffId: string; staffName: string };

const STEPS = ["Behandeling", "Medewerker", "Datum & Tijd", "Gegevens"];

export function BookingWizard({
  salon, servicesByCategory, staff, openingHours,
}: {
  salon: Salon;
  servicesByCategory: Record<string, Service[]>;
  staff: Staff[];
  openingHours: OpeningHours[];
}) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [anyStaff, setAnyStaff] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const availableStaff = selectedService
    ? staff.filter(s => selectedService.staff.some(ss => ss.staff.id === s.id))
    : [];

  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const params = new URLSearchParams({ salonId: salon.id, serviceId: selectedService.id, date: format(selectedDate, "yyyy-MM-dd") });
        if (selectedStaff && !anyStaff) params.append("staffId", selectedStaff.id);
        const res = await fetch(`/api/availability?${params}`);
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } catch { setAvailableSlots([]); }
      finally { setLoadingSlots(false); }
    };
    fetchSlots();
  }, [selectedDate, selectedService, selectedStaff, anyStaff, salon.id]);

  const isDayClosed = (date: Date) => {
    const hours = openingHours.find(h => h.dayOfWeek === date.getDay());
    return hours?.isClosed ?? true;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot || !selectedDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: salon.id, serviceId: selectedService.id, staffId: selectedSlot.staffId,
          date: format(selectedDate, "yyyy-MM-dd"), time: selectedSlot.time, ...formData,
        }),
      });
      if (res.ok) setBookingComplete(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ✅ Booking Complete
  if (bookingComplete) {
    return (
      <div className="bg-white rounded-3xl border p-8 text-center animate-slide-up shadow-lg shadow-black/[0.03]">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Afspraak bevestigd!</h2>
        <p className="text-muted-foreground mb-8">
          We sturen een bevestiging naar <strong>{formData.email}</strong>
        </p>
        
        <div className="bg-muted/50 rounded-2xl p-5 text-left mb-8">
          <div className="space-y-3">
            {[
              { l: "Behandeling", v: selectedService?.name },
              { l: "Datum", v: selectedDate && format(selectedDate, "EEEE d MMMM", { locale: nl }) },
              { l: "Tijd", v: selectedSlot?.time },
              { l: "Medewerker", v: selectedSlot?.staffName },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between">
              <span className="text-muted-foreground">Prijs</span>
              <span className="text-xl font-bold gradient-text">€{Number(selectedService?.price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button onClick={() => window.location.reload()} className="text-violet-600 hover:underline underline-offset-4 text-sm font-medium">
          Nog een afspraak maken →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full mb-1.5 transition-all duration-500 ${i + 1 <= step ? "gradient-primary" : "bg-muted"}`} />
            <span className={`text-[10px] font-medium hidden sm:block ${i + 1 <= step ? "text-violet-600" : "text-muted-foreground"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold">Wat wil je laten doen?</h2>
            <p className="text-sm text-muted-foreground">Kies een behandeling</p>
          </div>
          
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{category}</h3>
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(2); }}
                    className="w-full p-4 rounded-2xl bg-white border hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all text-left flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-semibold group-hover:text-violet-700">{service.name}</p>
                      {service.description && <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">⏱ {service.duration} min</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-lg font-bold">€{Number(service.price).toFixed(2)}</p>
                      <span className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">Kies →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && selectedService && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-violet-600 font-medium">← Terug</button>
          <div>
            <h2 className="text-xl font-bold">Bij wie wil je?</h2>
            <p className="text-sm text-muted-foreground">Voor: {selectedService.name}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => { setAnyStaff(true); setSelectedStaff(null); setStep(3); }}
              className="w-full p-4 rounded-2xl bg-white border hover:border-violet-200 hover:shadow-md transition-all text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xl">⚡</div>
              <div>
                <p className="font-semibold group-hover:text-violet-700">Eerste beschikbaar</p>
                <p className="text-sm text-muted-foreground">Snelste beschikbare tijd</p>
              </div>
            </button>

            {availableStaff.map((member) => (
              <button
                key={member.id}
                onClick={() => { setSelectedStaff(member); setAnyStaff(false); setStep(3); }}
                className="w-full p-4 rounded-2xl bg-white border hover:border-violet-200 hover:shadow-md transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: member.color || "#8B5CF6" }}>
                  {member.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold group-hover:text-violet-700">{member.displayName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && selectedService && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-violet-600 font-medium">← Terug</button>
          <div>
            <h2 className="text-xl font-bold">Wanneer past het?</h2>
            <p className="text-sm text-muted-foreground">{selectedService.name} {!anyStaff && selectedStaff && `met ${selectedStaff.displayName}`}</p>
          </div>

          {/* Date Picker */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {dateOptions.map((date) => {
              const closed = isDayClosed(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !closed && setSelectedDate(date)}
                  disabled={closed}
                  className={`flex-shrink-0 p-3 rounded-2xl text-center min-w-[72px] border-2 transition-all ${
                    selected ? "border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/25" :
                    closed ? "border-transparent bg-muted/50 text-muted-foreground/40 cursor-not-allowed" :
                    isToday ? "border-violet-200 bg-violet-50 hover:bg-violet-100" :
                    "border-transparent bg-white hover:border-violet-200"
                  }`}
                >
                  <p className="text-[10px] uppercase font-semibold tracking-wider opacity-70">{format(date, "EEE", { locale: nl })}</p>
                  <p className="text-xl font-bold my-0.5">{format(date, "d")}</p>
                  <p className="text-[10px] opacity-70">{format(date, "MMM", { locale: nl })}</p>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="font-semibold mb-3">Beschikbare tijden</h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <span className="text-3xl block mb-2">😔</span>
                  <p className="font-medium">Geen beschikbare tijden</p>
                  <p className="text-sm">Probeer een andere dag</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedSlot(slot); setStep(4); }}
                      className="py-3 px-2 rounded-xl bg-white border hover:border-violet-300 hover:bg-violet-50 transition-all text-center group"
                    >
                      <p className="font-semibold group-hover:text-violet-700">{slot.time}</p>
                      {anyStaff && <p className="text-[10px] text-muted-foreground mt-0.5">{slot.staffName}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Details */}
      {step === 4 && selectedService && selectedSlot && selectedDate && (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStep(3)} className="text-sm text-muted-foreground hover:text-violet-600 font-medium">← Terug</button>
          <div>
            <h2 className="text-xl font-bold">Bijna klaar!</h2>
            <p className="text-sm text-muted-foreground">Vul je gegevens in om te bevestigen</p>
          </div>

          {/* Summary */}
          <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{selectedService.name}</p>
                <p className="text-sm text-violet-700">{format(selectedDate, "EEEE d MMMM", { locale: nl })} om {selectedSlot.time}</p>
                <p className="text-sm text-violet-600/70">met {selectedSlot.staffName}</p>
              </div>
              <p className="text-xl font-bold text-violet-700">€{Number(selectedService.price).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Naam *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border bg-white placeholder:text-muted-foreground/50" placeholder="Je naam" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border bg-white placeholder:text-muted-foreground/50" placeholder="je@email.nl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefoon <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-white placeholder:text-muted-foreground/50" placeholder="06 12345678" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Opmerkingen <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-xl border bg-white placeholder:text-muted-foreground/50 resize-none" placeholder="Eventuele wensen" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.name || !formData.email}
            className="w-full py-4 rounded-2xl gradient-primary text-white font-semibold text-lg hover:opacity-90 disabled:opacity-50 shadow-xl shadow-violet-500/25"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Bezig met boeken...
              </span>
            ) : "Afspraak Bevestigen ✓"}
          </button>

          <p className="text-xs text-center text-muted-foreground">Je ontvangt een bevestiging per email</p>
        </div>
      )}
    </div>
  );
}
