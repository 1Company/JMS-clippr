# Clippr - TODO & Roadmap

> Modern salon booking platform voor kapsalons en beautysalons
> Status: 🚧 In Development

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

### Fase 3: Beschikbaarheid (Week 2-3) ⬜
- [ ] Werkrooster beheer
  - [ ] Per medewerker per dag (ma-zo)
  - [ ] Begin- en eindtijd
  - [ ] Pauzes
- [ ] Vakantie beheer
  - [ ] Periode invoeren (van-tot)
  - [ ] Notitie/reden (optioneel)
  - [ ] Conflict check met bestaande afspraken
- [ ] Ziekmeldingen
  - [ ] Ad-hoc ziek melden
  - [ ] Verwachte terugkeer
  - [ ] Afspraken herverdelen/annuleren
- [ ] Salon openingstijden
  - [ ] Per dag van de week
  - [ ] Speciale dagen (feestdagen, etc.)

### Fase 4: Klant Booking (Week 3-4) ⬜
- [ ] Publieke booking pagina (salon.clippr.nl/[slug])
- [ ] Booking flow:
  1. [ ] Behandeling kiezen
  2. [ ] Medewerker kiezen (gefilterd op skills)
  3. [ ] "Eerste beschikbaar" optie
  4. [ ] Datum kiezen (alleen binnen openingstijden)
  5. [ ] Tijd kiezen (vrije slots)
  6. [ ] Contactgegevens invoeren
  7. [ ] Bevestiging
- [ ] Klant login (magic link)
- [ ] Voorkeursmedewerker opslaan
- [ ] Afspraak annuleren/verzetten

### Fase 5: Beheerder Agenda (Week 4-5) ⬜
- [ ] Dashboard overzicht
  - [ ] Vandaag's afspraken
  - [ ] Komende afspraken
  - [ ] Stats (week/maand)
- [ ] Agenda weergave
  - [ ] Dag view (alle medewerkers naast elkaar)
  - [ ] Week view
  - [ ] Maand view
- [ ] Handmatig afspraken inplannen
  - [ ] Ook buiten openingstijden
  - [ ] Walk-ins toevoegen
- [ ] Drag & drop afspraken verplaatsen
- [ ] Klantgeschiedenis bekijken

### Fase 6: Notificaties (Week 5-6) ⬜
- [ ] Email notificaties
  - [ ] Bevestiging bij nieuwe afspraak
  - [ ] Reminder (24u van tevoren)
  - [ ] Annulering bevestiging
  - [ ] Wijziging bevestiging
- [ ] SMS notificaties (optioneel, Twilio/MessageBird)
  - [ ] Zelfde triggers als email
  - [ ] Configurable per salon
- [ ] Push notificaties voor beheerders
  - [ ] Nieuwe boeking
  - [ ] Annulering
  - [ ] Klant no-show

### Fase 7: Polish & Launch ⬜
- [ ] Responsive design check
- [ ] Performance optimalisatie
- [ ] Error handling & logging
- [ ] Testing (unit + e2e)
- [ ] Documentatie
- [ ] Landing page
- [ ] Pricing pagina

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
