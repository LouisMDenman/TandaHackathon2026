"use client"
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
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
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle-float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.6
            }}
          />
        ))}
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
              ✨ MARKET SIMULATOR ✨
            </span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x neon-text"
                  style={{
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)'
                  }}>
              Play Money
            </span>
            <br />
            <span className="text-white neon-text"
                  style={{
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
                  }}>Markets</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Learn how trading works with <span className="text-cyan-400 font-bold">fake money</span> and{" "}
            <span className="text-purple-400 font-bold">real prices</span>. 
            Practice your strategy risk-free.
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
            
            <a
              href="#features"
              className="px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md border-2 border-white/20 text-white text-lg font-bold transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105 hover:-translate-y-1"
            >
              Learn More
            </a>
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
            <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">📈</div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Real-Time Prices</h3>
            <p className="text-slate-300 leading-relaxed">
              Experience actual market movements with live price feeds from real exchanges.
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
            <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">💰</div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Risk-Free Practice</h3>
            <p className="text-slate-300 leading-relaxed">
              Start with virtual money and learn without the fear of losing real capital.
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
              Zero Risk
            </div>
            <div className="text-slate-300 mt-2 font-bold text-lg group-hover:text-green-400 transition-colors">
              Practice Trading
            </div>
            <div className="w-24 h-1 mx-auto mt-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:w-32 transition-all duration-300"
                 style={{
                   boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
                 }}></div>
          </div>
        </div>
      </main>
    </div>
  );
}
