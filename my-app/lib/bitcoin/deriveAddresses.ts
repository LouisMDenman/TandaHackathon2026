/**
 * Bitcoin address derivation from extended public keys
 * Implements BIP32 hierarchical deterministic wallet address derivation
 */

import { BIP32Factory, BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { KeyType, DerivedAddress } from './types';
import { convertToXpub, getNodeFromExtendedKey } from './convertKey';
import { ADDRESS_SCAN_LIMIT, CHAINS } from './constants';

// Initialize BIP32 with elliptic curve operations
const bip32 = BIP32Factory(ecc);

/**
 * Convert public key to address based on key type
 *
 * Address formats:
 * - xpub (Legacy): P2PKH - addresses starting with 1
 * - ypub (Nested SegWit): P2SH-P2WPKH - addresses starting with 3
 * - zpub (Native SegWit): P2WPKH - addresses starting with bc1
 *
 * @param publicKey Public key buffer
 * @param keyType Original key type (xpub/ypub/zpub)
 * @param network Bitcoin network
 * @returns Bitcoin address string
 */
export function publicKeyToAddress(
  publicKey: Buffer,
  keyType: KeyType,
  network: bitcoin.Network
): string {
  let address: string | undefined;

  switch (keyType) {
    case 'xpub':
      // Legacy P2PKH (Pay to Public Key Hash)
      // Addresses start with 1 (mainnet)
      const p2pkh = bitcoin.payments.p2pkh({
        pubkey: publicKey,
        network,
      });
      address = p2pkh.address;
      break;

    case 'ypub':
      // Nested SegWit P2SH-P2WPKH (Pay to Witness Public Key Hash wrapped in Pay to Script Hash)
      // Addresses start with 3 (mainnet)
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: publicKey,
        network,
      });
      const p2sh = bitcoin.payments.p2sh({
        redeem: p2wpkh,
        network,
      });
      address = p2sh.address;
      break;

    case 'zpub':
      // Native SegWit P2WPKH (Pay to Witness Public Key Hash)
      // Addresses start with bc1 (mainnet)
      const p2wpkhNative = bitcoin.payments.p2wpkh({
        pubkey: publicKey,
        network,
      });
      address = p2wpkhNative.address;
      break;

    default:
      throw new Error(`Unsupported key type: ${keyType}`);
  }

  if (!address) {
    throw new Error(`Failed to generate address for key type: ${keyType}`);
  }

  return address;
}

/**
 * Derive a single address from a BIP32 node
 *
 * @param node BIP32 node (extended public key)
 * @param chain Chain type (0=external/receiving, 1=internal/change)
 * @param index Address index (0-19 for standard scanning)
 * @param keyType Original key type for address format
 * @param network Bitcoin network
 * @returns Derived address with metadata
 */
export function deriveAddress(
  node: BIP32Interface,
  chain: 0 | 1,
  index: number,
  keyType: KeyType,
  network: bitcoin.Network
): DerivedAddress {
  // Derive child key: m/chain/index
  const child = node.derive(chain).derive(index);

  // Get public key from child node
  const publicKey = Buffer.from(child.publicKey);

  // Convert public key to address based on key type
  const address = publicKeyToAddress(publicKey, keyType, network);

  // Determine chain type
  const chainType: 'external' | 'internal' = chain === 0 ? 'external' : 'internal';

  // Build derivation path string
  const path = `m/${chain}/${index}`;

  return {
    path,
    address,
    index,
    chain: chainType,
  };
}

/**
 * Derive all addresses from an extended public key
 *
 * Generates addresses for both external (receiving) and internal (change) chains.
 * Standard scanning generates 20 addresses per chain (40 total).
 *
 * External chain (m/0/0 to m/0/19): Used for receiving payments
 * Internal chain (m/1/0 to m/1/19): Used for change addresses
 *
 * @param xpub Extended public key (xpub format - must be converted if ypub/zpub)
 * @param keyType Original key type (determines address format)
 * @param network Bitcoin network
 * @returns Array of all derived addresses (40 addresses)
 */
export function deriveAddresses(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network
): DerivedAddress[] {
  // Convert ypub/zpub to xpub format if needed
  // (bitcoinjs-lib requires xpub format for derivation)
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);

  // Get BIP32 node from extended public key
  const node = bip32.fromBase58(xpubKey, network);

  const addresses: DerivedAddress[] = [];

  // Derive external chain addresses (m/0/0 to m/0/19)
  for (let i = 0; i < ADDRESS_SCAN_LIMIT; i++) {
    const address = deriveAddress(node, CHAINS.external, i, keyType, network);
    addresses.push(address);
  }

  // Derive internal chain addresses (m/1/0 to m/1/19)
  for (let i = 0; i < ADDRESS_SCAN_LIMIT; i++) {
    const address = deriveAddress(node, CHAINS.internal, i, keyType, network);
    addresses.push(address);
  }

  return addresses;
}

/**
 * Derive only external (receiving) addresses
 *
 * @param xpub Extended public key
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param limit Number of addresses to derive (default: 20)
 * @returns Array of external addresses
 */
export function deriveExternalAddresses(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network,
  limit: number = ADDRESS_SCAN_LIMIT
): DerivedAddress[] {
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);
  const node = bip32.fromBase58(xpubKey, network);

  const addresses: DerivedAddress[] = [];

  for (let i = 0; i < limit; i++) {
    const address = deriveAddress(node, CHAINS.external, i, keyType, network);
    addresses.push(address);
  }

  return addresses;
}

/**
 * Derive only internal (change) addresses
 *
 * @param xpub Extended public key
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param limit Number of addresses to derive (default: 20)
 * @returns Array of internal addresses
 */
export function deriveInternalAddresses(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network,
  limit: number = ADDRESS_SCAN_LIMIT
): DerivedAddress[] {
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);
  const node = bip32.fromBase58(xpubKey, network);

  const addresses: DerivedAddress[] = [];

  for (let i = 0; i < limit; i++) {
    const address = deriveAddress(node, CHAINS.internal, i, keyType, network);
    addresses.push(address);
  }

  return addresses;
}

/**
 * Get address at specific derivation path
 *
 * @param xpub Extended public key
 * @param keyType Original key type
 * @param network Bitcoin network
 * @param chain Chain index (0=external, 1=internal)
 * @param index Address index
 * @returns Single derived address
 */
export function getAddressAtPath(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network,
  chain: 0 | 1,
  index: number
): DerivedAddress {
  const xpubKey = keyType === 'xpub' ? xpub : convertToXpub(xpub, keyType);
  const node = bip32.fromBase58(xpubKey, network);

  return deriveAddress(node, chain, index, keyType, network);
}
