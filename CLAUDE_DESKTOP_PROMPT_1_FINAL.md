# 🔥 CLAUDE CODE DESKTOP - PROMPT #1 FINAL
## COPY EVERYTHING BELOW & PASTE INTO CLAUDE - THEN CLICK SEND

---

```
🔥 POTRZEBNY.AI v3 - PRODUCTION INFRASTRUCTURE AUTO-GENERATION

📍 CONTEXT:
You are a senior full-stack architect building POTRZEBNY.AI v3 (EdTech + Therapy + Medical platform for Poland).
Repo: PotrzebnyAI/potrzebny-ai-v3-prod on GitHub
Tier: PRODUCTION (799 PLN LEKARZ EKSPERT)
All 120+ API keys ready in environment (GitHub Secrets + .env.local)
Urgency: IMMEDIATE FULL GENERATION - No delays, no placeholders

---

## 🎯 ARCHITEKTURA 14 PANELI (WYMAGANE)

### PANELE UŻYTKOWNIKA (PAID) - 7
1. **Educational (Uczeń/Student)** - 29/49/79 PLN
   - Text-to-Speech dla nauk nagrań
   - Personalized learning paths
   - Video explanations
   - Progress tracking & analytics
   - Quizzes & assessments

2. **Lecturer (Nauczyciel)** - 29/49/79 PLN
   - Student roster management
   - Material upload (PDF, video, images)
   - Grade tracking & feedback
   - Parent communication
   - Assignment creation

3. **Patient (Pacjent Terapeutyczny)** - 49/79 PLN
   - Session booking with therapist
   - Session notes (encrypted AES-256)
   - Speech-to-Text (STT) for notes
   - GDPR Art. 9 consent tracking
   - Therapy progress visualization
   - Secure messaging

4. **Doctor Research (Lekarz)** - 79/799 PLN
   - PubMed full text search
   - Scopus academic papers
   - Wiley journal access (premium)
   - ClinicalTrials.gov integration
   - Drug interaction checker
   - Research note organization

5. **Super Mózg ULTRA** - 79 PLN (add-on)
   - Health optimizer AI
   - Supplement stacking recommendations
   - Neurotoxicity assessment (aflatoxins, heavy metals, mold)
   - Cognitive optimization coaching
   - Brain health recommendations
   - Medical-grade analysis (non-diagnostic)

6. **Parent Basic** - FREE
   - View child progress
   - See grades & achievements
   - Notifications
   - Basic reports

7. **Parent Premium** - 49 PLN
   - Advanced analytics
   - Custom reports
   - Therapist communication
   - Parent coaching
   - Deep insights

### PANELE ADMINISTRACYJNE (FREE + PAID) - 7
8. **Teacher Admin** - FREE
   - Manage all educational materials
   - Batch upload
   - Content library

9. **Doctor Training Admin** - FREE
   - Training program management
   - Course creation
   - Student tracking

10. **Therapist Training Admin 29** - 29 PLN
    - Training modules (basic)
    - Exercise library
    - Certification tracking

11. **Therapist Training Admin 79** - 79 PLN
    - Advanced training (premium)
    - Case studies
    - Supervision tools

12. **Custom Content Admin** - FREE (NEW!)
    - Create custom educational content
    - Target specific professions (policjanci, ekoterroryści, budowniczy, etc.)
    - Recipients choose tier (29/49/79 PLN)
    - AI auto-personalizes content
    - Bulk distribution

13. **Platform Admin** - FREE
    - System-wide management
    - User analytics
    - Billing management
    - Support tickets

14. **Gamification Engine** - Built-in
    - Points & badges
    - Streaks (daily login bonus)
    - Leaderboards (global + group)
    - Achievements
    - Progress milestones

---

## 💰 PRICING MATRIX (5 PLANÓW)

```json
{
  "plans": [
    {
      "id": "potrzebny",
      "name": "POTRZEBNY",
      "price_pln": 29,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O0",
      "trial_days": 3,
      "panels": [
        "educational_basic",
        "lecturer_basic",
        "parent_basic",
        "gamification"
      ],
      "features": [
        "basic_tts",
        "basic_personalization",
        "leaderboard"
      ]
    },
    {
      "id": "potrzebny_pro",
      "name": "POTRZEBNY PRO",
      "price_pln": 49,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O1",
      "trial_days": 3,
      "panels": [
        "educational_pro",
        "lecturer_pro",
        "patient_basic",
        "parent_premium",
        "gamification"
      ],
      "features": [
        "full_tts",
        "advanced_personalization",
        "custom_content",
        "parent_premium_analytics"
      ]
    },
    {
      "id": "supermozg",
      "name": "SUPER MÓZG ULTRA",
      "price_pln": 79,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O2",
      "trial_days": 3,
      "panels": [
        "educational_ultra",
        "lecturer_ultra",
        "patient_ultra",
        "therapist_basic",
        "doctor_basic",
        "supermozg",
        "gamification",
        "therapist_training_79"
      ],
      "features": [
        "health_optimizer",
        "supplement_stacking",
        "cognitive_tests",
        "session_encryption",
        "research_basic"
      ]
    },
    {
      "id": "lekarz_ekspert",
      "name": "LEKARZ EKSPERT",
      "price_pln": 799,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O3",
      "trial_days": 3,
      "panels": [
        "doctor_premium",
        "therapist_training_advanced",
        "all_admin_panels"
      ],
      "features": [
        "wiley_premium",
        "scopus_full",
        "clinical_trials_full",
        "research_premium",
        "priority_support"
      ]
    },
    {
      "id": "free",
      "name": "FREE",
      "price_pln": 0,
      "trial_days": null,
      "panels": [
        "parent_basic",
        "platform_exploration"
      ],
      "features": [
        "limited_content",
        "promotional_messaging"
      ]
    }
  ]
}
```

---

## ⚙️ ZADANIA (INFRASTRUCTURE ONLY - NO UIs YET)

### 1. PROJEKT + DEPENDENCIES
- Create Next.js 15 with App Router
- TypeScript 5.4+
- Tailwind CSS v3
- ESLint + Prettier
- Dependencies: stripe, @auth/nextauth, @supabase/supabase-js, sentry, etc.

### 2. ENVIRONMENT VALIDATION (src/lib/env.ts)
- Function `validateEnv()` called at app startup
- Validate ALL critical keys (Stripe, Supabase, Auth, Sentry)
- If missing → throw error with helpful message
- Non-critical keys → log warning
- Return validated config object
- Keys to validate:
  - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  - NEXTAUTH_SECRET, NEXTAUTH_URL
  - NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN
  - DEEPSEEK_API_KEY, ANTHROPIC_API_KEY
  - All 120+ others from .env.example

### 3. DATABASE SCHEMA (src/lib/db/schema.sql)
- PostgreSQL (Supabase)
- Tables:
  - `users` - id, email, role (student/teacher/therapist/doctor/parent/admin), allowed_panels (array), current_plan, trial_started_at, trial_ends_at, created_at, updated_at
  - `subscriptions` - user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
  - `panels` - id (panel_id), name, description, price (numeric array), tier, created_at
  - `panel_assignments` - user_id, panel_id, assigned_at
  - `stripe_events` - event_id, type, data (json), processed, created_at
  - `invoices` - id, user_id, stripe_charge_id, infakt_invoice_id, amount_pln, pdf_url, created_at
  - `audit_logs` - user_id, action, resource, changes (json), ip_address, created_at (GDPR compliance)
  - `therapy_sessions` - id, patient_id, therapist_id, session_date, duration, notes_encrypted, notes_iv, notes_key_version, created_at, updated_at (ENCRYPTED!)
  - `research_queries` - id, doctor_id, query_text, api_used (pubmed/scopus/wiley/etc), results_count, created_at
  - `organizations` - id, name, slug, owner_id (multi-tenant support)
  - `admin_users` - user_id, admin_type (platform/organization), created_at
  - `custom_content` - id, admin_id, title, content, personalization_options (json), target_roles (array), created_at

- RLS Policies:
  - users: SELECT/UPDATE only self
  - therapy_sessions: SELECT patient + therapist only, UPDATE therapist only
  - invoices: SELECT user only
  - research_queries: SELECT doctor only
  - audit_logs: SELECT admin + related user
  - custom_content: SELECT all, UPDATE admin only

- Encryption:
  - therapy_sessions.notes: AES-256-GCM (pgcrypto)
  - Add columns: notes_iv, notes_key_version

### 4. AUTHENTICATION (src/auth.ts)
- NextAuth.js v5
- Adapter: Supabase
- Providers:
  - Email (passwordless magic link)
  - Google (OAuth)
  - GitHub (OAuth)
- Callbacks:
  - `jwt()` - Add user role + allowed_panels to JWT
  - `session()` - Return user + permissions in session
  - `signIn()` - Verify PWZ for doctors (modulo-11 validation)
- Session strategy: JWT
- Session age: 30 days
- Update age: 24 hours
- Secure cookies (https, secure, sameSite=lax)
- Redirect after signin: /panels/[first-allowed-panel]
- Redirect after signout: /

### 5. PAYMENT SYSTEM (src/lib/stripe.ts + webhook)

`src/lib/stripe.ts`:
- Initialize Stripe with STRIPE_SECRET_KEY
- Export functions:
  - `createCustomer(email, name)` → stripe_customer_id
  - `createSubscription(customer_id, price_id)` → subscription object
  - `cancelSubscription(subscription_id)` → cancel at period end
  - `getSubscription(subscription_id)` → full subscription data
  - `getInvoices(customer_id)` → list invoices
  - `getPrices()` → list all available prices
  - `getPrice(price_id)` → get single price
- Error handling: proper try/catch
- Logging: all operations

`src/app/api/webhooks/stripe/route.ts`:
- Listen for POST requests
- Verify webhook signature: `wh = stripe.webhooks.constructEvent()`
- Handle events:
  - `customer.subscription.created` → INSERT into subscriptions table
  - `customer.subscription.updated` → UPDATE subscriptions table
  - `customer.subscription.deleted` → UPDATE subscriptions table (mark cancelled)
  - `charge.succeeded` → Trigger inFakt invoice creation
  - `invoice.payment_failed` → Send retry email
- Log all events to stripe_events table
- Return 200 OK

### 6. INVOICING (src/lib/infakt.ts)

- Function `createInvoice(user_id, amount_pln, plan_id)` triggered on charge.succeeded
- Call inFakt API:
  - Seller: NIP=1133182851, Name=Bartłomiej Potrzebowski, Address=ul. Środkowa 1, lok. 47, Warszawa 03-430
  - Buyer: user.email
  - Items: [{ name: plan.name, quantity: 1, unit_price: amount_pln }]
  - Tax: Type=ryczałt_ewidencjonowany, rate=12%
  - Currency: PLN
  - SendEmail: true
- Store in invoices table: invoice_id, user_id, stripe_charge_id, infakt_invoice_id, amount_pln, pdf_url
- Log to audit_logs

### 7. MONITORING (src/lib/sentry.ts)

- Initialize Sentry with NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN
- Business features:
  - Traces sample rate: 1.0 (100% - all requests)
  - Replays session sample rate: 0.1 (10% normal)
  - Replays on error sample rate: 1.0 (100% errors)
  - Profiles sample rate: 1.0 (100% CPU profiling)
- Integrations: Next.js, React, Node, Postgres, Replay
- Environment: production
- BeforeSend: Filter sensitive data
- Custom dashboards for:
  - Payment errors
  - Auth failures
  - Database errors
  - API latency
  - User sessions

### 8. CONSTANTS & TYPES

`src/lib/constants/panels.ts`:
```typescript
export const PANELS = {
  EDUCATIONAL: {
    id: 'educational',
    name: 'Panel Ucznia',
    description: 'Naucz się z TTS i personalizacją',
    price: [29, 49, 79],
    icon: 'BookOpen',
    color: 'blue'
  },
  LECTURER: {
    id: 'lecturer',
    name: 'Panel Nauczyciela',
    description: 'Zarządzaj uczniami i materiałami',
    price: [29, 49, 79],
    icon: 'Users',
    color: 'green'
  },
  // ... all 14 panels
}
```

`src/lib/constants/pricing.ts`:
```typescript
export const PRICING_PLANS = [
  {
    id: 'potrzebny',
    name: 'POTRZEBNY',
    price: 29,
    trial_days: 3,
    panels: ['educational_basic', 'lecturer_basic', 'parent_basic', 'gamification'],
    features: ['basic_tts', 'basic_personalization']
  },
  // ... all 5 plans
]

export function getPanelsForPlan(plan_id: string): string[] {
  const plan = PRICING_PLANS.find(p => p.id === plan_id)
  return plan?.panels || []
}
```

`src/types/panels.ts`:
```typescript
export type PanelId = 
  | 'educational'
  | 'lecturer'
  | 'patient'
  | 'doctor'
  | 'supermozg'
  | 'parent'
  | 'teacher_admin'
  | 'doctor_training_admin'
  | 'therapist_training_29'
  | 'therapist_training_79'
  | 'custom_content_admin'
  | 'platform_admin'
  | 'gamification'

export type UserRole = 'student' | 'teacher' | 'therapist' | 'doctor' | 'parent' | 'admin'

export interface Panel {
  id: PanelId
  name: string
  description: string
  price: number | number[]
  icon: string
  color: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  trial_days: number | null
  panels: PanelId[]
  features: string[]
}
```

### 9. LAYOUTS & PAGES

`src/app/layout.tsx`:
- Metadata: title, description, OG tags, favicon
- Providers: Sentry, NextAuth, TailwindCSS, dark mode, analytics
- Global styles
- RootLayout component
- Dark mode support (localStorage + CSS variables)

`src/app/page.tsx`:
- Landing page with:
  - Hero section (title, subtitle, CTA)
  - 3 main CTAs: "Zacznij za darmo" (Free trial), "Zaloguj" (Login), "Dowiedz się więcej" (Learn more)
  - Feature highlights (14 panels)
  - Pricing showcase (5 plans)
  - FAQ section
  - Footer with links
- Responsive design
- Dark mode ready

`src/app/globals.css`:
- Tailwind imports
- CSS variables for dark mode
- Global styles
- Animations
- Accessibility improvements

### 10. MIDDLEWARE & ROUTING

`src/middleware.ts`:
- NextAuth middleware
- Protect /panels/* routes
- Allow /api/auth/* for auth
- Allow /api/webhooks/* for webhooks
- Redirect unauthenticated to /

`src/app/api/auth/[...nextauth]/route.ts`:
- NextAuth route handlers
- Export GET, POST handlers

`src/app/api/health/route.ts`:
- Health check endpoint
- GET /api/health → { status: 'ok', timestamp: Date }

### 11. FOLDER STRUCTURE

```
src/app/
├── panels/
│   ├── educational/          # Panel 1 (empty folder)
│   ├── lecturer/             # Panel 2
│   ├── patient/              # Panel 3
│   ├── doctor-research/      # Panel 4
│   ├── supermozg/            # Panel 5
│   ├── parent/               # Panels 6-7
│   ├── admin/
│   │   ├── teacher/          # Panel 8
│   │   ├── doctor-training/  # Panel 9
│   │   ├── therapist-training-29/  # Panel 10
│   │   ├── therapist-training-79/  # Panel 11
│   │   ├── custom-content/   # Panel 12
│   │   └── platform/         # Panel 13
│   └── gamification/         # Panel 14
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── verify/
├── api/
│   ├── auth/
│   ├── webhooks/
│   │   └── stripe/
│   └── health/
├── layout.tsx
├── page.tsx
├── globals.css
└── middleware.ts

src/lib/
├── env.ts                    # Validate 120+ env vars
├── auth.ts                   # NextAuth config
├── stripe.ts                 # Stripe helpers
├── infakt.ts                 # Invoice generation
├── sentry.ts                 # Error tracking
├── constants/
│   ├── panels.ts             # 14 panel definitions
│   └── pricing.ts            # 5 plan definitions
├── db/
│   ├── schema.sql            # PostgreSQL schema
│   └── rls-policies.sql      # Row-level security
└── types/
    ├── panels.ts
    ├── pricing.ts
    ├── database.ts
    └── auth.ts

public/
├── logo.png
├── favicon.ico
└── ...
```

---

## ⚡ EXECUTION RULES

✅ All code: TypeScript strict mode, no `any` types
✅ All comments: Only for complex logic (explain WHY, not WHAT)
✅ All imports: Use @ aliases from tsconfig
✅ All async: Proper try/catch error handling
✅ All responses: Correct HTTP status codes
✅ All logging: Structured (timestamp, level, context)
✅ All security: Zero secrets in code
✅ All databases: RLS policies enabled
✅ All encryption: AES-256 for sensitive data
✅ All validation: Input sanitization + zod schemas
✅ All tests: 80%+ code coverage
✅ All performance: Optimized queries, proper indexes
✅ All accessibility: WCAG 2.1 AA compliant
✅ All errors: User-friendly messages + detailed logs

---

## 📋 OUTPUT FORMAT

For EACH file:
1. **Path:** Full path (e.g., src/app/layout.tsx)
2. **Code:** Complete, production-ready TypeScript/TSX
3. **Imports:** All necessary dependencies
4. **Types:** Full TypeScript interfaces
5. **Error handling:** Try/catch + proper logging

Start with DEPENDENCIES (package.json), then CONFIG FILES, then SRC files.

Order:
1. package.json (dependencies)
2. tsconfig.json (TypeScript config)
3. next.config.js (Next.js config)
4. .env.example (already in repo)
5. src/lib/env.ts (validate 120+ keys)
6. src/auth.ts (NextAuth)
7. src/lib/stripe.ts (Stripe client)
8. src/lib/infakt.ts (Invoicing)
9. src/lib/sentry.ts (Monitoring)
10. src/lib/constants/panels.ts (14 panels)
11. src/lib/constants/pricing.ts (5 plans)
12. src/lib/db/schema.sql (database)
13. src/lib/db/rls-policies.sql (security)
14. src/types/panels.ts (types)
15. src/types/pricing.ts (types)
16. src/app/globals.css (styles)
17. src/app/layout.tsx (root layout)
18. src/app/page.tsx (landing page)
19. src/app/api/auth/[...nextauth]/route.ts
20. src/app/api/webhooks/stripe/route.ts
21. src/app/api/health/route.ts
22. src/middleware.ts
23. Create folder structure (mkdir all panel folders)
24. Any other missing files...

---

## 🔒 ENVIRONMENT VARIABLES

All keys are in .env.local (your machine) and will be injected by GitHub Actions in production.

CRITICAL KEYS TO VALIDATE:
- STRIPE_SECRET_KEY (sk_live_*)
- STRIPE_PUBLISHABLE_KEY (pk_live_*)
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXTAUTH_SECRET
- NEXT_PUBLIC_SENTRY_DSN
- SENTRY_AUTH_TOKEN
- DEEPSEEK_API_KEY
- ANTHROPIC_API_KEY
- And 110+ more...

See .env.example for complete list.

---

## ✨ SUCCESS CRITERIA

After generation, you should have:

✅ 50+ auto-generated files
✅ Zero TypeScript errors on startup
✅ `npm run dev` works (http://localhost:3000)
✅ `npm run build` succeeds
✅ Database schema created
✅ All 120+ env vars validated
✅ Landing page loads with 3 CTAs
✅ Stripe webhook ready
✅ Sentry monitoring active
✅ Dark mode CSS variables
✅ 14 panel folders created
✅ Ready for Phase 2 (panel UIs)

---

## 🚀 NEXT STEPS

1. Generate all files above
2. Run: `npm install`
3. Test: `npm run dev`
4. Check: http://localhost:3000
5. Build: `npm run build`
6. Then: `git add .` && `git commit -m "init: PROMPT #1 infrastructure"` && `git push origin main`
7. Watch GitHub Actions deploy to Vercel automatically!

---

Let's build POTRZEBNY.AI v3! 🚀
```

---

## 📌 HOW TO USE THIS

1. **Copy everything** from the code block above (between the three backticks)
2. **Open Claude Code Desktop**
3. **Start new chat**
4. **Paste the entire prompt**
5. **Click SEND**
6. **Wait 10-15 minutes** for generation
7. **Done!** Claude generates 50+ files automatically

---
