/**
 * Wallet Balance Checker Page
 * Main page for checking Bitcoin and Ethereum wallet balances
 */

'use client';

import { useState } from 'react';
import type { WalletInfo } from '@/lib/wallet/detectWalletType';
import type { KeyType } from '@/lib/bitcoin/types';
import { detectAndValidateKey } from '@/lib/bitcoin/detectKeyType';
import { scanAddressesWithGapLimit } from '@/lib/bitcoin/scanAddresses';
import { autoDetectAddressFormat } from '@/lib/bitcoin/autoDetectFormat';
import { calculateTotalBalance } from '@/lib/api/blockstream';
import { fetchBTCPrice, fetchETHPrice } from '@/lib/api/coingecko';
import { fetchEthBalance } from '@/lib/api/ethereum';
import { satoshisToAUD } from '@/lib/utils/format';
import { NETWORKS } from '@/lib/bitcoin/constants';
import WalletInput from '@/components/WalletInput';
import LoadingState from '@/components/LoadingState';
import BalanceDisplay from '@/components/BalanceDisplay';
import ErrorDisplay from '@/components/ErrorDisplay';

type ViewState = 'input' | 'loading' | 'results' | 'error';
type ErrorType = 'validation' | 'network' | 'api' | 'unknown';
type CryptoType = 'BTC' | 'ETH';

export default function WalletPage() {
  // State management
  const [viewState, setViewState] = useState<ViewState>('input');
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  // Wallet data
  const [walletInput, setWalletInput] = useState<string>('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [cryptoType, setCryptoType] = useState<CryptoType>('BTC');

  // Results (generic for both BTC and ETH)
  const [totalCrypto, setTotalCrypto] = useState<number>(0); // BTC or ETH amount
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
  const handleSubmit = async (input: string, info: WalletInfo) => {
    setWalletInput(input);
    setWalletInfo(info);
    setViewState('loading');
    setError('');

    try {
      if (info.walletType === 'bitcoin' && info.bitcoinInfo) {
        // Bitcoin flow
        await handleBitcoinCheck(input, info.bitcoinInfo.type);
      } else if (info.walletType === 'ethereum' && info.ethereumInfo) {
        // Ethereum flow
        await handleEthereumCheck(info.ethereumInfo.address);
      } else {
        throw new Error('Invalid wallet type');
      }
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
   * Handle Bitcoin wallet check
   */
  const handleBitcoinCheck = async (key: string, type: KeyType) => {
    setCryptoType('BTC');

    // Step 1: Validate extended key
    setLoadingStatus('Validating Bitcoin extended public key...');
    const validation = detectAndValidateKey(key);

    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid extended public key');
    }

    // Step 2: Auto-detect correct address format
    setLoadingStatus('Auto-detecting address format (checking Legacy/SegWit/Native SegWit)...');
    const formatDetection = await autoDetectAddressFormat(key, type, NETWORKS.mainnet);
    const actualKeyType = formatDetection.detectedFormat;

    // Step 3: Derive and scan addresses with gap limit
    setLoadingStatus(`Scanning ${actualKeyType} addresses (${actualKeyType === 'xpub' ? 'Legacy/1...' : actualKeyType === 'ypub' ? 'SegWit/3...' : 'Native SegWit/bc1...'})...`);
    const addresses = await scanAddressesWithGapLimit(key, actualKeyType, NETWORKS.mainnet);
    setAddressesScanned(addresses.length);

    // Extract address strings for balance checking
    const addressList = addresses.map(addr => addr.address);

    // Step 4: Fetch balances
    setLoadingStatus('Checking Bitcoin balances...');
    const balanceResult = await calculateTotalBalance(addressList);
    setAddressesWithErrors(balanceResult.addressesWithErrors);

    // Step 5: Fetch BTC price
    setLoadingStatus('Fetching BTC price...');
    const priceData = await fetchBTCPrice();

    // Convert satoshis to BTC
    const btcAmount = balanceResult.totalBalance / 100000000;
    setTotalCrypto(btcAmount);

    const audValue = satoshisToAUD(balanceResult.totalBalance, priceData.aud);
    setTotalAUD(audValue);

    // Success! Show results
    setTimestamp(Date.now());
    setViewState('results');
  };

  /**
   * Handle Ethereum wallet check
   */
  const handleEthereumCheck = async (address: string) => {
    setCryptoType('ETH');

    // Step 1: Fetch ETH balance
    setLoadingStatus('Checking Ethereum balance...');
    const balanceResult = await fetchEthBalance(address);

    if (balanceResult.status === 'error') {
      throw new Error(balanceResult.error || 'Failed to fetch Ethereum balance');
    }

    setTotalCrypto(balanceResult.balanceInEth);
    setAddressesScanned(1); // Single address
    setAddressesWithErrors(0);

    // Step 2: Fetch ETH price
    setLoadingStatus('Fetching ETH price...');
    const priceData = await fetchETHPrice();
    const audValue = balanceResult.balanceInEth * priceData.aud;
    setTotalAUD(audValue);

    // Success! Show results
    setTimestamp(Date.now());
    setViewState('results');
  };

  /**
   * Reset to initial state
   */
  const handleReset = () => {
    setViewState('input');
    setLoadingStatus('');
    setWalletInput('');
    setWalletInfo(null);
    setCryptoType('BTC');
    setTotalCrypto(0);
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
    if (walletInput && walletInfo) {
      handleSubmit(walletInput, walletInfo);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crypto Wallet Balance Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check your Bitcoin or Ethereum wallet balance privately and securely.
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
              cryptoType={cryptoType}
              totalCrypto={totalCrypto}
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
              extended public keys, addresses, or balance data. Everything is processed in real-time
              and discarded after display.
            </p>
            <p>
              <strong>Read-Only Access:</strong> For Bitcoin, extended public keys only allow us to
              view addresses and balances. For Ethereum, you provide a public address. Neither can be
              used to spend or access your funds.
            </p>
            <p>
              <strong>Third-Party APIs:</strong> Balance data is fetched from public blockchain
              APIs (Blockstream for Bitcoin, Ethereum RPC nodes for Ethereum) and price data from CoinGecko.
              For Bitcoin, during auto-detection, we check up to 3 derived addresses on-chain to determine
              your wallet's address format. These API requests may be logged by the provider (including your
              IP address and the addresses checked). Note that blockchain addresses and their balances are
              public information already visible on the blockchain to anyone.
            </p>
            <p>
              <strong>Client-Side Processing:</strong> All cryptographic operations
              (address derivation for Bitcoin, checksum validation for Ethereum) happen in your browser.
              Your wallet information is never sent to our servers.
            </p>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">For Bitcoin:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Enter your xpub (Legacy), ypub (Nested SegWit), or zpub (Native SegWit) key.
                    The app auto-detects the correct format by checking which address type has been used.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Derives addresses using BIP32/44/49/84, scanning until finding 20 consecutive unused addresses.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Checks balances via Blockstream API and displays total in BTC and AUD.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Ethereum:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Enter your Ethereum address (0x...). The app validates the EIP-55 checksum.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Fetches balance via Ethereum JSON-RPC (Cloudflare gateway) and displays in ETH and AUD.
                  </p>
                </div>
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
