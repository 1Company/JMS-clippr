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
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center animate-slide-up">
          ✅ Account aangemaakt! Log hieronder in.
        </div>
      )}

      <div className="glass-card rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/80">
              Emailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
              placeholder="jouw@email.nl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground/80">
              Wachtwoord <span className="text-muted-foreground font-normal">(optioneel)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 focus:bg-white placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Even geduld...
              </span>
            ) : "Inloggen"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 gradient-subtle relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tight mb-3">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <p className="text-muted-foreground">Welkom terug bij je salon</p>
        </div>

        <Suspense fallback={
          <div className="glass-card rounded-3xl p-8">
            <div className="space-y-5">
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
              <div className="h-12 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Nog geen account?{" "}
          <Link href="/register" className="text-violet-600 font-medium hover:text-violet-700 hover:underline underline-offset-4">
            Registreer je salon
          </Link>
        </p>
      </div>
    </main>
  );
}
