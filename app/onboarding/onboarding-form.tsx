"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm({ 
  userEmail, 
  userId 
}: { 
  userEmail: string; 
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    salonName: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/salon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (res.ok) {
        router.push("/dashboard?welcome=true");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Naam van je salon *
          </label>
          <input
            type="text"
            value={formData.salonName}
            onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Kapsalon De Schaar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telefoonnummer
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="020 123 4567"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Straat + nummer
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Hoofdstraat 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Postcode
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1234 AB"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Plaats
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Amsterdam"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.salonName}
          className="w-full py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Start met Clippr →"}
        </button>
      </form>
    </div>
  );
}
