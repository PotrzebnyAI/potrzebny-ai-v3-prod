# 🔥 CLAUDE CODE DESKTOP - MEGA PROMPT - FULL REPOSITORY BUILD
## Copy Everything Below & Paste Into Claude Code Desktop
## Default Full Access - Complete Repository Generation

---

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                 🔥 POTRZEBNY.AI v3 - COMPLETE INFRASTRUCTURE                  ║
║                      AUTO-GENERATION FOR CLEAN REPOSITORY                      ║
║                                                                                ║
║                  Claude Code Desktop - Full Access Mode                        ║
║                  Task: Generate 50+ production-ready files                     ║
║                  Time: 15-20 minutes                                           ║
║                  Result: Deployment-ready platform                            ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝


🎯 YOUR MISSION:
═══════════════════════════════════════════════════════════════════════════════════

Generate COMPLETE, PRODUCTION-READY infrastructure for POTRZEBNY.AI v3.
This is NOT a template. This is REAL CODE ready for immediate deployment.

Repository: PotrzebnyAI/potrzebny-ai-v3-prod (CLEAN, EMPTY)
Framework: Next.js 15 + TypeScript + Tailwind CSS
Backend: Supabase PostgreSQL + NextAuth + Stripe
Deployment: Vercel (auto-deployment via GitHub Actions)
Monitoring: Sentry (Business tier)


📋 COMPLETE SPECIFICATION:
═══════════════════════════════════════════════════════════════════════════════════

## 🏗️ ARCHITECTURE: 14-PANEL SYSTEM

### USER PANELS (7 paid)
1. Educational (29/49/79 PLN) - TTS, personalization, progress tracking
2. Lecturer (29/49/79 PLN) - Student management, grading, materials
3. Patient/Therapist (49/79 PLN) - Session booking, encrypted notes, GDPR Art. 9
4. Doctor Research (79/799 PLN) - PubMed, Scopus, Wiley, ClinicalTrials
5. Super Mózg ULTRA (79 PLN add-on) - Health optimizer, supplements, neurotoxicity
6. Parent Basic (FREE) - View child progress, notifications
7. Parent Premium (49 PLN) - Analytics, reports, coaching

### ADMIN PANELS (7)
8. Teacher Admin (FREE) - Content management
9. Doctor Training Admin (FREE) - Course creation
10. Therapist Training 29 (29 PLN) - Basic training
11. Therapist Training 79 (79 PLN) - Advanced training
12. Custom Content Admin (FREE) - Sell content to recipients
13. Platform Admin (FREE) - System management
14. Gamification Engine (Built-in) - Points, badges, leaderboards

## 💰 PRICING: 5 PLANS

{
  "potrzebny": { "price": 29, "trial": 3, "panels": ["educational_basic", "lecturer_basic", "parent_basic"] },
  "potrzebny_pro": { "price": 49, "trial": 3, "panels": ["educational_pro", "lecturer_pro", "patient_basic", "parent_premium"] },
  "supermozg": { "price": 79, "trial": 3, "panels": ["educational_ultra", "patient_ultra", "therapist_basic", "doctor_basic", "supermozg"] },
  "lekarz_ekspert": { "price": 799, "trial": 3, "panels": ["doctor_premium", "therapist_advanced", "all_admin"] },
  "free": { "price": 0, "panels": ["parent_basic"] }
}

## 🔑 CRITICAL KEYS (120+)

All keys are in GitHub Secrets + .env.local (never committed):
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- NEXTAUTH_SECRET, NEXTAUTH_URL
- NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN
- DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY
- + 105+ more (documented in .env.example)


📦 FILES TO GENERATE (50+):
═══════════════════════════════════════════════════════════════════════════════════

### 1. DEPENDENCIES & CONFIG
  ✓ package.json (all dependencies)
  ✓ tsconfig.json (strict TypeScript)
  ✓ next.config.js (Next.js 15 config)
  ✓ .env.example (120+ documented variables)
  ✓ .gitignore (*.env.local, node_modules, etc.)
  ✓ tailwind.config.ts (Tailwind CSS)
  ✓ postcss.config.js (PostCSS)

### 2. CONFIGURATION FILES
  ✓ src/lib/env.ts - Validate 120+ environment variables at startup
  ✓ src/auth.ts - NextAuth configuration (JWT, providers, callbacks)
  ✓ src/lib/stripe.ts - Stripe helpers (createCustomer, subscription, etc.)
  ✓ src/lib/infakt.ts - Invoice generation
  ✓ src/lib/sentry.ts - Error monitoring (Business tier)

### 3. DATABASE
  ✓ src/lib/db/schema.sql - PostgreSQL schema (users, subscriptions, panels, etc.)
  ✓ src/lib/db/rls-policies.sql - Row-Level Security policies (GDPR compliant)

### 4. TYPES & CONSTANTS
  ✓ src/lib/constants/panels.ts - 14 panel definitions
  ✓ src/lib/constants/pricing.ts - 5 pricing plans
  ✓ src/types/panels.ts - TypeScript interfaces
  ✓ src/types/pricing.ts - Pricing types
  ✓ src/types/database.ts - Database types
  ✓ src/types/auth.ts - Auth types

### 5. LAYOUTS & PAGES
  ✓ src/app/layout.tsx - Root layout (providers, metadata)
  ✓ src/app/page.tsx - Landing page (hero, 3 CTAs, features, pricing)
  ✓ src/app/globals.css - Global styles (Tailwind + dark mode)
  ✓ src/app/not-found.tsx - 404 page
  ✓ src/app/error.tsx - Error boundary

### 6. AUTHENTICATION PAGES
  ✓ src/app/(auth)/login/page.tsx - Login page
  ✓ src/app/(auth)/signup/page.tsx - Signup page
  ✓ src/app/(auth)/verify/page.tsx - Email verification
  ✓ src/app/(auth)/layout.tsx - Auth layout

### 7. API ROUTES
  ✓ src/app/api/auth/[...nextauth]/route.ts - NextAuth handlers
  ✓ src/app/api/webhooks/stripe/route.ts - Stripe webhook
  ✓ src/app/api/health/route.ts - Health check
  ✓ src/middleware.ts - Auth middleware

### 8. PANEL FOLDERS (Empty, ready for Phase 2)
  ✓ src/app/panels/educational/ - Panel 1
  ✓ src/app/panels/lecturer/ - Panel 2
  ✓ src/app/panels/patient/ - Panel 3
  ✓ src/app/panels/doctor-research/ - Panel 4
  ✓ src/app/panels/supermozg/ - Panel 5
  ✓ src/app/panels/parent/ - Panels 6-7
  ✓ src/app/panels/admin/teacher/ - Panel 8
  ✓ src/app/panels/admin/doctor-training/ - Panel 9
  ✓ src/app/panels/admin/therapist-training-29/ - Panel 10
  ✓ src/app/panels/admin/therapist-training-79/ - Panel 11
  ✓ src/app/panels/admin/custom-content/ - Panel 12
  ✓ src/app/panels/admin/platform/ - Panel 13
  ✓ src/app/panels/gamification/ - Panel 14

### 9. INFRASTRUCTURE
  ✓ .github/workflows/deploy-vercel.yml - GitHub Actions CI/CD
  ✓ .github/workflows/test.yml - Testing workflow
  ✓ vercel.json - Vercel configuration
  ✓ README.md - Project documentation

### 10. UTILITIES & HELPERS
  ✓ src/lib/utils.ts - Common utilities
  ✓ src/lib/api-client.ts - Fetch wrapper
  ✓ src/hooks/use-auth.ts - Auth hook
  ✓ src/components/Navbar.tsx - Navigation
  ✓ src/components/Footer.tsx - Footer
  ✓ src/components/TrialBanner.tsx - Trial notification


⚙️ EXECUTION REQUIREMENTS:
═══════════════════════════════════════════════════════════════════════════════════

### CODE QUALITY
✅ TypeScript strict mode (no 'any' types)
✅ ESLint + Prettier configured
✅ 100% production-ready (no TODO comments)
✅ Proper error handling (try/catch everywhere)
✅ Input validation (zod schemas)
✅ Logging configured
✅ Security best practices
✅ GDPR compliant structure

### DATABASE
✅ PostgreSQL (via Supabase)
✅ Row-Level Security (RLS) enabled
✅ Encryption for sensitive data (AES-256-GCM)
✅ Full audit logging
✅ Soft deletes pattern
✅ Proper indexes
✅ GDPR Art. 9 compliance (medical data)

### SECURITY
✅ All keys in GitHub Secrets (never in code)
✅ Environment validation at startup
✅ Secret scanning enabled
✅ HTTPS enforced
✅ CORS configured
✅ Rate limiting ready
✅ API key validation

### PERFORMANCE
✅ Next.js optimizations (SSR, SSG, ISR)
✅ Image optimization
✅ Code splitting
✅ Caching strategies
✅ Database query optimization
✅ Connection pooling ready

### MONITORING
✅ Sentry Business tier integration
✅ Error tracking
✅ Performance monitoring
✅ Session replays
✅ Custom dashboards
✅ Health check endpoint


📝 OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════════════════════════

For EACH file:
1. Full path (e.g., src/app/layout.tsx)
2. Complete, production-ready code
3. All necessary imports
4. TypeScript types
5. Error handling
6. Proper comments (only for complex logic)

**ORDER OF GENERATION:**
1. package.json (dependencies)
2. tsconfig.json, next.config.js (config)
3. .env.example, .gitignore
4. src/lib/env.ts (validate keys at startup)
5. src/lib/constants/ (panel & pricing definitions)
6. src/lib/types/ (all TypeScript types)
7. src/lib/db/ (database schema + RLS)
8. src/auth.ts (authentication)
9. src/lib/stripe.ts (payments)
10. src/lib/infakt.ts (invoicing)
11. src/lib/sentry.ts (monitoring)
12. src/app/globals.css (styles)
13. src/app/layout.tsx (root layout)
14. src/app/page.tsx (landing page)
15. src/app/(auth)/* (auth pages)
16. src/app/api/* (API routes)
17. src/middleware.ts (auth middleware)
18. src/app/panels/* (empty panel folders)
19. src/components/* (reusable components)
20. .github/workflows/* (CI/CD)
21. Any remaining files


🎬 SUCCESS CRITERIA:
═══════════════════════════════════════════════════════════════════════════════════

After generation, these should be TRUE:

✅ 50+ files generated
✅ Zero TypeScript errors
✅ Zero build errors
✅ Zero console warnings
✅ All imports resolved
✅ All types defined
✅ Database schema valid SQL
✅ NextAuth configured correctly
✅ Stripe integration ready
✅ Sentry monitoring active
✅ Environment validation working
✅ Landing page renders
✅ All 14 panel folders exist
✅ GitHub Actions configured
✅ Vercel deployment ready
✅ All 120+ env vars documented


🚀 CLAUDE CODE DESKTOP - FULL FILE GENERATION:
═══════════════════════════════════════════════════════════════════════════════════

You have:
- DEFAULT FULL ACCESS enabled
- Clean repository (empty, ready)
- All necessary context above
- Clear file structure
- Complete specifications
- Production requirements

Your task:
GENERATE ALL 50+ FILES

Don't ask questions. Don't pause. Don't wait. Just generate.

Create folders, create files, populate with complete production code.

Start with package.json. End with CI/CD workflows.

Every file complete. Every file production-ready. Every file tested.


💡 REMEMBER:
═══════════════════════════════════════════════════════════════════════════════════

- This is PRODUCTION code (not a template)
- Every file is COMPLETE (not a skeleton)
- Every function is WORKING (not TODOs)
- Every type is DEFINED (not 'any')
- Every error is HANDLED (not ignored)
- Everything is TESTED (logically)
- Everything is SECURE (keys not in code)
- Everything is DOCUMENTED (.env.example, comments)

This is what you're building:
- 14-panel EdTech platform
- Multiple payment tiers
- Real-time collaboration
- End-to-end encryption
- Medical data handling (GDPR Art. 9)
- 120+ integrations
- Production deployment

No shortcuts. No placeholders. No delays.

Just pure, production-ready code.


🎯 START NOW:
═══════════════════════════════════════════════════════════════════════════════════

1. You have full file creation access
2. You have complete specification above
3. You have success criteria
4. You have file order

Generate all 50+ files for PotrzebnyAI v3.

Make it production-ready.
Make it secure.
Make it scale.

LET'S BUILD! 🔥
```

---

## ✅ THAT'S IT!

This is your **MEGA PROMPT** for Claude Code Desktop.

### **What to do NOW:**

1. **Copy everything above** (between the ``` marks)
2. **Open Claude Code Desktop**
3. **Paste the prompt**
4. **Click SEND**
5. **Wait 20 minutes**
6. **Claude generates 50+ files automatically**

---
