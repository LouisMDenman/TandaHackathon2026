/**
 * WalletInput Component
 * Input form for extended public key (xpub/ypub/zpub)
 */

'use client';

import { useState, useEffect } from 'react';
import { KeyType } from '@/lib/bitcoin/types';
import { detectAndValidateKey, getKeyTypeDescription } from '@/lib/bitcoin/detectKeyType';

interface WalletInputProps {
  onSubmit: (extendedKey: string, keyType: KeyType) => void;
  disabled?: boolean;
}

export default function WalletInput({ onSubmit, disabled = false }: WalletInputProps) {
  const [extendedKey, setExtendedKey] = useState('');
  const [detectedKeyType, setDetectedKeyType] = useState<KeyType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate extended key as user types
  useEffect(() => {
    if (!extendedKey.trim()) {
      setDetectedKeyType(null);
      setValidationError(null);
      setIsValid(false);
      return;
    }

    const result = detectAndValidateKey(extendedKey.trim());

    if (result.valid) {
      setDetectedKeyType(result.type);
      setValidationError(null);
      setIsValid(true);
    } else {
      setDetectedKeyType(null);
      setValidationError(result.error || 'Invalid extended public key');
      setIsValid(false);
    }
  }, [extendedKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !detectedKeyType) {
      return;
    }

    onSubmit(extendedKey.trim(), detectedKeyType);
  };

  const handleClear = () => {
    setExtendedKey('');
    setDetectedKeyType(null);
    setValidationError(null);
    setIsValid(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="xpub-input" className="block text-sm font-medium text-gray-700 mb-2">
          Extended Public Key
        </label>
        <div className="relative">
          <textarea
            id="xpub-input"
            value={extendedKey}
            onChange={(e) => setExtendedKey(e.target.value)}
            placeholder="Enter your xpub, ypub, or zpub..."
            disabled={disabled}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm resize-none ${
              extendedKey && isValid
                ? 'border-green-500 focus:ring-green-500'
                : extendedKey && validationError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          {extendedKey && !disabled && (
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
        {extendedKey && (
          <div className="mt-2">
            {isValid && detectedKeyType ? (
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
                  <p className="font-medium">Valid {detectedKeyType}</p>
                  <p className="text-gray-600 mt-0.5">
                    {getKeyTypeDescription(detectedKeyType)}
                  </p>
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
          <strong>Privacy Notice:</strong> Your extended public key never leaves your device
          during validation. Balance checking is done through secure API calls.
        </p>
        <p>
          <strong>Supported formats:</strong> xpub (Legacy), ypub (Nested SegWit), zpub (Native SegWit)
        </p>
      </div>
    </form>
  );
}
