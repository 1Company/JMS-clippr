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
    <div className="glass-card rounded-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">Naam van je salon *</label>
          <input type="text" value={formData.salonName} onChange={(e) => setFormData({ ...formData, salonName: e.target.value })} required autoFocus
            className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50" placeholder="Kapsalon De Schaar" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">Telefoonnummer <span className="text-muted-foreground font-normal">(optioneel)</span></label>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50" placeholder="020 123 4567" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2 text-foreground/80">Straat + nummer</label>
            <input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50" placeholder="Hoofdstraat 1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">Postcode</label>
            <input type="text" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50" placeholder="1234 AB" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground/80">Plaats</label>
          <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50" placeholder="Amsterdam" />
        </div>
        <button type="submit" disabled={loading || !formData.salonName}
          className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Bezig...
            </span>
          ) : "Start met Clippr →"}
        </button>
      </form>
    </div>
  );
}
