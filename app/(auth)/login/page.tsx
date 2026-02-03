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
        setError("Ongeldige inloggegevens");
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
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="jouw@email.nl"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Laden..." : "Inloggen"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Nog geen account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registreer je salon
          </Link>
        </p>
      </div>

      <div className="mt-4 p-3 rounded-md bg-muted text-xs">
        <p className="font-medium">🧪 Development Mode</p>
        <p>Gebruik wachtwoord: <code className="bg-background px-1 rounded">demo</code></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">
            <span className="text-primary">✂️</span> Clippr
          </Link>
          <p className="text-muted-foreground mt-2">Log in om je salon te beheren</p>
        </div>

        <Suspense fallback={<div className="bg-card rounded-lg border p-6 animate-pulse h-80" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
