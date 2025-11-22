# 🚀 Play Money Markets

A beautiful, modern stock trading simulator with real-time market data, user authentication, and persistent portfolio tracking.

## ✨ Features

- 🎨 **Stunning UI** - Glassmorphism, animated gradients, micro-interactions
- 📊 **Real-Time Prices** - Live stock data from actual markets  
- 💰 **Practice Trading** - Start with $100,000 virtual money
- 🔐 **User Auth** - Secure sign-in with Clerk
- 💾 **Data Persistence** - Portfolio saved to Supabase database
- 📈 **Live Charts** - Beautiful Chart.js visualizations
- 📱 **Responsive Design** - Works on all devices

## 🏃 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Auth & Database
📖 **Follow the 15-minute guide:** `SETUP-AUTH.md`  
✅ **Quick checklist:** `QUICK-SETUP-CHECKLIST.md`

**Summary:**
1. Get Clerk keys from https://dashboard.clerk.com/
2. Get Supabase keys from https://supabase.com/
3. Run database migration (copy/paste SQL)
4. Add all keys to `.env.local`

### 3. Run Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with TypeScript
- **Styling:** Tailwind CSS + CSS Modules
- **Auth:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Charts:** Chart.js
- **API:** Twelve Data (stock prices)

## 📁 Project Structure

```
app/
├── api/
│   ├── portfolio/          # Portfolio CRUD
│   ├── quotes/             # Stock prices
│   └── webhooks/clerk/     # User webhooks
├── playground/             # Trading interface
│   ├── components/         # UI components
│   ├── StockChart.tsx      # Charts
│   └── usePriceFeed.tsx    # Real-time prices
├── sign-in/                # Auth pages
├── sign-up/
└── page.tsx                # Landing page
```

## 🎨 What Makes This Special

### Visual Design
- **Glassmorphism cards** with backdrop blur
- **Animated gradient backgrounds** with floating orbs
- **Shimmer effects** on hover
- **Multi-layered shadows** for depth
- **Smooth micro-interactions** everywhere

### Technical Features
- **Debounced database writes** (1s delay)
- **Optimistic UI updates** 
- **Protected routes** with middleware
- **Row-level security** in database
- **Real-time price feeds** with WebSockets

## 🚀 Deployment

Deploy to Vercel in one click:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

## 📝 Environment Variables

Create `.env.local` with:

```bash
# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 💡 Demo Tips

1. Show the **stunning landing page**
2. **Sign up live** to demonstrate auth
3. **Execute trades** with real-time prices
4. **Open Supabase** to prove data persistence
5. **Sign out/in** to show cross-device sync

## 🤝 Contributing

Hackathon project - but PRs welcome!

## 📄 License

MIT - Use freely!

---

**Built with ❤️ for the hackathon. Good luck! 🏆**
