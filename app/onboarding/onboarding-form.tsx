"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm({ userEmail, userId }: { userEmail: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ salonName: "", phone: "", street: "", city: "", postalCode: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/salon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });
      if (res.ok) { router.push("/dashboard?welcome=true"); router.refresh(); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-elevated p-7 sm:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Naam van je salon *</label>
          <input type="text" value={formData.salonName} onChange={(e) => setFormData({ ...formData, salonName: e.target.value })} required autoFocus
            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border" placeholder="Kapsalon De Schaar" />
          <p className="text-xs text-muted-foreground mt-1.5">Dit wordt zichtbaar op je boekingspagina</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Telefoonnummer</label>
            <span className="text-xs text-muted-foreground">optioneel</span>
          </div>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border" placeholder="020 123 4567" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Adres</label>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border" placeholder="Hoofdstraat 1" />
            </div>
            <div>
              <input type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border" placeholder="1234 AB" />
            </div>
          </div>
          <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border mt-2.5" placeholder="Amsterdam" />
        </div>

        <button type="submit" disabled={loading || !formData.salonName}
          className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Bezig...
            </>
          ) : (
            <>
              Start met Clippr
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
