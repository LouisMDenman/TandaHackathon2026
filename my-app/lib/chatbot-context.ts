/**
 * Codebase Context for Crypto Assistant Chatbot
 * This provides the chatbot with knowledge about the application
 */

export const WEBAPP_CONTEXT = `
# APPLICATION OVERVIEW
This is a comprehensive cryptocurrency web application called "Bitcoin Tools & Trading Simulator" built with Next.js 14, TypeScript, and deployed on Netlify.

## MAIN FEATURES

### 1. WALLET BALANCE CHECKER (/wallet)
- Check Bitcoin wallet balances using extended public keys (xpub, ypub, zpub)
- **Supported formats:**
  - xpub: Legacy addresses (starting with 1)
  - ypub: Nested SegWit addresses (starting with 3)
  - zpub: Native SegWit addresses (starting with bc1)
- **Also supports:**
  - Ethereum addresses (0x...)
  - Solana addresses (base58 format)
- **Privacy:** No data is stored, everything processed in real-time
- **How it works:** Uses BIP44 gap limit standard (scans until 20 consecutive unused addresses)
- **APIs used:** Blockstream API for Bitcoin, Alchemy/Infura for Ethereum, Solana RPC for Solana
- **Balance display:** Shows balance in both crypto and AUD using CoinGecko API

### 2. TRADING PLAYGROUND (/playground)
- Paper trading simulator with real-time market data
- **Starting balance:** $100,000 fake money
- **Features:**
  - Real-time price feeds from Finnhub API
  - Buy/sell stocks with fake money
  - Portfolio tracking
  - Trade history
  - Interactive charts with price visualization
  - Risk-free learning environment
- **Requires:** User authentication via Clerk
- **Data storage:** Uses Supabase for storing user portfolios and trade history

### 3. AUTHENTICATION
- Uses Clerk for user authentication
- Sign in/Sign up required only for Trading Playground
- Wallet checker works without authentication

### 4. CRYPTO ASSISTANT CHATBOT
- AI-powered assistant using Google Gemini API
- Helps users understand crypto concepts
- Answers questions about the webapp features
- Located in bottom-right corner (floating button)
- Created by "Santa Claude" team

## TECHNICAL STACK
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Authentication:** Clerk
- **Database:** Supabase
- **APIs:**
  - Google Gemini AI (chatbot)
  - Blockstream (Bitcoin blockchain data)
  - CoinGecko (crypto prices)
  - Finnhub (stock/crypto market data)
  - Alchemy/Infura (Ethereum data)
  - Solana RPC (Solana data)
- **Deployment:** Netlify with serverless functions
- **Styling:** Custom CSS with glassmorphism effects, gradients, and animations

## KEY PAGES & ROUTES
- **/** - Landing page with hero section and feature showcase
- **/wallet** - Wallet balance checker
- **/playground** - Trading simulator (requires auth)
- **/sign-in** - Clerk authentication
- **/sign-up** - User registration
- **API Routes:**
  - /api/chat - Chatbot endpoint
  - /api/portfolio - Portfolio management
  - /api/quotes - Stock/crypto price quotes
  - /api/solana-rpc - Solana blockchain queries

## HOW TO USE THE APP

### Checking Wallet Balance:
1. Go to /wallet page
2. Paste your xpub/ypub/zpub (Bitcoin) or address (ETH/SOL)
3. Click "Check Balance"
4. View your balance in crypto and AUD
5. No signup needed, completely private

### Trading Simulator:
1. Sign up/Sign in with Clerk
2. Go to /playground
3. Start with $100,000 fake money
4. Search for stocks/crypto to trade
5. Buy/sell using real market prices
6. Track your portfolio performance
7. Learn trading without risk

## SECURITY & PRIVACY
- Extended public keys (xpub/ypub/zpub) are read-only - cannot spend funds
- No wallet data is stored on servers
- Client-side address derivation using cryptographic libraries
- Clerk handles authentication securely
- Environment variables protect API keys

## COMMON USER QUESTIONS

**Q: Is my Bitcoin safe?**
A: Yes! xpub/ypub/zpub keys can only VIEW balances, not spend. Your funds are completely safe.

**Q: Do you store my wallet information?**
A: No! Everything is processed in real-time and discarded immediately.

**Q: Is the trading real?**
A: No, it's paper trading with fake money ($100k starting balance) but REAL market prices.

**Q: Do I need to sign up?**
A: Only for the Trading Playground. Wallet checker works without signup.

**Q: What cryptocurrencies are supported?**
A: Bitcoin (xpub/ypub/zpub), Ethereum (addresses), and Solana (addresses) for balance checking.

**Q: How do I get my xpub/ypub/zpub?**
A: Export from wallets like Electrum, BlueWallet, or Ledger Live. Never share private keys!

**Q: The chatbot isn't working?**
A: Make sure GEMINI_API_KEY is configured in environment variables.

## DEVELOPER INFO
- **Repository:** GitHub (TandaHackathon2026)
- **Framework:** Next.js 14 with App Router
- **Team:** Santa Claude
- **Purpose:** Educational crypto tool for learning about wallets and trading
`;
