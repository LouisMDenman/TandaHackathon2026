/**
 * Bitcoin network constants and configuration
 */

import * as bitcoin from 'bitcoinjs-lib';
import { KeyType } from './types';

/**
 * Bitcoin network configurations
 */
export const NETWORKS = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
} as const;

/**
 * Extended public key version bytes (first 4 bytes)
 * Used to identify key type and network
 */
export const VERSION_BYTES = {
  // Mainnet
  xpub: 0x0488b21e, // BIP32 - Legacy P2PKH (m/44'/0'/0')
  ypub: 0x049d7cb2, // BIP49 - Nested SegWit P2SH-P2WPKH (m/49'/0'/0')
  zpub: 0x04b24746, // BIP84 - Native SegWit P2WPKH (m/84'/0'/0')

  // Testnet
  tpub: 0x043587cf, // BIP32 testnet
  upub: 0x044a5262, // BIP49 testnet
  vpub: 0x045f1cf6, // BIP84 testnet
} as const;

/**
 * BIP32 derivation paths for different address types
 */
export const DERIVATION_PATHS = {
  xpub: "m/44'/0'/0'", // Legacy (BIP44)
  ypub: "m/49'/0'/0'", // Nested SegWit (BIP49)
  zpub: "m/84'/0'/0'", // Native SegWit (BIP84)
} as const;

/**
 * Chain indices for BIP32 derivation
 */
export const CHAINS = {
  external: 0,  // Receiving addresses
  internal: 1,  // Change addresses
} as const;

/**
 * Number of addresses to scan per chain
 */
export const ADDRESS_SCAN_LIMIT = 20;

/**
 * Gap limit for address scanning
 * Number of consecutive unused addresses before stopping scan
 */
export const GAP_LIMIT = 20;

/**
 * Maximum consecutive API errors before failing the scan
 * Prevents silent failures when the API is down or rate limiting
 */
export const MAX_CONSECUTIVE_API_ERRORS = 3;

/**
 * Total addresses scanned (external + internal)
 */
export const TOTAL_ADDRESSES_SCANNED = ADDRESS_SCAN_LIMIT * 2; // 40 total

/**
 * Satoshis per Bitcoin
 */
export const SATOSHIS_PER_BTC = 100000000;

/**
 * Extended key prefix mapping
 * Maps the first 4 characters to key type
 */
export const KEY_PREFIX_MAP: Record<string, KeyType> = {
  xpub: 'xpub',
  ypub: 'ypub',
  zpub: 'zpub',
} as const;

/**
 * Valid mainnet key prefixes
 */
export const VALID_MAINNET_PREFIXES = ['xpub', 'ypub', 'zpub'] as const;

/**
 * Valid testnet key prefixes
 */
export const VALID_TESTNET_PREFIXES = ['tpub', 'upub', 'vpub'] as const;

/**
 * All valid key prefixes
 */
export const ALL_VALID_PREFIXES = [
  ...VALID_MAINNET_PREFIXES,
  ...VALID_TESTNET_PREFIXES,
] as const;

/**
 * Minimum length for extended public keys (Base58 encoded)
 */
export const EXTENDED_KEY_MIN_LENGTH = 111;

/**
 * Maximum length for extended public keys
 */
export const EXTENDED_KEY_MAX_LENGTH = 112;

/**
 * API configuration
 */
export const API_CONFIG = {
  blockstream: {
    mainnet: 'https://blockstream.info/api',
    testnet: 'https://blockstream.info/testnet/api',
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
  },
  // Request batching configuration
  batchSize: 10,
  requestDelay: 100, // ms between batches
  timeout: 30000, // 30 seconds
  retries: 3,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_KEY_FORMAT: 'Invalid extended public key format',
  INVALID_KEY_LENGTH: 'Extended public key has invalid length',
  UNSUPPORTED_KEY_TYPE: 'Unsupported key type',
  TESTNET_NOT_SUPPORTED: 'Testnet keys are not currently supported',
  NETWORK_ERROR: 'Network error while fetching data',
  API_ERROR: 'API returned an error',
  BALANCE_FETCH_FAILED: 'Failed to fetch balance',
  PRICE_FETCH_FAILED: 'Failed to fetch Bitcoin price',
  DERIVATION_FAILED: 'Failed to derive addresses',
} as const;
