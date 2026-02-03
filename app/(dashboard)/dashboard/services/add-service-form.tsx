"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Staff = { id: string; displayName: string };

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120];

export function AddServiceForm({ 
  salonId, 
  categories, 
  staff 
}: { 
  salonId: string; 
  categories: Category[];
  staff: Staff[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: "",
    categoryId: "",
    staffIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create category first if new
      let categoryId = formData.categoryId;
      if (newCategory && !categoryId) {
        const catRes = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salonId, name: newCategory }),
        });
        if (catRes.ok) {
          const cat = await catRes.json();
          categoryId = cat.id;
        }
      }

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          salonId,
          categoryId: categoryId || null,
          price: parseFloat(formData.price),
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({
          name: "",
          description: "",
          duration: 30,
          price: "",
          categoryId: "",
          staffIds: [],
        });
        setNewCategory("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaff = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter(id => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition"
      >
        + Behandeling toevoegen
      </button>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Nieuwe behandeling</h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Naam *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-md border bg-background"
            placeholder="Dames knippen"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Beschrijving</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-md border bg-background"
            placeholder="Inclusief wassen en föhnen"
          />
        </div>

        {/* Duration & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duur *</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              {DURATION_OPTIONS.map(d => (
                <option key={d} value={d}>{d} minuten</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prijs (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-md border bg-background"
              placeholder="35.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Categorie</label>
          {categories.length > 0 ? (
            <select
              value={formData.categoryId}
              onChange={(e) => {
                setFormData({ ...formData, categoryId: e.target.value });
                if (e.target.value) setNewCategory("");
              }}
              className="w-full px-3 py-2 rounded-md border bg-background"
            >
              <option value="">Geen / Nieuwe categorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          ) : null}
          {!formData.categoryId && (
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-background mt-2"
              placeholder="Nieuwe categorie (bijv. Knippen, Kleuren)"
            />
          )}
        </div>

        {/* Staff */}
        {staff.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Wie kan dit uitvoeren?</label>
            <div className="flex flex-wrap gap-2">
              {staff.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStaff(s.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.staffIds.includes(s.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {s.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 px-4 rounded-md border hover:bg-accent transition"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name || !formData.price}
            className="flex-1 py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Opslaan..." : "Behandeling toevoegen"}
          </button>
        </div>
      </form>
    </div>
  );
}
