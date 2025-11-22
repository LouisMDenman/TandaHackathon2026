/**
 * Wallet Balance Checker Page
 * Main page for checking Bitcoin wallet balances
 */

'use client';

import { useState } from 'react';
import { KeyType } from '@/lib/bitcoin/types';
import { detectAndValidateKey } from '@/lib/bitcoin/detectKeyType';
import { deriveAddresses } from '@/lib/bitcoin/deriveAddresses';
import { scanAddressesWithGapLimit } from '@/lib/bitcoin/scanAddresses';
import { autoDetectAddressFormat } from '@/lib/bitcoin/autoDetectFormat';
import { calculateTotalBalance } from '@/lib/api/blockstream';
import { fetchBTCPrice } from '@/lib/api/coingecko';
import { satoshisToAUD } from '@/lib/utils/format';
import { NETWORKS } from '@/lib/bitcoin/constants';
import WalletInput from '@/components/WalletInput';
import LoadingState from '@/components/LoadingState';
import BalanceDisplay from '@/components/BalanceDisplay';
import ErrorDisplay from '@/components/ErrorDisplay';

type ViewState = 'input' | 'loading' | 'results' | 'error';
type ErrorType = 'validation' | 'network' | 'api' | 'unknown';

export default function WalletPage() {
  // State management
  const [viewState, setViewState] = useState<ViewState>('input');
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  // Wallet data
  const [extendedKey, setExtendedKey] = useState<string>('');
  const [keyType, setKeyType] = useState<KeyType | null>(null);

  // Results
  const [totalSatoshis, setTotalSatoshis] = useState<number>(0);
  const [totalAUD, setTotalAUD] = useState<number>(0);
  const [addressesScanned, setAddressesScanned] = useState<number>(0);
  const [addressesWithErrors, setAddressesWithErrors] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);

  // Error handling
  const [error, setError] = useState<string>('');
  const [errorType, setErrorType] = useState<ErrorType>('unknown');

  /**
   * Handle wallet balance check submission
   */
  const handleSubmit = async (key: string, type: KeyType) => {
    setExtendedKey(key);
    setKeyType(type);
    setViewState('loading');
    setError('');

    try {
      // Step 1: Validate extended key
      setLoadingStatus('Validating extended public key...');
      const validation = detectAndValidateKey(key);

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid extended public key');
      }

      // Step 1.5: Auto-detect correct address format
      setLoadingStatus('Auto-detecting address format (checking Legacy/SegWit/Native SegWit)...');

      const formatDetection = await autoDetectAddressFormat(key, type, NETWORKS.mainnet);

      // Update the key type to the detected format
      const actualKeyType = formatDetection.detectedFormat;
      setKeyType(actualKeyType);

      // Step 2: Derive and scan addresses with gap limit
      setLoadingStatus(`Scanning ${actualKeyType} addresses (${actualKeyType === 'xpub' ? 'Legacy/1...' : actualKeyType === 'ypub' ? 'SegWit/3...' : 'Native SegWit/bc1...'})...`);

      // Use gap limit scanning to find all used addresses with the correct format
      // This will scan until finding 20 consecutive unused addresses
      const addresses = await scanAddressesWithGapLimit(key, actualKeyType, NETWORKS.mainnet);
      setAddressesScanned(addresses.length);

      // Extract just the address strings for balance checking
      const addressList = addresses.map(addr => addr.address);

      // Step 3: Fetch balances
      setLoadingStatus('Checking balances...');
      const balanceResult = await calculateTotalBalance(addressList);
      setTotalSatoshis(balanceResult.totalBalance);
      setAddressesWithErrors(balanceResult.addressesWithErrors);

      // Step 4: Fetch price
      setLoadingStatus('Fetching price...');
      const priceData = await fetchBTCPrice();
      const audValue = satoshisToAUD(balanceResult.totalBalance, priceData.aud);
      setTotalAUD(audValue);

      // Success! Show results
      setTimestamp(Date.now());
      setViewState('results');

    } catch (err) {
      console.error('Error checking wallet balance:', err);

      // Determine error type
      let errType: ErrorType = 'unknown';
      let errMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        errMessage = err.message;

        if (errMessage.includes('Invalid') || errMessage.includes('invalid')) {
          errType = 'validation';
        } else if (errMessage.includes('fetch') || errMessage.includes('network') || errMessage.includes('Failed to fetch')) {
          errType = 'network';
        } else if (errMessage.includes('API') || errMessage.includes('timeout')) {
          errType = 'api';
        }
      }

      setError(errMessage);
      setErrorType(errType);
      setViewState('error');
    }
  };

  /**
   * Reset to initial state
   */
  const handleReset = () => {
    setViewState('input');
    setLoadingStatus('');
    setExtendedKey('');
    setKeyType(null);
    setTotalSatoshis(0);
    setTotalAUD(0);
    setAddressesScanned(0);
    setAddressesWithErrors(0);
    setTimestamp(0);
    setError('');
    setErrorType('unknown');
  };

  /**
   * Retry the last check
   */
  const handleRetry = () => {
    if (extendedKey && keyType) {
      handleSubmit(extendedKey, keyType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bitcoin Wallet Balance Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check your Bitcoin wallet balance privately and securely.
            No data is stored, and all checks are done in real-time.
          </p>
        </div>

        {/* Main content area - switches based on view state */}
        <div className="mb-8">
          {viewState === 'input' && (
            <WalletInput onSubmit={handleSubmit} disabled={false} />
          )}

          {viewState === 'loading' && (
            <LoadingState status={loadingStatus} />
          )}

          {viewState === 'results' && (
            <BalanceDisplay
              totalSatoshis={totalSatoshis}
              totalAUD={totalAUD}
              addressesScanned={addressesScanned}
              addressesWithErrors={addressesWithErrors}
              timestamp={timestamp}
              onReset={handleReset}
            />
          )}

          {viewState === 'error' && (
            <ErrorDisplay
              error={error}
              errorType={errorType}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Privacy notice - always visible */}
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Privacy & Security
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>No Data Storage:</strong> We don't store any wallet information,
              extended public keys, or balance data. Everything is processed in real-time
              and discarded after display.
            </p>
            <p>
              <strong>Read-Only Access:</strong> Extended public keys only allow us to
              view addresses and balances. They cannot be used to spend or access your funds.
            </p>
            <p>
              <strong>Third-Party APIs:</strong> Balance data is fetched from public blockchain
              APIs (Blockstream) and price data from CoinGecko. During auto-detection, we check
              up to 3 derived addresses on-chain to determine your wallet's address format. These
              API requests may be logged by the provider (including your IP address and the addresses
              checked). Note that Bitcoin addresses and their balances are public information already
              visible on the blockchain to anyone.
            </p>
            <p>
              <strong>Client-Side Processing:</strong> All cryptographic operations
              (address derivation) happen in your browser. Your extended public keys are never
              sent to our servers.
            </p>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Enter Your Extended Public Key</h4>
                <p className="text-sm text-gray-600">
                  Paste your xpub (Legacy), ypub (Nested SegWit), or zpub (Native SegWit) key.
                  The app will auto-detect the correct format by checking which address type has
                  been used (this checks 3 addresses on the blockchain via Blockstream's API).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Derive Addresses</h4>
                <p className="text-sm text-gray-600">
                  We derive addresses from your extended key using industry-standard BIP32/44/49/84
                  derivation paths, scanning until we find 20 consecutive unused addresses (gap limit).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Check Balances</h4>
                <p className="text-sm text-gray-600">
                  Each address is checked against the Bitcoin blockchain using the
                  Blockstream API to get the current balance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Display Results</h4>
                <p className="text-sm text-gray-600">
                  Your total balance is displayed in both BTC and AUD,
                  with the current exchange rate from CoinGecko.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This tool is for informational purposes only. Always verify balances
            through your official wallet software.
          </p>
        </div>
      </div>
    </div>
  );
}
