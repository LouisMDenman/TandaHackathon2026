/**
 * Universal wallet type detection
 * Identifies whether input is Bitcoin (xpub/ypub/zpub), Ethereum address, or Solana address
 */

import { detectAndValidateKey, looksLikeExtendedKey } from '../bitcoin/detectKeyType';
import { detectAndValidateAddress as detectAndValidateEthereumAddress, looksLikeEthereumAddress } from '../ethereum/detectAddress';
import { detectAndValidateAddress as detectAndValidateSolanaAddress, looksLikeSolanaAddress } from '../solana/detectAddress';
import type { ExtendedKeyInfo } from '../bitcoin/types';
import type { EthereumAddressInfo } from '../ethereum/types';
import type { SolanaAddressInfo } from '../solana/types';

/**
 * Supported wallet types
 */
export type WalletType = 'bitcoin' | 'ethereum' | 'solana' | 'unknown';

/**
 * Universal wallet information
 */
export interface WalletInfo {
  walletType: WalletType;
  valid: boolean;
  bitcoinInfo?: ExtendedKeyInfo;
  ethereumInfo?: EthereumAddressInfo;
  solanaInfo?: SolanaAddressInfo;
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

  // Check if it looks like a Solana address (32-44 chars, base58)
  if (looksLikeSolanaAddress(trimmedInput)) {
    return 'solana';
  }

  return 'unknown';
}

/**
 * Fully validate and detect wallet type
 * This performs complete validation including checksums
 * Note: Ethereum and Solana validation are async
 */
export async function validateWallet(input: string): Promise<WalletInfo> {
  const trimmedInput = input.trim();

  // Quick format detection first
  const format = detectWalletFormat(trimmedInput);

  if (format === 'ethereum') {
    // Perform full Ethereum validation (async for checksum)
    const ethereumInfo = await detectAndValidateEthereumAddress(trimmedInput);

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
  } else if (format === 'solana') {
    // Perform full Solana validation (async for base58 decoding)
    const solanaInfo = await detectAndValidateSolanaAddress(trimmedInput);

    return {
      walletType: 'solana',
      valid: solanaInfo.valid,
      solanaInfo,
      error: solanaInfo.error,
    };
  } else {
    // Unknown format
    return {
      walletType: 'unknown',
      valid: false,
      error: 'Unrecognized wallet format. Please enter a Bitcoin extended public key (xpub/ypub/zpub), an Ethereum address (0x...), or a Solana address (base58).',
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
    case 'solana':
      return 'Solana Address';
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
    case 'solana':
      return 'Solana addresses should be 32-44 base58-encoded characters';
    case 'unknown':
      return 'Enter a Bitcoin extended public key (xpub/ypub/zpub), Ethereum address (0x...), or Solana address (base58)';
  }
}
