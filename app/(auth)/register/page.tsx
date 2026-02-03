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
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-subtle" />

      <div className="w-full max-w-[420px] relative">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight mb-2">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <p className="text-muted-foreground text-sm">Start gratis met je salon</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/60 shadow-elevated p-7 sm:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Progress */}
          <div className="flex gap-3 mb-7">
            {[
              { num: 1, label: "Salon" },
              { num: 2, label: "Jouw gegevens" },
            ].map((s) => (
              <div key={s.num} className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-all duration-300 ${
                    s.num < step 
                      ? "bg-emerald-500 text-white" 
                      : s.num === step 
                        ? "gradient-primary text-white shadow-sm shadow-violet-500/20" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {s.num < step ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : s.num}
                  </div>
                  <span className={`text-xs font-medium ${s.num <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  s.num <= step ? "gradient-primary" : "bg-muted"
                }`} />
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-sm animate-slide-up flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hoe heet je salon?
                  </label>
                  <input
                    type="text"
                    value={formData.salonName}
                    onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
                    placeholder="Kapsalon De Schaar"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Dit wordt zichtbaar voor je klanten</p>
                </div>

                <button
                  type="button"
                  onClick={() => formData.salonName && setStep(2)}
                  disabled={!formData.salonName}
                  className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
                >
                  Volgende
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Je naam</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
                    placeholder="Jan Jansen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emailadres</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
                    placeholder="jan@kapsalon.nl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Telefoonnummer</label>
                    <span className="text-xs text-muted-foreground">optioneel</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
                    placeholder="06 12345678"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 px-4 rounded-xl border-2 border-border/80 font-semibold hover:bg-muted/50 hover:border-border flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Terug
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.email}
                    className="flex-1 py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Aanmaken...
                      </>
                    ) : "Start Gratis ✨"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-6 space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground">
            Al een account?{" "}
            <Link href="/login" className="text-violet-600 font-medium hover:text-violet-700 underline underline-offset-4 decoration-violet-200 hover:decoration-violet-400">
              Inloggen
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            14 dagen gratis · Geen creditcard nodig
          </p>
        </div>
      </div>
    </main>
  );
}
