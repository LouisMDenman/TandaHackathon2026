/**
 * Ethereum constants and configuration
 */

/**
 * RPC endpoints for Ethereum mainnet
 * Using multiple endpoints for redundancy
 */
export const RPC_ENDPOINTS = {
  // Primary: Cloudflare Ethereum Gateway (reliable, no API key needed)
  primary: 'https://cloudflare-eth.com',

  // Fallback: Public Ethereum nodes
  fallbacks: [
    'https://rpc.ankr.com/eth',
    'https://eth.llamarpc.com',
  ],
};

/**
 * API configuration for Ethereum requests
 */
export const API_CONFIG = {
  timeout: 30000,           // 30 seconds timeout per request
  retries: 3,               // Number of retry attempts
  retryDelay: 1000,         // Initial retry delay (ms) - will use exponential backoff
};

/**
 * Ethereum constants
 */
export const ETHEREUM_CONSTANTS = {
  // Wei conversion
  WEI_PER_ETH: BigInt('1000000000000000000'), // 10^18

  // Address format
  ADDRESS_LENGTH: 42,       // Including '0x' prefix
  ADDRESS_PREFIX: '0x',
};

/**
 * Network configuration
 */
export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrls: [RPC_ENDPOINTS.primary, ...RPC_ENDPOINTS.fallbacks],
  },
};
