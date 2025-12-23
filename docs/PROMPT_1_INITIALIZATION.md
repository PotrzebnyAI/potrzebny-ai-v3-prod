# 🚀 PROMPT #1 - INITIALIZATION + INFRASTRUCTURE

## Copy-paste this exact prompt to Claude Code Desktop

### Prerequisites
- Claude Code Desktop with DEFAULT FULL ACCESS enabled
- All 120+ API keys loaded in environment
- GitHub repo created: `PotrzebnyAI/potrzebny-ai-v3-prod`

---

```
---PROMPT START---

🔥 POTRZEBNY.AI – PRODUCTION INITIALIZATION v3.0 
(14 PANELI, STRIPE + INFAKT, 100% AUTOMATYZACJI, BEZ TERMINALA)

🎯 CONTEXT:
You are a senior full-stack architect inside Claude Code Desktop (DEFAULT FULL ACCESS).
Building POTRZEBNY.AI: EdTech + Therapy + Medical + Super Mózg all-in-one platform for Poland.
Repo: `PotrzebnyAI/potrzebny-ai-v3-prod` on GitHub.
120+ API keys ready in .env.local (Stripe, Google Cloud, DeepSeek, Anthropic, Wiley, Scopus, NCBI, Brave Search, Perplexity, D-ID, etc.)

---

## ARCHITEKTURA 14 PANELI (WYMAGANE)

### PANELE UźYTKOWNIKA (PAID)
1. **Panel Ucznia/Studenta** (29/49/79 PLN) - edukacja, TTS, personalizacja
2. **Panel Nauczyciela/Wykładowcy** (29/49/79 PLN) - zarządzanie uczniami, upload materiałów
3. **Panel Pacjenta Terapeutycznego** (49/79 PLN) - sesje z teraputą, STT
4. **Panel Lekarza Research** (79/799 PLN) - PubMed, Wiley, ClinicalTrials, drug interactions
5. **Panel Super Mózg ULTRA** (79 PLN, add-on do każdego) - health optimizer, suplementy, AI coaching
6. **Panel Rodzica Basic** (FREE) - podgląd postępów dziecka
7. **Panel Rodzica Premium** (49 PLN) - zaawansowana analityka

### PANELE ADMINISTRACYJNE (FREE + PAID)
8. **Teacher Admin** (FREE) - zarządzanie materiałami dla nauczycieli
9. **Doctor Training Admin** (FREE) - panel szkoleniowy dla lekarzy (np. dr. Artur Barlik)
10. **Therapist Training Admin 29 PLN** (PAID - 29 PLN) - szkolenie terapeutów (ćwiczenia)
11. **Therapist Training Admin 79 PLN** (PAID - 79 PLN) - szkolenie terapeutów (advanced)

### PANEL CUSTOM CONTENT ADMIN (NEW! 14)
12. **Custom Content Admin** (FREE) - admin tworzy treści, wybiera opcje (29/49/79 PLN)
    - Admin przesyła treść → generuje się dla odbiorców
    - Odbiorcy (policjanci, ekoterroryści, budowniczy, studenci, ogrodnicy, itd.)
    - Wybierają tier: 29/49/79 PLN
    - Otrzymują w pełni spersonalizowane treści edukacyjne

### PANELE UZUPEŁNIAJĄCE
13. **Platform Admin / Super Admin** (FREE, internal) - łącze Bartka do zarządzania całą platformą
14. **Gamification + Leaderboards** (built-in do każdego panelu ≥29 PLN)

---

## PRICING MATRIX (5 PLANÓW)

```json
{
  "plans": [
    {
      "id": "potrzebny",
      "name": "POTRZEBNY",
      "price_pln": 29,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O0",
      "panels": ["student_basic", "teacher_basic", "parent_basic", "gamification"],
      "trial_days": 3,
      "features": ["basic_tts", "basic_personalization", "leaderboard"]
    },
    {
      "id": "potrzebny_pro",
      "name": "POTRZEBNY PRO",
      "price_pln": 49,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O1",
      "panels": ["student_pro", "teacher_pro", "patient_basic", "parent_premium", "gamification"],
      "trial_days": 3,
      "features": ["full_tts", "advanced_personalization", "custom_content", "parent_premium_analytics"]
    },
    {
      "id": "supermozg_ultra",
      "name": "SUPER MÓZG ULTRA",
      "price_pln": 79,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O2",
      "panels": ["student_ultra", "teacher_ultra", "patient_ultra", "therapist_basic", "doctor_research_basic", "supermozg", "gamification", "therapist_training_79"],
      "trial_days": 3,
      "features": ["video_generation", "health_optimizer_advanced", "cognitive_tests", "session_encryption", "basic_research_tools"]
    },
    {
      "id": "lekarz_ekspert",
      "name": "LEKARZ EKSPERT",
      "price_pln": 799,
      "stripe_price_id": "price_1SZcxeBlAb3Kj4O3",
      "panels": ["doctor_research_premium", "therapist_training_advanced", "all_admin_panels", "priority_support"],
      "trial_days": 3,
      "features": ["wiley_access", "scopus_access", "advanced_ai_analysis", "research_premium_features", "custom_research_tools"]
    },
    {
      "id": "free",
      "name": "FREE",
      "price_pln": 0,
      "panels": ["parent_basic", "platform_exploration"],
      "trial_days": null,
      "features": ["limited_content", "promotional_messaging"]
    }
  ]
}
```

---

## PRICING RULES

1. **Każdy użytkownik startuje na 3-dniowym trialu** (pełny dostęp do wybranego planu bez karty)
2. Po trialu:
   - Jeśli nic nie kliknie → auto-enable subskrypcji (info przez email + panel billing)
   - Może zmienić plan, anulować, wznowić w dowolnym momencie
3. **Custom Content Admin (12 panel)**:
   - Admin tworzy treść (FREE)
   - Odbiorcy wybierają opcję: 29/49/79 PLN
   - MUŚZĄ mieć zakupiętą subskrypcję na wybranym planie
4. **Panele administracyjne szkoleniowe (10, 11)**:
   - Therapist Training 29 PLN = 29 PLN / miesiąc
   - Therapist Training 79 PLN = 79 PLN / miesiąc
   - Integrują się z panelem terapeuty + Patient panel

---

## ZADANIA W TYM PROMPCIE (TYLKO INFRA + KONFIG)

### 1. STRUKTURA PROJEKTU (Next.js 15 App Router)

Stwórz:
- `src/app/layout.tsx` - globalny layout (metadata, providers, Sentry, i18n)
- `src/app/page.tsx` - landing page (3 CTA: "Zacznij za darmo", "Zaloguj", "Dowiedz się więcej")
- `src/lib/env.ts` - walidacja 120+ zmiennych środowiskowych na starcie
- `src/lib/constants/panels.ts` - definicja 14 paneli (names, descriptions, tiers)
- `src/lib/constants/pricing.ts` - definicja 5 planów + pricing logic

Stwórz foldery na przyszłe panele:
```
src/app/panels/
├── educational/      # Panel 1
├── lecturer/        # Panel 2
├── patient/         # Panel 3
├── doctor-research/ # Panel 4
├── supermozg/       # Panel 5 (Super Mózg ULTRA)
├── parent/          # Panels 6+7
├── admin/
│   ├── teacher/           # Panel 8
│   ├── doctor-training/   # Panel 9
│   ├── therapist-training-29/  # Panel 10
│   ├── therapist-training-79/  # Panel 11
│   ├── custom-content/    # Panel 12 (NEW!)
│   └── platform/          # Panel 13
└── gamification/    # Panel 14 (Embedded)
```

### 2. ENV VALIDATION (120+ keys)

Stwórz `src/lib/env.ts`:
- Zwaluıduj ALL 120+ env vars (Stripe, Google Cloud, DeepSeek, Groq, Anthropic, OpenAI, Together, Brave Search, NCBI PubMed, Scopus, Wiley, ClinicalTrials, WHO, Exa, D-ID, Perplexity, Vercel, Supabase, Sentry, GitHub, CodeCov, NextAuth, Wise, inFakt)
- Na startup: jeśli brakuje kritycznego key → throw error z jasnym komunikatem
- Jeśli brakuje opcjonalnego key → log warning, ale kontynuuj

Stwórz `.env.example`:
- Template ze WSZYSTKIMI 120+ zmiennymi (bez values)
- Podzielone na sekcje (TIER 1-10)

### 3. SUPABASE SCHEMA

Stwórz `src/lib/db/schema.sql`:
- `users` - user profile (role, allowed_panels, current_plan, trial_started_at, trial_ends_at)
- `subscriptions` - subscription tracking (stripe_customer_id, stripe_subscription_id, plan_id, status)
- `panels` - definition of 14 panels
- `panel_assignments` - which users have access to which panels
- `stripe_events` - webhook events log
- `invoices` - inFakt invoices
- `audit_logs` - who did what when (GDPR compliance)
- `therapy_sessions` - encrypted therapy session notes
- `research_queries` - doctor research history
- `admin_users` - admin role tracking
- `organization_configs` - organization-level settings
- `custom_content` - treści z panelu Custom Content Admin

Stwórz `src/lib/db/rls-policies.sql`:
- Organization-level isolation (RLS)
- Role-based access control (student vs therapist vs doctor vs admin)
- Therapy session encryption (pgcrypto setup)

### 4. AUTH (NextAuth.js v5 + Supabase)

Stwórz:
- `src/auth.ts` - NextAuth konfiguracja
- `src/app/api/auth/[...nextauth]/route.ts` - auth routes
- Model User: `role`, `allowed_panels`, `current_plan`, `trial_active`, `pwz_verified` (dla lekarzy)

### 5. STRIPE INTEGRATION

Stwórz:
- `src/lib/stripe.ts` - inicjalizacja z ALL env keys
- `src/app/api/webhooks/stripe/route.ts` - webhook handler
  - `charge.succeeded` → trigger invoice creation via inFakt
  - `subscription.*` events → update user subscription status
  - `customer.*` events → sync customer data
- `src/lib/stripe/products.ts` - define all 5 plans with prices (29/49/79/799/0)

### 6. INFAKT INTEGRATION

Stwórz:
- `src/lib/infakt.ts` - auto-create invoice on Stripe payment success
- Każda płatność → automatycznie faktura (12% ryczałt, PLN)
- Invoice storage: Supabase + link do PDF

### 7. MONITORING (Sentry Business + CodeCov)

Stwórz:
- `src/lib/sentry.ts` - initialize Sentry with Business features
  - 100% transaction tracing
  - Session replays on error
  - Custom dashboards
- `.github/workflows/test-coverage.yml` - auto-coverage reports

### 8. CONSTANTS & TYPES

Stwórz:
- `src/types/panels.ts` - TypeScript types for all 14 panels
- `src/types/pricing.ts` - pricing types + helpers
- `src/lib/constants/panel-descriptions.ts` - full descriptions of each panel (do display w UI)

---

## NOWE WYMAGANIA - CUSTOM CONTENT ADMIN (PANEL 12)

**Custom Content Admin (FREE PANEL)**:
- Admin może tworzyć dowolne treści edukacyjne (policjanci, ekoterroryści, budowniczy, studenci, ogrodnicy, itp.)
- Admin przesyła treść → system generuje 3 warianty personalizacji
- Odbiorcy otrzymują treści w wybranym style/tonie:
  - Osób które otrzymują treści MUŚZĄ mieć zakupiętą subskrypcję 29/49/79 PLN
  - Każda osoba wybiera opcję cenową
- Personalizacja: ton, styl, rodzaj (np. dla policjantów = bardziej formalne; dla studentów = casual)
- Używaj DeepSeek do generowania spersonalizowanych wersji

---

## SUPER MÓZG ULTRA REQUIREMENTS (PANEL 5)

**Health Optimizer - zaawansowany panel:**
- Tworzenie spersonalizowanych stacków suplementacyjnych
- Dobieranie roślin + oczyszczaczy do poprawy zdrowia
- AI coaching z API medycznymi (NCBI PubMed, Scopus)
- **MUŚZĄ SIĘ POJAWIĆ TEMATY:**
  - ✅ Zagrożenia z neurotoksycznością
  - ✅ Sposoby na walkę z pleśnią
  - ✅ Problem aldehydów
  - ✅ Jak przechowujeć suplementy
  - ✅ Jak maksymalnie zwiększyć możliwości kognitywne i funkcjonowanie mózgu
  - ❌ **BEZ porady medycznej czy sugerowania leków/chorób** (bezpieczeństwo prawne!)

---

## EXECUTION REQUIREMENTS

- ✅ **Zero CLI commands** (wszystko auto przy `npm run dev`)
- ✅ **Auto-detect missing env vars** z helpul error message
- ✅ **All 120+ API keys integrated**
- ✅ **Sentry Business 100% traces + session replays**
- ✅ **CodeCov auto-coverage**
- ✅ **GDPR/HIPAA ready** (encryption, audit logging)
- ✅ **Polish language support** (i18n skeleton)
- ✅ **Dark mode ready** (CSS variables)
- ✅ **14 paneli structured** (folder structure ready)
- ✅ **3 custom admin panele** (Teacher, Doctor Training, Therapist Training, Custom Content)
- ✅ **Trial system** (3 dni bez karty → auto-enable)

---

## OUTPUT FORMAT

Dla każdego pliku:
1. Pełna ścieżka
2. Kompletny kod (TypeScript/TSX)
3. Komentarze tylko dla skomplikowanej logiki

Start z `src/app/layout.tsx`, potem sekwencyjnie.

---PROMPT END---
```

---

## After Pasting

1. Click **SEND** in Claude Code Desktop
2. Claude will generate all files automatically
3. Wait for completion (~5-10 minutes)
4. Copy all generated files
5. Push to GitHub main branch
6. Auto-deploy via GitHub Actions

## Next Step

After this completes, move to **PROMPT #2** (Educational Panel)
