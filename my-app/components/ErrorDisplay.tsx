/**
 * ErrorDisplay Component
 * Displays error messages with retry functionality
 */

'use client';

type ErrorType = 'validation' | 'network' | 'api' | 'unknown';

interface ErrorDisplayProps {
  error: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  onReset?: () => void;
}

const errorTypeInfo = {
  validation: {
    title: 'Validation Error',
    icon: '⚠️',
    color: 'yellow',
    tips: [
      'Make sure you\'re using an extended public key (xpub, ypub, or zpub)',
      'Check that the key is complete and correctly copied',
      'Testnet keys are not currently supported',
    ],
  },
  network: {
    title: 'Network Error',
    icon: '📡',
    color: 'orange',
    tips: [
      'Check your internet connection',
      'The blockchain API might be temporarily unavailable',
      'Try again in a few moments',
    ],
  },
  api: {
    title: 'API Error',
    icon: '🔧',
    color: 'red',
    tips: [
      'The blockchain API returned an error',
      'This might be due to rate limiting or server issues',
      'Wait a moment and try again',
    ],
  },
  unknown: {
    title: 'Error',
    icon: '❌',
    color: 'red',
    tips: [
      'An unexpected error occurred',
      'Try refreshing the page',
      'If the problem persists, try again later',
    ],
  },
};

export default function ErrorDisplay({
  error,
  errorType = 'unknown',
  onRetry,
  onReset,
}: ErrorDisplayProps) {
  const info = errorTypeInfo[errorType];

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      iconBg: 'bg-yellow-100',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      iconBg: 'bg-orange-100',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-900',
      iconBg: 'bg-red-100',
    },
  };

  const colors = colorClasses[info.color as keyof typeof colorClasses];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Error header */}
        <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className={`${colors.iconBg} rounded-full p-2 text-2xl flex-shrink-0`}>
              {info.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${colors.text} mb-1`}>
                {info.title}
              </h3>
              <p className={`text-sm ${colors.text} opacity-90`}>
                {error}
              </p>
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">What you can try:</h4>
          <ul className="space-y-2">
            {info.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common issues */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Common Issues:</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <details className="cursor-pointer">
              <summary className="font-medium hover:text-gray-900">
                Invalid key format
              </summary>
              <p className="mt-2 ml-4 text-gray-600">
                Extended public keys start with "xpub", "ypub", or "zpub" for mainnet.
                Make sure you haven't accidentally copied a private key or seed phrase.
              </p>
            </details>
            <details className="cursor-pointer">
              <summary className="font-medium hover:text-gray-900">
                API timeout
              </summary>
              <p className="mt-2 ml-4 text-gray-600">
                If the request is taking too long, the blockchain API might be experiencing
                high traffic. Wait a moment and try again.
              </p>
            </details>
            <details className="cursor-pointer">
              <summary className="font-medium hover:text-gray-900">
                Rate limiting
              </summary>
              <p className="mt-2 ml-4 text-gray-600">
                Public APIs have rate limits. If you're checking multiple wallets,
                wait a few seconds between requests.
              </p>
            </details>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Start Over
            </button>
          )}
        </div>

        {/* Support info */}
        <div className="text-xs text-gray-500 text-center">
          If issues persist, the blockchain API may be temporarily unavailable.
        </div>
      </div>
    </div>
  );
}
