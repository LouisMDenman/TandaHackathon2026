/**
 * Advanced address scanning with gap limit
 * Implements BIP44 gap limit: scan until finding N consecutive unused addresses
 */

import { BIP32Factory, BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { KeyType, DerivedAddress } from './types';
import { convertToXpub } from './convertKey';
import { GAP_LIMIT, CHAINS } from './constants';
import { deriveAddress } from './deriveAddresses';
import { hasTransactions } from '../api/blockstream';

const bip32 = BIP32Factory(ecc);

/**
 * Scan addresses with gap limit until finding N consecutive unused addresses
 *
 * This is the standard wallet behavior: keep deriving addresses until
 * you find GAP_LIMIT (default 20) consecutive unused addresses.
 *
 * @param xpub Extended public key
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param gapLimit Number of consecutive unused addresses before stopping (default 20)
 * @param maxAddresses Maximum addresses to scan per chain (safety limit, default 200)
 * @returns Array of derived addresses
 */
export async function scanAddressesWithGapLimit(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network,
  gapLimit: number = GAP_LIMIT,
  maxAddresses: number = 200
): Promise<DerivedAddress[]> {
  // Convert ypub/zpub to xpub format if needed
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);

  // Get BIP32 node from extended public key
  const node = bip32.fromBase58(xpubKey, network);

  const addresses: DerivedAddress[] = [];

  // Scan external chain (receiving addresses)
  const externalAddresses = await scanChain(
    node,
    CHAINS.external,
    keyType,
    network,
    gapLimit,
    maxAddresses
  );
  addresses.push(...externalAddresses);

  // Scan internal chain (change addresses)
  const internalAddresses = await scanChain(
    node,
    CHAINS.internal,
    keyType,
    network,
    gapLimit,
    maxAddresses
  );
  addresses.push(...internalAddresses);

  return addresses;
}

/**
 * Scan a single chain (external or internal) with gap limit
 *
 * @param node BIP32 node
 * @param chain Chain type (0=external, 1=internal)
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param gapLimit Gap limit
 * @param maxAddresses Maximum addresses to scan
 * @returns Array of derived addresses for this chain
 */
async function scanChain(
  node: BIP32Interface,
  chain: 0 | 1,
  keyType: KeyType,
  network: bitcoin.Network,
  gapLimit: number,
  maxAddresses: number
): Promise<DerivedAddress[]> {
  const addresses: DerivedAddress[] = [];
  let consecutiveUnused = 0;
  let index = 0;

  while (index < maxAddresses && consecutiveUnused < gapLimit) {
    // Derive address at current index
    const derivedAddress = deriveAddress(node, chain, index, keyType, network);
    addresses.push(derivedAddress);

    // Check if address has been used
    try {
      const used = await hasTransactions(derivedAddress.address);

      if (used) {
        // Address has transactions, reset counter
        consecutiveUnused = 0;
      } else {
        // Address is unused, increment counter
        consecutiveUnused++;
      }
    } catch (error) {
      // On error, treat as unused and continue
      consecutiveUnused++;
    }

    index++;
  }

  return addresses;
}

/**
 * Quick scan with fixed limit (original behavior)
 * Useful when you want fast results without gap limit checking
 *
 * @param xpub Extended public key
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param limit Number of addresses to scan per chain
 * @returns Array of derived addresses
 */
export function quickScanAddresses(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network,
  limit: number = 20
): DerivedAddress[] {
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);
  const node = bip32.fromBase58(xpubKey, network);

  const addresses: DerivedAddress[] = [];

  // External chain
  for (let i = 0; i < limit; i++) {
    addresses.push(deriveAddress(node, CHAINS.external, i, keyType, network));
  }

  // Internal chain
  for (let i = 0; i < limit; i++) {
    addresses.push(deriveAddress(node, CHAINS.internal, i, keyType, network));
  }

  return addresses;
}
