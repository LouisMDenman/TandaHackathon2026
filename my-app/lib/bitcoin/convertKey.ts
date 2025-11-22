/**
 * Extended public key conversion utilities
 * Converts ypub/zpub to xpub format for address derivation
 */

import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bs58check from 'bs58check';
import { KeyType, NetworkType } from './types';
import { VERSION_BYTES, NETWORKS } from './constants';

// Initialize BIP32 with elliptic curve operations
const bip32 = BIP32Factory(ecc);

/**
 * Convert ypub/zpub to xpub format for address derivation
 * This changes the version bytes while preserving all cryptographic material
 *
 * Extended key structure (78 bytes):
 * - 4 bytes: version bytes
 * - 1 byte: depth
 * - 4 bytes: parent fingerprint
 * - 4 bytes: child index
 * - 32 bytes: chain code
 * - 33 bytes: public key
 *
 * @param key Extended public key (xpub/ypub/zpub)
 * @param type Original key type
 * @returns Converted xpub format key (or original if already xpub)
 */
export function convertToXpub(key: string, type: KeyType): string {
  // If already xpub, return as-is
  if (type === 'xpub') {
    return key;
  }

  try {
    // Decode the Base58Check encoded extended key
    const decoded = bs58check.decode(key);

    // Extended keys are 78 bytes
    if (decoded.length !== 78) {
      throw new Error('Invalid extended key length');
    }

    // Create a new buffer for the converted key
    const converted = Buffer.from(decoded);

    // Replace the version bytes (first 4 bytes) with xpub version
    converted.writeUInt32BE(VERSION_BYTES.xpub, 0);

    // Encode back to Base58Check
    return bs58check.encode(converted);
  } catch (error) {
    throw new Error(`Failed to convert ${type} to xpub: ${error}`);
  }
}

/**
 * Convert xpub to zpub format
 * Useful for Ledger Live which exports xpub for Native SegWit accounts
 * that actually use zpub derivation and bc1 addresses
 *
 * @param xpub Extended public key in xpub format
 * @returns Converted zpub key
 */
export function convertXpubToZpub(xpub: string): string {
  try {
    // Decode the Base58Check encoded extended key
    const decoded = bs58check.decode(xpub);

    // Extended keys are 78 bytes
    if (decoded.length !== 78) {
      throw new Error('Invalid extended key length');
    }

    // Verify it's actually an xpub
    const version = Buffer.from(decoded).readUInt32BE(0);
    if (version !== VERSION_BYTES.xpub) {
      throw new Error(`Input is not an xpub (version bytes: 0x${version.toString(16)})`);
    }

    // Create a new buffer for the converted key
    const converted = Buffer.from(decoded);

    // Replace the version bytes (first 4 bytes) with zpub version
    converted.writeUInt32BE(VERSION_BYTES.zpub, 0);

    // Encode back to Base58Check
    const zpub = bs58check.encode(converted);

    return zpub;
  } catch (error) {
    throw new Error(`Failed to convert xpub to zpub: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Convert xpub to ypub format
 * Useful for some wallets that export xpub for Nested SegWit accounts
 * that actually use ypub derivation and P2SH addresses (starting with 3)
 *
 * @param xpub Extended public key in xpub format
 * @returns Converted ypub key
 */
export function convertXpubToYpub(xpub: string): string {
  try {
    // Decode the Base58Check encoded extended key
    const decoded = bs58check.decode(xpub);

    // Extended keys are 78 bytes
    if (decoded.length !== 78) {
      throw new Error('Invalid extended key length');
    }

    // Verify it's actually an xpub
    const version = Buffer.from(decoded).readUInt32BE(0);
    if (version !== VERSION_BYTES.xpub) {
      throw new Error(`Input is not an xpub (version bytes: 0x${version.toString(16)})`);
    }

    // Create a new buffer for the converted key
    const converted = Buffer.from(decoded);

    // Replace the version bytes (first 4 bytes) with ypub version
    converted.writeUInt32BE(VERSION_BYTES.ypub, 0);

    // Encode back to Base58Check
    const ypub = bs58check.encode(converted);

    return ypub;
  } catch (error) {
    throw new Error(`Failed to convert xpub to ypub: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Get BIP32 node from extended public key
 * Works with xpub, ypub, or zpub
 *
 * @param key Extended public key
 * @param network Bitcoin network
 * @returns BIP32 node interface
 */
export function getNodeFromExtendedKey(
  key: string,
  network: NetworkType = 'mainnet'
): BIP32Interface {
  const bitcoinNetwork = NETWORKS[network];
  return bip32.fromBase58(key, bitcoinNetwork);
}

/**
 * Verify that a key conversion was successful by checking the public key
 * @param originalKey Original extended key
 * @param convertedKey Converted extended key
 * @param network Bitcoin network
 * @returns True if conversion preserved the public key
 */
export function verifyKeyConversion(
  originalKey: string,
  convertedKey: string,
  network: NetworkType = 'mainnet'
): boolean {
  const bitcoinNetwork = NETWORKS[network];

  try {
    const originalNode = bip32.fromBase58(originalKey, bitcoinNetwork);
    const convertedNode = bip32.fromBase58(convertedKey, bitcoinNetwork);

    // Convert Uint8Array to Buffer for comparison
    const origPubKey = Buffer.from(originalNode.publicKey);
    const convPubKey = Buffer.from(convertedNode.publicKey);
    const origChainCode = Buffer.from(originalNode.chainCode);
    const convChainCode = Buffer.from(convertedNode.chainCode);

    // Compare public keys and chain codes to ensure conversion was correct
    return (
      origPubKey.equals(convPubKey) &&
      origChainCode.equals(convChainCode) &&
      originalNode.depth === convertedNode.depth &&
      originalNode.index === convertedNode.index &&
      originalNode.parentFingerprint === convertedNode.parentFingerprint
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if an extended key needs conversion
 * @param keyType Key type
 * @returns True if conversion is needed
 */
export function needsConversion(keyType: KeyType): boolean {
  return keyType !== 'xpub';
}

/**
 * Get the proper Bitcoin network for a given network type
 * @param network Network type
 * @returns Bitcoin network object
 */
export function getBitcoinNetwork(network: NetworkType): bitcoin.Network {
  return NETWORKS[network];
}

/**
 * Get version bytes for a given key type
 * @param keyType Key type (xpub/ypub/zpub)
 * @returns Version bytes as number
 */
export function getVersionBytes(keyType: KeyType): number {
  return VERSION_BYTES[keyType];
}

/**
 * Extract version bytes from an extended key
 * @param key Extended public key
 * @returns Version bytes as number
 */
export function extractVersionBytes(key: string): number {
  try {
    const decoded = bs58check.decode(key);
    const buffer = Buffer.from(decoded);
    return buffer.readUInt32BE(0);
  } catch (error) {
    throw new Error('Failed to extract version bytes from key');
  }
}
