/**
 * Formatting utilities for displaying Bitcoin and fiat amounts
 */

import { SATOSHIS_PER_BTC } from '../bitcoin/constants';

/**
 * Convert satoshis to BTC
 * @param satoshis Amount in satoshis
 * @returns Amount in BTC
 */
export function satoshisToBTC(satoshis: number): number {
  return satoshis / SATOSHIS_PER_BTC;
}

/**
 * Convert BTC to satoshis
 * @param btc Amount in BTC
 * @returns Amount in satoshis
 */
export function btcToSatoshis(btc: number): number {
  return Math.round(btc * SATOSHIS_PER_BTC);
}

/**
 * Format BTC amount with proper decimal places
 * @param btc Amount in BTC
 * @param maxDecimals Maximum decimal places (default: 8)
 * @returns Formatted BTC string
 */
export function formatBTC(btc: number, maxDecimals: number = 8): string {
  // Remove trailing zeros but keep at least 2 decimal places
  const formatted = btc.toFixed(maxDecimals);
  const trimmed = formatted.replace(/\.?0+$/, '');

  // Ensure at least 2 decimal places
  const parts = trimmed.split('.');
  if (parts.length === 1) {
    return `${trimmed}.00`;
  } else if (parts[1].length === 1) {
    return `${trimmed}0`;
  }

  return trimmed;
}

/**
 * Format satoshis as BTC string
 * @param satoshis Amount in satoshis
 * @returns Formatted BTC string
 */
export function formatSatoshisAsBTC(satoshis: number): string {
  const btc = satoshisToBTC(satoshis);
  return formatBTC(btc);
}

/**
 * Format currency amount (AUD)
 * @param amount Amount in AUD
 * @param includeSymbol Whether to include $ symbol
 * @returns Formatted currency string
 */
export function formatAUD(amount: number, includeSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? formatted : formatted.replace('$', '').trim();
}

/**
 * Format large numbers with thousand separators
 * @param num Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-AU').format(num);
}

/**
 * Convert BTC to AUD
 * @param btc Amount in BTC
 * @param price BTC price in AUD
 * @returns Amount in AUD
 */
export function btcToAUD(btc: number, price: number): number {
  return btc * price;
}

/**
 * Convert satoshis to AUD
 * @param satoshis Amount in satoshis
 * @param price BTC price in AUD
 * @returns Amount in AUD
 */
export function satoshisToAUD(satoshis: number, price: number): number {
  const btc = satoshisToBTC(satoshis);
  return btcToAUD(btc, price);
}

/**
 * Format Bitcoin address for display (truncate middle)
 * @param address Full Bitcoin address
 * @param startChars Number of characters to show at start (default: 8)
 * @param endChars Number of characters to show at end (default: 8)
 * @returns Truncated address string
 */
export function truncateAddress(
  address: string,
  startChars: number = 8,
  endChars: number = 8
): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format timestamp as human-readable date
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param timestamp Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Validate and sanitize numeric input
 * @param value Input value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumericInput(value: string): number | null {
  const cleaned = value.trim().replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Format percentage
 * @param value Decimal value (e.g., 0.05 for 5%)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
