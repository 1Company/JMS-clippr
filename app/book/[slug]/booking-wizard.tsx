"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
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

type OpeningHours = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

type Salon = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  bufferMinutes: number;
};

type TimeSlot = {
  time: string;
  staffId: string;
  staffName: string;
};

export function BookingWizard({
  salon,
  servicesByCategory,
  staff,
  openingHours,
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Get available staff for selected service
  const availableStaff = selectedService
    ? staff.filter(s => 
        selectedService.staff.some(ss => ss.staff.id === s.id)
      )
    : [];

  // Generate next 14 days for date selection
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const params = new URLSearchParams({
          salonId: salon.id,
          serviceId: selectedService.id,
          date: format(selectedDate, "yyyy-MM-dd"),
        });
        if (selectedStaff && !anyStaff) {
          params.append("staffId", selectedStaff.id);
        }

        const res = await fetch(`/api/availability?${params}`);
        const data = await res.json();
        setAvailableSlots(data.slots || []);
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService, selectedStaff, anyStaff, salon.id]);

  // Check if day is closed
  const isDayClosed = (date: Date) => {
    const dayOfWeek = date.getDay();
    const hours = openingHours.find(h => h.dayOfWeek === dayOfWeek);
    return hours?.isClosed ?? true;
  };

  // Handle booking submission
  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot || !selectedDate) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: salon.id,
          serviceId: selectedService.id,
          staffId: selectedSlot.staffId,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedSlot.time,
          ...formData,
        }),
      });

      if (res.ok) {
        const booking = await res.json();
        setBookingDetails(booking);
        setBookingComplete(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Booking complete view
  if (bookingComplete && bookingDetails) {
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Afspraak bevestigd!</h2>
        <p className="text-muted-foreground mb-6">
          We hebben je een bevestiging gestuurd naar {formData.email}
        </p>
        
        <div className="bg-muted rounded-lg p-4 text-left mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Behandeling</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Datum</span>
              <span className="font-medium">
                {selectedDate && format(selectedDate, "EEEE d MMMM", { locale: nl })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tijd</span>
              <span className="font-medium">{selectedSlot?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medewerker</span>
              <span className="font-medium">{selectedSlot?.staffName}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground">Prijs</span>
              <span className="font-bold">€{Number(selectedService?.price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline text-sm"
        >
          Nog een afspraak maken
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Choose Service */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Kies een behandeling</h2>
          
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className="w-full p-4 rounded-lg border bg-card hover:border-primary transition text-left flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{service.duration} min</p>
                    </div>
                    <p className="font-bold text-lg">€{Number(service.price).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Choose Staff */}
      {step === 2 && selectedService && (
        <div className="space-y-4">
          <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Terug
          </button>
          
          <h2 className="text-lg font-semibold">Kies een medewerker</h2>
          <p className="text-sm text-muted-foreground">
            Voor: <span className="font-medium text-foreground">{selectedService.name}</span>
          </p>

          <div className="space-y-2">
            {/* Any staff option */}
            <button
              onClick={() => {
                setAnyStaff(true);
                setSelectedStaff(null);
                setStep(3);
              }}
              className="w-full p-4 rounded-lg border bg-card hover:border-primary transition text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                ⚡
              </div>
              <div>
                <p className="font-medium">Eerste beschikbaar</p>
                <p className="text-sm text-muted-foreground">Snelste beschikbare tijd</p>
              </div>
            </button>

            {/* Individual staff */}
            {availableStaff.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedStaff(member);
                  setAnyStaff(false);
                  setStep(3);
                }}
                className="w-full p-4 rounded-lg border bg-card hover:border-primary transition text-left flex items-center gap-3"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: member.color || "#8B5CF6" }}
                >
                  {member.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{member.displayName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Choose Date & Time */}
      {step === 3 && selectedService && (
        <div className="space-y-4">
          <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Terug
          </button>

          <h2 className="text-lg font-semibold">Kies datum en tijd</h2>
          <p className="text-sm text-muted-foreground">
            {selectedService.name} {!anyStaff && selectedStaff && `met ${selectedStaff.displayName}`}
          </p>

          {/* Date Selection */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dateOptions.map((date) => {
              const closed = isDayClosed(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !closed && setSelectedDate(date)}
                  disabled={closed}
                  className={`flex-shrink-0 p-3 rounded-lg border text-center min-w-[70px] transition ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : closed
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-card hover:border-primary"
                  }`}
                >
                  <p className="text-xs uppercase">
                    {format(date, "EEE", { locale: nl })}
                  </p>
                  <p className="text-lg font-bold">{format(date, "d")}</p>
                  <p className="text-xs">{format(date, "MMM", { locale: nl })}</p>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="font-medium mb-2">Beschikbare tijden</h3>
              {loadingSlots ? (
                <div className="text-center py-8 text-muted-foreground">
                  Laden...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Geen beschikbare tijden op deze dag
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(4);
                      }}
                      className="p-3 rounded-lg border bg-card hover:border-primary transition text-center"
                    >
                      <p className="font-medium">{slot.time}</p>
                      {anyStaff && (
                        <p className="text-xs text-muted-foreground">{slot.staffName}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Contact Details */}
      {step === 4 && selectedService && selectedSlot && selectedDate && (
        <div className="space-y-4">
          <button onClick={() => setStep(3)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Terug
          </button>

          <h2 className="text-lg font-semibold">Jouw gegevens</h2>

          {/* Summary */}
          <div className="bg-muted rounded-lg p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{selectedService.name}</span>
                <span className="font-medium">€{Number(selectedService.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{format(selectedDate, "EEEE d MMMM", { locale: nl })}</span>
                <span>{selectedSlot.time}</span>
              </div>
              <div className="text-muted-foreground">
                met {selectedSlot.staffName}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Naam *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="Je naam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="je@email.nl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefoon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="06 12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opmerkingen</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
                rows={2}
                placeholder="Eventuele wensen of opmerkingen"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.name || !formData.email}
            className="w-full py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Bezig met boeken..." : "Afspraak bevestigen"}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Je ontvangt een bevestiging per email
          </p>
        </div>
      )}
    </div>
  );
}
