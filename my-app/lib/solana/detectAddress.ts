/**
 * Solana address detection and validation
 * Solana addresses are base58-encoded public keys
 */

import { SOLANA_CONSTANTS } from './constants';
import type { SolanaAddressInfo } from './types';

/**
 * Check if a string looks like a Solana address
 * Solana addresses are base58-encoded and typically 32-44 characters
 */
export function looksLikeSolanaAddress(input: string): boolean {
  // Check length
  if (
    input.length < SOLANA_CONSTANTS.ADDRESS_MIN_LENGTH ||
    input.length > SOLANA_CONSTANTS.ADDRESS_MAX_LENGTH
  ) {
    return false;
  }

  // Check if all characters are valid base58
  const base58Alphabet = SOLANA_CONSTANTS.BASE58_ALPHABET;
  return input.split('').every((char) => base58Alphabet.includes(char));
}

/**
 * Validate that a string contains only valid base58 characters
 */
export function isValidBase58(input: string): boolean {
  const base58Alphabet = SOLANA_CONSTANTS.BASE58_ALPHABET;
  return input.split('').every((char) => base58Alphabet.includes(char));
}

/**
 * Validate and normalize a Solana address
 */
export async function detectAndValidateAddress(
  input: string
): Promise<SolanaAddressInfo> {
  const trimmedInput = input.trim();

  // Basic format check
  if (!looksLikeSolanaAddress(trimmedInput)) {
    let errorMessage = 'Invalid Solana address format.';

    if (trimmedInput.length < SOLANA_CONSTANTS.ADDRESS_MIN_LENGTH) {
      errorMessage = `Address too short. Must be at least ${SOLANA_CONSTANTS.ADDRESS_MIN_LENGTH} characters.`;
    } else if (trimmedInput.length > SOLANA_CONSTANTS.ADDRESS_MAX_LENGTH) {
      errorMessage = `Address too long. Must be at most ${SOLANA_CONSTANTS.ADDRESS_MAX_LENGTH} characters.`;
    } else if (!isValidBase58(trimmedInput)) {
      errorMessage = 'Address contains invalid characters. Must be base58 encoded.';
    }

    return {
      address: trimmedInput,
      valid: false,
      network: 'mainnet',
      error: errorMessage,
    };
  }

  // Additional validation using bs58 library for proper decoding
  try {
    const bs58 = await import('bs58');
    const decoded = bs58.default.decode(trimmedInput);

    // Solana public keys should decode to exactly 32 bytes
    if (decoded.length !== 32) {
      return {
        address: trimmedInput,
        valid: false,
        network: 'mainnet',
        error: 'Invalid Solana address. Decoded length must be 32 bytes.',
      };
    }

    return {
      address: trimmedInput,
      valid: true,
      network: 'mainnet',
    };
  } catch (error) {
    return {
      address: trimmedInput,
      valid: false,
      network: 'mainnet',
      error: 'Failed to decode base58 address. Please check the address.',
    };
  }
}

/**
 * Synchronous basic format check (for quick UI feedback)
 */
export function isValidSolanaAddressFormat(input: string): boolean {
  return looksLikeSolanaAddress(input.trim());
}

/**
 * Get a human-readable description of a Solana address
 */
export function getAddressDescription(): string {
  return 'Solana Address (base58)';
}
