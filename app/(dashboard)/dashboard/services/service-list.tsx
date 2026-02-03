"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: any; // Decimal
  isActive: boolean;
  category: { id: string; name: string } | null;
  staff: { staff: { id: string; displayName: string } }[];
  _count: { bookings: number };
};

export function ServiceList({ 
  services, 
  salonId 
}: { 
  services: Service[];
  salonId: string;
}) {
  const router = useRouter();

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Weet je zeker dat je deze behandeling wilt verwijderen?")) return;
    
    await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    router.refresh();
  };

  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    await fetch(`/api/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
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
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {category}
          </h2>
          <div className="space-y-2">
            {categoryServices.map((service) => (
              <div 
                key={service.id} 
                className={`bg-card rounded-lg border p-4 ${!service.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-4">
                  {/* Service Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      {!service.isActive && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactief</span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    
                    {/* Staff who can do this */}
                    <div className="flex gap-1 mt-2">
                      {service.staff.length === 0 ? (
                        <span className="text-xs text-orange-500">⚠️ Geen medewerkers gekoppeld</span>
                      ) : (
                        service.staff.map((s) => (
                          <span 
                            key={s.staff.id}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {s.staff.displayName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Duration & Price */}
                  <div className="text-center px-4">
                    <p className="text-lg font-bold">€{Number(service.price).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{service.duration} min</p>
                  </div>

                  {/* Stats & Actions */}
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="font-semibold">{service._count.bookings}</span>
                      <span className="text-muted-foreground"> boekingen</span>
                    </p>
                    
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => handleToggleActive(service.id, service.isActive)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {service.isActive ? "Deactiveren" : "Activeren"}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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
        </div>
      ))}
    </div>
  );
}
