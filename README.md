# ₿ Bitcoin Tools & Trading Playground

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**A stunning full-stack crypto & trading platform with real-time data, authentication, and beautiful UI**

[Live Demo](#) • [Documentation](./DEPLOYMENT.md) • [Quick Deploy](./QUICK-DEPLOY.md)

</div>

---

## ✨ Features

### 💰 **Bitcoin Wallet Balance Checker**
- ✅ Check Bitcoin wallet balances using xpub/ypub/zpub keys
- ✅ Auto-detect wallet format (Legacy/SegWit/Native SegWit)
- ✅ BIP44 gap limit scanning for comprehensive balance checking
- ✅ Private and secure - no data storage
- ✅ Real-time blockchain queries via Blockstream API
- ✅ BTC to AUD conversion with live prices

### 🎮 **Trading Playground**
- ✅ Practice trading with $100,000 virtual money
- ✅ Real-time stock prices (BTC, ASX stocks)
- ✅ Live price charts with interactive UI
- ✅ Portfolio tracking with gain/loss calculations
- ✅ Trade history with timestamps
- ✅ Persistent storage across sessions

### 🎨 **Stunning UI/UX**
- ✅ Glass-morphism design with backdrop blur
- ✅ Animated gradient backgrounds with floating orbs
- ✅ Smooth transitions and micro-interactions
- ✅ 3D card hover effects
- ✅ Neon text effects with glow
- ✅ Responsive design for all devices
- ✅ Dark mode with beautiful gradients

### 🔐 **Authentication & Security**
- ✅ Clerk authentication integration
- ✅ Protected routes with middleware
- ✅ User-specific portfolio data
- ✅ Automatic portfolio creation on signup
- ✅ Row-level security in database

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Finnhub](https://finnhub.io)

### **1. Clone & Install**
```bash
git clone https://github.com/LouisMDenman/TandaHackathon2026.git
cd TandaHackathon2026/my-app
npm install
```

### **2. Set Up Environment Variables**
Create `.env.local` from the template:
```bash
cp .env.local.example .env.local
```

Fill in your API keys:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Finnhub Stock Prices
FINNHUB_API_KEY=your_key_here
```

### **3. Set Up Database**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Run the SQL schema from `supabase-schema.sql`
4. Copy your credentials to `.env.local`

### **4. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── portfolio/route.ts      # Portfolio CRUD operations
│   │   ├── quotes/route.ts         # Stock price API
│   │   └── webhooks/clerk/route.ts # User creation webhook
│   ├── playground/
│   │   ├── components/             # Trading UI components
│   │   │   ├── TickerCard.tsx     # Price display cards
│   │   │   ├── TradeForm.tsx      # Buy/sell interface
│   │   │   ├── Portfolio.tsx      # Holdings display
│   │   │   └── HistoryList.tsx    # Trade history
│   │   ├── StockChart.tsx          # Price charts
│   │   ├── usePriceFeed.tsx        # Real-time price hook
│   │   └── page.tsx                # Main trading page
│   ├── wallet/page.tsx             # Bitcoin balance checker
│   ├── sign-in/[[...sign-in]]/     # Clerk auth pages
│   ├── sign-up/[[...sign-up]]/
│   └── page.tsx                    # Landing page
├── components/
│   ├── Navigation.tsx              # Site navigation
│   ├── WalletInput.tsx             # Wallet key input
│   ├── BalanceDisplay.tsx          # Balance results
│   ├── LoadingState.tsx            # Loading UI
│   └── ErrorDisplay.tsx            # Error handling
├── lib/
│   ├── api/
│   │   ├── blockstream.ts          # Bitcoin blockchain API
│   │   ├── coingecko.ts            # Crypto price API
│   │   └── ethereum.ts             # Ethereum support
│   ├── bitcoin/
│   │   ├── deriveAddresses.ts      # BIP32/44/49/84 derivation
│   │   ├── scanAddresses.ts        # Gap limit scanning
│   │   ├── autoDetectFormat.ts     # Format detection
│   │   └── detectKeyType.ts        # Key validation
│   ├── utils/
│   │   └── format.ts               # Number formatting
│   └── supabase.ts                 # Database client
├── middleware.ts                    # Route protection
└── supabase-schema.sql             # Database schema
```

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + CSS Modules
- **UI Library:** React 19
- **State Management:** React Hooks
- **Charts:** Chart.js + react-chartjs-2

### **Backend**
- **API Routes:** Next.js API Routes (Serverless)
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **ORM:** Supabase Client

### **External APIs**
- **Blockstream:** Bitcoin blockchain data
- **CoinGecko:** Cryptocurrency prices
- **Finnhub:** Stock market prices
- **Clerk:** User authentication

### **Blockchain**
- **bitcoinjs-lib:** Bitcoin address derivation
- **bip32:** HD wallet derivation
- **bs58check:** Base58 encoding/decoding

### **DevOps**
- **Hosting:** Vercel (recommended)
- **CI/CD:** GitHub Actions (optional)
- **Monitoring:** Vercel Analytics

---

## 🎨 UI Showcase

### **Landing Page**
- Animated gradient background with floating orbs
- Particle effects with smooth animations
- Glass-morphism hero section
- Feature cards with 3D hover effects
- Comprehensive information sections

### **Wallet Balance Checker**
- Modern dark theme with neon accents
- Glass-morphism input cards
- Real-time validation with visual feedback
- Animated loading states
- Beautiful results display

### **Trading Playground**
- Live price tickers with color indicators
- Interactive trade form with validation
- Portfolio display with gain/loss
- Trade history timeline
- Authentication gate for new users

---

## 🔧 Key Features Explained

### **Bitcoin Wallet Scanning**
Uses BIP44 gap limit standard:
1. Derives addresses from xpub/ypub/zpub
2. Checks blockchain for transactions
3. Continues until 20 consecutive unused addresses
4. Ensures all funds are found

### **Auto-Format Detection**
Automatically detects if user provided wrong format:
1. Tests Legacy (1...), SegWit (3...), Native SegWit (bc1...)
2. Checks first 3 addresses on blockchain
3. Determines which format has transactions
4. Uses correct format for full scan

### **Real-Time Trading**
Live price updates every 10 seconds:
- Fetches prices from Finnhub API
- Updates all tickers simultaneously
- Maintains price history for charts
- Handles API rate limits gracefully

### **Portfolio Persistence**
Debounced saves to prevent excessive writes:
- 1-second delay after each change
- Automatically saves to Supabase
- Syncs across devices
- Handles conflicts gracefully

---

## 📊 API Routes

### **GET /api/portfolio**
Get user's portfolio data
- Requires authentication
- Returns balance, holdings, history

### **POST /api/portfolio**
Update user's portfolio
- Requires authentication
- Accepts balance, holdings, history

### **GET /api/quotes?symbols=BTC,AAPL&range=1D**
Get stock prices
- `symbols`: Comma-separated tickers
- `range`: 1D, 1W, 1M, ALL
- Returns current prices + history

### **POST /api/webhooks/clerk**
Clerk user creation webhook
- Called when new user signs up
- Creates initial portfolio with $100k

---

## 🧪 Testing

### **Run Tests**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### **Test Coverage**
- ✅ Bitcoin address derivation
- ✅ Key format detection
- ✅ Balance calculations
- ✅ API client error handling
- ✅ Number formatting utilities

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

#### **Quick Deploy (5 minutes)**
See [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) for fastest method

#### **Full Deploy Guide**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide

#### **One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LouisMDenman/TandaHackathon2026)

### **Environment Variables (Production)**
Set these in Vercel Dashboard:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
FINNHUB_API_KEY=xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/playground
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/playground
```

### **Post-Deployment**
1. Update Clerk webhook URL with your production domain
2. Test all features in production
3. Monitor logs in Vercel dashboard

---

## 💰 Cost Breakdown

### **Free Tier (Perfect for Demo/Hackathon)**
- **Vercel:** Free (Hobby)
  - Unlimited deployments
  - 100GB bandwidth/month
- **Supabase:** Free
  - 500MB database
  - 50MB storage
  - 50k monthly active users
- **Clerk:** Free (Development)
  - 10k monthly active users
- **Finnhub:** Free
  - 60 API calls/minute
- **Blockstream & CoinGecko:** Free (no limits)

**Total: $0/month** 🎉

### **Scaling (If Needed)**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Clerk Pro: $25/month
- Finnhub Premium: $40+/month

---

## 🐛 Troubleshooting

### **"Failed to load portfolio"**
- Check Supabase credentials in `.env.local`
- Verify SQL schema was run
- Check Supabase logs for errors

### **"Authentication failed"**
- Verify Clerk keys are correct
- Update webhook URL in Clerk dashboard
- Check middleware is not blocking routes

### **"No stock prices"**
- Verify Finnhub API key
- Check rate limits (60/min on free tier)
- Try different stock symbols

### **Build errors**
- Run `npm install` to ensure all dependencies
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Quick Deploy](./QUICK-DEPLOY.md) - 5-minute deploy guide
- [Environment Variables](./.env.local.example) - All required variables
- [Database Schema](./supabase-schema.sql) - Supabase table setup
- [API Documentation](#-api-routes) - API route reference

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - Feel free to use this project however you like!

---

## 🎯 Roadmap

### **Completed ✅**
- ✅ Bitcoin wallet balance checker
- ✅ Trading playground with real-time prices
- ✅ User authentication
- ✅ Portfolio persistence
- ✅ Beautiful UI with animations
- ✅ Ethereum wallet support (basic)

### **Future Ideas 💡**
- [ ] More crypto support (ETH, SOL, etc.)
- [ ] Advanced charting (candlesticks, indicators)
- [ ] Social features (leaderboard, sharing)
- [ ] Paper trading competitions
- [ ] Mobile app (React Native)
- [ ] AI-powered trading suggestions

---

## 🏆 Built For

**Tanda Hackathon 2026**

This project demonstrates modern full-stack development with:
- Beautiful UI/UX design
- Real-time data integration
- Secure authentication
- Database persistence
- API integration
- Blockchain technology
- Best practices & clean code

---

## 👥 Team

Built with ❤️ by the team

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - Amazing React framework
- [Clerk](https://clerk.com) - Seamless authentication
- [Supabase](https://supabase.com) - Powerful database
- [Finnhub](https://finnhub.io) - Stock market data
- [Blockstream](https://blockstream.info) - Bitcoin blockchain API
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS

---

## 📞 Support

- 🐛 [Report a Bug](https://github.com/LouisMDenman/TandaHackathon2026/issues)
- 💡 [Request a Feature](https://github.com/LouisMDenman/TandaHackathon2026/issues)
- 📧 Email: TBA

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with 💻 and ☕ for Tanda Hackathon 2026

</div>
