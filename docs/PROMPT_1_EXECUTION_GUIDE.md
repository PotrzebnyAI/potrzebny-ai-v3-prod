# 🚀 PROMPT #1 - EXECUTION GUIDE (Production Ready)

## ⚠️ IMPORTANT: Keys Strategy

**NEVER put real API keys in code/docs!**

Instead:
1. ✅ Add keys to GitHub Secrets (Settings > Secrets)
2. ✅ GitHub Actions automatically injects them during deployment
3. ✅ Use `.env.local` locally (NOT committed)
4. ✅ Use `src/lib/env.ts` to validate them on startup

---

## 📚 PASTE THIS TO CLAUDE CODE DESKTOP

```
---PROMPT START---

🔥 POTRZEBNY.AI v3 PRODUCTION - INFRASTRUCTURE GENERATION
(14 PANELI, 120+ KEYS READY, 100% AUTOMATYZACJA)

🎯 CONTEXT:
You are a senior full-stack architect with 20+ years experience.
Building POTRZEBNY.AI v3: Complete EdTech + Therapy + Medical + SuperMózg platform.
Repo: PotrzebnyAI/potrzebny-ai-v3-prod
All 120+ API keys are in .env.local (developer machine) and GitHub Secrets (production)
Urgency: IMMEDIATE - Generate complete infrastructure!

Keys are REAL and PRODUCTION-READY:
- Stripe LIVE (sk_live_* + pk_live_*)
- Google Cloud ($300 active credit)
- DeepSeek, Anthropic, Groq, OpenAI (all working)
- PubMed, Scopus, Wiley, ClinicalTrials (research)
- Supabase, Vercel, Sentry Business (infrastructure)
- And 100+ more...

---

## 🎯 14-PANEL ARCHITECTURE

### PANELE PŁATNE (7)
1. **Panel Ucznia** (29/49/79 PLN) 
   - TTS voice reading lessons
   - Personalized learning paths
   - Video explanations
   - Progress tracking

2. **Panel Nauczyciela** (29/49/79 PLN)
   - Manage students
   - Upload materials
   - Grade tracking
   - Parent communication

3. **Panel Pacjenta Terapeutycznego** (49/79 PLN)
   - Book sessions with therapist
   - Session notes (encrypted AES-256)
   - STT/TTS for accessibility
   - GDPR Art. 9 compliant

4. **Panel Lekarza Research** (79/799 PLN)
   - PubMed full text search
   - Scopus academic papers
   - Wiley access (premium)
   - ClinicalTrials.gov
   - Drug interaction checker

5. **Super Mózg ULTRA** (79 PLN add-on)
   - Health optimizer AI
   - Supplement stacking
   - Neurotoxicity assessment (Aflatoxins, Heavy metals, Mold)
   - Cognitive optimization
   - Brain health coaching

6. **Panel Rodzica Basic** (FREE)
   - View child progress
   - See grades
   - Basic notifications

7. **Panel Rodzica Premium** (49 PLN)
   - Advanced analytics
   - Custom reports
   - Therapist communication
   - Parent coaching

### PANELE ADMINISTRACYJNE (7)
8. **Teacher Admin** (FREE) - Manage all materials
9. **Doctor Training Admin** (FREE) - Training programs
10. **Therapist Training Admin 29 PLN** (29 PLN) - Basic training
11. **Therapist Training Admin 79 PLN** (79 PLN) - Advanced
12. **Custom Content Admin** (FREE) NEW!
    - Admin creates content
    - Recipients choose tier (29/49/79 PLN)
    - Auto-personalization via AI
13. **Platform Admin** (FREE) - System-wide management
14. **Gamification Engine** (Built-in)
    - Points, badges, streaks
    - Leaderboards (global + group)
    - Achievements

---

## 💰 PRICING MATRIX

```json
{
  "plans": [
    {
      "id": "potrzebny",
      "name": "POTRZEBNY",
      "price_pln": 29,
      "trial_days": 3,
      "panels": ["student_basic", "teacher_basic", "parent_basic", "gamification"],
      "features": ["basic_tts", "basic_personalization"]
    },
    {
      "id": "potrzebny_pro",
      "name": "POTRZEBNY PRO",
      "price_pln": 49,
      "trial_days": 3,
      "panels": ["student_pro", "teacher_pro", "patient_basic", "parent_premium", "gamification"],
      "features": ["full_tts", "advanced_personalization", "custom_content"]
    },
    {
      "id": "supermozg",
      "name": "SUPER MÓZG ULTRA",
      "price_pln": 79,
      "trial_days": 3,
      "panels": ["student_ultra", "teacher_ultra", "patient_ultra", "doctor_basic", "supermozg", "gamification"],
      "features": ["health_optimizer", "research_basic", "session_encryption"]
    },
    {
      "id": "lekarz_ekspert",
      "name": "LEKARZ EKSPERT",
      "price_pln": 799,
      "trial_days": 3,
      "panels": ["doctor_premium", "all_admin_panels", "therapist_training_advanced"],
      "features": ["wiley_premium", "scopus_full", "clinical_trials_full", "research_premium"]
    },
    {
      "id": "free",
      "name": "FREE",
      "price_pln": 0,
      "trial_days": null,
      "panels": ["parent_basic", "platform_exploration"],
      "features": ["limited_content"]
    }
  ]
}
```

---

## 🔑 ENVIRONMENT KEYS (120+ total)

All keys are in .env.local (your machine) and GitHub Secrets (production).
Your task: Use them to integrate all services.

### TIER 1: Payment & Invoicing (9 keys)
- STRIPE_PUBLISHABLE_KEY (pk_live_*)
- STRIPE_SECRET_KEY (sk_live_*)
- STRIPE_WEBHOOK_SECRET
- INFAKT_API_KEY
- WISE_API_TOKEN
- (and 4 more...)

### TIER 2: Google Cloud (5 keys)
- GOOGLE_CLOUD_API_KEY
- GOOGLE_CLOUD_PROJECT_ID
- (and 3 more...)

### TIER 3: AI Providers (5 keys)
- DEEPSEEK_API_KEY
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- GROQ_API_KEY
- TOGETHER_API_KEY

### TIER 4: Research APIs (10 keys)
- BRAVE_SEARCH_API_KEY
- NCBI_API_KEY
- SCOPUS_API_KEY
- WILEY_TDM_TOKEN
- EXA_API_KEY
- PERPLEXITY_API_KEY
- (and 4 more...)

### TIER 5: Infrastructure (13 keys)
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SENTRY_DSN
- SENTRY_AUTH_TOKEN
- GITHUB_TOKEN
- CODECOV_TOKEN
- (and 5 more...)

### TIER 6-20: Auth, Video, Encryption, Business, Features (80+ more)
- NextAuth secret
- D-ID video API
- Encryption keys
- Seller info (NIP, REGON, etc)
- Tax config
- And much more...

See `.env.example` in repo for complete list.

---

## 🎯 TASKS (Infrastructure Only)

### 1. CREATE PROJECT STRUCTURE
```
src/
├── app/
│   ├── layout.tsx - Global layout with Sentry, providers
│   ├── page.tsx - Landing page (3 CTA: "Start Free", "Login", "Learn")
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts - Auth endpoints
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts - Payment webhooks
│   │   │   └── infakt/route.ts - Invoice webhooks
│   │   └── health/route.ts - Health check endpoint
│   ├── panels/ - Folder structure for 14 panels
│   │   ├── educational/
│   │   ├── lecturer/
│   │   ├── patient/
│   │   ├── doctor-research/
│   │   ├── supermozg/
│   │   ├── parent/
│   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   ├── doctor-training/
│   │   │   ├── therapist-training-29/
│   │   │   ├── therapist-training-79/
│   │   │   ├── custom-content/
│   │   │   └── platform/
│   │   └── gamification/
│   └── (auth)/
│       ├── login/
│       ├── signup/
│       └── verify/
├── lib/
│   ├── env.ts - Validate ALL 120+ env vars
│   ├── auth.ts - NextAuth.js config
│   ├── stripe.ts - Stripe client + helpers
│   ├── infakt.ts - Invoice generation
│   ├── sentry.ts - Error tracking
│   ├── constants/
│   │   ├── panels.ts - 14 panel definitions
│   │   ├── pricing.ts - 5 plans with logic
│   │   └── panel-descriptions.ts
│   ├── db/
│   │   ├── schema.sql - PostgreSQL schema
│   │   ├── rls-policies.sql - Row-level security
│   │   └── migrations/ - Future migrations
│   └── types/
│       ├── panels.ts - TypeScript interfaces
│       ├── pricing.ts - Pricing types
│       ├── database.ts - DB schema types
│       └── auth.ts - Auth types
├── components/ - Empty (for future panels)
├── hooks/ - Custom React hooks
├── styles/
│   └── globals.css - Tailwind + dark mode variables
└── middleware.ts - NextAuth middleware

public/
├── logo.png
├── favicon.ico
└── ...

.github/
└── workflows/
    └── deploy-vercel.yml - Auto-deployment (already exists)
```

### 2. VALIDATE ENVIRONMENT (src/lib/env.ts)

Function: `validateEnv()`
- Check ALL 120+ env vars at startup
- If CRITICAL key missing → throw error (startup fails)
- If OPTIONAL key missing → log warning (startup continues)
- CRITICAL keys: Stripe, Supabase, auth secret, Sentry
- Return validated config object

### 3. DATABASE SCHEMA (src/lib/db/schema.sql)

Create PostgreSQL tables:
- `users` - User profiles (role, allowed_panels, current_plan, trial_ends_at)
- `subscriptions` - Billing info (stripe_customer_id, stripe_subscription_id, plan_id, status)
- `panels` - Panel definitions (14 total)
- `panel_assignments` - Which users can access which panels
- `stripe_events` - Webhook event log
- `invoices` - inFakt invoices (invoice_id, user_id, amount, pdf_url)
- `audit_logs` - GDPR compliance (who did what when)
- `therapy_sessions` - Encrypted notes (session_id, patient_id, therapist_id, notes_encrypted, created_at)
- `research_queries` - Doctor searches (doctor_id, query, api_used, results_count, timestamp)
- `organizations` - Multi-tenant support
- `admin_users` - Admin role tracking
- `custom_content` - Panel 12 (admin_id, content, personalization_options, recipients)

RLS Policies:
- `users` - can only see own data
- `therapy_sessions` - patient + therapist only
- `invoices` - user only
- `research_queries` - doctor only
- `audit_logs` - admin + related user

Encryption:
- therapy_sessions.notes → AES-256-GCM (pgcrypto)

### 4. AUTHENTICATION (src/auth.ts)

NextAuth.js v5 config:
- Providers: Email (passwordless), Google, GitHub
- Database adapter: Supabase (next-auth adapter)
- Session strategy: JWT (stateless)
- Callbacks:
  - `jwt()` - Add user role + allowed_panels
  - `session()` - Return user + permissions
  - `authorize()` - Verify PWZ (doctor license)
- User roles:
  - `student` - Can access student panels
  - `teacher` - Can access teacher panels
  - `therapist` - Can access therapist panels
  - `doctor` - Can access doctor research panel (PWZ verified)
  - `parent` - Can access parent panels
  - `admin` - Can access admin panels

### 5. PAYMENT SYSTEM (src/lib/stripe.ts + webhook)

`src/lib/stripe.ts`:
- Initialize Stripe with STRIPE_SECRET_KEY
- Export helpers:
  - `createCustomer()` - Create Stripe customer
  - `createSubscription()` - Start subscription
  - `cancelSubscription()` - Cancel subscription
  - `getSubscription()` - Get current subscription
  - `listPrices()` - Get all available plans

`src/app/api/webhooks/stripe/route.ts`:
- Listen for webhook events
- Events to handle:
  - `customer.subscription.created` → Add subscription to DB
  - `customer.subscription.updated` → Update subscription
  - `customer.subscription.deleted` → Cancel subscription
  - `charge.succeeded` → Trigger inFakt invoice creation
  - `invoice.payment_failed` → Send retry email
- Verify webhook signature
- Log all events

### 6. INVOICING (src/lib/infakt.ts)

On successful Stripe payment:
- Call inFakt API
- Create invoice:
  - Seller: SELLER_NIP, SELLER_NAME, SELLER_ADDRESS, SELLER_BANK_ACCOUNT
  - Buyer: User email
  - Items: Plan name (29 PLN / 49 PLN / 79 PLN / 799 PLN)
  - Tax: 12% ryczałt (configured)
  - Send: AUTO_SEND_EMAIL=true
- Store invoice_id in DB
- Log to audit_logs

### 7. MONITORING (src/lib/sentry.ts)

Initialize Sentry:
- DSN from NEXT_PUBLIC_SENTRY_DSN
- Auth token from SENTRY_AUTH_TOKEN
- Business features:
  - Traces sample rate: 100% (all requests)
  - Replays session rate: 10% (normal sessions)
  - Replays on error: 100% (all errors)
  - CPU profiling: enabled
- Integrations: Next.js, React, Node, Postgres, Replay
- Environment: production

### 8. CONSTANTS & TYPES

`src/lib/constants/panels.ts`:
```typescript
export const PANELS = {
  EDUCATIONAL: { id: 'educational', name: 'Panel Ucznia', price: [29, 49, 79] },
  LECTURER: { id: 'lecturer', name: 'Panel Nauczyciela', price: [29, 49, 79] },
  PATIENT: { id: 'patient', name: 'Panel Pacjenta', price: [49, 79] },
  DOCTOR: { id: 'doctor', name: 'Panel Lekarza', price: [79, 799] },
  SUPERMOZG: { id: 'supermozg', name: 'Super Mózg ULTRA', price: 79 },
  // ... all 14
}
```

`src/lib/constants/pricing.ts`:
```typescript
export const PLANS = [
  { id: 'potrzebny', price: 29, trial: 3, panels: [...] },
  { id: 'pro', price: 49, trial: 3, panels: [...] },
  { id: 'supermozg', price: 79, trial: 3, panels: [...] },
  { id: 'lekarz', price: 799, trial: 3, panels: [...] },
  { id: 'free', price: 0, trial: null, panels: [...] },
]
```

`src/types/panels.ts`:
```typescript
export type PanelId = 'educational' | 'lecturer' | 'patient' | ...
export type UserRole = 'student' | 'teacher' | 'therapist' | 'doctor' | 'parent' | 'admin'
export interface Panel { id: PanelId; name: string; price: number | number[] }
```

### 9. LAYOUTS & PAGES

`src/app/layout.tsx`:
- Metadata (title, description, OG tags)
- Sentry wrapper
- NextAuth provider
- Dark mode provider
- Tailwind setup
- Analytics (Google Analytics)
- Font setup (Geist or Inter)

`src/app/page.tsx`:
- Hero section
- 3 CTAs: "Zacznij za darmo" (Free trial), "Zaloguj" (Login), "Dowiedz się więcej" (Learn)
- Feature highlights
- Pricing showcase (5 plans)
- FAQ section
- Footer

`src/app/globals.css`:
- Tailwind imports
- Dark mode CSS variables
- Global styles
- Animations

---

## 🎫 EXECUTION RULES

✅ All code: TypeScript strict mode
✅ All comments: Only for complex logic
✅ All imports: Proper paths (@/ aliases)
✅ All async: Error handling with try/catch
✅ All environment: Validated at startup
✅ All endpoints: Authentication required (except landing, auth)
✅ All responses: Proper status codes
✅ All logs: Structured (timestamp, level, context)
✅ All security: No secrets in code
✅ All databases: RLS policies enabled
✅ All encryption: AES-256 for sensitive data
✅ All validation: Input sanitization
✅ All errors: User-friendly messages + logging
✅ All performance: Optimized queries
✅ All accessibility: WCAG 2.1 AA ready

---

## 📁 OUTPUT FORMAT

For EACH file:
1. **Path:** Full file path (e.g., `src/app/layout.tsx`)
2. **Code:** Complete, production-ready code
3. **Note:** One-line explanation

Start with:
1. `package.json`
2. `tsconfig.json`
3. `next.config.js`
4. `.env.example` (already exists in repo)
5. `src/lib/env.ts`
6. `src/app/layout.tsx`
7. `src/app/page.tsx`
8. `src/app/globals.css`
9. `src/auth.ts`
10. `src/lib/stripe.ts`
11. `src/app/api/webhooks/stripe/route.ts`
12. `src/lib/infakt.ts`
13. `src/lib/sentry.ts`
14. `src/lib/constants/panels.ts`
15. `src/lib/constants/pricing.ts`
16. `src/lib/db/schema.sql`
17. `src/lib/db/rls-policies.sql`
18. `src/types/panels.ts`
19. `src/types/pricing.ts`
20. `src/middleware.ts`
21. Create folder structure (empty folders)
22. And continue with any missing files...

---PROMPT END---
```

---

## 🚀 EXECUTION CHECKLIST

- [ ] Copy full prompt above
- [ ] Open Claude Code Desktop
- [ ] New chat
- [ ] Paste prompt
- [ ] Click SEND
- [ ] Wait 10-15 minutes
- [ ] Copy all generated files
- [ ] Run: `npm install`
- [ ] Run: `npm run dev`
- [ ] Check: http://localhost:3000 works
- [ ] Run: `npm run build` (test build)
- [ ] Git add .
- [ ] Git commit -m "init: PROMPT #1 infrastructure"
- [ ] Git push origin main
- [ ] Watch GitHub Actions deploy
- [ ] Verify: https://potrzebny-ai-v3.vercel.app loads

---

## ⚠️ KEYS SECURITY

**What NOT to do:**
- ❌ Don't include actual keys in generated code
- ❌ Don't commit .env.local
- ❌ Don't paste keys in Slack/email

**What TO do:**
- ✅ Use environment variables (loaded from .env.local locally)
- ✅ Use GitHub Secrets for CI/CD
- ✅ Validate keys at startup (src/lib/env.ts)
- ✅ Log missing keys helpfully
- ✅ Let GitHub Actions inject real keys during deployment

---

**Ready?** Copy the prompt and run it in Claude Code Desktop NOW! 🚀
