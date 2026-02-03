"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = { id: string; name: string };

const DAYS = [
  { key: 1, label: "Maandag", short: "Ma" },
  { key: 2, label: "Dinsdag", short: "Di" },
  { key: 3, label: "Woensdag", short: "Wo" },
  { key: 4, label: "Donderdag", short: "Do" },
  { key: 5, label: "Vrijdag", short: "Vr" },
  { key: 6, label: "Zaterdag", short: "Za" },
  { key: 0, label: "Zondag", short: "Zo" },
];

const COLORS = [
  "#8B5CF6", "#EC4899", "#F97316", "#10B981", "#3B82F6",
  "#6366F1", "#EF4444", "#14B8A6", "#F59E0B", "#84CC16"
];

export function AddStaffForm({ salonId, services }: { salonId: string; services: Service[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    serviceIds: [] as string[],
    schedule: DAYS.map(d => ({
      dayOfWeek: d.key,
      isWorking: d.key >= 1 && d.key <= 5,
      startTime: "09:00",
      endTime: "17:00",
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, salonId }),
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({
          displayName: "", phone: "",
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          serviceIds: [],
          schedule: DAYS.map(d => ({ dayOfWeek: d.key, isWorking: d.key >= 1 && d.key <= 5, startTime: "09:00", endTime: "17:00" })),
        });
        router.refresh();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const updateSchedule = (dayOfWeek: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s),
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Medewerker toevoegen
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border/40 overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <h2 className="font-semibold">Nieuwe medewerker</h2>
        <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Naam *</label>
            <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="Lisa de Vries" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefoon</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="06 12345678" />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Kleur</label>
          <div className="flex gap-1.5">
            {COLORS.map(color => (
              <button key={color} type="button" onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? "ring-2 ring-offset-2 ring-foreground/20 scale-110" : "hover:scale-105"}`}
                style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Behandelingen</label>
            <div className="flex flex-wrap gap-1.5">
              {services.map(service => (
                <button key={service.id} type="button" onClick={() => toggleService(service.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formData.serviceIds.includes(service.id)
                      ? "bg-violet-50 text-violet-700 border-violet-200"
                      : "border-border/60 text-muted-foreground hover:border-violet-200 hover:text-violet-600"
                  }`}>
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-2">Werkrooster</label>
          <div className="space-y-1.5">
            {DAYS.map(day => {
              const schedule = formData.schedule.find(s => s.dayOfWeek === day.key)!;
              return (
                <div key={day.key} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors ${schedule.isWorking ? "bg-muted/20" : ""}`}>
                  <label className="flex items-center gap-2 w-28 cursor-pointer">
                    <input type="checkbox" checked={schedule.isWorking} onChange={(e) => updateSchedule(day.key, "isWorking", e.target.checked)}
                      className="rounded border-border/80 text-violet-600 focus:ring-violet-500/20 w-3.5 h-3.5" />
                    <span className={`text-sm ${schedule.isWorking ? "font-medium" : "text-muted-foreground"}`}>{day.label}</span>
                  </label>
                  {schedule.isWorking && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <input type="time" value={schedule.startTime} onChange={(e) => updateSchedule(day.key, "startTime", e.target.value)}
                        className="px-2 py-1 rounded-lg border border-border/80 bg-white text-xs" />
                      <span className="text-muted-foreground">–</span>
                      <input type="time" value={schedule.endTime} onChange={(e) => updateSchedule(day.key, "endTime", e.target.value)}
                        className="px-2 py-1 rounded-lg border border-border/80 bg-white text-xs" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={() => setIsOpen(false)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border/80 text-sm font-medium hover:bg-muted/50 transition-colors">
            Annuleren
          </button>
          <button type="submit" disabled={loading || !formData.displayName}
            className="flex-1 py-2.5 px-4 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-500/20 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Opslaan...
              </>
            ) : "Toevoegen"}
          </button>
        </div>
      </form>
    </div>
  );
}
