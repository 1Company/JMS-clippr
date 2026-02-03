import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Logo */}
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-primary">✂️</span> Clippr
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Modern reserveringssysteem voor kapsalons en beautysalons
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold mb-1">Online Boeken</h3>
            <p className="text-sm text-muted-foreground">
              Klanten boeken 24/7 via je eigen pagina
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-1">Team Beheer</h3>
            <p className="text-sm text-muted-foreground">
              Skills, roosters, vakanties & ziekmeldingen
            </p>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Automatische email & SMS herinneringen
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            Start Gratis
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border font-semibold hover:bg-accent transition"
          >
            Inloggen
          </Link>
        </div>

        {/* Status */}
        <p className="mt-12 text-sm text-muted-foreground">
          🚧 In development — Coming soon
        </p>
      </div>
    </main>
  );
}
