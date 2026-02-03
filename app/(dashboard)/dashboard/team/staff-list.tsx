"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Vacation = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string | null;
};

type SickLeave = {
  id: string;
  startDate: Date | string;
  endDate: Date | string | null;
  expectedReturn: Date | string | null;
  notes: string | null;
};

type Staff = {
  id: string;
  displayName: string;
  phone: string | null;
  color: string | null;
  isActive: boolean;
  services: { service: { id: string; name: string } }[];
  schedule: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[];
  vacations: Vacation[];
  sickLeaves: SickLeave[];
  _count: { bookings: number };
};

type Service = {
  id: string;
  name: string;
};

const DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const COLORS = [
  "#8B5CF6", "#EC4899", "#F97316", "#10B981", "#3B82F6", 
  "#6366F1", "#EF4444", "#14B8A6", "#F59E0B", "#84CC16"
];

export function StaffList({ 
  staff, 
  services, 
  salonId 
}: { 
  staff: Staff[]; 
  services: Service[];
  salonId: string;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showVacationForm, setShowVacationForm] = useState<string | null>(null);
  const [showSickForm, setShowSickForm] = useState<string | null>(null);
  const [vacationData, setVacationData] = useState({ startDate: "", endDate: "", reason: "" });
  const [sickData, setSickData] = useState({ notes: "" });

  const handleDelete = async (staffId: string) => {
    if (!confirm("Weet je zeker dat je deze medewerker wilt verwijderen?")) return;
    
    await fetch(`/api/staff/${staffId}`, { method: "DELETE" });
    router.refresh();
  };

  const handleToggleActive = async (staffId: string, isActive: boolean) => {
    await fetch(`/api/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const handleAddVacation = async (staffId: string) => {
    if (!vacationData.startDate || !vacationData.endDate) return;
    
    await fetch(`/api/staff/${staffId}/vacation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vacationData),
    });
    setShowVacationForm(null);
    setVacationData({ startDate: "", endDate: "", reason: "" });
    router.refresh();
  };

  const handleDeleteVacation = async (staffId: string, vacationId: string) => {
    if (!confirm("Vakantie verwijderen?")) return;
    await fetch(`/api/staff/${staffId}/vacation?vacationId=${vacationId}`, { method: "DELETE" });
    router.refresh();
  };

  const handleAddSickLeave = async (staffId: string) => {
    await fetch(`/api/staff/${staffId}/sickleave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
        notes: sickData.notes,
      }),
    });
    setShowSickForm(null);
    setSickData({ notes: "" });
    router.refresh();
  };

  const handleEndSickLeave = async (staffId: string, sickLeaveId: string) => {
    await fetch(`/api/staff/${staffId}/sickleave?sickLeaveId=${sickLeaveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: new Date().toISOString() }),
    });
    router.refresh();
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-4">
      {staff.map((member) => (
        <div 
          key={member.id} 
          className={`bg-card rounded-lg border p-4 ${!member.isActive ? "opacity-60" : ""}`}
        >
          <div className="flex items-start gap-4">
            {/* Avatar/Color */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: member.color || "#8B5CF6" }}
            >
              {member.displayName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{member.displayName}</h3>
                {!member.isActive && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactief</span>
                )}
              </div>
              
              {member.phone && (
                <p className="text-sm text-muted-foreground">{member.phone}</p>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-2">
                {member.services.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Geen behandelingen gekoppeld</span>
                ) : (
                  member.services.map((s) => (
                    <span 
                      key={s.service.id}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                    >
                      {s.service.name}
                    </span>
                  ))
                )}
              </div>

              {/* Schedule Preview */}
              <div className="flex gap-1 mt-2">
                {DAYS.map((day, i) => {
                  const schedule = member.schedule.find(s => s.dayOfWeek === i);
                  const isWorking = schedule?.isWorking ?? false;
                  return (
                    <span
                      key={i}
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded ${
                        isWorking ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                      title={isWorking ? `${schedule?.startTime} - ${schedule?.endTime}` : "Niet werkzaam"}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>

              {/* Sick Leave Indicator */}
              {member.sickLeaves.length > 0 && !member.sickLeaves[0].endDate && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                    🤒 Ziek gemeld sinds {formatDate(member.sickLeaves[0].startDate)}
                  </span>
                  <button
                    onClick={() => handleEndSickLeave(member.id, member.sickLeaves[0].id)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Beter melden
                  </button>
                </div>
              )}

              {/* Upcoming Vacations */}
              {member.vacations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {member.vacations.slice(0, 2).map(v => (
                    <div key={v.id} className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        🏖️ {formatDate(v.startDate)} - {formatDate(v.endDate)}
                        {v.reason && ` (${v.reason})`}
                      </span>
                      <button
                        onClick={() => handleDeleteVacation(member.id, v.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats & Actions */}
            <div className="text-right">
              <p className="text-sm">
                <span className="font-semibold">{member._count.bookings}</span>
                <span className="text-muted-foreground"> afspraken</span>
              </p>
              
              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => setShowVacationForm(showVacationForm === member.id ? null : member.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Vakantie
                </button>
                {!member.sickLeaves.some(s => !s.endDate) && (
                  <button
                    onClick={() => setShowSickForm(showSickForm === member.id ? null : member.id)}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    Ziek melden
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(member.id, member.isActive)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {member.isActive ? "Deactiveren" : "Activeren"}
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>

          {/* Vacation Form */}
          {showVacationForm === member.id && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium mb-2">Vakantie toevoegen</p>
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Van</label>
                  <input
                    type="date"
                    value={vacationData.startDate}
                    onChange={(e) => setVacationData({ ...vacationData, startDate: e.target.value })}
                    className="block px-2 py-1 text-sm rounded border bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tot</label>
                  <input
                    type="date"
                    value={vacationData.endDate}
                    onChange={(e) => setVacationData({ ...vacationData, endDate: e.target.value })}
                    className="block px-2 py-1 text-sm rounded border bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reden (optioneel)</label>
                  <input
                    type="text"
                    value={vacationData.reason}
                    onChange={(e) => setVacationData({ ...vacationData, reason: e.target.value })}
                    placeholder="bijv. Skivakantie"
                    className="block px-2 py-1 text-sm rounded border bg-background"
                  />
                </div>
                <button
                  onClick={() => handleAddVacation(member.id)}
                  disabled={!vacationData.startDate || !vacationData.endDate}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
                >
                  Toevoegen
                </button>
                <button
                  onClick={() => setShowVacationForm(null)}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Sick Leave Form */}
          {showSickForm === member.id && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium mb-2">Ziek melden (vanaf vandaag)</p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Notities (optioneel)</label>
                  <input
                    type="text"
                    value={sickData.notes}
                    onChange={(e) => setSickData({ notes: e.target.value })}
                    placeholder="bijv. Griep"
                    className="block w-full px-2 py-1 text-sm rounded border bg-background"
                  />
                </div>
                <button
                  onClick={() => handleAddSickLeave(member.id)}
                  className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:opacity-90"
                >
                  Ziek melden
                </button>
                <button
                  onClick={() => setShowSickForm(null)}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
