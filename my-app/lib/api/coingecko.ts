/**
 * CoinGecko API client for fetching cryptocurrency prices
 * API Documentation: https://www.coingecko.com/en/api/documentation
 */

import { API_CONFIG } from '../bitcoin/constants';

/**
 * Bitcoin price in AUD with timestamp
 */
export interface BTCPrice {
  aud: number;
  timestamp: number;
}

/**
 * Ethereum price in AUD with timestamp
 */
export interface ETHPrice {
  aud: number;
  timestamp: number;
}

/**
 * Solana price in AUD with timestamp
 */
export interface SOLPrice {
  aud: number;
  timestamp: number;
}

/**
 * XRP price in AUD with timestamp
 */
export interface XRPPrice {
  aud: number;
  timestamp: number;
}

/**
 * CoinGecko API response structure for Bitcoin
 */
interface CoinGeckoResponse {
  bitcoin: {
    aud: number;
  };
}

/**
 * CoinGecko API response structure for Ethereum
 */
interface CoinGeckoETHResponse {
  ethereum: {
    aud: number;
  };
}

/**
 * CoinGecko API response structure for Solana
 */
interface CoinGeckoSOLResponse {
  solana: {
    aud: number;
  };
}

/**
 * CoinGecko API response structure for XRP
 */
interface CoinGeckoXRPResponse {
  ripple: {
    aud: number;
  };
}

/**
 * In-memory cache for BTC price
 * Stores the last fetched price with timestamp
 */
let priceCache: BTCPrice | null = null;

/**
 * In-memory cache for ETH price
 * Stores the last fetched price with timestamp
 */
let ethPriceCache: ETHPrice | null = null;

/**
 * In-memory cache for SOL price
 * Stores the last fetched price with timestamp
 */
let solPriceCache: SOLPrice | null = null;

/**
 * In-memory cache for XRP price
 * Stores the last fetched price with timestamp
 */
let xrpPriceCache: XRPPrice | null = null;

/**
 * Cache validity duration in milliseconds (60 seconds)
 */
const CACHE_DURATION = 60 * 1000;

/**
 * Check if cached price is still valid
 * @returns True if cache exists and is not expired
 */
function isCacheValid(): boolean {
  if (!priceCache) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - priceCache.timestamp;

  return cacheAge < CACHE_DURATION;
}

/**
 * Check if cached ETH price is still valid
 * @returns True if cache exists and is not expired
 */
function isETHCacheValid(): boolean {
  if (!ethPriceCache) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - ethPriceCache.timestamp;

  return cacheAge < CACHE_DURATION;
}

/**
 * Check if cached SOL price is still valid
 * @returns True if cache exists and is not expired
 */
function isSOLCacheValid(): boolean {
  if (!solPriceCache) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - solPriceCache.timestamp;

  return cacheAge < CACHE_DURATION;
}

/**
 * Check if cached XRP price is still valid
 * @returns True if cache exists and is not expired
 */
function isXRPCacheValid(): boolean {
  if (!xrpPriceCache) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - xrpPriceCache.timestamp;

  return cacheAge < CACHE_DURATION;
}

/**
 * Fetch BTC/AUD exchange rate from CoinGecko API
 * Implements short-term in-memory caching (60 seconds)
 *
 * @returns Bitcoin price in AUD with timestamp
 * @throws Error if API request fails
 */
export async function fetchBTCPrice(): Promise<BTCPrice> {
  // Return cached price if still valid
  if (isCacheValid() && priceCache) {
    return priceCache;
  }

  const url = `${API_CONFIG.coingecko.baseUrl}/simple/price?ids=bitcoin&vs_currencies=aud`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CoinGeckoResponse = await response.json();

    // Validate response structure
    if (!data.bitcoin || typeof data.bitcoin.aud !== 'number') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Create price object with current timestamp
    const price: BTCPrice = {
      aud: data.bitcoin.aud,
      timestamp: Date.now(),
    };

    // Update cache
    priceCache = price;

    return price;
  } catch (error) {
    // If we have a cached price (even if expired), return it as fallback
    if (priceCache) {
      console.warn('Failed to fetch fresh price, using cached value:', error);
      return priceCache;
    }

    // No cached price available, throw error
    console.error('Failed to fetch BTC price:', error);
    throw new Error(`Failed to fetch BTC price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch ETH/AUD exchange rate from CoinGecko API
 * Implements short-term in-memory caching (60 seconds)
 *
 * @returns Ethereum price in AUD with timestamp
 * @throws Error if API request fails
 */
export async function fetchETHPrice(): Promise<ETHPrice> {
  // Return cached price if still valid
  if (isETHCacheValid() && ethPriceCache) {
    return ethPriceCache;
  }

  const url = `${API_CONFIG.coingecko.baseUrl}/simple/price?ids=ethereum&vs_currencies=aud`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CoinGeckoETHResponse = await response.json();

    // Validate response structure
    if (!data.ethereum || typeof data.ethereum.aud !== 'number') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Create price object with current timestamp
    const price: ETHPrice = {
      aud: data.ethereum.aud,
      timestamp: Date.now(),
    };

    // Update cache
    ethPriceCache = price;

    return price;
  } catch (error) {
    // If we have a cached price (even if expired), return it as fallback
    if (ethPriceCache) {
      console.warn('Failed to fetch fresh ETH price, using cached value:', error);
      return ethPriceCache;
    }

    // No cached price available, throw error
    console.error('Failed to fetch ETH price:', error);
    throw new Error(`Failed to fetch ETH price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch SOL/AUD exchange rate from CoinGecko API
 * Implements short-term in-memory caching (60 seconds)
 *
 * @returns Solana price in AUD with timestamp
 * @throws Error if API request fails
 */
export async function fetchSOLPrice(): Promise<SOLPrice> {
  // Return cached price if still valid
  if (isSOLCacheValid() && solPriceCache) {
    return solPriceCache;
  }

  const url = `${API_CONFIG.coingecko.baseUrl}/simple/price?ids=solana&vs_currencies=aud`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CoinGeckoSOLResponse = await response.json();

    // Validate response structure
    if (!data.solana || typeof data.solana.aud !== 'number') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Create price object with current timestamp
    const price: SOLPrice = {
      aud: data.solana.aud,
      timestamp: Date.now(),
    };

    // Update cache
    solPriceCache = price;

    return price;
  } catch (error) {
    // If we have a cached price (even if expired), return it as fallback
    if (solPriceCache) {
      console.warn('Failed to fetch fresh SOL price, using cached value:', error);
      return solPriceCache;
    }

    // No cached price available, throw error
    console.error('Failed to fetch SOL price:', error);
    throw new Error(`Failed to fetch SOL price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch XRP/AUD exchange rate from CoinGecko API
 * Implements short-term in-memory caching (60 seconds)
 *
 * @returns XRP price in AUD with timestamp
 * @throws Error if API request fails
 */
export async function fetchXRPPrice(): Promise<XRPPrice> {
  // Return cached price if still valid
  if (isXRPCacheValid() && xrpPriceCache) {
    return xrpPriceCache;
  }

  const url = `${API_CONFIG.coingecko.baseUrl}/simple/price?ids=ripple&vs_currencies=aud`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CoinGeckoXRPResponse = await response.json();

    // Validate response structure
    if (!data.ripple || typeof data.ripple.aud !== 'number') {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Create price object with current timestamp
    const price: XRPPrice = {
      aud: data.ripple.aud,
      timestamp: Date.now(),
    };

    // Update cache
    xrpPriceCache = price;

    return price;
  } catch (error) {
    // If we have a cached price (even if expired), return it as fallback
    if (xrpPriceCache) {
      console.warn('Failed to fetch fresh XRP price, using cached value:', error);
      return xrpPriceCache;
    }

    // No cached price available, throw error
    console.error('Failed to fetch XRP price:', error);
    throw new Error(`Failed to fetch XRP price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert BTC amount to AUD
 *
 * @param btcAmount Amount in BTC
 * @param price BTC price in AUD
 * @returns Amount in AUD
 */
export function convertBTCToAUD(btcAmount: number, price: number): number {
  return btcAmount * price;
}

/**
 * Convert ETH amount to AUD
 *
 * @param ethAmount Amount in ETH
 * @param price ETH price in AUD
 * @returns Amount in AUD
 */
export function convertETHToAUD(ethAmount: number, price: number): number {
  return ethAmount * price;
}

/**
 * Convert SOL amount to AUD
 *
 * @param solAmount Amount in SOL
 * @param price SOL price in AUD
 * @returns Amount in AUD
 */
export function convertSOLToAUD(solAmount: number, price: number): number {
  return solAmount * price;
}

/**
 * Convert XRP amount to AUD
 *
 * @param xrpAmount Amount in XRP
 * @param price XRP price in AUD
 * @returns Amount in AUD
 */
export function convertXRPToAUD(xrpAmount: number, price: number): number {
  return xrpAmount * price;
}

/**
 * Format currency amount for display
 *
 * @param amount Amount to format
 * @param currency Currency type (BTC, ETH, SOL, XRP, or AUD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'AUD'): string {
  if (currency === 'BTC') {
    // Format BTC with 8 decimal places, removing trailing zeros
    const formatted = amount.toFixed(8);
    const trimmed = formatted.replace(/\.?0+$/, '');

    // Ensure at least 2 decimal places
    const parts = trimmed.split('.');
    if (parts.length === 1) {
      return `${trimmed}.00 BTC`;
    } else if (parts[1].length === 1) {
      return `${trimmed}0 BTC`;
    }

    return `${trimmed} BTC`;
  } else if (currency === 'ETH') {
    // Format ETH with 6 decimal places, removing trailing zeros
    const formatted = amount.toFixed(6);
    const trimmed = formatted.replace(/\.?0+$/, '');

    // Ensure at least 2 decimal places
    const parts = trimmed.split('.');
    if (parts.length === 1) {
      return `${trimmed}.00 ETH`;
    } else if (parts[1].length === 1) {
      return `${trimmed}0 ETH`;
    }

    return `${trimmed} ETH`;
  } else if (currency === 'SOL') {
    // Format SOL with 6 decimal places, removing trailing zeros
    const formatted = amount.toFixed(6);
    const trimmed = formatted.replace(/\.?0+$/, '');

    // Ensure at least 2 decimal places
    const parts = trimmed.split('.');
    if (parts.length === 1) {
      return `${trimmed}.00 SOL`;
    } else if (parts[1].length === 1) {
      return `${trimmed}0 SOL`;
    }

    return `${trimmed} SOL`;
  } else if (currency === 'XRP') {
    // Format XRP with 6 decimal places, removing trailing zeros
    const formatted = amount.toFixed(6);
    const trimmed = formatted.replace(/\.?0+$/, '');

    // Ensure at least 2 decimal places
    const parts = trimmed.split('.');
    if (parts.length === 1) {
      return `${trimmed}.00 XRP`;
    } else if (parts[1].length === 1) {
      return `${trimmed}0 XRP`;
    }

    return `${trimmed} XRP`;
  } else {
    // Format AUD with 2 decimal places and thousand separators
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/**
 * Clear the price cache
 * Useful for testing or manual refresh
 */
export function clearPriceCache(): void {
  priceCache = null;
}

/**
 * Get cached price without fetching
 * Returns null if no cache exists or cache is expired
 *
 * @returns Cached price or null
 */
export function getCachedPrice(): BTCPrice | null {
  if (isCacheValid() && priceCache) {
    return priceCache;
  }
  return null;
}

/**
 * Fetch BTC price with custom timeout
 *
 * @param timeoutMs Custom timeout in milliseconds
 * @returns Bitcoin price in AUD
 */
export async function fetchBTCPriceWithTimeout(timeoutMs: number): Promise<BTCPrice> {
  const url = `${API_CONFIG.coingecko.baseUrl}/simple/price?ids=bitcoin&vs_currencies=aud`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: CoinGeckoResponse = await response.json();

  if (!data.bitcoin || typeof data.bitcoin.aud !== 'number') {
    throw new Error('Invalid response format from CoinGecko API');
  }

  return {
    aud: data.bitcoin.aud,
    timestamp: Date.now(),
  };
}

/**
 * Convert satoshis to AUD
 *
 * @param satoshis Amount in satoshis
 * @param price BTC price in AUD
 * @returns Amount in AUD
 */
export function satoshisToAUD(satoshis: number, price: number): number {
  const btc = satoshis / 100000000; // 1 BTC = 100,000,000 satoshis
  return convertBTCToAUD(btc, price);
}

/**
 * Get cache age in seconds
 * Returns -1 if no cache exists
 *
 * @returns Cache age in seconds or -1
 */
export function getCacheAge(): number {
  if (!priceCache) {
    return -1;
  }

  const now = Date.now();
  const ageMs = now - priceCache.timestamp;
  return Math.floor(ageMs / 1000);
}

/**
 * Check if cache exists
 *
 * @returns True if cache exists
 */
export function hasCachedPrice(): boolean {
  return priceCache !== null;
}
