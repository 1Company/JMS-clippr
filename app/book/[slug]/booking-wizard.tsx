"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";

type Service = { id: string; name: string; description: string | null; duration: number; price: any; staff: { staff: { id: string; displayName: string } }[] };
type Staff = { id: string; displayName: string; color: string | null; services: { serviceId: string }[]; schedule: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[] };
type OpeningHours = { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean };
type Salon = { id: string; name: string; slug: string; timezone: string; bufferMinutes: number };
type TimeSlot = { time: string; staffId: string; staffName: string };

const STEPS = ["Behandeling", "Medewerker", "Datum & Tijd", "Gegevens"];

export function BookingWizard({ salon, servicesByCategory, staff, openingHours }: { salon: Salon; servicesByCategory: Record<string, Service[]>; staff: Staff[]; openingHours: OpeningHours[] }) {
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

  const availableStaff = selectedService ? staff.filter(s => selectedService.staff.some(ss => ss.staff.id === s.id)) : [];
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId: salon.id, serviceId: selectedService.id, staffId: selectedSlot.staffId, date: format(selectedDate, "yyyy-MM-dd"), time: selectedSlot.time, ...formData }),
      });
      if (res.ok) setBookingComplete(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  // ✅ Booking Complete
  if (bookingComplete) {
    return (
      <div className="bg-white rounded-2xl border border-border/40 p-7 sm:p-8 text-center shadow-elevated animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-1.5">Afspraak bevestigd!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We sturen een bevestiging naar <strong className="text-foreground">{formData.email}</strong>
        </p>
        
        <div className="bg-muted/30 rounded-xl p-4 text-left mb-6 space-y-2.5">
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
          <div className="border-t border-border/40 pt-2.5 flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Prijs</span>
            <span className="text-xl font-bold gradient-text">€{Number(selectedService?.price).toFixed(2)}</span>
          </div>
        </div>

        <button onClick={() => window.location.reload()} className="text-teal-600 hover:text-teal-700 text-sm font-medium underline underline-offset-4 decoration-teal-200 hover:decoration-teal-400">
          Nog een afspraak maken →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full mb-1.5 transition-all duration-500 ${i + 1 <= step ? "gradient-primary" : "bg-border/60"}`} />
            <span className={`text-[10px] font-medium hidden sm:block ${i + 1 <= step ? "text-teal-600" : "text-muted-foreground/60"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold">Wat wil je laten doen?</h2>
            <p className="text-xs text-muted-foreground">Kies een behandeling</p>
          </div>
          
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category}</h3>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="space-y-1.5">
                {services.map((service) => (
                  <button key={service.id} onClick={() => { setSelectedService(service); setStep(2); }}
                    className="w-full p-4 rounded-xl bg-white border border-border/40 hover:border-teal-200 hover:shadow-medium transition-all text-left flex justify-between items-center group">
                    <div>
                      <p className="font-semibold text-sm group-hover:text-teal-700 transition-colors">{service.name}</p>
                      {service.description && <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {service.duration} min
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-base font-bold tabular-nums">€{Number(service.price).toFixed(2)}</p>
                      <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-0.5 justify-end">
                        Kies
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </span>
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
          <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-teal-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Terug
          </button>
          <div>
            <h2 className="text-lg font-bold">Bij wie wil je?</h2>
            <p className="text-xs text-muted-foreground">Voor: {selectedService.name}</p>
          </div>

          <div className="space-y-1.5">
            <button onClick={() => { setAnyStaff(true); setSelectedStaff(null); setStep(3); }}
              className="w-full p-4 rounded-xl bg-white border border-border/40 hover:border-teal-200 hover:shadow-medium transition-all text-left flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-teal-700 transition-colors">Eerste beschikbaar</p>
                <p className="text-xs text-muted-foreground">Snelste beschikbare tijd</p>
              </div>
            </button>

            {availableStaff.map((member) => (
              <button key={member.id} onClick={() => { setSelectedStaff(member); setAnyStaff(false); setStep(3); }}
                className="w-full p-4 rounded-xl bg-white border border-border/40 hover:border-teal-200 hover:shadow-medium transition-all text-left flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0" style={{ backgroundColor: member.color || "#8B5CF6" }}>
                  {member.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-teal-700 transition-colors">{member.displayName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && selectedService && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:text-teal-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Terug
          </button>
          <div>
            <h2 className="text-lg font-bold">Wanneer past het?</h2>
            <p className="text-xs text-muted-foreground">{selectedService.name} {!anyStaff && selectedStaff && `met ${selectedStaff.displayName}`}</p>
          </div>

          {/* Date Picker */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {dateOptions.map((date) => {
              const closed = isDayClosed(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              return (
                <button key={date.toISOString()} onClick={() => !closed && setSelectedDate(date)} disabled={closed}
                  className={`flex-shrink-0 px-2.5 py-2 rounded-xl text-center min-w-[60px] border transition-all ${
                    selected ? "border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/25" :
                    closed ? "border-transparent bg-muted/30 text-muted-foreground/30 cursor-not-allowed" :
                    isToday ? "border-teal-200 bg-teal-50 hover:bg-teal-100" :
                    "border-border/30 bg-white hover:border-teal-200 hover:bg-teal-50/30"
                  }`}>
                  <p className={`text-[9px] uppercase font-semibold tracking-wider ${selected ? "text-white/80" : "opacity-60"}`}>{format(date, "EEE", { locale: nl })}</p>
                  <p className="text-lg font-bold my-px tabular-nums">{format(date, "d")}</p>
                  <p className={`text-[9px] ${selected ? "text-white/70" : "opacity-50"}`}>{format(date, "MMM", { locale: nl })}</p>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="font-semibold text-sm mb-2.5">Beschikbare tijden</h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-11 rounded-xl bg-muted/60 animate-pulse" />)}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <svg className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-sm">Geen beschikbare tijden</p>
                  <p className="text-xs mt-0.5">Probeer een andere dag</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {availableSlots.map((slot, i) => (
                    <button key={i} onClick={() => { setSelectedSlot(slot); setStep(4); }}
                      className="py-2.5 px-2 rounded-xl bg-white border border-border/40 hover:border-teal-300 hover:bg-teal-50 transition-all text-center group">
                      <p className="font-semibold text-sm group-hover:text-teal-700 tabular-nums">{slot.time}</p>
                      {anyStaff && <p className="text-[9px] text-muted-foreground mt-0.5">{slot.staffName}</p>}
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
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(3)} className="text-xs text-muted-foreground hover:text-teal-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Terug
          </button>
          <div>
            <h2 className="text-lg font-bold">Bijna klaar!</h2>
            <p className="text-xs text-muted-foreground">Vul je gegevens in om te bevestigen</p>
          </div>

          {/* Summary Card */}
          <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-100/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{selectedService.name}</p>
                <p className="text-xs text-teal-700 mt-0.5">{format(selectedDate, "EEEE d MMMM", { locale: nl })} om {selectedSlot.time}</p>
                <p className="text-xs text-teal-600/60">met {selectedSlot.staffName}</p>
              </div>
              <p className="text-lg font-bold text-teal-700 tabular-nums">€{Number(selectedService.price).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Naam *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white hover:border-border text-sm" placeholder="Je naam" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white hover:border-border text-sm" placeholder="je@email.nl" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Telefoon</label>
                  <span className="text-[10px] text-muted-foreground">optioneel</span>
                </div>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white hover:border-border text-sm" placeholder="06 ..." />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Opmerkingen</label>
                  <span className="text-[10px] text-muted-foreground">optioneel</span>
                </div>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white hover:border-border text-sm" placeholder="Wensen" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}
            className="w-full py-3.5 rounded-2xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-teal-500/25 hover:shadow-teal-500/35 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Bezig met boeken...
              </>
            ) : (
              <>
                Afspraak Bevestigen
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">Je ontvangt een bevestiging per email</p>
        </div>
      )}
    </div>
  );
}
