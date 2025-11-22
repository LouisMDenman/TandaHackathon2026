/**
 * Universal wallet type detection
 * Identifies whether input is Bitcoin (xpub/ypub/zpub) or Ethereum address
 */

import { detectAndValidateKey, looksLikeExtendedKey } from '../bitcoin/detectKeyType';
import { detectAndValidateAddress, looksLikeEthereumAddress } from '../ethereum/detectAddress';
import type { ExtendedKeyInfo } from '../bitcoin/types';
import type { EthereumAddressInfo } from '../ethereum/types';

/**
 * Supported wallet types
 */
export type WalletType = 'bitcoin' | 'ethereum' | 'unknown';

/**
 * Universal wallet information
 */
export interface WalletInfo {
  walletType: WalletType;
  valid: boolean;
  bitcoinInfo?: ExtendedKeyInfo;
  ethereumInfo?: EthereumAddressInfo;
  error?: string;
}

/**
 * Quick check to determine what type of wallet input this looks like
 * This is synchronous and doesn't perform full validation
 */
export function detectWalletFormat(input: string): WalletType {
  const trimmedInput = input.trim();

  // Check if it looks like an Ethereum address (42 chars, starts with 0x)
  if (looksLikeEthereumAddress(trimmedInput)) {
    return 'ethereum';
  }

  // Check if it looks like a Bitcoin extended key (111-112 chars, xpub/ypub/zpub prefix)
  if (looksLikeExtendedKey(trimmedInput)) {
    return 'bitcoin';
  }

  return 'unknown';
}

/**
 * Fully validate and detect wallet type
 * This performs complete validation including checksums
 * Note: Ethereum validation is async due to checksum verification
 */
export async function validateWallet(input: string): Promise<WalletInfo> {
  const trimmedInput = input.trim();

  // Quick format detection first
  const format = detectWalletFormat(trimmedInput);

  if (format === 'ethereum') {
    // Perform full Ethereum validation (async for checksum)
    const ethereumInfo = await detectAndValidateAddress(trimmedInput);

    return {
      walletType: 'ethereum',
      valid: ethereumInfo.valid,
      ethereumInfo,
      error: ethereumInfo.error,
    };
  } else if (format === 'bitcoin') {
    // Perform full Bitcoin validation (synchronous)
    const bitcoinInfo = detectAndValidateKey(trimmedInput);

    return {
      walletType: 'bitcoin',
      valid: bitcoinInfo.valid,
      bitcoinInfo,
      error: bitcoinInfo.error,
    };
  } else {
    // Unknown format
    return {
      walletType: 'unknown',
      valid: false,
      error: 'Unrecognized wallet format. Please enter a Bitcoin extended public key (xpub/ypub/zpub) or an Ethereum address (0x...).',
    };
  }
}

/**
 * Get a description of the detected wallet type
 */
export function getWalletTypeDescription(walletType: WalletType): string {
  switch (walletType) {
    case 'bitcoin':
      return 'Bitcoin Extended Public Key';
    case 'ethereum':
      return 'Ethereum Address';
    case 'unknown':
      return 'Unknown Format';
  }
}

/**
 * Get formatting hint for the user based on detected type
 */
export function getWalletFormatHint(walletType: WalletType): string {
  switch (walletType) {
    case 'bitcoin':
      return 'Bitcoin keys should be 111-112 characters starting with xpub, ypub, or zpub';
    case 'ethereum':
      return 'Ethereum addresses should be 42 characters starting with 0x';
    case 'unknown':
      return 'Enter a Bitcoin extended public key (xpub/ypub/zpub) or Ethereum address (0x...)';
  }
}
