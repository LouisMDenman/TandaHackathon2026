/**
 * Wallet Balance Checker Page
 * Main page for checking Bitcoin, Ethereum, and Solana wallet balances
 */

'use client';

import { useState } from 'react';
import { KeyType } from '@/lib/bitcoin/types';
import { detectAndValidateKey } from '@/lib/bitcoin/detectKeyType';
import { deriveAddresses } from '@/lib/bitcoin/deriveAddresses';
import { scanAddressesWithGapLimit } from '@/lib/bitcoin/scanAddresses';
import { autoDetectAddressFormat } from '@/lib/bitcoin/autoDetectFormat';
import { calculateTotalBalance } from '@/lib/api/blockstream';
import { fetchBTCPrice, fetchETHPrice, fetchSOLPrice } from '@/lib/api/coingecko';
import { fetchEthBalance } from '@/lib/api/ethereum';
import { fetchSolBalance } from '@/lib/api/solana';
import { satoshisToAUD } from '@/lib/utils/format';
import { NETWORKS } from '@/lib/bitcoin/constants';
import { validateWallet } from '@/lib/wallet/detectWalletType';
import WalletInput from '@/components/WalletInput';
import LoadingState from '@/components/LoadingState';
import BalanceDisplay from '@/components/BalanceDisplay';
import ErrorDisplay from '@/components/ErrorDisplay';

type ViewState = 'input' | 'loading' | 'results' | 'error';
type ErrorType = 'validation' | 'network' | 'api' | 'unknown';
type CryptoType = 'BTC' | 'ETH' | 'SOL';

export default function WalletPage() {
  // State management
  const [viewState, setViewState] = useState<ViewState>('input');
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  // Wallet data
  const [extendedKey, setExtendedKey] = useState<string>('');
  const [keyType, setKeyType] = useState<KeyType | null>(null);
  const [cryptoType, setCryptoType] = useState<CryptoType>('BTC');

  // Results
  const [totalSatoshis, setTotalSatoshis] = useState<number>(0);
  const [totalCrypto, setTotalCrypto] = useState<number>(0);
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
  const handleSubmit = async (input: string, type: KeyType) => {
    setExtendedKey(input);
    setKeyType(type);
    setViewState('loading');
    setError('');

    try {
      // Validate and detect wallet type
      setLoadingStatus('Detecting wallet type...');
      const info = await validateWallet(input);

      if (!info.valid) {
        throw new Error(info.error || 'Invalid wallet input');
      }

      // Route to appropriate handler based on wallet type
      if (info.walletType === 'bitcoin' && info.bitcoinInfo) {
        // Bitcoin flow
        await handleBitcoinCheck(input, info.bitcoinInfo.type);
      } else if (info.walletType === 'ethereum' && info.ethereumInfo) {
        // Ethereum flow
        await handleEthereumCheck(info.ethereumInfo.address);
      } else if (info.walletType === 'solana' && info.solanaInfo) {
        // Solana flow
        await handleSolanaCheck(info.solanaInfo.address);
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
   * Handle Solana wallet check
   */
  const handleSolanaCheck = async (address: string) => {
    setCryptoType('SOL');

    // Step 1: Fetch SOL balance
    setLoadingStatus('Checking Solana balance...');
    const balanceResult = await fetchSolBalance(address);

    if (balanceResult.status === 'error') {
      throw new Error(balanceResult.error || 'Failed to fetch Solana balance');
    }

    setTotalCrypto(balanceResult.balanceInSol);
    setAddressesScanned(1); // Single address
    setAddressesWithErrors(0);

    // Step 2: Fetch SOL price
    setLoadingStatus('Fetching SOL price...');
    const priceData = await fetchSOLPrice();
    const audValue = balanceResult.balanceInSol * priceData.aud;
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Animation */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-block mb-4">
              <div className="text-7xl mb-4 animate-bounce-slow">₿</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient-x"
                style={{
                  textShadow: '0 0 40px rgba(59, 130, 246, 0.5)'
                }}>
              Wallet Balance Checker
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Check your Bitcoin wallet balance <span className="text-cyan-400 font-bold">privately</span> and{" "}
              <span className="text-purple-400 font-bold">securely</span>.
              No data is stored, all checks are done in real-time.
            </p>
          </div>

          {/* Main content area - switches based on view state */}
          <div className="mb-8">
            {viewState === 'input' && (
              <div className="fade-in">
                <WalletInput onSubmit={handleSubmit} disabled={false} />
              </div>
            )}

            {viewState === 'loading' && (
              <div className="fade-in">
                <LoadingState status={loadingStatus} />
              </div>
            )}

            {viewState === 'results' && (
              <div className="fade-in">
                <BalanceDisplay
                  cryptoType={cryptoType}
                  totalCrypto={totalCrypto}
                  totalAUD={totalAUD}
                  addressesScanned={addressesScanned}
                  addressesWithErrors={addressesWithErrors}
                  timestamp={timestamp}
                  onReset={handleReset}
                />
              </div>
            )}

            {viewState === 'error' && (
              <div className="fade-in">
                <ErrorDisplay
                  error={error}
                  errorType={errorType}
                  onRetry={handleRetry}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>

        {/* Privacy notice - always visible */}
        <div className="glass-card p-8 max-w-2xl mx-auto group hover:shadow-2xl transition-all duration-300"
             style={{
               background: 'rgba(255, 255, 255, 0.05)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255, 255, 255, 0.1)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
             }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg
              className="w-7 h-7 mr-3 text-green-400"
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
          <div className="space-y-4 text-slate-300">
            <div className="pl-10">
              <p className="leading-relaxed">
                <strong className="text-cyan-400">No Data Storage:</strong> We don't store any wallet information,
                extended public keys, or balance data. Everything is processed in real-time
                and discarded after display.
              </p>
            </div>
            <div className="pl-10">
              <p className="leading-relaxed">
                <strong className="text-cyan-400">Read-Only Access:</strong> Extended public keys only allow us to
                view addresses and balances. They cannot be used to spend or access your funds.
              </p>
            </div>
            <div className="pl-10">
              <p className="leading-relaxed">
                <strong className="text-cyan-400">Third-Party APIs:</strong> Balance data is fetched from public blockchain
                APIs (Blockstream) and price data from CoinGecko. During auto-detection, we check
                up to 3 derived addresses on-chain to determine your wallet's address format.
              </p>
            </div>
            <div className="pl-10">
              <p className="leading-relaxed">
                <strong className="text-cyan-400">Client-Side Processing:</strong> All cryptographic operations
                (address derivation) happen in your browser. Your extended public keys are never
                sent to our servers.
              </p>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-8 glass-card p-8 max-w-2xl mx-auto group hover:shadow-2xl transition-all duration-300"
             style={{
               background: 'rgba(255, 255, 255, 0.05)',
               backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255, 255, 255, 0.1)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
             }}>
          <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Enter Your Extended Public Key</h4>
                <p className="text-slate-300 leading-relaxed">
                  Paste your xpub (Legacy), ypub (Nested SegWit), or zpub (Native SegWit) key.
                  The app will auto-detect the correct format by checking which address type has
                  been used.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Derive Addresses</h4>
                <p className="text-slate-300 leading-relaxed">
                  We derive addresses from your extended key using industry-standard BIP32/44/49/84
                  derivation paths, scanning until we find 20 consecutive unused addresses (gap limit).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Check Balances</h4>
                <p className="text-slate-300 leading-relaxed">
                  Each address is checked against the Bitcoin blockchain using the
                  Blockstream API to get the current balance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                4
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Display Results</h4>
                <p className="text-slate-300 leading-relaxed">
                  Your total balance is displayed in both BTC and AUD,
                  with the current exchange rate from CoinGecko.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Solana:</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Enter your Solana address (base58-encoded). The app validates the address format.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Fetches balance via Solana JSON-RPC and displays in SOL and AUD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              This tool is for informational purposes only. Always verify balances
              through your official wallet software.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
