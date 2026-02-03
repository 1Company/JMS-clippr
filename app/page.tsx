import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Online Boeken",
    desc: "Klanten boeken 24/7 via jouw eigen professionele pagina. Automatische bevestigingen en herinneringen.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Team Beheer",
    desc: "Medewerkers met specialisaties, roosters, vakanties en ziekmeldingen. Alles op één plek.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Slim Dashboard",
    desc: "Overzichtelijke agenda met dag- en weekweergave. Zie in één oogopslag wat er speelt.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Behandelingen",
    desc: "Categoriseer je diensten, stel prijzen in en koppel ze aan de juiste medewerkers.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Mobiel Klaar",
    desc: "Werkt perfect op telefoon, tablet en desktop. Voor jou én je klanten.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Herinneringen",
    desc: "Automatische bevestigingen bij boeking en herinneringen 24 uur vooraf.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "29",
    desc: "Perfect voor de zelfstandige kapper",
    features: ["1 medewerker", "Onbeperkt boekingen", "Online boekingspagina", "Email bevestigingen", "Basis dashboard"],
    cta: "Start Gratis",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "59",
    desc: "Voor salons die willen groeien",
    features: ["Tot 5 medewerkers", "Alles van Starter", "Team roosters", "Vakantie & ziekte beheer", "SMS herinneringen", "Klant database"],
    cta: "Meest Gekozen",
    highlighted: true,
  },
  {
    name: "Business",
    price: "99",
    desc: "Voor grotere salons en ketens",
    features: ["Onbeperkt medewerkers", "Alles van Professional", "Meerdere vestigingen", "Geavanceerde rapportages", "API toegang", "Prioriteit support"],
    cta: "Neem Contact Op",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="gradient-text">✂️ Clippr</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/80">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted/80">Prijzen</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-muted/80">
              Inloggen
            </Link>
            <Link href="/register" className="text-sm font-semibold text-white gradient-primary px-5 py-2.5 rounded-xl hover:opacity-90 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-px active:translate-y-0">
              Gratis Starten
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background - teal to cyan gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-teal-50" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-100/40 via-teal-100/30 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
        <div className="absolute top-60 left-0 w-72 h-72 bg-cyan-100/25 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-teal-100/80 shadow-soft animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            Nu beschikbaar voor salons in Nederland
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-balance animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Reserveringen
            <br />
            <span className="gradient-text">moeiteloos geregeld</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-balance leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Het moderne reserveringssysteem voor kapsalons en beautysalons. 
            Klanten boeken online, jij beheert alles vanuit één overzichtelijk dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white gradient-primary font-semibold text-lg hover:opacity-90 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/35 hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Gratis
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-border/80 font-semibold text-lg hover:bg-muted/50 hover:border-border"
            >
              Bekijk Features
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              14 dagen gratis
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Geen creditcard nodig
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              0% commissie
            </span>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF BAR ===== */}
      <section className="py-12 px-6 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "24/7", label: "Online boeken" },
              { value: "0%", label: "Commissie" },
              { value: "< 2 min", label: "Setup tijd" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-600 mb-3 uppercase tracking-wider">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Alles wat je salon nodig heeft
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Van online boeken tot teambeheer — Clippr regelt het voor je
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 stagger-children">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] hover:border-teal-200/80 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-100 group-hover:scale-105 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-600 mb-3 uppercase tracking-wider">Hoe het werkt</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">In 3 stappen klaar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: "01", title: "Maak je account", desc: "Registreer je salon in minder dan 2 minuten. Voeg je team en diensten toe." },
              { step: "02", title: "Deel je link", desc: "Stuur je unieke boekingslink naar klanten via WhatsApp, social media of je website." },
              { step: "03", title: "Ontvang boekingen", desc: "Klanten boeken zelf online. Jij ziet alles in je dashboard en agenda." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary text-white text-lg font-bold mb-5 shadow-lg shadow-teal-500/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-600 mb-3 uppercase tracking-wider">Prijzen</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Eerlijke, transparante prijzen</h2>
            <p className="text-lg text-muted-foreground">Geen verborgen kosten. Geen commissie. Vaste prijs per maand.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative w-full md:w-1/3 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-2 border-teal-200 shadow-elevated scale-[1.02] md:scale-105"
                    : "hover:border-teal-200/60 hover:shadow-medium"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg shadow-teal-500/20">
                    Meest Gekozen
                  </div>
                )}
                <CardContent className="p-7">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-5">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground">/mnd</span>
                  </div>
                  <Link
                    href="/register"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.highlighted
                        ? "gradient-primary text-white shadow-lg shadow-teal-500/20 hover:opacity-90 hover:-translate-y-px"
                        : "border-2 border-border hover:border-teal-200 hover:bg-teal-50"
                    }`}
                  >
                    {plan.highlighted ? "Start Gratis →" : plan.cta}
                  </Link>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om je salon te digitaliseren?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Start vandaag nog met Clippr en laat klanten online boeken. Geen verplichtingen.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white gradient-primary font-semibold text-lg hover:opacity-90 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/35 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Nu — Gratis
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-6 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold gradient-text">✂️ Clippr</span>
            <span className="text-sm text-muted-foreground">© 2026 · Een product van 1Company</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Inloggen</Link>
            <Link href="/register" className="hover:text-foreground">Registreren</Link>
            <Link href="#pricing" className="hover:text-foreground">Prijzen</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
