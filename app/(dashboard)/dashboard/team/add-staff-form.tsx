"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
};

const DAYS = [
  { key: 1, label: "Maandag" },
  { key: 2, label: "Dinsdag" },
  { key: 3, label: "Woensdag" },
  { key: 4, label: "Donderdag" },
  { key: 5, label: "Vrijdag" },
  { key: 6, label: "Zaterdag" },
  { key: 0, label: "Zondag" },
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
      isWorking: d.key >= 1 && d.key <= 5, // Ma-Vr default aan
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
          displayName: "",
          phone: "",
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          serviceIds: [],
          schedule: DAYS.map(d => ({
            dayOfWeek: d.key,
            isWorking: d.key >= 1 && d.key <= 5,
            startTime: "09:00",
            endTime: "17:00",
          })),
        });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      schedule: prev.schedule.map(s => 
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      ),
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition"
      >
        + Medewerker toevoegen
      </button>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nieuwe medewerker</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Naam *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-md border bg-background"
              placeholder="Lisa de Vries"
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
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Kleur (voor agenda)</label>
          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  formData.color === color ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Services/Skills */}
        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Behandelingen (vaardigheden)</label>
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.serviceIds.includes(service.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
            {services.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Voeg eerst behandelingen toe om ze te kunnen koppelen
              </p>
            )}
          </div>
        )}

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-2">Werkrooster</label>
          <div className="space-y-2">
            {DAYS.map(day => {
              const schedule = formData.schedule.find(s => s.dayOfWeek === day.key)!;
              return (
                <div key={day.key} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-24">
                    <input
                      type="checkbox"
                      checked={schedule.isWorking}
                      onChange={(e) => updateSchedule(day.key, "isWorking", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                  {schedule.isWorking && (
                    <>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateSchedule(day.key, "startTime", e.target.value)}
                        className="px-2 py-1 rounded border bg-background text-sm"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateSchedule(day.key, "endTime", e.target.value)}
                        className="px-2 py-1 rounded border bg-background text-sm"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 px-4 rounded-md border hover:bg-accent transition"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading || !formData.displayName}
            className="flex-1 py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Opslaan..." : "Medewerker toevoegen"}
          </button>
        </div>
      </form>
    </div>
  );
}
