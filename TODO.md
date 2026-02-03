# Clippr - TODO & Roadmap

> Modern salon booking platform voor kapsalons en beautysalons
> Status: ✅ MVP Complete - Ready for Deployment

---

## 📋 Project Status

- **Repo aangemaakt:** 3 feb 2026
- **Laatste update:** 3 feb 2026
- **Fase:** Setup & Database Design

---

## 🎯 MVP Scope (Target: 4-6 weken)

### Fase 1: Foundation (Week 1) ✅
- [x] Repo aanmaken
- [x] Project structuur opzetten
- [x] Database schema ontwerpen (Prisma)
- [x] Next.js 14 project initialiseren
- [x] Tailwind CSS + shadcn/ui setup
- [x] Database connectie (Neon PostgreSQL)
- [x] Basis auth setup (NextAuth)
- [x] Login/Register pages
- [x] Dashboard layout
- [x] Onboarding flow

### Fase 2: Beheerder Backend (Week 2) ✅
- [x] Salon onboarding flow
- [x] Medewerkers CRUD
  - [x] Naam, telefoon, kleur
  - [x] Werkrooster per dag
  - [ ] Foto upload (later)
- [x] Behandelingen CRUD
  - [x] Naam, beschrijving, duur, prijs
  - [x] Categorie (knippen, kleuren, nagels, etc.)
- [x] Medewerker-Behandeling koppelingen
  - [x] Wie kan welke behandeling
  - [ ] Optioneel: aangepaste duur per medewerker (later)

### Fase 3: Beschikbaarheid (Week 2-3) ✅
- [x] Werkrooster beheer
  - [x] Per medewerker per dag (ma-zo)
  - [x] Begin- en eindtijd
  - [ ] Pauzes (later)
- [x] Vakantie beheer
  - [x] Periode invoeren (van-tot)
  - [x] Notitie/reden (optioneel)
  - [x] Getoond in team pagina
- [x] Ziekmeldingen
  - [x] Ad-hoc ziek melden
  - [x] Beter melden functie
  - [ ] Afspraken herverdelen (later)
- [x] Salon openingstijden
  - [x] Per dag van de week
  - [ ] Speciale dagen (feestdagen) - later

### Fase 4: Klant Booking (Week 3-4) ✅
- [x] Publieke booking pagina (/book/[slug])
- [x] Booking flow:
  1. [x] Behandeling kiezen (per categorie)
  2. [x] Medewerker kiezen (gefilterd op skills)
  3. [x] "Eerste beschikbaar" optie
  4. [x] Datum kiezen (14 dagen, alleen open dagen)
  5. [x] Tijd kiezen (vrije slots met conflict check)
  6. [x] Contactgegevens invoeren
  7. [x] Bevestiging scherm
- [ ] Klant login (magic link) - later
- [ ] Voorkeursmedewerker opslaan - later
- [ ] Afspraak annuleren/verzetten - later

### Fase 5: Beheerder Agenda (Week 4-5) ✅
- [x] Dashboard overzicht
  - [x] Vandaag's afspraken
  - [x] Komende afspraken
  - [x] Stats (vandaag/openstaand)
- [x] Agenda weergave
  - [x] Dag view (alle medewerkers naast elkaar)
  - [x] Week view
  - [ ] Maand view (later)
- [x] Handmatig afspraken inplannen
  - [x] Ook buiten openingstijden
  - [x] Walk-ins toevoegen (geen email vereist)
- [ ] Drag & drop afspraken verplaatsen (later)
- [ ] Klantgeschiedenis bekijken (later)

### Fase 6: Notificaties (Week 5-6) ✅
- [x] Email notificaties (Resend)
  - [x] Bevestiging bij nieuwe afspraak
  - [x] Reminder (24u van tevoren via Vercel Cron)
  - [x] Annulering template (ready)
  - [ ] Wijziging bevestiging (later)
- [ ] SMS notificaties (optioneel, Twilio/MessageBird) - later
- [ ] Push notificaties voor beheerders - later

### Fase 7: Polish & Launch ⬜
- [x] Responsive design (mobile-first)
- [ ] Performance optimalisatie
- [ ] Error handling & logging
- [ ] Testing (unit + e2e)
- [x] Deployment documentatie (DEPLOYMENT.md)
- [ ] Marketing landing page
- [ ] Pricing pagina

### Deployment ✅
- [x] Vercel configuratie (vercel.json)
- [x] Cron job voor reminders (8:00 UTC dagelijks)
- [x] Environment variables gedocumenteerd
- [x] Database schema ready for push

---

## 🔮 Post-MVP Features (Later)

### Betalingen
- [ ] Online betalen bij boeking
- [ ] Aanbetaling vereisen
- [ ] No-show fee
- [ ] Mollie/Stripe integratie

### Marketing
- [ ] Cadeaubonnen
- [ ] Kortingscodes
- [ ] Loyalty punten
- [ ] Review systeem
- [ ] Social media booking (Instagram, Facebook)

### Geavanceerd
- [ ] Multi-locatie support
- [ ] Wachtlijst bij volle agenda
- [ ] Rapportages & analytics
- [ ] Export naar boekhouding
- [ ] API voor externe integraties
- [ ] White-label optie
- [ ] Mobile app (React Native)

### Team Features
- [ ] Rollen & permissies
- [ ] Urenregistratie
- [ ] Commissie tracking
- [ ] Team chat/notities

---

## 🐛 Known Issues

*(Nog geen issues)*

---

## 📝 Beslissingen & Notities

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js (magic link + credentials)
- **Email:** Resend of SendGrid
- **SMS:** Twilio of MessageBird (optioneel)

### Design Beslissingen
- Behandeling-eerst booking flow (niet medewerker-eerst)
- Klanten kunnen alleen binnen openingstijden boeken
- Beheerders kunnen altijd boeken (ook buiten uren)
- Medewerkers moeten expliciet aan behandelingen gekoppeld worden

### Pricing Model (Concept)
| Plan | Prijs | Features |
|------|-------|----------|
| Starter | €29/mnd | 1 medewerker, basis booking |
| Professional | €59/mnd | 5 medewerkers, SMS reminders |
| Business | €99/mnd | Onbeperkt, custom branding |

---

## 📞 Contact

Project eigenaar: Arnold
AI Assistant: James
Repo: https://github.com/1Company/JMS-clippr
