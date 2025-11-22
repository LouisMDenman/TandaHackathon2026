/**
 * XRP-specific type definitions
 */

export type NetworkType = 'mainnet' | 'testnet';
export type AddressType = 'classic' | 'x-address';

/**
 * Information about a validated XRP address
 */
export interface XRPAddressInfo {
  address: string;
  valid: boolean;
  network: NetworkType;
  addressType: AddressType;
  destinationTag?: number;
  error?: string;
}

/**
 * XRP balance information for an address
 */
export interface XRPBalance {
  address: string;
  balance: number; // in drops
  balanceInXrp: number;
  status: 'success' | 'error';
  error?: string;
  accountExists?: boolean;
  ownerCount?: number;
}

/**
 * XRP price data in AUD
 */
export interface XRPPrice {
  aud: number;
  timestamp: number;
}

/**
 * Account info result from XRP Ledger RPC
 */
export interface AccountInfoResult {
  account_data: {
    Account: string;
    Balance: string;
    Flags: number;
    LedgerEntryType: string;
    OwnerCount: number;
    Sequence: number;
  };
  ledger_current_index: number;
  validated: boolean;
}
