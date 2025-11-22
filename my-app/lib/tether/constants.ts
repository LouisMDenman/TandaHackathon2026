/**
 * Tether (USDT) constants and configuration
 */

/**
 * Tether USDT smart contract address on Ethereum mainnet
 */
export const TETHER_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

/**
 * Number of decimals used by Tether USDT token
 * IMPORTANT: Tether uses 6 decimals, not 18 like most ERC-20 tokens
 */
export const TETHER_DECIMALS = 6;

/**
 * Conversion factor for micro-USDT to USDT
 * 1 USDT = 1,000,000 micro-USDT
 */
export const MICRO_USDT_PER_USDT = 10 ** TETHER_DECIMALS; // 1,000,000

/**
 * RPC endpoints for Ethereum mainnet
 * Tether uses Ethereum infrastructure, so we reuse Ethereum RPC endpoints
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
 * API configuration for Tether requests
 */
export const API_CONFIG = {
  timeout: 30000,           // 30 seconds timeout per request
  retries: 3,               // Number of retry attempts
  retryDelay: 1000,         // Initial retry delay (ms) - will use exponential backoff
};

/**
 * ERC-20 function selectors
 */
export const ERC20_FUNCTIONS = {
  // balanceOf(address) - returns uint256
  BALANCE_OF: '0x70a08231',

  // name() - returns string
  NAME: '0x06fdde03',

  // symbol() - returns string
  SYMBOL: '0x95d89b41',

  // decimals() - returns uint8
  DECIMALS: '0x313ce567',
};
