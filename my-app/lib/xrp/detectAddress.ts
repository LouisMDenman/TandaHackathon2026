/**
 * XRP address detection and validation
 */

import { isValidClassicAddress, isValidXAddress, classicAddressToXAddress, xAddressToClassicAddress } from 'xrpl';
import { XRPAddressInfo, NetworkType, AddressType } from './types';
import { ADDRESS_PATTERNS } from './constants';
import { parseAddressWithTag } from './utils';

/**
 * Detect and validate XRP address
 * Supports: classic addresses (r...), X-addresses (X...), and addresses with destination tags (r...:tag)
 * @param input - Address string (classic, X-address, or with tag)
 * @returns Address validation info
 */
export async function detectAndValidateXrpAddress(input: string): Promise<XRPAddressInfo> {
  const trimmed = input.trim();

  // Parse potential destination tag
  const { address, destinationTag } = parseAddressWithTag(trimmed);

  // Detect address type and validate
  if (ADDRESS_PATTERNS.CLASSIC.test(address)) {
    return validateClassicAddress(address, destinationTag);
  } else if (ADDRESS_PATTERNS.X_ADDRESS.test(address)) {
    return validateXAddress(address);
  }

  return {
    address: trimmed,
    valid: false,
    network: 'mainnet',
    addressType: 'classic',
    error: 'Invalid XRP address format. Expected format: r... (classic) or X... (X-address)',
  };
}

/**
 * Validate classic XRP address (starts with 'r')
 * @param address - Classic address string
 * @param destinationTag - Optional destination tag
 * @returns Address validation info
 */
function validateClassicAddress(address: string, destinationTag?: number): XRPAddressInfo {
  try {
    const isValid = isValidClassicAddress(address);

    if (!isValid) {
      return {
        address,
        valid: false,
        network: 'mainnet',
        addressType: 'classic',
        error: 'Invalid classic address checksum',
      };
    }

    return {
      address,
      valid: true,
      network: 'mainnet', // Classic addresses don't encode network
      addressType: 'classic',
      destinationTag,
    };
  } catch (error) {
    return {
      address,
      valid: false,
      network: 'mainnet',
      addressType: 'classic',
      error: error instanceof Error ? error.message : 'Address validation failed',
    };
  }
}

/**
 * Validate X-address (starts with 'X')
 * X-addresses encode the classic address, destination tag, and network in a single string
 * @param address - X-address string
 * @returns Address validation info
 */
function validateXAddress(address: string): XRPAddressInfo {
  try {
    const isValid = isValidXAddress(address);

    if (!isValid) {
      return {
        address,
        valid: false,
        network: 'mainnet',
        addressType: 'x-address',
        error: 'Invalid X-address format',
      };
    }

    // Decode X-address to get classic address, tag, and network
    const decoded = xAddressToClassicAddress(address);

    return {
      address: decoded.classicAddress, // Store classic address for API calls
      valid: true,
      network: decoded.test ? 'testnet' : 'mainnet',
      addressType: 'x-address',
      destinationTag: decoded.tag === false ? undefined : decoded.tag,
    };
  } catch (error) {
    return {
      address,
      valid: false,
      network: 'mainnet',
      addressType: 'x-address',
      error: error instanceof Error ? error.message : 'X-address validation failed',
    };
  }
}

/**
 * Convert classic address to X-address
 * Useful for displaying addresses in X-address format
 * @param classicAddress - Classic XRP address (r...)
 * @param destinationTag - Optional destination tag
 * @param isTestnet - Whether the address is for testnet
 * @returns X-address string
 */
export function toXAddress(classicAddress: string, destinationTag?: number, isTestnet = false): string {
  return classicAddressToXAddress(classicAddress, destinationTag || false, isTestnet);
}
