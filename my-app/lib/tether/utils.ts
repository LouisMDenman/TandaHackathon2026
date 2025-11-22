/**
 * Tether (USDT) utility functions
 */

import { MICRO_USDT_PER_USDT } from './constants';

/**
 * Convert micro-USDT (smallest unit) to USDT
 * Tether uses 6 decimal places
 *
 * @param microUsdt - Amount in micro-USDT (1 USDT = 1,000,000 micro-USDT)
 * @returns Amount in USDT
 */
export function microUsdtToUsdt(microUsdt: number): number {
  return microUsdt / MICRO_USDT_PER_USDT;
}

/**
 * Convert USDT to micro-USDT
 *
 * @param usdt - Amount in USDT
 * @returns Amount in micro-USDT
 */
export function usdtToMicroUsdt(usdt: number): number {
  return Math.floor(usdt * MICRO_USDT_PER_USDT);
}

/**
 * Format micro-USDT as a string to avoid precision loss
 *
 * @param microUsdt - Amount in micro-USDT
 * @returns String representation
 */
export function microUsdtToString(microUsdt: bigint): string {
  return microUsdt.toString();
}

/**
 * Parse a hex string to bigint
 *
 * @param hex - Hex string (with or without 0x prefix)
 * @returns BigInt value
 */
export function hexToBigInt(hex: string): bigint {
  // Ensure hex has 0x prefix for BigInt
  const prefixed = hex.startsWith('0x') ? hex : '0x' + hex;
  return BigInt(prefixed);
}

/**
 * Pad an Ethereum address to 32 bytes for ERC-20 function calls
 * Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
 * becomes: 0x000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb
 *
 * @param address - Ethereum address (with 0x prefix)
 * @returns 32-byte padded address (lowercase)
 */
export function padAddressTo32Bytes(address: string): string {
  // Remove 0x prefix and convert to lowercase
  const addressWithoutPrefix = address.slice(2).toLowerCase();

  // Pad with zeros to make it 64 characters (32 bytes)
  const paddedAddress = addressWithoutPrefix.padStart(64, '0');

  return '0x' + paddedAddress;
}

/**
 * Encode an ERC-20 balanceOf function call
 *
 * @param address - Ethereum address to query balance for
 * @returns Encoded function call data
 */
export function encodeBalanceOfCall(address: string): string {
  const functionSelector = '0x70a08231'; // keccak256("balanceOf(address)").slice(0, 4)
  const paddedAddress = padAddressTo32Bytes(address);

  return functionSelector + paddedAddress.slice(2); // Concatenate, removing second 0x
}
