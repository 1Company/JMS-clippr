"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Staff = {
  id: string;
  displayName: string;
  phone: string | null;
  color: string | null;
  isActive: boolean;
  services: { service: { id: string; name: string } }[];
  schedule: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[];
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
            </div>

            {/* Stats & Actions */}
            <div className="text-right">
              <p className="text-sm">
                <span className="font-semibold">{member._count.bookings}</span>
                <span className="text-muted-foreground"> afspraken</span>
              </p>
              
              <div className="flex gap-2 mt-2">
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
        </div>
      ))}
    </div>
  );
}
