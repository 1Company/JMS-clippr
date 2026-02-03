"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Staff = { id: string; displayName: string };

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120];

export function AddServiceForm({ salonId, categories, staff }: { salonId: string; categories: Category[]; staff: Staff[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "", description: "", duration: 30, price: "", categoryId: "", staffIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let categoryId = formData.categoryId;
      if (newCategory && !categoryId) {
        const catRes = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ salonId, name: newCategory }) });
        if (catRes.ok) { const cat = await catRes.json(); categoryId = cat.id; }
      }
      const res = await fetch("/api/services", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, salonId, categoryId: categoryId || null, price: parseFloat(formData.price) }),
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: "", description: "", duration: 30, price: "", categoryId: "", staffIds: [] });
        setNewCategory("");
        router.refresh();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleStaff = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId) ? prev.staffIds.filter(id => id !== staffId) : [...prev.staffIds, staffId],
    }));
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="w-full py-3.5 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Behandeling toevoegen
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border/40 overflow-hidden animate-scale-in">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <h2 className="font-semibold">Nieuwe behandeling</h2>
        <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Naam *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
            className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="Dames knippen" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Beschrijving</label>
          <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="Inclusief wassen en föhnen" />
        </div>

        {/* Duration & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Duur *</label>
            <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border">
              {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} minuten</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Prijs (€) *</label>
            <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border" placeholder="35.00" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Categorie</label>
          {categories.length > 0 && (
            <select value={formData.categoryId} onChange={(e) => { setFormData({ ...formData, categoryId: e.target.value }); if (e.target.value) setNewCategory(""); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border">
              <option value="">Geen / Nieuwe categorie</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          )}
          {!formData.categoryId && (
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-white text-sm hover:border-border ${categories.length > 0 ? "mt-2" : ""}`}
              placeholder="Nieuwe categorie (bijv. Knippen, Kleuren)" />
          )}
        </div>

        {/* Staff */}
        {staff.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Wie kan dit uitvoeren?</label>
            <div className="flex flex-wrap gap-1.5">
              {staff.map(s => (
                <button key={s.id} type="button" onClick={() => toggleStaff(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formData.staffIds.includes(s.id)
                      ? "bg-violet-50 text-violet-700 border-violet-200"
                      : "border-border/60 text-muted-foreground hover:border-violet-200 hover:text-violet-600"
                  }`}>
                  {s.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={() => setIsOpen(false)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border/80 text-sm font-medium hover:bg-muted/50 transition-colors">
            Annuleren
          </button>
          <button type="submit" disabled={loading || !formData.name || !formData.price}
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
