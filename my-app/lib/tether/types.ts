/**
 * Tether (USDT) wallet types and interfaces
 */

export type NetworkType = 'mainnet' | 'testnet';

/**
 * Information about a validated Tether address
 * Note: Tether uses Ethereum addresses
 */
export interface TetherAddressInfo {
  address: string;          // The normalized Ethereum address (checksummed)
  valid: boolean;           // Whether the address is valid
  network: NetworkType;     // Network type (mainnet for production)
  error?: string;           // Error message if validation failed
}

/**
 * Tether USDT balance information
 */
export interface TetherBalance {
  address: string;          // The Ethereum address
  balance: string;          // Balance in micro-USDT (as string to avoid precision loss)
  balanceInUsdt: number;    // Balance converted to USDT
  status: 'success' | 'error';
  error?: string;           // Error message if fetch failed
}

/**
 * Tether price information
 */
export interface USDTPrice {
  aud: number;              // USDT price in AUD
  timestamp: number;        // Unix timestamp of price fetch
}

/**
 * JSON-RPC request structure
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any[];
  id: number;
}

/**
 * JSON-RPC response structure
 */
export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
