/**
 * LoadingState Component
 * Displays loading progress with status messages
 */

'use client';

interface LoadingStateProps {
  status?: string;
  onCancel?: () => void;
}

const defaultStatuses = [
  'Validating extended public key...',
  'Deriving addresses...',
  'Checking balances...',
  'Fetching price...',
];

export default function LoadingState({ status, onCancel }: LoadingStateProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Status message */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Checking Wallet Balance
          </h3>
          <p className="text-gray-600">
            {status || 'Processing your request...'}
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-2 mb-6">
          {defaultStatuses.map((step, index) => {
            const isActive = status === step;
            const isPending = !status || defaultStatuses.indexOf(status) < index;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 text-sm transition-opacity ${
                  isPending ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {isActive ? (
                  <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin flex-shrink-0"></div>
                ) : isPending ? (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                ) : (
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  className={
                    isActive
                      ? 'font-medium text-gray-900'
                      : isPending
                      ? 'text-gray-500'
                      : 'text-gray-700'
                  }
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Privacy Notice:</strong> We're fetching balance information from public
            blockchain APIs. Your extended public key is processed securely and no data is stored.
          </p>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}

        {/* Estimated time */}
        <div className="text-center text-xs text-gray-500 mt-4">
          This usually takes 5-15 seconds depending on API response times.
        </div>
      </div>
    </div>
  );
}
