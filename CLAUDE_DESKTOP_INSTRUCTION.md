# 🔥 CLAUDE DESKTOP (ZWYKŁY) - INSTRUKCJA MEGA PROMPTÓW
## Dla generowania MEGA PROMPTÓW dla Claude Code Desktop

**⚠️ WAŻNE:** Ta instrukcja idzie do Claude Desktop (zwykły)  
**Rezultat:** Otrzymasz 1 MEGA PROMPT dla Claude Code Desktop  
**Następnie:** Wklejasz ten mega prompt do Code Desktop i WSZYSTKO się generuje

---

# 🎯 INSTRUKCJA DLA CLAUDE DESKTOP (ZWYKŁY)

Jesteś Claude Desktop z ograniczonym kontekstem.  
Twoja JEDYNA misja: **Wygenerować JEDEN mega prompt dla Claude Code Desktop.**

Ten mega prompt będzie zawierać **WSZYSTKIE instrukcje** aby Code Desktop wygenerował:
- Backend (Next.js + Supabase + Auth + Payments + Encryption)
- Frontend (Web UI + 14 paneli + Components + Forms)
- Mobile (iOS Swift/SwiftUI + Android Kotlin/Compose)
- CI/CD (GitHub Actions + Vercel deployment)
- Monitoring (Sentry Business)
- Everything production-ready, zero TODOs

---

## 📋 CO MASZ WYGENEROWAĆ

Twoja única función: Utwórz JEDEN tekst zwany **MEGA_PROMPT_FOR_CODE_DESKTOP.md** zawierający:

### Część 1: Wstęp (~500 słów)
```
Tytuł: 🚀 POTRZEBNY.AI V3 - COMPLETE PRODUCTION SYSTEM - ONE THREAD GENERATION

Zawartość:
- Sytuacja: Code Desktop ma GIGANTYCZNY kontekst
- Misja: Wygenerować 150+ plików w JEDNYM wątku
- Timeline: ~165 minut
- Rezultat: Production-ready app na potrzebny.ai
- Deployment: 100% automatyczne (zero terminala)
```

### Część 2: SYSTEM REQUIREMENTS (~2000 słów)
Szczegółowo opisz:

#### Backend Requirements
```
Stack:
- Next.js 15 API Routes
- Supabase PostgreSQL
- NextAuth v5 (JWT)
- Stripe + BLIK + Przelewy24
- Sentry Business
- AES-256-GCM encryption

Database (11 tables):
1. users
2. profiles
3. subscriptions
4. payment_methods
5. therapy_notes (encrypted)
6. educational_content
7. gamification_data
8. audit_logs
9. api_keys
10. notifications
11. email_templates

RLS (Row Level Security) on ALL tables
Audit fields: created_at, updated_at
Encryption for: therapy_notes, passwords

Auth:
- Email + Password + Google OAuth
- Magic link support
- 2FA (TOTP)
- JWT with 24h expiry
- bcrypt hashing (12 rounds)

Payments:
- Stripe: Create subscription (3-day trial, no card)
- Webhook handling for events
- Auto-renewal logic
- Przelewy24 + BLIK support
- inFakt integration

API Routes (120+):
/api/auth/* - Auth endpoints
/api/panel/* - Panel endpoints
/api/payments/* - Payment endpoints
/api/user/* - User endpoints
/api/admin/* - Admin endpoints

All with:
- Input validation (Zod)
- Auth check
- Error handling
- Rate limiting
- Sentry logging
```

#### Frontend Requirements
```
Stack:
- Next.js 15 App Router
- React 19
- TailwindCSS
- React Hook Form
- Zod validation
- React Query
- TypeScript strict

Pages:
- Landing page
- Auth: Login, Signup, Forgot Password, 2FA
- Dashboard (role-based)
- 14 panel pages (see list below)
- Settings
- Billing
- Profile
- Not Found, Error pages

14 PANELS (ALL MUST WORK):
User Panels:
1. EDUCATIONAL (29/49/79 PLN) - Course learning
2. LECTURER (29/49/79 PLN) - Content management
3. PATIENT (49/79 PLN) - Therapy sessions + encrypted notes
4. DOCTOR (79/799 PLN) - Research database
5. SUPER MÓZG (79 PLN add-on) - Health optimization
6. PARENT BASIC (FREE) - Child monitoring
7. PARENT PREMIUM (49 PLN) - Advanced analytics

Admin Panels:
8. TEACHER ADMIN (FREE)
9. DOCTOR TRAINING ADMIN (FREE)
10. THERAPIST TRAINING 29 (29 PLN)
11. THERAPIST TRAINING 79 (79 PLN)
12. CUSTOM CONTENT ADMIN (FREE)
13. PLATFORM ADMIN (FREE)
14. GAMIFICATION ENGINE (all tiers)

Each panel needs:
- Dashboard with stats
- Data management (CRUD)
- Responsive design
- Dark mode
- Loading states
- Error boundaries
- Mobile optimized

Components:
- Buttons, Inputs, Selects, Textareas
- Checkboxes, Radios, Toggles
- Modals, Dropdowns, Tooltips
- Cards, Badges, Progress bars
- Skeleton loaders
- Toast notifications
- Error boundaries
- Forms with validation

Styles:
- TailwindCSS
- Dark mode support
- Mobile responsive
- Accessibility WCAG 2.1 AA
- Performance: LCP < 2.5s
```

#### Mobile Requirements
```
iOS (Swift + SwiftUI):
- Xcode project structure
- SwiftUI views for all panels
- Biometric auth (Face ID / Touch ID)
- Push notifications
- Offline mode + sync
- Background refresh
- Payment (Stripe SDK)
- Error handling
- Performance optimized

Android (Kotlin + Jetpack Compose):
- Gradle build setup
- Compose UI for all panels
- Biometric auth (Fingerprint / Face)
- Push notifications (FCM)
- Offline mode (Room DB)
- Background work (WorkManager)
- Payment (Stripe SDK)
- Error handling
- Memory optimized

Both must have:
- Same UI/UX as web
- Shared business logic
- Dark mode
- Responsive layout
- Battery optimization
```

#### CI/CD Requirements
```
GitHub Actions:
- On push to main:
  1. Run tests (npm run test)
  2. Run build (npm run build)
  3. Deploy to Vercel (npm run deploy)

- GitHub Secrets for all credentials
- Secret scanning enabled
- Branch protection rules
- Automatic deployments on merge

Vercel Configuration:
- Project: potrzebny-ai-v3-prod
- Domain: potrzebny.ai
- Auto-deploy: On git push
- Build: npm run build
- Start: npm start
- Environment: All 120+ vars from .env.example
- AI Gateway: vck_7LUvj6gHKOnKFNct0lcFmq6NfTExMoDY86blqt15aFwux9rpFB38xgqS
```

#### Security Requirements
```
✅ HTTPS/TLS 1.3+
✅ HSTS headers
✅ CSP headers
✅ XSS protection
✅ CSRF tokens
✅ SQL injection prevention (prepared statements)
✅ Rate limiting (login: 5 attempts / 15 min)
✅ Password requirements: 12+ chars, uppercase, number, special
✅ Password hashing: bcrypt (12 rounds)
✅ Session timeout: 24 hours
✅ Biometric auth on mobile
✅ GDPR Art. 9: therapy notes AES-256-GCM encrypted
✅ Data anonymization for analytics
✅ No hardcoded secrets
✅ GitHub Secrets for all credentials
✅ Audit logging for all actions
✅ Sentry monitoring for errors
```

### Część 3: EXECUTION REQUIREMENTS (~1000 słów)

```
WHEN GENERATING CODE:

1. EVERY file MUST be production-ready:
   - No placeholders
   - No TODO comments
   - No console.log
   - Complete error handling
   - Full TypeScript types
   - Proper validations

2. EVERY API route MUST include:
   - Input validation (Zod)
   - Authentication check
   - Authorization check
   - Error handling with Sentry
   - Rate limiting
   - Audit logging
   - Proper status codes

3. EVERY component MUST include:
   - Error boundary
   - Loading state
   - Empty state
   - Success state
   - Responsive design
   - Accessibility (ARIA)
   - Performance optimization

4. EVERY API response MUST have:
   {
     "success": boolean,
     "data": object | null,
     "error": string | null,
     "errors": object | null,
     "timestamp": ISO8601,
     "traceId": string
   }

5. EVERY database operation MUST:
   - Use prepared statements
   - Have proper indexes
   - Include RLS policies
   - Encrypt sensitive data
   - Include audit fields
   - Have transaction support

6. EVERY payment flow MUST:
   - Handle all failure scenarios
   - Include retry logic
   - Log to Sentry
   - Email confirmations
   - Store transaction records
   - Support webhooks

7. ENVIRONMENT VARIABLES (120+):
   Required:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - DATABASE_URL
   - STRIPE_SECRET_KEY
   - SENDGRID_API_KEY
   - SENTRY_AUTH_TOKEN
   - GITHUB_TOKEN
   - VERCEL_TOKEN
   - VERCEL_AI_GATEWAY_KEY=vck_7LUvj6gHKOnKFNct0lcFmq6NfTExMoDY86blqt15aFwux9rpFB38xgqS
   - And 110+ more (all in .env.example)
```

### Część 4: FILE STRUCTURE (~500 słów)

```
potrzebny-ai-v3-prod/
├── web/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── ...
│   │   ├── (panels)/
│   │   │   ├── educational/page.tsx
│   │   │   ├── lecturer/page.tsx
│   │   │   ├── patient/page.tsx
│   │   │   ├── doctor/page.tsx
│   │   │   ├── super-mozg/page.tsx
│   │   │   ├── parent-basic/page.tsx
│   │   │   ├── parent-premium/page.tsx
│   │   │   ├── teacher-admin/page.tsx
│   │   │   ├── doctor-training-admin/page.tsx
│   │   │   ├── therapist-training-29/page.tsx
│   │   │   ├── therapist-training-79/page.tsx
│   │   │   ├── custom-content-admin/page.tsx
│   │   │   ├── platform-admin/page.tsx
│   │   │   └── gamification/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── panel/[panel]/route.ts
│   │   │   ├── payments/create/route.ts
│   │   │   ├── user/profile/route.ts
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── panels/
│   │   ├── ui/
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── payments.ts
│   │   ├── encryption.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── public/
│   ├── styles/
│   ├── .env.local
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── mobile/
│   ├── ios/
│   │   ├── PotrzebnyApp/
│   │   ├── Podfile
│   │   └── project.pbxproj
│   └── android/
│       ├── app/
│       ├── build.gradle
│       └── settings.gradle
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── test.yml
│       └── mobile-build.yml
│
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── turbo.json (if monorepo)
```

### Część 5: TIMELINE & AUTOMATION (~300 słów)

```
WHEN CODE DESKTOP GETS THIS PROMPT:

0:00 → Setup (5 min)
     - Create folder structure
     - Create .gitignore
     - Create .env.example
     - Create package.json

0:05 → Backend (45 min)
     - Database schema (PostgreSQL)
     - Auth system (NextAuth)
     - Payment system (Stripe)
     - API routes (120+)
     - Encryption setup
     - Error handling
     - Validation

0:50 → Frontend (35 min)
     - Landing page
     - Auth pages
     - 14 panel pages
     - Components
     - Forms
     - Responsive design

1:25 → Mobile (50 min)
     - iOS setup
     - Android setup
     - Shared services
     - UI components
     - Build config

2:15 → CI/CD (20 min)
     - GitHub workflows
     - Vercel config
     - Environment setup

2:35 → Final (30 min)
     - Tests
     - Documentation
     - Validation
     - Git commit
     - Git push
     - Auto-deploy trigger

3:05 → LIVE ✅
     - Vercel deployment starts
     - ~2 minutes later: https://potrzebny.ai LIVE!

TOTAL: ~165 minutes (2.75 hours)
```

### Część 6: SUCCESS CRITERIA (~200 słów)

```
WHEN THIS PROMPT IS DONE GENERATING, YOU SHOULD HAVE:

✅ 150+ production files
✅ Backend fully implemented
✅ Frontend fully implemented
✅ Mobile apps buildable
✅ CI/CD pipeline ready
✅ Zero TODOs in codebase
✅ Zero console.log statements
✅ All tests passing
✅ All validations in place
✅ All error handling implemented
✅ All 14 panels working
✅ All payment methods working
✅ Database connected and working
✅ Email system working
✅ Authentication working
✅ Authorization working
✅ Encryption working
✅ Rate limiting working
✅ Monitoring (Sentry) connected
✅ GitHub Actions passing
✅ Vercel deployment successful
✅ App live at https://potrzebny.ai
✅ Production-ready for 2+ months without issues
```

---

## ✅ YOUR TASK (CLAUDE DESKTOP - ZWYKŁY)

Generuj JEDEN dokument: **MEGA_PROMPT_FOR_CODE_DESKTOP.md**

Zawierający DOKŁADNIE:
1. Wstęp (500 słów)
2. System Requirements (2000 słów) - szczegółowo!
3. Execution Requirements (1000 słów)
4. File Structure (500 słów)
5. Timeline & Automation (300 słów)
6. Success Criteria (200 słów)

**Format:**
- Markdown
- Headers, lists, code blocks
- Clear, detailed, specific
- Production-ready language
- No placeholders

**Output:**
Wypisz CAŁY dokument (copy-paste ready) dla użytkownika.

---

**TERAZ GENERUJ! 🚀**