# 🚀 Deployment Guide - Bitcoin Tools & Trading Playground

Complete guide to deploy your app with backend to Vercel (or any hosting platform).

---

## 📋 Pre-Deployment Checklist

Before deploying, you need to set up these third-party services:

### 1. **Clerk (Authentication)** ✅ Required for Playground
- [ ] Sign up at [clerk.com](https://clerk.com)
- [ ] Create a new application
- [ ] Copy your API keys

### 2. **Supabase (Database)** ✅ Required for Portfolio Storage
- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create a new project
- [ ] Run the SQL schema (see below)
- [ ] Copy your project URL and anon key

### 3. **Finnhub (Stock Prices)** ✅ Required for Trading Simulator
- [ ] Sign up at [finnhub.io](https://finnhub.io/register)
- [ ] Get your free API key (60 API calls/minute)

### 4. **CoinGecko & Blockstream** ℹ️ Optional (No keys required)
- CoinGecko: Free BTC price API (no key needed)
- Blockstream: Free Bitcoin blockchain API (no key needed)

---

## 🗄️ Step 1: Set Up Supabase Database

### A. Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose a name, database password, and region (Sydney for Australia)
4. Wait for project to be created (~2 minutes)

### B. Run SQL Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql`:

\`\`\`sql
-- This will create the portfolios table
-- The schema is already in your project at: supabase-schema.sql
\`\`\`

4. Click **Run** or press `Ctrl+Enter`
5. Verify the table was created under **Database** → **Tables**

### C. Get Your Credentials
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJhbGc...`)

---

## 🔐 Step 2: Set Up Clerk Authentication

### A. Create Clerk Application
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **+ Create Application**
3. Name it "Bitcoin Tools" or similar
4. Enable **Email** and **Google** (optional) authentication
5. Click **Create Application**

### B. Configure Clerk
1. In Clerk dashboard, go to **Configure** → **Paths**
2. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/playground`
   - After sign-up: `/playground`

3. Go to **Webhooks** → **Add Endpoint**
   - URL: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Subscribe to: `user.created`
   - (You'll update this after deployment)

### C. Get Your API Keys
1. Go to **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

---

## 📈 Step 3: Get Finnhub API Key

1. Go to [finnhub.io/register](https://finnhub.io/register)
2. Sign up with your email
3. Verify your email
4. Go to [finnhub.io/dashboard](https://finnhub.io/dashboard)
5. Copy your **API Key**

**Free Tier Limits:**
- 60 API calls/minute
- Perfect for hackathon/demo use

---

## 🌐 Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (already done! ✅)

2. **Go to [vercel.com](https://vercel.com)**
   - Sign up/Login with GitHub
   - Click **Add New** → **Project**

3. **Import your GitHub repository**
   - Search for `TandaHackathon2026`
   - Click **Import**

4. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `my-app`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**
   Click **Environment Variables** and add:

   \`\`\`
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/playground
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/playground
   
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   
   FINNHUB_API_KEY=your_finnhub_key
   \`\`\`

6. **Deploy!**
   - Click **Deploy**
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI (Alternative)

\`\`\`bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to your project
cd my-app

# 4. Deploy
vercel --prod

# 5. Follow the prompts:
#    - Set up and deploy? Y
#    - Which scope? (your account)
#    - Link to existing project? N
#    - Project name? bitcoin-tools
#    - Directory? ./
#    - Override settings? N

# 6. Add environment variables via dashboard
# Go to: https://vercel.com/your-project/settings/environment-variables
\`\`\`

---

## 🔗 Step 5: Update Clerk Webhook

After deployment, update your Clerk webhook:

1. Copy your deployed URL: `https://your-project.vercel.app`
2. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
3. Update the endpoint URL to: `https://your-project.vercel.app/api/webhooks/clerk`
4. Click **Update**

---

## ✅ Step 6: Test Your Deployment

### Test Wallet Balance Checker
1. Go to `https://your-project.vercel.app/wallet`
2. Enter a test xpub (or use the one from your Bitcoin wallet)
3. Verify balance loads correctly

### Test Trading Playground
1. Go to `https://your-project.vercel.app/playground`
2. Sign up with a new account
3. Verify you get $100,000 play money
4. Try making a trade
5. Check that portfolio is saved

### Test API Routes
- `/api/portfolio` - Should create/load your portfolio
- `/api/quotes?symbols=AAPL,TSLA` - Should return stock prices
- `/api/webhooks/clerk` - Should create portfolio on signup

---

## 🐛 Troubleshooting

### "Failed to load portfolio"
- **Cause:** Supabase credentials are wrong or table not created
- **Fix:** 
  1. Check environment variables in Vercel dashboard
  2. Verify SQL schema was run in Supabase
  3. Check Supabase logs in dashboard

### "Authentication failed"
- **Cause:** Clerk keys are wrong or webhook not configured
- **Fix:**
  1. Verify Clerk API keys in Vercel
  2. Update webhook URL in Clerk dashboard
  3. Check webhook signing secret matches

### "No stock prices loading"
- **Cause:** Finnhub API key is invalid or rate limited
- **Fix:**
  1. Verify API key in Vercel dashboard
  2. Check Finnhub dashboard for usage limits
  3. Wait if rate limited (60 calls/min)

### Build errors
- **Cause:** Missing dependencies or TypeScript errors
- **Fix:**
  1. Check Vercel build logs
  2. Run `npm run build` locally first
  3. Fix any TypeScript errors

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- **Deployments:** View all deployments and their status
- **Logs:** Real-time function logs for debugging
- **Analytics:** Page views and performance metrics
- **Environment Variables:** Manage secrets securely

### Supabase Dashboard
- **Database:** View all portfolios and data
- **Logs:** SQL queries and API requests
- **Storage:** Monitor database size
- **Auth:** (Not used, using Clerk instead)

### Clerk Dashboard
- **Users:** View all signed-up users
- **Analytics:** Sign-up conversion rates
- **Webhooks:** Monitor webhook deliveries
- **Sessions:** Active user sessions

---

## 🚀 Optional: Custom Domain

### Add Custom Domain to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `bitcointools.com.au`
4. Follow DNS configuration instructions
5. Add CNAME record to your DNS provider:
   - Name: `@` or `www`
   - Value: `cname.vercel-dns.com`
6. Wait for DNS propagation (~10 minutes to 24 hours)

### Update Clerk URLs
After adding custom domain, update Clerk:
1. Go to **Clerk Dashboard** → **Domains**
2. Add your production domain
3. Update webhook URL to use custom domain

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Supabase database schema created
- [ ] Clerk webhook configured with production URL
- [ ] Test all features in production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Monitoring set up in Vercel dashboard
- [ ] Backup plan for database (Supabase auto-backups)

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Hackathon/Demo)
- **Vercel:** Free (Hobby plan)
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions included

- **Supabase:** Free
  - 500MB database
  - 50MB file storage
  - 2GB bandwidth
  - 50,000 monthly active users

- **Clerk:** Free (Development plan)
  - 10,000 monthly active users
  - All features included

- **Finnhub:** Free
  - 60 API calls/minute
  - Real-time stock prices

**Total Cost: $0/month** 🎉

### If You Need to Scale
- **Vercel Pro:** $20/month (more bandwidth & team features)
- **Supabase Pro:** $25/month (8GB database, more bandwidth)
- **Clerk Pro:** $25/month (unlimited users, advanced features)
- **Finnhub Premium:** $40-$400/month (more API calls)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Finnhub API Docs](https://finnhub.io/docs/api)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Vercel build logs
3. Check Supabase and Clerk dashboards for errors
4. Open an issue on GitHub
5. Contact support for the respective services

---

## 🎉 Congratulations!

Your Bitcoin Tools & Trading Playground app is now live with a fully functional backend! 

**Next Steps:**
1. Share your deployed URL with your team
2. Test all features thoroughly
3. Gather feedback from users
4. Monitor usage in dashboards
5. Scale up if needed

Good luck with your hackathon! 🚀
