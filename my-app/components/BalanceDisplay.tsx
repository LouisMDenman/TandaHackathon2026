/**
 * BalanceDisplay Component
 * Displays crypto wallet balance results (Bitcoin, Ethereum, Solana, or XRP)
 */

'use client';

import { formatAUD, formatTimestamp } from '@/lib/utils/format';
import { formatCurrency } from '@/lib/api/coingecko';

type CryptoType = 'BTC' | 'ETH' | 'SOL' | 'XRP';

interface BalanceDisplayProps {
  cryptoType: CryptoType;
  totalCrypto: number; // Amount in BTC, ETH, SOL, or XRP
  totalAUD: number;
  addressesScanned: number;
  addressesWithErrors: number;
  timestamp: number;
  onReset: () => void;
}

export default function BalanceDisplay({
  cryptoType,
  totalCrypto,
  totalAUD,
  addressesScanned,
  addressesWithErrors,
  timestamp,
  onReset,
}: BalanceDisplayProps) {
  const cryptoAmount = formatCurrency(totalCrypto, cryptoType);
  const audAmount = formatAUD(totalAUD);
  const isBitcoin = cryptoType === 'BTC';
  const cryptoName = cryptoType === 'BTC' ? 'Bitcoin' : cryptoType === 'ETH' ? 'Ethereum' : cryptoType === 'SOL' ? 'Solana' : 'XRP';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Wallet Balance</h2>
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-1"
          >
            Check Another
          </button>
        </div>

        {/* Crypto Balance */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total {cryptoName}
          </div>
          <div className="text-4xl font-bold text-gray-900 font-mono">
            {cryptoAmount}
          </div>
        </div>

        {/* AUD Value */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-blue-900 uppercase tracking-wide">
            Current Value (AUD)
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {audAmount}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {isBitcoin ? 'Addresses Scanned' : 'Address'}
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {isBitcoin ? addressesScanned : '1'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Checked At
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatTimestamp(timestamp)}
            </div>
          </div>
        </div>

        {/* Error warning - shown if some addresses failed */}
        {addressesWithErrors > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-orange-800">
                <p className="font-medium">Partial Results - API Issues Detected</p>
                <p className="mt-1">
                  {addressesWithErrors} {addressesWithErrors === 1 ? 'address' : 'addresses'} could not be checked due to API errors.
                  The balance shown may be incomplete. Please try again later for complete results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info box - shown if balance is zero */}
        {totalCrypto === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">No balance found</p>
                <p className="mt-1">
                  {addressesWithErrors > 0 ? (
                    <>
                      The {isBitcoin ? 'addresses' : 'address'} that {isBitcoin ? 'were' : 'was'} successfully checked {isBitcoin ? 'have' : 'has'} no current balance. However, {addressesWithErrors} {addressesWithErrors === 1 ? 'address' : 'addresses'} could not be checked - there may be funds in {addressesWithErrors === 1 ? 'that address' : 'those addresses'}.
                    </>
                  ) : (
                    <>
                      This {isBitcoin ? 'wallet' : 'address'} has no current balance. It may be empty or all funds have been spent.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy notice */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
          <p>
            <strong>Privacy:</strong> No data was stored during this check. All information was
            fetched in real-time and will be cleared when you navigate away.
          </p>
        </div>

        {/* Reset button (mobile-friendly duplicate) */}
        <button
          onClick={onReset}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Check Another Wallet
        </button>
      </div>
    </div>
  );
}
