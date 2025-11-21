/**
 * Auto-detect the correct address format for an extended public key
 *
 * Problem: Wallets like Ledger Live export "xpub" even for Native SegWit accounts.
 * Solution: Try all 3 formats and see which one has been used.
 *
 * This is the industry standard approach used by:
 * - hd-wallet-derive
 * - BTCPay Server
 * - Blockpath
 * - Most professional Bitcoin tools
 */

import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { KeyType } from './types';
import { convertToXpub, convertXpubToYpub, convertXpubToZpub } from './convertKey';
import { deriveAddress } from './deriveAddresses';
import { hasTransactions } from '../api/blockstream';
import { CHAINS } from './constants';

const bip32 = BIP32Factory(ecc);

/**
 * Format detection result
 */
export interface FormatDetectionResult {
  detectedFormat: KeyType;
  confidence: 'high' | 'medium' | 'low';
  formatsWithTransactions: KeyType[];
  firstAddresses: {
    xpub: string;
    ypub: string;
    zpub: string;
  };
  message: string;
}

/**
 * Auto-detect which address format is being used by checking the first address
 * in each format (Legacy/P2PKH, Nested SegWit/P2SH, Native SegWit/P2WPKH)
 *
 * This handles the Ledger Live issue where xpub is exported for all account types.
 *
 * @param key Extended public key (xpub/ypub/zpub)
 * @param detectedType The type detected from the prefix
 * @param network Bitcoin network
 * @returns Format detection result with the correct key type to use
 */
export async function autoDetectAddressFormat(
  key: string,
  detectedType: KeyType,
  network: bitcoin.Network
): Promise<FormatDetectionResult> {
  // Convert to all three formats
  let xpubKey: string;
  let ypubKey: string;
  let zpubKey: string;

  if (detectedType === 'xpub') {
    xpubKey = key;
    ypubKey = convertXpubToYpub(key);
    zpubKey = convertXpubToZpub(key);
  } else if (detectedType === 'ypub') {
    xpubKey = convertToXpub(key, 'ypub');
    ypubKey = key;
    zpubKey = convertXpubToZpub(xpubKey);
  } else { // zpub
    xpubKey = convertToXpub(key, 'zpub');
    ypubKey = convertXpubToYpub(xpubKey);
    zpubKey = key;
  }

  // Derive first external address (m/0/0) in each format
  // Note: We always parse with xpubKey (BIP32 only understands xpub format)
  // but use the type to determine the address format
  const formats: Array<{ type: KeyType }> = [
    { type: 'xpub' },
    { type: 'ypub' },
    { type: 'zpub' },
  ];

  const firstAddresses: Record<KeyType, string> = {
    xpub: '',
    ypub: '',
    zpub: '',
  };

  const formatsWithTransactions: KeyType[] = [];

  // Parse the xpub once (BIP32 only works with xpub format)
  const node = bip32.fromBase58(xpubKey, network);

  // Check each format
  for (const format of formats) {
    // Derive address using the same node but different address format
    const firstAddress = deriveAddress(node, CHAINS.external, 0, format.type, network);
    firstAddresses[format.type] = firstAddress.address;

    // Check if this address has transactions
    const used = await hasTransactions(firstAddress.address);

    if (used) {
      formatsWithTransactions.push(format.type);
    }
  }

  // Determine the correct format
  let detectedFormat: KeyType;
  let confidence: 'high' | 'medium' | 'low';
  let message: string;

  if (formatsWithTransactions.length === 1) {
    // Perfect! Only one format has transactions
    detectedFormat = formatsWithTransactions[0];
    confidence = 'high';
    message = `Detected format: ${detectedFormat}. Confidence: HIGH (only this format has transactions)`;
  } else if (formatsWithTransactions.length > 1) {
    // Multiple formats have transactions (unusual but possible if user used multiple wallet types)
    detectedFormat = formatsWithTransactions[0]; // Use the first one found
    confidence = 'medium';
    message = `Multiple formats have transactions: ${formatsWithTransactions.join(', ')}. Using ${detectedFormat}. This wallet may have been used with multiple address formats.`;
  } else {
    // No formats have transactions - wallet is empty or first address hasn't been used
    // Fall back to the input type or zpub (most common for modern wallets)
    detectedFormat = detectedType === 'xpub' ? 'zpub' : detectedType;
    confidence = 'low';
    message = `No transactions found in any format. Using ${detectedFormat} (assuming modern Native SegWit wallet). Wallet may be empty or addresses haven't been used yet.`;
  }

  return {
    detectedFormat,
    confidence,
    formatsWithTransactions,
    firstAddresses: firstAddresses as { xpub: string; ypub: string; zpub: string },
    message,
  };
}

/**
 * Quick check if an extended key looks like it needs format detection
 * (mainly for Ledger Live xpub exports)
 *
 * @param key Extended public key
 * @param detectedType Detected key type
 * @returns True if auto-detection is recommended
 */
export function shouldAutoDetect(key: string, detectedType: KeyType): boolean {
  // Always auto-detect for xpub (could be Legacy, or could be Ledger Live Native SegWit)
  if (detectedType === 'xpub') {
    return true;
  }

  // ypub and zpub are usually explicit, but can still auto-detect for safety
  // Disable for now to reduce API calls
  return false;
}
