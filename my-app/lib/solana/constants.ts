/**
 * Solana constants and configuration
 */

/**
 * RPC endpoints for Solana mainnet
 * Using multiple endpoints for redundancy
 * Note: Public endpoints have rate limits - using server-side proxy is recommended
 */
export const RPC_ENDPOINTS = {
  // Primary: Server-side API route (avoids CORS and rate limits)
  primary: '/api/solana-rpc',

  // Fallback: Direct public endpoints (may have rate limits)
  fallbacks: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.rpc.extrnode.com',
  ],
};

/**
 * API configuration for Solana requests
 */
export const API_CONFIG = {
  timeout: 30000,           // 30 seconds timeout per request
  retries: 3,               // Number of retry attempts
  retryDelay: 1000,         // Initial retry delay (ms) - will use exponential backoff
};

/**
 * Solana constants
 */
export const SOLANA_CONSTANTS = {
  // Lamport conversion
  LAMPORTS_PER_SOL: 1000000000, // 10^9

  // Address format
  ADDRESS_MIN_LENGTH: 32,   // Minimum address length in base58
  ADDRESS_MAX_LENGTH: 44,   // Maximum address length in base58

  // Valid base58 characters (Bitcoin base58 alphabet)
  BASE58_ALPHABET: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
};

/**
 * Network configuration
 */
export const NETWORKS = {
  mainnet: {
    name: 'Solana Mainnet Beta',
    rpcUrls: [RPC_ENDPOINTS.primary, ...RPC_ENDPOINTS.fallbacks],
  },
};
