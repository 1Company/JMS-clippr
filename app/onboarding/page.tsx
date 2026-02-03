"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
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
    if (!session?.user?.email) return;
    
    setLoading(true);

    try {
      const res = await fetch("/api/salon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: session.user.email,
        }),
      });

      if (res.ok) {
        router.push("/dashboard?welcome=true");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">
            <span className="text-primary">✂️</span> Clippr
          </Link>
          <h1 className="text-xl font-semibold mt-4">Welkom! Laten we je salon opzetten</h1>
          <p className="text-muted-foreground">Dit duurt maar een minuutje</p>
        </div>

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

        <p className="text-center text-xs text-muted-foreground mt-4">
          Je kunt deze gegevens later altijd aanpassen
        </p>
      </div>
    </main>
  );
}
