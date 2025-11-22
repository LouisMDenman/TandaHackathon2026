"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-32 h-32 border-8 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"
             style={{
               boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)'
             }}></div>
        
        {/* Middle ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-8 border-purple-500/20 border-b-purple-500 rounded-full animate-spin"
             style={{
               animationDirection: 'reverse',
               animationDuration: '1.5s',
               boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
             }}></div>
        
        {/* Inner ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-4 border-cyan-500/20 border-r-cyan-500 rounded-full animate-spin"
             style={{
               animationDuration: '0.8s',
               boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
             }}></div>
        
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"
             style={{
               boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)',
               animation: 'pulse 2s ease-in-out infinite'
             }}></div>
      </div>
    </div>
  )
}
