"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    salonName: "",
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Stap 1: Maak account + salon aan via API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Er ging iets mis");
        setLoading(false);
        return;
      }

      // Stap 2: Log automatisch in (redirect: false zodat we het zelf kunnen afhandelen)
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: "demo",
        redirect: false,
      });

      if (signInResult?.error) {
        // Als signIn faalt, stuur naar login met email
        router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`);
      } else {
        // Succes! Ga naar dashboard
        router.push("/dashboard?welcome=true");
      }
    } catch (err) {
      console.error(err);
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">
            <span className="text-primary">✂️</span> Clippr
          </Link>
          <p className="text-muted-foreground mt-2">Start gratis met je salon</p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Over je salon</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Naam van je salon
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

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.salonName}
                  className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  Volgende
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Jouw gegevens</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Je naam
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Jan Jansen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="jan@kapsalon.nl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="06 12345678"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 px-4 rounded-md border font-medium hover:bg-accent transition"
                  >
                    Terug
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.email}
                    className="flex-1 py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Aanmaken..." : "Start Gratis"}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Al een account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Inloggen
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          14 dagen gratis proberen • Geen creditcard nodig
        </p>
      </div>
    </main>
  );
}
