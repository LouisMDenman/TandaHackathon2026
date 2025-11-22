# ⚡ Quick Deploy Guide (5 Minutes)

The fastest way to get your app deployed with backend.

---

## 🎯 Quick Steps

### 1️⃣ Get Your API Keys (5 min)

Open these tabs and sign up:

**Clerk (Authentication):**
- 🔗 [clerk.com](https://clerk.com) → Create Application → Copy keys
- Time: 2 minutes

**Supabase (Database):**
- 🔗 [supabase.com](https://supabase.com) → New Project → Run SQL schema → Copy URL & key
- Time: 3 minutes

**Finnhub (Stock Prices):**
- 🔗 [finnhub.io/register](https://finnhub.io/register) → Verify email → Copy API key
- Time: 2 minutes

---

### 2️⃣ Deploy to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click **Add New** → **Project**
4. Import `TandaHackathon2026`
5. Set Root Directory: `my-app`
6. Add Environment Variables:

\`\`\`bash
# Copy from Step 1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
FINNHUB_API_KEY=xxx

# These are static
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/playground
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/playground
\`\`\`

7. Click **Deploy**
8. Wait 2-3 minutes ☕

---

### 3️⃣ Configure Clerk Webhook (1 min)

After deployment:

1. Copy your Vercel URL: `https://your-app.vercel.app`
2. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
3. Add Endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
4. Subscribe to: `user.created`
5. Save

---

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

### Test It:
- ✅ Wallet: `/wallet`
- ✅ Playground: `/playground` (sign up first)
- ✅ Trading: Make a trade in playground

---

## 🐛 Issues?

### Build Failed?
- Check Vercel logs
- Verify all env vars are set

### Can't Sign In?
- Update Clerk webhook URL
- Check Clerk dashboard for errors

### No Stock Prices?
- Verify Finnhub API key
- Check you're not rate limited (60/min)

### Portfolio Not Saving?
- Run SQL schema in Supabase
- Verify Supabase credentials

---

## 📖 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

---

**Total Time: ~8 minutes** ⏱️

Good luck! 🚀
