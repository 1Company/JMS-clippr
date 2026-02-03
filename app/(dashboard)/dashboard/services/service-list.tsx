"use client";

import { useRouter } from "next/navigation";

type Service = {
  id: string; name: string; description: string | null; duration: number; price: any; isActive: boolean;
  category: { id: string; name: string } | null;
  staff: { staff: { id: string; displayName: string } }[];
  _count: { bookings: number };
};

export function ServiceList({ services, salonId }: { services: Service[]; salonId: string }) {
  const router = useRouter();

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Weet je zeker dat je deze behandeling wilt verwijderen?")) return;
    await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    router.refresh();
  };

  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    await fetch(`/api/services/${serviceId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    router.refresh();
  };

  // Group by category
  const grouped = services.reduce((acc, service) => {
    const catName = service.category?.name || "Overig";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryServices]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-2.5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</h2>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] text-muted-foreground tabular-nums">{categoryServices.length}</span>
          </div>

          <div className="space-y-2">
            {categoryServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-xl border border-border/40 p-4 sm:p-5 transition-all hover:shadow-soft ${!service.isActive ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{service.name}</h3>
                      {!service.isActive && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md font-medium">Inactief</span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                    )}
                    
                    {/* Staff */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {service.staff.length === 0 ? (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          Geen medewerkers gekoppeld
                        </span>
                      ) : (
                        service.staff.map((s) => (
                          <span key={s.staff.id} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md font-medium">
                            {s.staff.displayName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Price & Duration */}
                  <div className="text-center shrink-0 px-3">
                    <p className="text-lg font-bold tabular-nums">€{Number(service.price).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{service.duration} min</p>
                  </div>

                  {/* Actions */}
                  <div className="text-right shrink-0">
                    <p className="text-xs tabular-nums mb-2">
                      <span className="font-semibold">{service._count.bookings}</span>
                      <span className="text-muted-foreground ml-0.5">boekingen</span>
                    </p>
                    
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleToggleActive(service.id, service.isActive)}
                        className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                        {service.isActive ? "Deactiveren" : "Activeren"}
                      </button>
                      <button onClick={() => handleDelete(service.id)}
                        className="text-[11px] text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors">
                        Verwijderen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
