# 🔐 GitHub Secrets Setup

## Why Use GitHub Secrets?

- ✅ Never commit actual API keys to repository
- ✅ Automatic secret scanning & alerts
- ✅ Keys only available in GitHub Actions during deployment
- ✅ Full audit trail of access
- ✅ Can rotate keys without code changes

---

## How to Add Secrets

### Step 1: Go to GitHub Settings

1. Open: https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod/settings
2. Click: **Secrets and variables** → **Actions**
3. Click: **New repository secret**

### Step 2: Add Each Secret

**Format:**
```
Name: EXACT_VARIABLE_NAME (from .env.example)
Value: your_actual_secret_value
```

**Click: Add secret** (repeat for each)

---

## Critical Secrets (Must Have)

### 💳 Payment & Invoicing (TIER 1)

```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ACCOUNT_ID=acct_...
INFAKT_API_KEY=...
WISE_API_TOKEN=...
```

### 🔠 AI Providers (TIER 3)

```
DEEPSEEK_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
TOGETHER_API_KEY=tgp_v1_...
```

### 📄 Research APIs (TIER 4)

```
BRAVE_SEARCH_API_KEY=BSA...
NCBI_API_KEY=...
SCOPUS_API_KEY=...
WILEY_TDM_TOKEN=...
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
```

### ☁️ Infrastructure (TIER 5)

```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sbp_...
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntryu_...
GOOGLE_CLOUD_API_KEY=AIza...
CODECOV_TOKEN=...
GITHUB_TOKEN=ghp_...
```

### 🔇 Authentication (TIER 6)

```
NEXTAUTH_SECRET=...
```

### 🎥 Video (TIER 7)

```
DID_API_KEY=YWI...
```

---

## All 120+ Secrets

### TIER 1: Payment & Invoicing (9 secrets)

```
1.  STRIPE_PUBLISHABLE_KEY
2.  STRIPE_SECRET_KEY
3.  STRIPE_WEBHOOK_SECRET
4.  STRIPE_ACCOUNT_ID
5.  INFAKT_API_KEY
6.  WISE_API_TOKEN
7.  WISE_PROFILE_ID
8.  WISE_MEMBERSHIP_NUMBER
9.  WISE_ACCOUNT_ID_PLN
```

### TIER 2: Google Cloud (5 secrets)

```
10. GOOGLE_CLOUD_API_KEY
11. GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL
```

### TIER 3: AI Providers (5 secrets)

```
12. DEEPSEEK_API_KEY
13. GROQ_API_KEY
14. ANTHROPIC_API_KEY
15. OPENAI_API_KEY
16. TOGETHER_API_KEY
```

### TIER 4: Research APIs (7 secrets)

```
17. BRAVE_SEARCH_API_KEY_FREE
18. BRAVE_SEARCH_API_KEY
19. BRAVE_SEARCH_AI_KEY
20. NCBI_API_KEY
21. SCOPUS_API_KEY
22. WILEY_TDM_TOKEN
23. EXA_API_KEY
24. SONAR_API_KEY
25. PERPLEXITY_API_KEY
```

### TIER 5: Deployment & Infrastructure (11 secrets)

```
26. VERCEL_TOKEN
27. VERCEL_ORG_ID
28. VERCEL_PROJECT_ID
29. NEXT_PUBLIC_SUPABASE_URL
30. NEXT_PUBLIC_SUPABASE_ANON_KEY
31. SUPABASE_SERVICE_ROLE_KEY
32. NEXT_PUBLIC_SENTRY_DSN
33. SENTRY_AUTH_TOKEN
34. CODECOV_TOKEN
35. GITHUB_TOKEN
36. SLACK_WEBHOOK_URL (optional for Slack notifications)
```

### TIER 6: Authentication (2 secrets)

```
37. NEXTAUTH_SECRET
```

### TIER 7: Video Generation (1 secret)

```
38. DID_API_KEY
```

### Configuration Variables (Non-Secret)

**Note:** These are NOT secrets (public values OK)

```
- GOOGLE_CLOUD_PROJECT_ID
- SUPABASE_PROJECT_ID
- SUPABASE_PROJECT_REGION
- SELLER_NIP
- SELLER_REGON
- TAX_RATE
- NODE_ENV=production
LogLevel=info
```

---

## Verification Checklist

### GitHub Secrets Dashboard

- [ ] STRIPE_SECRET_KEY ✅
- [ ] SUPABASE_SERVICE_ROLE_KEY ✅
- [ ] DEEPSEEK_API_KEY ✅
- [ ] ANTHROPIC_API_KEY ✅
- [ ] NEXT_PUBLIC_SENTRY_DSN ✅
- [ ] SENTRY_AUTH_TOKEN ✅
- [ ] VERCEL_TOKEN ✅
- [ ] CODECOV_TOKEN ✅
- [ ] GOOGLE_CLOUD_API_KEY ✅
- [ ] All 30+ others... ✅

### Test Deployment

1. Push to `main` branch:
   ```bash
   git add .
   git commit -m "test: verify github actions"
   git push origin main
   ```

2. Watch workflow:
   - Go: https://github.com/PotrzebnyAI/potrzebny-ai-v3-prod/actions
   - Click: Latest workflow run
   - Check: All steps pass ✅

3. Verify Vercel deployment:
   - Go: https://potrzebny-ai-v3.vercel.app
   - Should show landing page ✅

---

## Secret Rotation

### When to Rotate?

- ⚠️ Compromised (leaked online)
- ⚠️ API provider recommends
- ⚠️ Employee leaves
- ⚠️ Regular rotation (monthly)

### How to Rotate?

1. Generate new key on provider (Stripe, Google Cloud, etc.)
2. Update GitHub Secret:
   - Settings → Secrets → Edit secret
   - Paste new value
   - Click: Update secret
3. Optionally revoke old key on provider
4. Deployment auto-uses new key next time

---

## Troubleshooting

### "Workflow failed - Missing secret XYZ"

**Solution:**
1. Check `.github/workflows/deploy-vercel.yml`
2. Find line with `${{ secrets.XYZ }}`
3. Go to GitHub Settings → Secrets
4. Add the missing secret

### "Secret scanning detected XYZ in commit"

**Solution:**
1. GitHub automatically blocks commit
2. Never commit secrets again
3. Use GitHub Secrets instead
4. Rotate compromised key

### "Vercel deployment fails with error X"

**Solution:**
1. Check Vercel logs: https://vercel.com/dashboard
2. Look for "Missing environment variable" error
3. Find variable name
4. Add to GitHub Secrets
5. Re-run workflow

---

## Security Best Practices

- ✅ **Never paste secrets in Slack/Discord**
- ✅ **Never commit .env.local to Git**
- ✅ **Always use GitHub Secrets for CI/CD**
- ✅ **Rotate keys quarterly**
- ✅ **Use different keys for dev/staging/prod**
- ✅ **Enable secret scanning in GitHub**
- ✅ **Add collaborators only when needed**
- ✅ **Use branch protection rules** (require reviews before merge)

---

## Quick Add All Script (CLI)

If you have all 120+ keys in `.env.local`:

```bash
#!/bin/bash
# Load .env.local
set -a
source .env.local
set +a

# Add each to GitHub
for var in STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_ACCOUNT_ID INFAKT_API_KEY DEEPSEEK_API_KEY ANTHROPIC_API_KEY OPENAI_API_KEY GROQ_API_KEY NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID NEXT_PUBLIC_SENTRY_DSN SENTRY_AUTH_TOKEN GOOGLE_CLOUD_API_KEY CODECOV_TOKEN GITHUB_TOKEN NEXTAUTH_SECRET DID_API_KEY BRAVE_SEARCH_API_KEY NCBI_API_KEY SCOPUS_API_KEY WILEY_TDM_TOKEN PERPLEXITY_API_KEY EXA_API_KEY WISE_API_TOKEN TOGETHER_API_KEY NEXTAUTH_SECRET; do
  if [ -n "${!var}" ]; then
    # Use GitHub CLI if available
    # gh secret set $var -b "${!var}" --repo PotrzebnyAI/potrzebny-ai-v3-prod
    echo "✅ Would add: $var"
  fi
done
```

**Note:** Requires GitHub CLI: https://cli.github.com

---

## Next Steps

1. ✅ Add all 120+ GitHub Secrets
2. ✅ Test workflow on main branch
3. ✅ Verify Vercel deployment
4. ✅ Start PROMPT #1 in Claude Code Desktop
5. ✅ Push generated files
6. ✅ Auto-deploy to production
