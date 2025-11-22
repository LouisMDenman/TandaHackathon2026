"use client"
import React, { useState } from "react"

export default function TickerCard({ symbol, name, price, currency }: { symbol: string; name: string; price?: number; currency?: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const display = price == null ? "—" : new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(price)

  return (
    <div 
      style={{
        ...cardStyle,
        transform: isHovered ? 'translateX(8px) scale(1.03)' : 'translateX(0) scale(1)',
        boxShadow: isHovered 
          ? '0 12px 48px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.5) inset, 0 0 60px rgba(139, 92, 246, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(59, 130, 246, 0.12) 100%)'
          : '#ffffff',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: isHovered ? '19px' : '17px',
            backgroundImage: isHovered 
              ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
            transition: 'all 0.3s ease',
            textShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
          }}>
            {symbol}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: isHovered ? '#3b82f6' : '#64748b',
            fontWeight: isHovered ? 600 : 500,
            transition: 'all 0.3s ease'
          }}>
            {name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontWeight: isHovered ? 800 : 700, 
            fontSize: isHovered ? '20px' : '16px',
            color: '#0f172a',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateX(-4px) scale(1.1)' : 'translateX(0) scale(1)',
            textShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
          }}>
            {display}
          </div>
        </div>
      </div>
      
      {/* Animated glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
        animation: isHovered ? 'glow-rotate 3s linear infinite' : 'none',
        zIndex: 0
      }} />
      
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: isHovered ? '100%' : '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        transition: 'left 0.6s',
        borderRadius: '16px',
        pointerEvents: 'none',
        zIndex: 0
      }} />
    </div>
  )
}

const cardStyle: React.CSSProperties = { 
  padding: '20px 24px', 
  border: 'none', 
  borderRadius: '16px', 
  background: '#fff',
  width: '100%',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  zIndex: 2
}
