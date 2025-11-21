/**
 * Bitcoin wallet types and interfaces
 */

/**
 * Supported extended public key types
 */
export type KeyType = 'xpub' | 'ypub' | 'zpub';

/**
 * Bitcoin network type
 */
export type NetworkType = 'mainnet' | 'testnet';

/**
 * Address chain type (external for receiving, internal for change)
 */
export type ChainType = 'external' | 'internal';

/**
 * Information about an extended public key
 */
export interface ExtendedKeyInfo {
  type: KeyType;
  key: string;
  network: NetworkType;
  valid: boolean;
  error?: string;
}

/**
 * A single derived Bitcoin address with metadata
 */
export interface DerivedAddress {
  path: string;
  address: string;
  index: number;
  chain: ChainType;
}

/**
 * Balance information for a single address
 */
export interface AddressBalance {
  address: string;
  balance: number;        // in satoshis
  received: number;       // total received in satoshis
  sent: number;           // total sent in satoshis
  txCount: number;        // number of transactions
}

/**
 * Wallet balance summary
 */
export interface WalletBalance {
  totalSatoshis: number;
  totalBTC: number;
  addressesScanned: number;
  addressesWithBalance: number;
  addresses: AddressBalance[];
}

/**
 * Bitcoin price information
 */
export interface BTCPrice {
  aud: number;
  timestamp: number;
}

/**
 * Complete wallet information with balance and price
 */
export interface WalletInfo {
  balance: WalletBalance;
  price: BTCPrice;
  totalAUD: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Balance check request
 */
export interface BalanceCheckRequest {
  extendedKey: string;
  keyType?: KeyType;  // Optional, can be auto-detected
}

/**
 * Balance check response
 */
export interface BalanceCheckResponse {
  totalSatoshis: number;
  totalBTC: number;
  addressesScanned: number;
  addressesWithBalance: number;
  keyType: KeyType;
}
