# ✂️ Clippr

> Modern salon booking platform voor kapsalons en beautysalons

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()

## 🎯 Wat is Clippr?

Clippr is een gebruikersvriendelijk reserveringssysteem voor salons. Klanten kunnen 24/7 online afspraken maken, terwijl beheerders volledige controle houden over de agenda.

### Voor Klanten
- Online reserveren (binnen openingstijden)
- Behandeling kiezen → beschikbare medewerkers zien
- Voorkeursmedewerker onthouden
- Afspraken eenvoudig wijzigen/annuleren

### Voor Salons
- Team beheer met skills per medewerker
- Flexibel werkrooster per medewerker
- Vakantie en ziekmelding beheer
- Handmatig inplannen (ook buiten uren)
- Overzichtelijke agenda (dag/week/maand)

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js

## 🚀 Getting Started

```bash
# Clone de repo
git clone https://github.com/1Company/JMS-clippr.git
cd JMS-clippr

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Vul DATABASE_URL en andere secrets in

# Database setup
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login/register pages
│   ├── (dashboard)/       # Beheerder dashboard
│   ├── book/[slug]/       # Publieke booking pagina
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & helpers
├── prisma/               # Database schema
└── public/               # Static assets
```

## 📋 Roadmap

Zie [TODO.md](./TODO.md) voor de volledige roadmap en progress.

## 📄 License

Proprietary - © 1Company
