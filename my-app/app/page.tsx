"use client"
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

/**
 * Landing Page
 * Main landing page for Bitcoin Tools - Wallet Checker & Trading Playground
 * Combines animated hero section with comprehensive informational content
 */

export default function Home() {
  return (
    <>
      {/* Hero Section with Animated Background */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-shift"></div>
        
        {/* Floating orbs with EXTREME glow */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-float" 
             style={{
               boxShadow: '0 0 100px 50px rgba(139, 92, 246, 0.3), 0 0 200px 100px rgba(139, 92, 246, 0.2)'
             }}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-30 animate-float-delay-1"
             style={{
               boxShadow: '0 0 100px 50px rgba(59, 130, 246, 0.3), 0 0 200px 100px rgba(59, 130, 246, 0.2)'
             }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-30 animate-float-delay-2"
             style={{
               boxShadow: '0 0 100px 50px rgba(6, 182, 212, 0.3), 0 0 200px 100px rgba(6, 182, 212, 0.2)'
             }}></div>
        
        {/* Particle effect overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => {
            // Use index-based deterministic values instead of Math.random()
            const left = (i * 17 + 13) % 100;
            const top = (i * 23 + 7) % 100;
            const duration = 3 + (i % 4);
            const delay = (i * 0.3) % 5;
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `particle-float ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  opacity: 0.6
                }}
              />
            );
          })}
        </div>
        
        <main className="relative z-10 flex min-h-screen w-full max-w-6xl flex-col items-center justify-center py-20 px-8 text-center">
          {/* User button in top right */}
          <div className="absolute top-8 right-8">
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12 ring-2 ring-white/30 hover:ring-white/50 transition-all"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Hero section */}
          <div className="fade-in mb-12">
            <div className="inline-block mb-6 px-8 py-3 rounded-full bg-white/5 backdrop-blur-md border-2 border-white/30 relative overflow-hidden group cursor-pointer"
                 style={{
                   boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
                 }}>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-widest relative z-10 group-hover:from-cyan-200 group-hover:to-purple-200 transition-all duration-300"
                    style={{
                      textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                    }}>
                ✨ BITCOIN TOOLS & MARKET SIMULATOR ✨
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x neon-text"
                    style={{
                      textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)'
                    }}>
                Bitcoin Tools
              </span>
              <br />
              <span className="text-white neon-text"
                    style={{
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
                    }}>& Trading Simulator</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Check your Bitcoin wallet balance privately, or learn trading with{" "}
              <span className="text-cyan-400 font-bold">fake money</span> and{" "}
              <span className="text-purple-400 font-bold">real prices</span>. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black shadow-2xl transition-all duration-300 overflow-hidden"
                          style={{
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.boxShadow = '0 0 60px rgba(139, 92, 246, 0.8), 0 0 120px rgba(139, 92, 246, 0.6), 0 30px 80px rgba(0, 0, 0, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-8px) scale(1.08)';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          }}>
                    <span className="relative z-10 flex items-center gap-3">
                      Start Trading
                      <span className="text-3xl group-hover:translate-x-2 transition-transform duration-300">🚀</span>
                    </span>
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Link
                  href="/playground"
                  className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black shadow-2xl transition-all duration-300 overflow-hidden inline-block"
                  style={{
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.boxShadow = '0 0 60px rgba(139, 92, 246, 0.8), 0 0 120px rgba(139, 92, 246, 0.6), 0 30px 80px rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.08)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Go to Playground
                    <span className="text-3xl group-hover:translate-x-2 transition-transform duration-300">🎮</span>
                  </span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </Link>
              </SignedIn>
              
              <Link
                href="/wallet"
                className="group relative px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white text-lg font-bold transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  Check Wallet Balance
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">₿</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Features - ENHANCED */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full fade-in">
            <div className="glass-card p-8 group cursor-pointer"
                 style={{
                   transform: 'perspective(1000px) rotateY(0deg)',
                   transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                 }}
                 onMouseEnter={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) translateY(-10px)';
                 }}
                 onMouseLeave={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0)';
                 }}>
              <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">₿</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Wallet Balance Checker</h3>
              <p className="text-slate-300 leading-relaxed">
                Check your Bitcoin balance privately using xpub, ypub, or zpub keys. No signup required.
              </p>
            </div>
            
            <div className="glass-card p-8 group cursor-pointer glow-border"
                 style={{
                   transform: 'perspective(1000px) rotateY(0deg)',
                   transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                 }}
                 onMouseEnter={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) translateY(-10px) scale(1.05)';
                 }}
                 onMouseLeave={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0) scale(1)';
                 }}>
              <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">📈</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Real-Time Trading</h3>
              <p className="text-slate-300 leading-relaxed">
                Practice trading with live market prices from real exchanges. Zero risk, real learning.
              </p>
            </div>
            
            <div className="glass-card p-8 group cursor-pointer"
                 style={{
                   transform: 'perspective(1000px) rotateY(0deg)',
                   transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                 }}
                 onMouseEnter={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) translateY(-10px)';
                 }}
                 onMouseLeave={(e: any) => {
                   e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0)';
                 }}>
              <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">Track Performance</h3>
              <p className="text-slate-300 leading-relaxed">
                Monitor your portfolio and review your trading history to improve your skills.
              </p>
            </div>
          </div>

          {/* Stats - ENHANCED */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
            <div className="text-center fade-in group cursor-pointer">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{
                     textShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
                   }}>
                $100K
              </div>
              <div className="text-slate-300 mt-2 font-bold text-lg group-hover:text-cyan-400 transition-colors">
                Starting Balance
              </div>
              <div className="w-24 h-1 mx-auto mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full group-hover:w-32 transition-all duration-300"
                   style={{
                     boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                   }}></div>
            </div>
            <div className="text-center fade-in group cursor-pointer">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 neon-text mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{
                     textShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
                   }}>
                Real-Time
              </div>
              <div className="text-slate-300 mt-2 font-bold text-lg group-hover:text-purple-400 transition-colors">
                Market Data
              </div>
              <div className="w-24 h-1 mx-auto mt-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-32 transition-all duration-300"
                   style={{
                     boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                   }}></div>
            </div>
            <div className="text-center fade-in group cursor-pointer">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 neon-text mb-4 group-hover:scale-110 transition-transform duration-300"
                   style={{
                     textShadow: '0 0 40px rgba(16, 185, 129, 0.6)'
                   }}>
                Private
              </div>
              <div className="text-slate-300 mt-2 font-bold text-lg group-hover:text-green-400 transition-colors">
                No Data Stored
              </div>
              <div className="w-24 h-1 mx-auto mt-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:w-32 transition-all duration-300"
                   style={{
                     boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
                   }}></div>
            </div>
          </div>
        </main>
      </div>

      {/* Wallet Balance Checker Information Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Supported Formats Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Bitcoin Wallet Balance Checker
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Check your Bitcoin wallet balance privately using extended public keys. 
              No signup required, completely free.
            </p>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Supported Wallet Formats
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* xpub */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-orange-600">X</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">xpub</h3>
                  <p className="text-sm text-gray-600 mb-2">Legacy (P2PKH)</p>
                  <p className="text-xs text-gray-500">
                    Addresses starting with <span className="font-mono font-semibold">1</span>
                  </p>
                </div>
              </div>

              {/* ypub */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-blue-600">Y</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ypub</h3>
                  <p className="text-sm text-gray-600 mb-2">Nested SegWit (P2SH-P2WPKH)</p>
                  <p className="text-xs text-gray-500">
                    Addresses starting with <span className="font-mono font-semibold">3</span>
                  </p>
                </div>
              </div>

              {/* zpub */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-green-600">Z</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">zpub</h3>
                  <p className="text-sm text-gray-600 mb-2">Native SegWit (P2WPKH)</p>
                  <p className="text-xs text-gray-500">
                    Addresses starting with <span className="font-mono font-semibold">bc1</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Use Our Balance Checker?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* No Signup */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Signup Required</h3>
                <p className="text-gray-600">
                  Start checking your balance immediately. No accounts, no emails, no registration.
                </p>
              </div>

              {/* No Data Stored */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Stored</h3>
                <p className="text-gray-600">
                  Your wallet information is never saved. Everything is processed in real-time and discarded.
                </p>
              </div>

              {/* Free to Use */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Completely Free</h3>
                <p className="text-gray-600">
                  No hidden fees, no premium tiers. Check as many wallets as you want, anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Enter Your Extended Public Key
                  </h3>
                  <p className="text-gray-600">
                    Paste your xpub, ypub, or zpub key. Our tool automatically detects the format
                    and validates it for you.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Scan Addresses with Gap Limit
                  </h3>
                  <p className="text-gray-600">
                    We scan addresses using BIP44 gap limit standard, checking until we find 20 
                    consecutive unused addresses to ensure all your funds are found.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Check Blockchain
                  </h3>
                  <p className="text-gray-600">
                    Each address is checked against the Bitcoin blockchain using the Blockstream API
                    to retrieve current balances.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    View Results
                  </h3>
                  <p className="text-gray-600">
                    Your total balance is displayed in both BTC and AUD, with the current exchange
                    rate fetched from CoinGecko.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <svg
                className="w-12 h-12 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-center mb-12">
              Security & Privacy Guaranteed
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Read-Only Access</h3>
                    <p className="text-gray-300 text-sm">
                      Extended public keys can only view addresses and balances. They cannot be used
                      to spend funds or access your wallet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">No Data Storage</h3>
                    <p className="text-gray-300 text-sm">
                      We never store your extended public keys, addresses, or balance information.
                      Everything is discarded after display.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Client-Side Processing</h3>
                    <p className="text-gray-300 text-sm">
                      Address derivation happens in your browser using cryptographic libraries.
                      Your keys never leave your device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Public APIs Only</h3>
                    <p className="text-gray-300 text-sm">
                      Balance data comes from public blockchain APIs (Blockstream) and price data
                      from CoinGecko. No authentication required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Check your Bitcoin balance or start trading with play money - completely free and private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Check Balance Now
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
                    Start Trading Practice
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Link
                  href="/playground"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Go to Playground
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-400 text-center">
          <p className="text-sm">
            This tool is for informational purposes only. Always verify balances through your
            official wallet software.
          </p>
          <p className="text-xs mt-2">
            Built with Next.js • Uses Blockstream API, CoinGecko API & Finnhub API
          </p>
        </footer>
      </div>
    </>
  );
}
