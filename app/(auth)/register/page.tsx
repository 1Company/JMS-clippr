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

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: "",
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`);
      } else {
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
    <main className="min-h-screen flex items-center justify-center p-6 gradient-subtle relative overflow-hidden">
      <div className="absolute top-10 left-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tight mb-3">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <p className="text-muted-foreground">Start gratis met je salon</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {/* Progress */}
          <div className="flex gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  s <= step ? "gradient-primary" : "bg-muted"
                }`} />
                <span className={`text-xs ${s <= step ? "text-violet-600 font-medium" : "text-muted-foreground"}`}>
                  {s === 1 ? "Salon" : "Jouw gegevens"}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Hoe heet je salon?
                  </label>
                  <input
                    type="text"
                    value={formData.salonName}
                    onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
                    placeholder="Kapsalon De Schaar"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.salonName}
                  className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20"
                >
                  Volgende →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Je naam
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
                    placeholder="Jan Jansen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Emailadres
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
                    placeholder="jan@kapsalon.nl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">
                    Telefoonnummer <span className="text-muted-foreground font-normal">(optioneel)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
                    placeholder="06 12345678"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 px-4 rounded-xl border-2 border-border font-semibold hover:bg-muted"
                  >
                    ← Terug
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.email}
                    className="flex-1 py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Aanmaken...
                      </span>
                    ) : "Start Gratis ✨"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Al een account?{" "}
          <Link href="/login" className="text-violet-600 font-medium hover:text-violet-700 hover:underline underline-offset-4">
            Inloggen
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3">
          14 dagen gratis · Geen creditcard nodig
        </p>
      </div>
    </main>
  );
}
