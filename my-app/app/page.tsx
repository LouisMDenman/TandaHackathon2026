/**
 * Landing Page
 * Main landing page for Crypto Wallet Balance Checker
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Check Your Crypto Balance{' '}
            <span className="text-blue-600">Privately</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            View your Bitcoin or Ethereum wallet balance instantly without compromising your privacy.
            No signup, no data storage, completely free.
          </p>
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Check Balance Now
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Use Our Balance Checker?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* No Signup */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Signup Required</h3>
              <p className="text-gray-600">
                Start checking your balance immediately. No accounts, no emails, no registration.
              </p>
            </div>

            {/* No Data Stored */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Stored</h3>
              <p className="text-gray-600">
                Your wallet information is never saved. Everything is processed in real-time and discarded.
              </p>
            </div>

            {/* Free to Use */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Completely Free</h3>
              <p className="text-gray-600">
                No hidden fees, no premium tiers. Check as many wallets as you want, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Supported Wallet Formats
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* xpub */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-orange-600">X</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">xpub</h3>
                <p className="text-sm text-gray-600 mb-2">Legacy (P2PKH)</p>
                <p className="text-xs text-gray-500">
                  Addresses starting with <span className="font-mono font-semibold">1</span>
                </p>
              </div>
            </div>

            {/* ypub */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-blue-600">Y</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ypub</h3>
                <p className="text-sm text-gray-600 mb-2">Nested SegWit (P2SH-P2WPKH)</p>
                <p className="text-xs text-gray-500">
                  Addresses starting with <span className="font-mono font-semibold">3</span>
                </p>
              </div>
            </div>

            {/* zpub */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-green-600">Z</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">zpub</h3>
                <p className="text-sm text-gray-600 mb-2">Native SegWit (P2WPKH)</p>
                <p className="text-xs text-gray-500">
                  Addresses starting with <span className="font-mono font-semibold">bc1</span>
                </p>
              </div>
            </div>

            {/* Ethereum */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-purple-600">Ξ</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ethereum</h3>
                <p className="text-sm text-gray-600 mb-2">Public Address</p>
                <p className="text-xs text-gray-500">
                  Addresses starting with <span className="font-mono font-semibold">0x</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Enter Your Wallet Information
                </h3>
                <p className="text-gray-600">
                  Paste your Bitcoin extended public key (xpub/ypub/zpub) or Ethereum address (0x...).
                  Our tool automatically detects the format and validates it for you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Process & Validate
                </h3>
                <p className="text-gray-600">
                  For Bitcoin, we derive addresses using BIP32/44/49/84 protocols.
                  For Ethereum, we validate the address checksum (EIP-55).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Blockchain
                </h3>
                <p className="text-gray-600">
                  Balances are fetched from the blockchain using Blockstream API (Bitcoin) or
                  Ethereum RPC nodes (Ethereum).
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  View Results
                </h3>
                <p className="text-gray-600">
                  Your total balance is displayed in crypto (BTC or ETH) and AUD, with current
                  exchange rates fetched from CoinGecko.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <svg
              className="w-12 h-12 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-center mb-12">
            Security & Privacy Guaranteed
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
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
                  <h3 className="font-semibold mb-1">Read-Only Access</h3>
                  <p className="text-gray-300 text-sm">
                    Extended public keys can only view addresses and balances. They cannot be used
                    to spend funds or access your wallet.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
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
                  <h3 className="font-semibold mb-1">No Data Storage</h3>
                  <p className="text-gray-300 text-sm">
                    We never store your extended public keys, addresses, or balance information.
                    Everything is discarded after display.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
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
                  <h3 className="font-semibold mb-1">Client-Side Processing</h3>
                  <p className="text-gray-300 text-sm">
                    Address derivation happens in your browser using cryptographic libraries.
                    Your keys never leave your device.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
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
                  <h3 className="font-semibold mb-1">Public APIs Only</h3>
                  <p className="text-gray-300 text-sm">
                    Balance data comes from public blockchain APIs (Blockstream) and price data
                    from CoinGecko. No authentication required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {/* FAQ 1 */}
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 text-lg list-none flex items-center justify-between">
                What is an extended public key?
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                An extended public key (xpub, ypub, or zpub) is a master key that can derive all
                public addresses in your Bitcoin wallet. For Ethereum, you provide a direct public address.
                Both allow viewing of balances without exposing private keys or ability to spend funds.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 text-lg list-none flex items-center justify-between">
                Is it safe to enter my extended public key?
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Yes, it's completely safe. Extended public keys can only be used to view addresses
                and balances. They cannot be used to spend funds or access your wallet. However,
                they do reveal your balance and transaction history, so only use trusted tools.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 text-lg list-none flex items-center justify-between">
                Why do you scan 40 addresses?
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                HD wallets derive two chains of addresses: 20 external (receiving) addresses and 20
                internal (change) addresses. This is the standard gap limit that ensures we capture
                all addresses that may have been used by your wallet.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 text-lg list-none flex items-center justify-between">
                What formats are supported?
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                For Bitcoin: xpub (Legacy, addresses start with 1), ypub (Nested SegWit, addresses start with 3),
                and zpub (Native SegWit, addresses start with bc1). For Ethereum: standard addresses starting with 0x.
                The tool auto-detects which format you're using.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
              <summary className="font-semibold text-gray-900 text-lg list-none flex items-center justify-between">
                Where does the balance data come from?
                <svg
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-gray-600">
                Balance data is fetched from Blockstream's API (Bitcoin) or Ethereum RPC nodes (Ethereum).
                Price data (BTC/AUD and ETH/AUD) comes from CoinGecko's free API. All are reputable
                and widely-used sources in the cryptocurrency ecosystem.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Check Your Balance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get started now - no signup required, completely free and private.
          </p>
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          >
            Check Balance Now
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-400 text-center">
        <p className="text-sm">
          This tool is for informational purposes only. Always verify balances through your
          official wallet software.
        </p>
        <p className="text-xs mt-2">
          Built with Next.js • Uses Blockstream API, Ethereum RPC & CoinGecko API
        </p>
      </footer>
    </div>
  );
}
