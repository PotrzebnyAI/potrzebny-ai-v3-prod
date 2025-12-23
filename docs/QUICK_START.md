# 🚀 POTRZEBNY.AI v3 - Quick Start Checklist

## 🏗️ Phase 0: Foundation (YOU ARE HERE)

- [x] GitHub repo created: `PotrzebnyAI/potrzebny-ai-v3-prod`
- [x] `.env.example` created (120+ variables)
- [x] GitHub Actions workflow created (`deploy-vercel.yml`)
- [x] GitHub Secrets guide ready
- [x] PROMPT #1 documentation ready
- [x] README with 14-panel architecture

## 🗓️ NEXT: Phase 1 - Setup (2-3 hours)

### Step 1: Prepare GitHub Secrets (30 min)

- [ ] Go to: https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod/settings/secrets/actions
- [ ] Read: `docs/GITHUB_SECRETS_SETUP.md`
- [ ] Add **CRITICAL secrets** (payment, AI, infra):
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `INFAKT_API_KEY`
  - [ ] `DEEPSEEK_API_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SENTRY_DSN`
  - [ ] `SENTRY_AUTH_TOKEN`
  - [ ] `GOOGLE_CLOUD_API_KEY`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] **ALL 120+** from `.env.example`

### Step 2: Clone & Setup Local (10 min)

```bash
# Clone repo
git clone https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod.git
cd potrzebny-ai-v3-prod

# Copy env template
cp .env.example .env.local

# Fill in .env.local with actual keys (from your .env-backup or secrets manager)
# Do NOT commit this file!
```

### Step 3: Open in Claude Code Desktop (1 hour)

1. **Install Claude Code Desktop** (if not done)
   - Go: https://claude.ai/desktop
   - Download for your OS
   - Launch it

2. **Open repo in Code Desktop**
   ```bash
   # From inside repo directory
   code .
   ```
   Or manually:
   - File → Open Folder
   - Select: `/path/to/potrzebny-ai-v3-prod`

3. **Enable Full Access (CRITICAL)**
   - Code Desktop settings → Enable default full access
   - This allows Claude to create/modify files

4. **Copy PROMPT #1**
   - Open: `docs/PROMPT_1_INITIALIZATION.md`
   - Copy the ENTIRE prompt between `---PROMPT START---` and `---PROMPT END---`

5. **Paste into Claude Chat**
   - Code Desktop: New chat
   - Paste the prompt
   - Click: **SEND**
   - Wait 5-10 minutes for auto-generation

6. **Claude generates:**
   - ``` src/app/layout.tsx
   - `src/app/page.tsx`
   - `src/lib/env.ts`
   - `src/lib/constants/panels.ts`
   - `src/lib/constants/pricing.ts`
   - `src/lib/db/schema.sql`
   - `src/auth.ts`
   - `src/lib/stripe.ts`
   - `src/lib/infakt.ts`
   - `src/lib/sentry.ts`
   - And 30+ other files...

### Step 4: Setup Vercel Project (5 min)

1. Go: https://vercel.com
2. Import project:
   - Click: **Add New Project**
   - Select: **GitHub** → `potrzebny-ai-v3-prod`
   - Framework: **Next.js**
   - Root Directory: **./`** (default)
   - Click: **Deploy**

3. Add Environment Variables to Vercel:
   - Project Settings → Environment Variables
   - Copy all from GitHub Secrets
   - Save

### Step 5: Test GitHub Actions Workflow (10 min)

```bash
# Push generated files to GitHub
git add .
git commit -m "init: auto-generated infrastructure from PROMPT #1"
git push origin main
```

Watch workflow:
- Go: https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod/actions
- Click: Latest workflow run
- Check all steps pass ✅

### Step 6: Verify Live Deployment (2 min)

- Go: https://potrzebny-ai-v3.vercel.app
- Should see landing page ✅
- Check: Console for any errors

---

## 📌 Phase 2: First Panel (Educational)

**AFTER Phase 1 completes:**

1. Copy PROMPT #2 from `docs/PROMPT_2_EDUCATIONAL_PANEL.md`
2. Paste into Claude Code Desktop
3. Auto-generates Educational Panel
4. Push to main → Auto-deploy

---

## 🚀 Auto-Deployment Flow

```
You make changes locally
      ↓
  git push main
      ↓
GitHub Actions triggered
      ↓
Run tests & build
      ↓
  Deploy to Vercel
      ↓
Live in 2-3 minutes
```

**NO MANUAL DEPLOYMENT** - Everything automatic!

---

## 🔐 Security Checklist

- [ ] `.env.local` in `.gitignore` (CRITICAL!)
- [ ] All secrets in GitHub Secrets (not in .env.example)
- [ ] GitHub Secret Scanning enabled
- [ ] Branch protection rules set (require reviews)
- [ ] No API keys in code comments
- [ ] Supabase RLS policies enabled
- [ ] Sentry Business monitoring active

---

## 🔧 Troubleshooting

### "Module not found" error after PROMPT #1

**Solution:**
```bash
npm install
npm run dev
```

### "Cannot find .env variables" on startup

**Solution:**
- Check `.env.local` exists in root
- All required vars are filled
- Restart: `npm run dev`

### GitHub Actions fails with "Missing secret"

**Solution:**
1. Check workflow file: `.github/workflows/deploy-vercel.yml`
2. Find missing secret name
3. Add to GitHub Secrets
4. Re-run workflow

### Vercel deployment fails

**Solution:**
1. Check Vercel logs
2. Find error (usually missing env var)
3. Add to Vercel environment variables
4. Re-deploy

---

## 📈 Status Dashboard

Quick links to check status:

- **GitHub Workflow:** https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod/actions
- **Vercel Deployment:** https://vercel.com/potrzebny-ai/potrzebny-ai-v3-prod
- **Live Site:** https://potrzebny-ai-v3.vercel.app
- **Sentry Monitoring:** https://potrzebny-ai.sentry.io
- **CodeCov Coverage:** https://codecov.io/github/PotrzebnyAI/potrzebny-ai-v3-prod
- **Database:** https://supabase.com/dashboard

---

## 🎦 What Happens After Phase 1?

**Your codebase will have:**

- ✅ Next.js 15 fully configured
- ✅ Supabase database with schema
- ✅ NextAuth authentication
- ✅ Stripe payment integration
- ✅ inFakt invoice generation
- ✅ Sentry monitoring (100% traces)
- ✅ GitHub Actions auto-deployment
- ✅ Vercel production hosting
- ✅ 14 panel folder structure ready
- ✅ TypeScript types for all panels
- ✅ Pricing logic for 5 plans
- ✅ GDPR/HIPAA compliance foundation
- ✅ Polish language support (i18n skeleton)
- ✅ Dark mode ready (CSS variables)

**What's NOT included (yet):**

- ❌ Educational Panel UI (PROMPT #2)
- ❌ Therapeutic Panel (PROMPT #3)
- ❌ Doctor Research Panel (PROMPT #4)
- ❌ Super Mózg Panel (PROMPT #5)
- ❌ Admin Panels (PROMPT #6-9)
- ❌ Mobile App (PROMPT #10-15)

---

## 🗣️ Support

**Issues with setup?**
- Check: `README.md` for full docs
- Check: `.github/workflows/deploy-vercel.yml` for deployment logic
- Check: `docs/GITHUB_SECRETS_SETUP.md` for secret management

**Ready for next phase?**
- Go to: `docs/PROMPT_2_EDUCATIONAL_PANEL.md`
- Copy prompt
- Paste into Claude Code Desktop
- Send!

---

## 🚀 You're Ready!

You now have:
- ✅ Clean production GitHub repo
- ✅ Auto-deployment pipeline
- ✅ 120+ environment variables documented
- ✅ Infrastructure scaffold ready
- ✅ PROMPT #1 to auto-generate everything

**Next step:** Run PROMPT #1 in Claude Code Desktop

**Time estimate:** 2-3 hours total (mostly waiting for auto-generation)

**Result:** Production-ready infrastructure! 🊉
