/**
 * Ethereum address detection and validation
 * Implements EIP-55 checksum validation
 */

import { ETHEREUM_CONSTANTS } from './constants';
import type { EthereumAddressInfo } from './types';

/**
 * keccak256 hash implementation using js-sha3 library
 */
async function keccak256(data: string): Promise<string> {
  const { keccak_256 } = await import('js-sha3');
  return keccak_256(data);
}

/**
 * Check if a string looks like an Ethereum address
 */
export function looksLikeEthereumAddress(input: string): boolean {
  // Must be 42 characters (0x + 40 hex digits)
  if (input.length !== ETHEREUM_CONSTANTS.ADDRESS_LENGTH) {
    return false;
  }

  // Must start with 0x
  if (!input.startsWith(ETHEREUM_CONSTANTS.ADDRESS_PREFIX)) {
    return false;
  }

  // Must be valid hex (0-9, a-f, A-F)
  const hexPart = input.slice(2);
  return /^[0-9a-fA-F]{40}$/.test(hexPart);
}

/**
 * Convert address to checksummed format (EIP-55)
 * https://eips.ethereum.org/EIPS/eip-55
 */
export async function toChecksumAddress(address: string): Promise<string> {
  // Remove 0x prefix and convert to lowercase
  const addressLower = address.toLowerCase().replace('0x', '');

  // Hash the lowercase address
  const hash = await keccak256(addressLower);

  // Build checksummed address
  let checksumAddress = '0x';

  for (let i = 0; i < addressLower.length; i++) {
    const char = addressLower[i];

    // If it's a letter (a-f) and the corresponding hash digit is >= 8, capitalize it
    if (parseInt(hash[i], 16) >= 8) {
      checksumAddress += char.toUpperCase();
    } else {
      checksumAddress += char;
    }
  }

  return checksumAddress;
}

/**
 * Verify EIP-55 checksum of an address
 * Returns true if checksum is valid or if address is all lowercase/uppercase
 */
export async function isValidChecksum(address: string): Promise<boolean> {
  const addressHex = address.slice(2); // Remove 0x prefix

  // If all lowercase or all uppercase, checksum validation is not applicable
  if (addressHex === addressHex.toLowerCase() || addressHex === addressHex.toUpperCase()) {
    return true;
  }

  // Verify checksum
  const checksummed = await toChecksumAddress(address);
  return address === checksummed;
}

/**
 * Validate and normalize an Ethereum address
 */
export async function detectAndValidateAddress(
  input: string
): Promise<EthereumAddressInfo> {
  const trimmedInput = input.trim();

  // Basic format check
  if (!looksLikeEthereumAddress(trimmedInput)) {
    return {
      address: trimmedInput,
      valid: false,
      network: 'mainnet',
      error: 'Invalid Ethereum address format. Must be 42 characters starting with 0x.',
    };
  }

  // Verify checksum if applicable
  try {
    const isValid = await isValidChecksum(trimmedInput);

    if (!isValid) {
      return {
        address: trimmedInput,
        valid: false,
        network: 'mainnet',
        error: 'Invalid EIP-55 checksum. Please check the address.',
      };
    }

    // Convert to checksummed format
    const checksummedAddress = await toChecksumAddress(trimmedInput);

    return {
      address: checksummedAddress,
      valid: true,
      network: 'mainnet',
    };
  } catch (error) {
    return {
      address: trimmedInput,
      valid: false,
      network: 'mainnet',
      error: 'Error validating address checksum.',
    };
  }
}

/**
 * Synchronous basic format check (for quick UI feedback)
 */
export function isValidEthereumAddressFormat(input: string): boolean {
  return looksLikeEthereumAddress(input.trim());
}

/**
 * Normalize address to lowercase (for API calls that don't require checksum)
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Get a human-readable description of an Ethereum address
 */
export function getAddressDescription(): string {
  return 'Ethereum Address (0x...)';
}
