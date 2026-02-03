"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Vacation = { id: string; startDate: Date | string; endDate: Date | string; reason: string | null };
type SickLeave = { id: string; startDate: Date | string; endDate: Date | string | null; expectedReturn: Date | string | null; notes: string | null };
type Staff = {
  id: string; displayName: string; phone: string | null; color: string | null; isActive: boolean;
  services: { service: { id: string; name: string } }[];
  schedule: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[];
  vacations: Vacation[]; sickLeaves: SickLeave[];
  _count: { bookings: number };
};
type Service = { id: string; name: string };

const DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export function StaffList({ staff, services, salonId }: { staff: Staff[]; services: Service[]; salonId: string }) {
  const router = useRouter();
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
    await fetch(`/api/staff/${staffId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    router.refresh();
  };

  const handleAddVacation = async (staffId: string) => {
    if (!vacationData.startDate || !vacationData.endDate) return;
    await fetch(`/api/staff/${staffId}/vacation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vacationData) });
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
    await fetch(`/api/staff/${staffId}/sickleave`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startDate: new Date().toISOString(), notes: sickData.notes }) });
    setShowSickForm(null);
    setSickData({ notes: "" });
    router.refresh();
  };

  const handleEndSickLeave = async (staffId: string, sickLeaveId: string) => {
    await fetch(`/api/staff/${staffId}/sickleave?sickLeaveId=${sickLeaveId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endDate: new Date().toISOString() }) });
    router.refresh();
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-3">
      {staff.map((member) => {
        const isSick = member.sickLeaves.length > 0 && !member.sickLeaves[0].endDate;

        return (
          <div key={member.id} className={`bg-white rounded-xl border border-border/40 overflow-hidden transition-all hover:shadow-soft ${!member.isActive ? "opacity-60" : ""}`}>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm" style={{ backgroundColor: member.color || "#8B5CF6" }}>
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                  {isSick && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px]">
                      🤒
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{member.displayName}</h3>
                    {!member.isActive && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-medium">Inactief</span>
                    )}
                    {isSick && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-medium">Ziek</span>
                    )}
                  </div>
                  
                  {member.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">{member.phone}</p>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.services.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">Geen behandelingen gekoppeld</span>
                    ) : (
                      member.services.map((s) => (
                        <span key={s.service.id} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-medium">
                          {s.service.name}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="flex gap-0.5 mt-2.5">
                    {DAYS.map((day, i) => {
                      const schedule = member.schedule.find(s => s.dayOfWeek === i);
                      const isWorking = schedule?.isWorking ?? false;
                      return (
                        <span
                          key={i}
                          className={`text-[9px] w-6 h-6 flex items-center justify-center rounded-md font-medium transition-colors ${
                            isWorking 
                              ? "bg-teal-50 text-teal-700" 
                              : "bg-muted/50 text-muted-foreground/40"
                          }`}
                          title={isWorking ? `${schedule?.startTime}–${schedule?.endTime}` : "Vrij"}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="text-right shrink-0">
                  <p className="text-sm tabular-nums">
                    <span className="font-semibold">{member._count.bookings}</span>
                    <span className="text-muted-foreground text-xs ml-0.5">afspraken</span>
                  </p>
                  
                  <div className="flex gap-1.5 mt-2 justify-end flex-wrap">
                    <button onClick={() => setShowVacationForm(showVacationForm === member.id ? null : member.id)}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">
                      + Vakantie
                    </button>
                    {!isSick && (
                      <button onClick={() => setShowSickForm(showSickForm === member.id ? null : member.id)}
                        className="text-[11px] font-medium text-orange-600 hover:text-orange-700 px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">
                        Ziek
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5 mt-1 justify-end">
                    <button onClick={() => handleToggleActive(member.id, member.isActive)}
                      className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                      {member.isActive ? "Deactiveren" : "Activeren"}
                    </button>
                    <button onClick={() => handleDelete(member.id)}
                      className="text-[11px] text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors">
                      Verwijderen
                    </button>
                  </div>
                </div>
              </div>

              {/* Sick indicator */}
              {isSick && (
                <div className="mt-3 flex items-center justify-between bg-red-50/60 border border-red-100/60 rounded-lg px-3 py-2">
                  <span className="text-xs text-red-700">
                    Ziek gemeld sinds {formatDate(member.sickLeaves[0].startDate)}
                    {member.sickLeaves[0].notes && ` — ${member.sickLeaves[0].notes}`}
                  </span>
                  <button onClick={() => handleEndSickLeave(member.id, member.sickLeaves[0].id)}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors">
                    Beter melden ✓
                  </button>
                </div>
              )}

              {/* Vacations */}
              {member.vacations.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  {member.vacations.slice(0, 3).map(v => (
                    <div key={v.id} className="flex items-center justify-between bg-blue-50/50 border border-blue-100/50 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-blue-700">
                        🏖️ {formatDate(v.startDate)} – {formatDate(v.endDate)}
                        {v.reason && <span className="text-blue-600/70"> · {v.reason}</span>}
                      </span>
                      <button onClick={() => handleDeleteVacation(member.id, v.id)}
                        className="text-[11px] text-muted-foreground hover:text-red-500 px-1 rounded transition-colors">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vacation Form */}
            {showVacationForm === member.id && (
              <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-border/30 bg-muted/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Vakantie toevoegen</p>
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Van</label>
                    <input type="date" value={vacationData.startDate} onChange={(e) => setVacationData({ ...vacationData, startDate: e.target.value })}
                      className="block px-2.5 py-1.5 text-sm rounded-lg border border-border/80 bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Tot</label>
                    <input type="date" value={vacationData.endDate} onChange={(e) => setVacationData({ ...vacationData, endDate: e.target.value })}
                      className="block px-2.5 py-1.5 text-sm rounded-lg border border-border/80 bg-white" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Reden</label>
                    <input type="text" value={vacationData.reason} onChange={(e) => setVacationData({ ...vacationData, reason: e.target.value })} placeholder="optioneel"
                      className="block w-full px-2.5 py-1.5 text-sm rounded-lg border border-border/80 bg-white" />
                  </div>
                  <button onClick={() => handleAddVacation(member.id)} disabled={!vacationData.startDate || !vacationData.endDate}
                    className="px-3 py-1.5 text-xs font-medium gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 shadow-sm shadow-teal-500/10">
                    Toevoegen
                  </button>
                  <button onClick={() => setShowVacationForm(null)}
                    className="px-3 py-1.5 text-xs font-medium border border-border/80 rounded-lg hover:bg-muted/50">
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {/* Sick Form */}
            {showSickForm === member.id && (
              <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-border/30 bg-muted/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Ziek melden (vanaf vandaag)</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Notities</label>
                    <input type="text" value={sickData.notes} onChange={(e) => setSickData({ notes: e.target.value })} placeholder="bijv. Griep"
                      className="block w-full px-2.5 py-1.5 text-sm rounded-lg border border-border/80 bg-white" />
                  </div>
                  <button onClick={() => handleAddSickLeave(member.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm">
                    Ziek melden
                  </button>
                  <button onClick={() => setShowSickForm(null)}
                    className="px-3 py-1.5 text-xs font-medium border border-border/80 rounded-lg hover:bg-muted/50">
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
