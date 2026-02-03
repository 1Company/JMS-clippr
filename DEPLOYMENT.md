# Clippr - Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1Company/JMS-clippr)

---

## 1. Prerequisites

- [Vercel Account](https://vercel.com)
- [Neon Database](https://neon.tech) (PostgreSQL)
- [Resend Account](https://resend.com) (Email - optional)

---

## 2. Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret for auth sessions | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://clippr.nl` |

### Optional (Email)

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender email address | `Clippr <noreply@clippr.nl>` |

### Optional (Cron)

| Variable | Description | Example |
|----------|-------------|---------|
| `CRON_SECRET` | Secret to protect cron endpoints | Generate with: `openssl rand -base64 32` |

---

## 3. Database Setup

### Option A: Use Existing Neon Database
If you already have a Neon database, just use a different schema:
```
DATABASE_URL="postgresql://...?schema=clippr"
```

### Option B: Create New Neon Project
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string
4. Add to Vercel environment variables

### Push Schema
After deploy, run once to create tables:
```bash
npx prisma db push
```

Or in Vercel, add a build command:
```bash
prisma generate && prisma db push && next build
```

---

## 4. Deploy Steps

### Via Vercel Dashboard
1. Import Git Repository: `1Company/JMS-clippr`
2. Set environment variables (see above)
3. Deploy!

### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd JMS-clippr
vercel --prod
```

---

## 5. Post-Deploy Setup

### Custom Domain (Optional)
1. Vercel → Project → Domains
2. Add your domain (e.g., `clippr.nl`)
3. Update DNS records
4. Update `NEXTAUTH_URL` to match

### Email Setup (Resend)
1. Create account at [resend.com](https://resend.com)
2. Verify your domain (for custom from address)
3. Create API key
4. Add `RESEND_API_KEY` to Vercel

### Cron Jobs
Vercel automatically runs the cron defined in `vercel.json`:
- **Reminders**: Daily at 8:00 UTC (`/api/cron/reminders`)

To test manually:
```bash
curl https://your-domain.vercel.app/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 6. Configuration Summary

```env
# === REQUIRED ===
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require&schema=clippr"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="https://clippr.nl"

# === OPTIONAL: Email ===
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="Clippr <noreply@clippr.nl>"

# === OPTIONAL: Cron Protection ===
CRON_SECRET="another-random-secret"
```

---

## 7. First Salon Setup

After deployment:

1. Go to `/register`
2. Create your first salon account
3. Add staff members (Team page)
4. Add services/treatments
5. Share booking link: `https://yourdomain.com/book/[salon-slug]`

---

## 8. Monitoring

### Vercel Dashboard
- View deployments
- Check function logs
- Monitor usage

### Database (Neon)
- View tables in Neon console
- Check connection limits

---

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` is correct
- Ensure Neon project is active
- Check if using pooler URL (recommended)

### "Auth not working"
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

### "Emails not sending"
- Verify `RESEND_API_KEY` is valid
- Check Resend dashboard for errors
- Verify domain if using custom from address

---

## Tech Stack Reference

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

---

## Support

- GitHub: https://github.com/1Company/JMS-clippr
- Issues: https://github.com/1Company/JMS-clippr/issues
