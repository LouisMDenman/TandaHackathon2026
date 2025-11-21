/**
 * Extended public key detection and validation
 */

import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import {
  KeyType,
  NetworkType,
  ExtendedKeyInfo,
} from './types';
import {
  KEY_PREFIX_MAP,
  VALID_MAINNET_PREFIXES,
  VALID_TESTNET_PREFIXES,
  EXTENDED_KEY_MIN_LENGTH,
  EXTENDED_KEY_MAX_LENGTH,
  ERROR_MESSAGES,
} from './constants';

// Initialize BIP32 with elliptic curve operations
const bip32 = BIP32Factory(ecc);

/**
 * Get the prefix (first 4 characters) of an extended key
 * @param key Extended public key
 * @returns Key prefix
 */
function getKeyPrefix(key: string): string {
  return key.slice(0, 4);
}

/**
 * Check if a key is a mainnet key
 * @param prefix Key prefix
 * @returns True if mainnet
 */
function isMainnetKey(prefix: string): boolean {
  return VALID_MAINNET_PREFIXES.includes(prefix as any);
}

/**
 * Check if a key is a testnet key
 * @param prefix Key prefix
 * @returns True if testnet
 */
function isTestnetKey(prefix: string): boolean {
  return VALID_TESTNET_PREFIXES.includes(prefix as any);
}

/**
 * Detect the network from key prefix
 * @param prefix Key prefix
 * @returns Network type or null if invalid
 */
function detectNetwork(prefix: string): NetworkType | null {
  if (isMainnetKey(prefix)) {
    return 'mainnet';
  } else if (isTestnetKey(prefix)) {
    return 'testnet';
  }
  return null;
}

/**
 * Map testnet prefix to mainnet equivalent
 * @param prefix Testnet prefix
 * @returns Mainnet prefix
 */
function testnetToMainnetPrefix(prefix: string): string {
  const mapping: Record<string, string> = {
    tpub: 'xpub',
    upub: 'ypub',
    vpub: 'zpub',
  };
  return mapping[prefix] || prefix;
}

/**
 * Detect key type from prefix
 * @param prefix Key prefix
 * @returns Key type or null if invalid
 */
function detectKeyType(prefix: string): KeyType | null {
  // Check if it's a mainnet key
  if (isMainnetKey(prefix)) {
    return KEY_PREFIX_MAP[prefix] || null;
  }

  // Check if it's a testnet key and map to mainnet equivalent
  if (isTestnetKey(prefix)) {
    const mainnetPrefix = testnetToMainnetPrefix(prefix);
    return KEY_PREFIX_MAP[mainnetPrefix] || null;
  }

  return null;
}

/**
 * Validate extended public key format
 * @param key Extended public key
 * @returns Validation result
 */
function validateKeyFormat(key: string): { valid: boolean; error?: string } {
  // Remove whitespace
  const trimmedKey = key.trim();

  // Check length
  if (trimmedKey.length < EXTENDED_KEY_MIN_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_KEY_LENGTH };
  }

  if (trimmedKey.length > EXTENDED_KEY_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_KEY_LENGTH };
  }

  // Check prefix
  const prefix = getKeyPrefix(trimmedKey);
  const keyType = detectKeyType(prefix);

  if (!keyType) {
    return { valid: false, error: ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE };
  }

  // Try to decode with bitcoinjs-lib to validate Base58 encoding
  try {
    bip32.fromBase58(trimmedKey, bitcoin.networks.bitcoin);
    return { valid: true };
  } catch (error) {
    // If mainnet fails, try testnet
    try {
      bip32.fromBase58(trimmedKey, bitcoin.networks.testnet);
      return { valid: true };
    } catch (testnetError) {
      return { valid: false, error: ERROR_MESSAGES.INVALID_KEY_FORMAT };
    }
  }
}

/**
 * Detect and validate an extended public key
 * Determines the key type (xpub/ypub/zpub) and network (mainnet/testnet)
 *
 * @param input Extended public key string
 * @returns Extended key information
 */
export function detectAndValidateKey(input: string): ExtendedKeyInfo {
  // Remove whitespace
  const key = input.trim();

  // Validate format first
  const validation = validateKeyFormat(key);
  if (!validation.valid) {
    return {
      type: 'xpub', // default
      key,
      network: 'mainnet',
      valid: false,
      error: validation.error,
    };
  }

  // Get prefix and detect key type
  const prefix = getKeyPrefix(key);
  const keyType = detectKeyType(prefix);
  const network = detectNetwork(prefix);

  if (!keyType || !network) {
    return {
      type: 'xpub',
      key,
      network: 'mainnet',
      valid: false,
      error: ERROR_MESSAGES.UNSUPPORTED_KEY_TYPE,
    };
  }

  // Check if testnet (we don't support testnet in production)
  if (network === 'testnet') {
    return {
      type: keyType,
      key,
      network: 'testnet',
      valid: false,
      error: ERROR_MESSAGES.TESTNET_NOT_SUPPORTED,
    };
  }

  return {
    type: keyType,
    key,
    network,
    valid: true,
  };
}

/**
 * Quick check if a string looks like an extended public key
 * @param input String to check
 * @returns True if it looks like an extended key
 */
export function looksLikeExtendedKey(input: string): boolean {
  const trimmed = input.trim();
  const prefix = getKeyPrefix(trimmed);

  return (
    trimmed.length >= EXTENDED_KEY_MIN_LENGTH &&
    trimmed.length <= EXTENDED_KEY_MAX_LENGTH &&
    (isMainnetKey(prefix) || isTestnetKey(prefix))
  );
}

/**
 * Get a human-readable description of a key type
 * @param keyType Key type
 * @returns Description string
 */
export function getKeyTypeDescription(keyType: KeyType): string {
  const descriptions: Record<KeyType, string> = {
    xpub: 'Legacy (P2PKH) - Addresses starting with 1',
    ypub: 'Nested SegWit (P2SH-P2WPKH) - Addresses starting with 3',
    zpub: 'Native SegWit (P2WPKH) - Addresses starting with bc1',
  };
  return descriptions[keyType];
}

/**
 * Auto-detect key type from input or validate provided type
 * @param input Extended public key
 * @param providedType Optional key type provided by user
 * @returns Key information or null if invalid
 */
export function autoDetectOrValidateKeyType(
  input: string,
  providedType?: KeyType
): ExtendedKeyInfo {
  const detected = detectAndValidateKey(input);

  if (!detected.valid) {
    return detected;
  }

  // If user provided a type, verify it matches
  if (providedType && providedType !== detected.type) {
    return {
      ...detected,
      valid: false,
      error: `Key type mismatch: expected ${providedType}, detected ${detected.type}`,
    };
  }

  return detected;
}
