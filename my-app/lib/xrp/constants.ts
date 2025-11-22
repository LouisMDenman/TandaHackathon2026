/**
 * XRP configuration constants and RPC endpoints
 */

/**
 * RPC endpoint configuration
 */
export const RPC_ENDPOINTS = {
  primary: 'https://s1.ripple.com:51234/',
  fallbacks: [
    'https://s2.ripple.com:51234/',
    'https://xrplcluster.com/'
  ]
};

/**
 * XRP Ledger constants
 */
export const XRP_CONSTANTS = {
  DROPS_PER_XRP: 1000000, // 1 XRP = 1,000,000 drops (10^6)
  MIN_ACCOUNT_RESERVE: 10000000, // 10 XRP in drops
  BASE_RESERVE: 10000000, // 10 XRP base reserve
  OWNER_RESERVE: 2000000, // 2 XRP per owned object
  ADDRESS_LENGTH_MIN: 25,
  ADDRESS_LENGTH_MAX: 35,
  MAX_DESTINATION_TAG: 4294967295, // 2^32 - 1
};

/**
 * Regular expressions for address validation
 * Note: XRP uses a different base58 alphabet than Bitcoin: rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz
 */
export const ADDRESS_PATTERNS = {
  // Classic address: starts with 'r', followed by 24-34 base58 characters (using Ripple's alphabet)
  CLASSIC: /^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{24,34}$/,

  // X-address: starts with 'X', followed by 46 base58 characters (using Ripple's alphabet)
  X_ADDRESS: /^X[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{46}$/,

  // Classic address with destination tag (format: rAddress:tag)
  WITH_TAG: /^(r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{24,34}):(\d+)$/,
};

/**
 * API configuration
 */
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second initial delay
};
