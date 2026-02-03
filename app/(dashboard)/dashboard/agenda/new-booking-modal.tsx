"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type Staff = { id: string; displayName: string; color: string | null };
type Service = { id: string; name: string; duration: number; price: number; staff: { staff: Staff }[] };
type PreselectedSlot = { staffId: string; time: string; date: Date } | null;

export function NewBookingModal({
  salonId, staff, services, preselectedSlot, onClose, onSuccess,
}: {
  salonId: string; staff: Staff[]; services: Service[]; preselectedSlot: PreselectedSlot; onClose: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const availableStaff = formData.serviceId
    ? staff.filter(s => services.find(svc => svc.id === formData.serviceId)?.staff.some(ss => ss.staff.id === s.id))
    : staff;

  useEffect(() => {
    if (formData.serviceId && formData.staffId) {
      const stillAvailable = availableStaff.some(s => s.id === formData.staffId);
      if (!stillAvailable && availableStaff.length > 0) {
        setFormData(prev => ({ ...prev, staffId: availableStaff[0].id }));
      }
    }
  }, [formData.serviceId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId, serviceId: formData.serviceId, staffId: formData.staffId,
          date: formData.date, time: formData.time,
          name: formData.name || "Walk-in",
          email: formData.email || `walkin-${Date.now()}@clippr.local`,
          phone: formData.phone, notes: formData.notes,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Er ging iets mis");
      }
    } catch (err) {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-border/40 shadow-elevated w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold">Nieuwe afspraak</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors" aria-label="Sluiten">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-sm flex items-center gap-2 animate-slide-up">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Service */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Behandeling *</label>
              <select value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border">
                <option value="">Kies een behandeling</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration} min · €{s.price.toFixed(2)})</option>)}
              </select>
            </div>

            {/* Staff */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Medewerker *</label>
              <select value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border">
                <option value="">Kies een medewerker</option>
                {availableStaff.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Datum *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tijd *</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required step="900"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" />
              </div>
            </div>

            {/* Summary */}
            {selectedService && formData.staffId && (
              <div className="bg-violet-50/60 rounded-xl p-3.5 border border-violet-100/50 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedService.name}</span>
                  <span className="font-semibold text-violet-700 tabular-nums">€{selectedService.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-violet-600/70 mt-0.5">
                  {selectedService.duration} min · {staff.find(s => s.id === formData.staffId)?.displayName}
                </p>
              </div>
            )}

            <div className="border-t border-border/30 pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Klantgegevens</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Naam</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="Optioneel voor walk-in" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="email@..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Telefoon</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="06 ..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Notities</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border resize-none" placeholder="Interne notities" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-5 py-4 border-t border-border/40 bg-muted/10">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border/80 text-sm font-medium hover:bg-muted/50 transition-colors">
              Annuleren
            </button>
            <button type="submit" disabled={loading || !formData.serviceId || !formData.staffId}
              className="flex-1 py-2.5 px-4 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-500/20 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Opslaan...
                </>
              ) : "Afspraak maken"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
