"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Account niet gevonden. Controleer je emailadres.");
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {registered && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm text-center animate-slide-up flex items-center justify-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Account aangemaakt! Log hieronder in.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border/60 shadow-elevated p-7 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-sm animate-slide-up flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Emailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
              placeholder="jouw@email.nl"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-sm font-medium">
                Wachtwoord
              </label>
              <span className="text-xs text-muted-foreground">optioneel</span>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border/80 bg-white focus:bg-white hover:border-border"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Even geduld...
              </>
            ) : "Inloggen"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function LoginPage() {
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
          <p className="text-muted-foreground text-sm">Welkom terug bij je salon</p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Suspense fallback={
            <div className="bg-white rounded-2xl border border-border/60 shadow-elevated p-7 sm:p-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded-xl animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-12 bg-muted rounded-xl animate-pulse" />
                </div>
                <div className="h-12 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Nog geen account?{" "}
          <Link href="/register" className="text-teal-600 font-medium hover:text-teal-700 underline underline-offset-4 decoration-teal-200 hover:decoration-teal-400">
            Registreer je salon
          </Link>
        </p>
      </div>
    </main>
  );
}
