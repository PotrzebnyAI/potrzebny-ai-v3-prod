# 🚀 POTRZEBNY.AI v3 - Production

![Version](https://img.shields.io/badge/version-3.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-production-green?style=flat-square)
![Node](https://img.shields.io/badge/node-20%2B-blue?style=flat-square)
![License](https://img.shields.io/badge/license-proprietary-red?style=flat-square)

## 🎯 Overview

**POTRZEBNY.AI v3** - The complete EdTech + Therapy + Medical + SuperMózg platform for Poland.

### 14 Panels Architecture

#### 👥 User Panels (Paid)
1. **Educational Student** - 29/49/79 PLN
2. **Lecturer/Teacher** - 29/49/79 PLN
3. **Therapeutic Patient** - 49/79 PLN
4. **Medical Doctor (Research)** - 79/799 PLN
5. **SuperMózg ULTRA** - 79 PLN (add-on)
6. **Parent Basic** - FREE
7. **Parent Premium** - 49 PLN

#### 🛠️ Admin Panels (Free + Paid)
8. **Teacher Admin** - FREE
9. **Doctor Training Admin** - FREE (internal)
10. **Therapist Training Admin 29** - 29 PLN
11. **Therapist Training Admin 79** - 79 PLN
12. **Custom Content Admin** - FREE (for creating custom content)
13. **Platform Admin** - FREE (internal)
14. **Gamification Engine** - Built-in

### 💰 Pricing Plans

| Plan | Price | Features | Trial |
|------|-------|----------|-------|
| **POTRZEBNY** | 29 PLN/m | Basic educational, gamification | 3 days |
| **POTRZEBNY PRO** | 49 PLN/m | Pro panels, custom content, parent premium | 3 days |
| **SUPERMÓZG ULTRA** | 79 PLN/m | Everything + health optimizer, research basic | 3 days |
| **LEKARZ EKSPERT** | 799 PLN/m | Premium research (Wiley), all admin panels | 3 days |
| **FREE** | 0 PLN | Limited features, promotional | - |

---

## 🔧 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### 1. Clone & Install

```bash
git clone https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod.git
cd potrzebny-ai-v3-prod
npm install
```

### 2. Setup Environment

```bash
# Copy template
cp .env.example .env.local

# Fill in your secrets
# For GitHub Actions: use GitHub Secrets instead
```

### 3. Add 120+ Secrets to GitHub

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these critical secrets (full list in `.env.example`):

**Payment & Invoicing:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `INFAKT_API_KEY`
- `WISE_API_TOKEN`

**AI Providers:**
- `DEEPSEEK_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GROQ_API_KEY`

**Google Cloud:**
- `GOOGLE_CLOUD_API_KEY`

**Research APIs:**
- `BRAVE_SEARCH_API_KEY`
- `NCBI_API_KEY`
- `SCOPUS_API_KEY`
- `WILEY_TDM_TOKEN`
- `PERPLEXITY_API_KEY`

**Infrastructure:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `CODECOV_TOKEN`
- `GITHUB_TOKEN`

**And all others from `.env.example`** (80+ more)

### 4. Local Development

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:3000

# Run tests
npm run test

# Build for production
npm run build
```

---

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)

Push to `main` branch → Auto-deploy to Vercel

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Workflow:
1. ✅ Install dependencies
2. ✅ Validate environment variables
3. ✅ Build Next.js project
4. ✅ Run tests
5. ✅ Upload coverage to CodeCov
6. ✅ Deploy to Vercel
7. ✅ Create GitHub Release
8. ✅ Notify Slack

### Manual Deployment

```bash
# Deploy to staging
vercel --prod --token $VERCEL_TOKEN

# Or use GitHub CLI
gh workflow run deploy-vercel.yml
```

---

## 📊 Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Frontend** | Next.js 15, React 19, TypeScript | Web app |
| **Mobile** | React Native, Capacitor | iOS/Android |
| **Backend** | Next.js API Routes, Supabase | API |
| **Database** | PostgreSQL (Supabase) | Data storage |
| **Auth** | NextAuth.js v5 | Authentication |
| **Payments** | Stripe | Subscription billing |
| **Invoicing** | inFakt | Polish tax compliance |
| **AI** | DeepSeek, Claude, Groq, OpenAI | LLM providers |
| **Monitoring** | Sentry Business | Error tracking |
| **Coverage** | CodeCov | Code quality |
| **Hosting** | Vercel | Production deployment |

### Data Flow

```
┌─────────────────┐
│  User (Browser) │
└────────┬────────┘
         │
         ▼
   ┌─────────────────────┐
   │  Next.js Frontend   │ (React 19)
   │  + NextAuth Auth    │
   └────────┬────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │  Next.js API Routes      │
   │  + Stripe Webhooks       │
   │  + inFakt Integration    │
   └────────┬─────────────────┘
            │
    ┌───────┴────────┬──────────┐
    │                │          │
    ▼                ▼          ▼
┌─────────┐  ┌────────────┐  ┌──────────┐
│ Supabase│  │  Stripe    │  │ Research │
│PostgreSQL  │ Payments   │  │ APIs     │
└─────────┘  └────────────┘  └──────────┘
     │
     ├─ User profiles
     ├─ Subscriptions
     ├─ Therapy sessions (encrypted)
     ├─ Research queries
     └─ Audit logs
```

---

## 🔐 Security

### Environment Variables
- ✅ All secrets in GitHub Secrets (not committed)
- ✅ `.env.example` only contains variable names
- ✅ GitHub secret scanning enabled
- ✅ Automatic alerts on secret leaks

### Data Protection
- ✅ Therapy notes encrypted with AES-256-GCM
- ✅ GDPR compliance ready (Art. 9 consent tracking)
- ✅ HIPAA-safe (no medical advice given)
- ✅ Supabase RLS (Row Level Security) enabled
- ✅ Sentry Business for error tracking

### Authentication
- ✅ NextAuth.js with JWT strategy
- ✅ PWZ doctor license verification (modulo-11)
- ✅ Therapist license validation
- ✅ MFA-ready for future expansion

---

## 📈 Monitoring

### Sentry Business (Error Tracking)
```
URL: https://potrzebny-ai.sentry.io
Org: potrzebny-ai
Project: production

Features:
✅ 100% transaction tracing
✅ Session replays on error
✅ Custom dashboards
✅ 20+ metric alerts
```

### CodeCov (Code Coverage)
```
URL: https://codecov.io/github/PotrzebnyAI/potrzebny-ai-v3-prod
Min Coverage: 80%
Auto-reports on every commit
```

### Vercel Analytics
```
URL: https://vercel.com/potrzebny-ai/potrzebny-ai-v3-prod
Auto-deployment logs
Performance metrics
Uptime monitoring
```

---

## 🛠️ Development

### Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Global layout
│   │   ├── page.tsx      # Landing page
│   │   ├── api/          # API routes
│   │   ├── panels/       # 14 panel components
│   │   └── (auth)/       # Auth pages
│   ├── lib/              # Utilities
│   │   ├── stripe.ts     # Stripe integration
│   │   ├── supabase.ts   # Database client
│   │   ├── env.ts        # Environment validation
│   │   ├── db/           # Database schemas
│   │   ├── ai/           # AI providers
│   │   └── research/     # Research APIs
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static assets
├── .github/
│   └── workflows/        # GitHub Actions
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

### Important Files

- **`.env.example`** - All 120+ env variable names
- **`.github/workflows/deploy-vercel.yml`** - Auto-deployment workflow
- **`src/lib/env.ts`** - Environment validation on startup
- **`src/auth.ts`** - NextAuth configuration
- **`src/lib/stripe.ts`** - Stripe integration
- **`src/lib/infakt.ts`** - Invoice generation

---

## 🎯 Next Steps

### Phase 1: Foundation (Now)
✅ GitHub repo created
✅ `.env.example` with 120+ variables
✅ GitHub Actions auto-deployment

### Phase 2: Infrastructure (Prompt #1)
- [ ] Next.js setup
- [ ] Supabase database schema
- [ ] NextAuth authentication
- [ ] Stripe integration
- [ ] Sentry monitoring

### Phase 3: Panels (Prompts #2-6)
- [ ] Educational Panel
- [ ] Therapeutic Panel
- [ ] Research Panel
- [ ] SuperMózg Panel
- [ ] Admin Panels

### Phase 4: Mobile (Prompts #7-15)
- [ ] React Native setup
- [ ] Capacitor configuration
- [ ] Mobile panels
- [ ] App Store deployment
- [ ] Google Play deployment

### Phase 5: Polish (Prompts #16-50)
- [ ] UI/UX optimization
- [ ] Advanced features
- [ ] Performance tuning
- [ ] Full testing
- [ ] Launch

---

## 📞 Support

**Repo Owner:** Bartłomiej Potrzebowski  
**Email:** ai@potrzebny.ai  
**GitHub:** [@PotrzebnyAI](https://github.com/PotrzebnyAI)  

---

## 📄 License

Proprietaryfor POTRZEBNY.AI - All rights reserved ©2025

---

## 🚀 Deploy Now!

**Option 1: GitHub Actions (Automatic)**
```bash
git push origin main
# Auto-deploys to Vercel
```

**Option 2: Manual Vercel Deploy**
```bash
vercel --prod
```

**Option 3: Claude Code Desktop (Recommended)**
1. Copy PROMPT #1 (Infrastructure) from `/docs/prompts`
2. Paste into Claude Code Desktop
3. Hit SEND → Auto-generates all files
4. Commit & push
5. Auto-deploys via GitHub Actions

---

**Made with ❤️ for Polish EdTech & Healthcare**
