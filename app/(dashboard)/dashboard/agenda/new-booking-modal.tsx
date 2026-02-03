"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

type Staff = {
  id: string;
  displayName: string;
  color: string | null;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  staff: { staff: Staff }[];
};

type PreselectedSlot = {
  staffId: string;
  time: string;
  date: Date;
} | null;

export function NewBookingModal({
  salonId,
  staff,
  services,
  preselectedSlot,
  onClose,
  onSuccess,
}: {
  salonId: string;
  staff: Staff[];
  services: Service[];
  preselectedSlot: PreselectedSlot;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: "",
    staffId: preselectedSlot?.staffId || "",
    date: preselectedSlot?.date ? format(preselectedSlot.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    time: preselectedSlot?.time || "09:00",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Filter staff based on selected service
  const availableStaff = formData.serviceId
    ? staff.filter(s => 
        services.find(svc => svc.id === formData.serviceId)?.staff.some(ss => ss.staff.id === s.id)
      )
    : staff;

  // Reset staff if not available for selected service
  useEffect(() => {
    if (formData.serviceId && formData.staffId) {
      const stillAvailable = availableStaff.some(s => s.id === formData.staffId);
      if (!stillAvailable && availableStaff.length > 0) {
        setFormData(prev => ({ ...prev, staffId: availableStaff[0].id }));
      }
    }
  }, [formData.serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId,
          serviceId: formData.serviceId,
          staffId: formData.staffId,
          date: formData.date,
          time: formData.time,
          name: formData.name || "Walk-in",
          email: formData.email || `walkin-${Date.now()}@clippr.local`,
          phone: formData.phone,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Er ging iets mis");
      }
    } catch (err) {
      console.error(err);
      alert("Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">Nieuwe afspraak</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Service */}
          <div>
            <label className="block text-sm font-medium mb-1">Behandeling *</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="">Kies een behandeling</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min - €{service.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="block text-sm font-medium mb-1">Medewerker *</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="">Kies een medewerker</option>
              {availableStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Datum *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tijd *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                step="900"
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
          </div>

          {/* Summary */}
          {selectedService && formData.staffId && (
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span>{selectedService.name}</span>
                <span className="font-medium">€{selectedService.price.toFixed(2)}</span>
              </div>
              <div className="text-muted-foreground">
                {selectedService.duration} minuten • {staff.find(s => s.id === formData.staffId)?.displayName}
              </div>
            </div>
          )}

          <hr />

          {/* Customer Info */}
          <div>
            <label className="block text-sm font-medium mb-1">Klantnaam</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              placeholder="Naam (optioneel voor walk-in)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              placeholder="email@voorbeeld.nl"
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
            <label className="block text-sm font-medium mb-1">Notities</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background"
              rows={2}
              placeholder="Interne notities"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md border hover:bg-accent transition"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading || !formData.serviceId || !formData.staffId}
              className="flex-1 py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Opslaan..." : "Afspraak maken"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
