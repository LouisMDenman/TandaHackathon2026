/**
 * WalletInput Component
 * Input form for crypto wallet (Bitcoin xpub/ypub/zpub or Ethereum address)
 */

'use client';

import { useState, useEffect } from 'react';
import type { WalletInfo } from '@/lib/wallet/detectWalletType';
import { validateWallet, getWalletTypeDescription } from '@/lib/wallet/detectWalletType';

interface WalletInputProps {
  onSubmit: (walletInput: string, walletInfo: WalletInfo) => void;
  disabled?: boolean;
}

export default function WalletInput({ onSubmit, disabled = false }: WalletInputProps) {
  const [walletInput, setWalletInput] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate wallet input as user types (async for Ethereum checksum validation)
  useEffect(() => {
    if (!walletInput.trim()) {
      setWalletInfo(null);
      setValidationError(null);
      setIsValid(false);
      return;
    }

    // Debounce validation to avoid excessive calls
    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await validateWallet(walletInput.trim());

        if (result.valid) {
          setWalletInfo(result);
          setValidationError(null);
          setIsValid(true);
        } else {
          setWalletInfo(result);
          setValidationError(result.error || 'Invalid wallet format');
          setIsValid(false);
        }
      } catch (error) {
        setWalletInfo(null);
        setValidationError('Error validating wallet');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [walletInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !walletInfo) {
      return;
    }

    onSubmit(walletInput.trim(), walletInfo);
  };

  const handleClear = () => {
    setWalletInput('');
    setWalletInfo(null);
    setValidationError(null);
    setIsValid(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="wallet-input" className="block text-sm font-medium text-gray-700 mb-2">
          Wallet Address or Public Key
        </label>
        <div className="relative">
          <textarea
            id="wallet-input"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="Enter Bitcoin xpub/ypub/zpub or Ethereum address (0x...)..."
            disabled={disabled}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm resize-none text-gray-700 placeholder:text-gray-400 ${
              walletInput && isValid
                ? 'border-green-500 focus:ring-green-500'
                : walletInput && validationError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {walletInput && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
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
        {walletInput && (
          <div className="mt-2">
            {isValidating ? (
              <div className="flex items-start space-x-2 text-sm text-gray-500">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p>Validating...</p>
              </div>
            ) : isValid && walletInfo ? (
              <div className="flex items-start space-x-2 text-sm text-green-600">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
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
                  <p className="font-medium">
                    Valid {getWalletTypeDescription(walletInfo.walletType)}
                  </p>
                  {walletInfo.bitcoinInfo && (
                    <p className="text-gray-600 mt-0.5">
                      {walletInfo.bitcoinInfo.type.toUpperCase()} -
                      {walletInfo.bitcoinInfo.type === 'xpub' && ' Legacy (P2PKH)'}
                      {walletInfo.bitcoinInfo.type === 'ypub' && ' Nested SegWit (P2SH-P2WPKH)'}
                      {walletInfo.bitcoinInfo.type === 'zpub' && ' Native SegWit (P2WPKH)'}
                    </p>
                  )}
                  {walletInfo.ethereumInfo && (
                    <p className="text-gray-600 mt-0.5">
                      Ethereum Mainnet Address
                    </p>
                  )}
                </div>
              </div>
            ) : validationError ? (
              <div className="flex items-start space-x-2 text-sm text-red-600">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{validationError}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isValid && !disabled
            ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {disabled ? 'Checking...' : 'Check Balance'}
      </button>

      {/* Help text */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <strong>Privacy Notice:</strong> Your wallet information never leaves your device
          during validation. Balance checking is done through secure API calls.
        </p>
        <p>
          <strong>Supported formats:</strong>
        </p>
        <ul className="ml-4 list-disc">
          <li>Bitcoin: xpub (Legacy), ypub (Nested SegWit), zpub (Native SegWit)</li>
          <li>Ethereum: Standard addresses starting with 0x</li>
        </ul>
      </div>
    </form>
  );
}
