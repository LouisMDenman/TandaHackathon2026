/**
 * WalletInput Component
 * Input form for wallet addresses (Bitcoin xpub/ypub/zpub, Ethereum, Solana, XRP)
 */

'use client';

import { useState, useEffect } from 'react';
import { KeyType } from '@/lib/bitcoin/types';
import { getKeyTypeDescription } from '@/lib/bitcoin/detectKeyType';
import { validateWallet, getWalletTypeDescription, type WalletType } from '@/lib/wallet/detectWalletType';

interface WalletInputProps {
  onSubmit: (extendedKey: string, keyType: KeyType, tokenType?: 'ETH' | 'USDT') => void;
  disabled?: boolean;
}

export default function WalletInput({ onSubmit, disabled = false }: WalletInputProps) {
  const [extendedKey, setExtendedKey] = useState('');
  const [detectedKeyType, setDetectedKeyType] = useState<KeyType | null>(null);
  const [detectedWalletType, setDetectedWalletType] = useState<WalletType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [tokenType, setTokenType] = useState<'ETH' | 'USDT'>('ETH');

  // Validate wallet as user types
  useEffect(() => {
    if (!extendedKey.trim()) {
      setDetectedKeyType(null);
      setDetectedWalletType(null);
      setValidationError(null);
      setIsValid(false);
      setTokenType('ETH'); // Reset token type when clearing
      return;
    }

    // Use async validation for all wallet types
    validateWallet(extendedKey.trim()).then(result => {
      if (result.valid) {
        setDetectedWalletType(result.walletType);
        if (result.walletType === 'bitcoin' && result.bitcoinInfo) {
          setDetectedKeyType(result.bitcoinInfo.type);
        } else {
          setDetectedKeyType(null);
        }
        // Reset to ETH when detecting a new Ethereum address
        if (result.walletType === 'ethereum') {
          setTokenType('ETH');
        }
        setValidationError(null);
        setIsValid(true);
      } else {
        setDetectedKeyType(null);
        setDetectedWalletType(null);
        setValidationError(result.error || 'Invalid wallet input');
        setIsValid(false);
      }
    });
  }, [extendedKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    // For Bitcoin, we need the keyType. For others, we'll use 'xpub' as a placeholder
    // since the parent component routes based on wallet type anyway
    const keyType = detectedKeyType || 'xpub';

    // Pass tokenType only for Ethereum addresses
    const tokenTypeToPass = detectedWalletType === 'ethereum' ? tokenType : undefined;
    onSubmit(extendedKey.trim(), keyType, tokenTypeToPass);
  };

  const handleClear = () => {
    setExtendedKey('');
    setDetectedKeyType(null);
    setDetectedWalletType(null);
    setValidationError(null);
    setIsValid(false);
    setTokenType('ETH');
  };

  // Get display description based on wallet type
  const getValidationDescription = () => {
    if (!detectedWalletType) return '';

    if (detectedWalletType === 'bitcoin' && detectedKeyType) {
      return getKeyTypeDescription(detectedKeyType);
    } else {
      return getWalletTypeDescription(detectedWalletType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <label htmlFor="wallet-input" className="block text-lg font-bold text-white mb-4">
          Wallet Address or Key
        </label>
        <div className="relative">
          <textarea
            id="wallet-input"
            value={extendedKey}
            onChange={(e) => setExtendedKey(e.target.value)}
            placeholder="Enter Bitcoin xpub/ypub/zpub, Ethereum address (0x...), Solana address, or XRP address (r...)"
            disabled={disabled}
            rows={3}
            className={`w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 font-mono text-sm resize-none transition-all duration-300 ${
              extendedKey && isValid
                ? 'bg-white/20 border-2 border-green-400 focus:ring-green-400 text-white placeholder:text-slate-400 shadow-lg shadow-green-400/20'
                : extendedKey && validationError
                ? 'bg-white/20 border-2 border-red-400 focus:ring-red-400 text-white placeholder:text-slate-400 shadow-lg shadow-red-400/20'
                : 'bg-white/10 border-2 border-white/20 focus:ring-cyan-400 text-white placeholder:text-slate-400'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          {extendedKey && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-4 right-4 text-slate-400 hover:text-white focus:outline-none transition-colors p-1 hover:bg-white/10 rounded-lg"
              aria-label="Clear input"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Validation feedback */}
        {extendedKey && (
          <div className="mt-4">
            {isValid && detectedWalletType ? (
              <div className="flex items-start space-x-3 text-sm bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                <svg
                  className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-400"
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
                  <p className="font-bold text-green-400">
                    Valid {detectedKeyType || detectedWalletType.toUpperCase()}
                  </p>
                  <p className="text-green-300 mt-1">
                    {getValidationDescription()}
                  </p>
                </div>
              </div>
            ) : validationError ? (
              <div className="flex items-start space-x-3 text-sm bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                <svg
                  className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-300">{validationError}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Token Type Selector for Ethereum addresses */}
        {isValid && detectedWalletType === 'ethereum' && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <label className="block text-sm font-bold text-white mb-3">
              Select Token to Check:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="tokenType"
                  value="ETH"
                  checked={tokenType === 'ETH'}
                  onChange={(e) => setTokenType(e.target.value as 'ETH' | 'USDT')}
                  disabled={disabled}
                  className="w-5 h-5 text-cyan-500 border-white/30 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                  Ethereum (ETH)
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="tokenType"
                  value="USDT"
                  checked={tokenType === 'USDT'}
                  onChange={(e) => setTokenType(e.target.value as 'ETH' | 'USDT')}
                  disabled={disabled}
                  className="w-5 h-5 text-green-500 border-white/30 focus:ring-green-400 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-white font-medium group-hover:text-green-400 transition-colors">
                  Tether (USDT)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || disabled}
        className={`group w-full py-5 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 relative overflow-hidden ${
          isValid && !disabled
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 hover:-translate-y-1'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
        style={{
          boxShadow: isValid && !disabled ? '0 0 40px rgba(59, 130, 246, 0.4)' : 'none'
        }}
      >
        {disabled ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking Balance...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-3">
            Check Balance
            <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
          </span>
        )}
        {isValid && !disabled && (
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        )}
      </button>

      {/* Help text */}
      <div className="text-sm text-slate-400 space-y-3 bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
        <p className="flex items-start gap-2">
          <span className="text-cyan-400 font-bold">🔒</span>
          <span>
            <strong className="text-white">Privacy Notice:</strong> Your wallet information never leaves your device
            during validation. Balance checking is done through secure API calls.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-purple-400 font-bold">✓</span>
          <span>
            <strong className="text-white">Supported wallets:</strong> Bitcoin (xpub/ypub/zpub), Ethereum (0x...), Solana (base58), XRP (r... or X...), Tether USDT (Ethereum address)
          </span>
        </p>
      </div>
    </form>
  );
}
