import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-muted"
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white gradient-primary px-5 py-2.5 rounded-xl hover:opacity-90 shadow-lg shadow-violet-500/25"
            >
              Gratis Starten
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-100/60 via-purple-50/40 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-violet-100/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-violet-100">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            Nu beschikbaar voor salons in Nederland
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
            Reserveringen
            <br />
            <span className="gradient-text">moeiteloos geregeld</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            Het moderne reserveringssysteem voor kapsalons en beautysalons. 
            Klanten boeken online, jij beheert alles vanuit één overzichtelijk dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white gradient-primary font-semibold text-lg hover:opacity-90 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              Start Gratis →
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-border font-semibold text-lg hover:bg-muted hover:border-muted-foreground/20"
            >
              Bekijk Features
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            ✓ Gratis uitproberen &nbsp; ✓ Geen creditcard nodig &nbsp; ✓ Direct aan de slag
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alles wat je salon nodig heeft
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Van online boeken tot teambeheer — Clippr regelt het voor je
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📅",
                title: "Online Boeken",
                desc: "Klanten boeken 24/7 via je eigen professionele pagina. Automatische bevestigingen en herinneringen.",
                gradient: "from-violet-500/10 to-purple-500/5",
              },
              {
                icon: "👥",
                title: "Team Beheer",
                desc: "Medewerkers met hun specialisaties, roosters, vakanties en ziekmeldingen. Alles op één plek.",
                gradient: "from-blue-500/10 to-indigo-500/5",
              },
              {
                icon: "📊",
                title: "Slim Dashboard",
                desc: "Overzichtelijke agenda met dag- en weekweergave. Zie in één oogopslag wat er speelt.",
                gradient: "from-emerald-500/10 to-teal-500/5",
              },
              {
                icon: "✨",
                title: "Behandelingen",
                desc: "Categoriseer je diensten, stel prijzen in en koppel ze aan de juiste medewerkers.",
                gradient: "from-amber-500/10 to-orange-500/5",
              },
              {
                icon: "📱",
                title: "Mobiel Vriendelijk",
                desc: "Werkt perfect op telefoon, tablet en desktop. Voor jou én je klanten.",
                gradient: "from-pink-500/10 to-rose-500/5",
              },
              {
                icon: "📧",
                title: "Automatische Emails",
                desc: "Bevestigingen bij boeking, herinneringen 24 uur vooraf, en annuleringen.",
                gradient: "from-cyan-500/10 to-sky-500/5",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-white/60 hover:shadow-xl hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 gradient-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om te groeien?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Sluit je aan bij salons die hun werkdag makkelijker maken met Clippr
          </p>
          
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-4 rounded-2xl text-white gradient-primary font-semibold text-lg hover:opacity-90 shadow-xl shadow-violet-500/25"
          >
            Start Nu — Het is Gratis
          </Link>

          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            {[
              { value: "24/7", label: "Online boeken" },
              { value: "0%", label: "Commissie" },
              { value: "< 2 min", label: "Setup tijd" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 Clippr. Een product van 1Company.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Inloggen</Link>
            <Link href="/register" className="hover:text-foreground">Registreren</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
