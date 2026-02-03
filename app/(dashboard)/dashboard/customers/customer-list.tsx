"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  createdAt: Date | string;
  bookings: { startTime: Date | string; service: { name: string } }[];
  _count: { bookings: number };
};

export function CustomerList({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam, email of telefoon..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm font-medium">Geen klanten gevonden</p>
          <p className="text-xs mt-0.5">Probeer een andere zoekterm</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => {
            const lastBooking = customer.bookings[0];

            return (
              <Card key={customer.id} className="hover:shadow-soft transition-all">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-semibold text-sm shrink-0">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{customer.name}</h3>
                        {customer.notes && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Notitie
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          {customer.email}
                        </span>
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            {customer.phone}
                          </span>
                        )}
                      </div>

                      {customer.notes && (
                        <p className="text-[11px] text-amber-700/80 bg-amber-50/50 rounded-lg px-2 py-1 mt-2 inline-block">
                          📝 {customer.notes}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0">
                      <p className="text-sm tabular-nums">
                        <span className="font-semibold">{customer._count.bookings}</span>
                        <span className="text-muted-foreground text-xs ml-0.5">
                          {customer._count.bookings === 1 ? "bezoek" : "bezoeken"}
                        </span>
                      </p>
                      {lastBooking && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Laatst: {formatDate(lastBooking.startTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
