/**
 * Utility functions for XRP operations
 */

import { XRP_CONSTANTS } from './constants';

/**
 * Convert drops to XRP
 * @param drops - Amount in drops (can be string or number)
 * @returns Amount in XRP (decimal)
 */
export function dropsToXrp(drops: number | string): number {
  const dropsNum = typeof drops === 'string' ? parseInt(drops, 10) : drops;
  return dropsNum / XRP_CONSTANTS.DROPS_PER_XRP;
}

/**
 * Convert XRP to drops
 * @param xrp - Amount in XRP
 * @returns Amount in drops (integer)
 */
export function xrpToDrops(xrp: number): number {
  return Math.round(xrp * XRP_CONSTANTS.DROPS_PER_XRP);
}

/**
 * Format XRP amount for display
 * @param xrp - Amount in XRP
 * @returns Formatted string with appropriate decimals
 */
export function formatXrp(xrp: number): string {
  if (xrp === 0) return '0 XRP';
  if (xrp < 0.000001) return '<0.000001 XRP';

  // Remove trailing zeros after decimal point
  return `${xrp.toFixed(6).replace(/\.?0+$/, '')} XRP`;
}

/**
 * Parse destination tag from address string
 * Supports format: rAddress:tag
 * @param input - Address string (may include :tag)
 * @returns {address, destinationTag}
 */
export function parseAddressWithTag(input: string): {
  address: string;
  destinationTag?: number;
} {
  // Check if there's a colon in the address
  const colonIndex = input.indexOf(':');

  if (colonIndex === -1) {
    // No colon, return address as-is
    return { address: input };
  }

  // Check for multiple colons - invalid format
  if (input.indexOf(':', colonIndex + 1) !== -1) {
    // Multiple colons, return whole input as address
    return { address: input };
  }

  // Split by colon
  const addressPart = input.substring(0, colonIndex);
  const tagPart = input.substring(colonIndex + 1);

  // Try to parse the tag - must be only digits
  const tag = parseInt(tagPart, 10);

  // Validate tag is a valid number, matches the string exactly (no extra chars), and within valid range
  if (!isNaN(tag) && tagPart === tag.toString() && tag >= 0 && tag <= XRP_CONSTANTS.MAX_DESTINATION_TAG) {
    return { address: addressPart, destinationTag: tag };
  }

  // Invalid tag, return whole input as address
  return { address: input };
}

/**
 * Calculate total reserve requirement for an account
 * @param ownerCount - Number of objects owned by the account
 * @returns Required reserve in drops
 */
export function calculateReserve(ownerCount: number): number {
  return XRP_CONSTANTS.BASE_RESERVE + (ownerCount * XRP_CONSTANTS.OWNER_RESERVE);
}
