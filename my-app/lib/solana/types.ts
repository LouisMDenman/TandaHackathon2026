/**
 * Solana wallet types and interfaces
 */

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

/**
 * Information about a validated Solana address
 */
export interface SolanaAddressInfo {
  address: string;          // The validated address
  valid: boolean;           // Whether the address is valid
  network: NetworkType;     // Network type (mainnet for production)
  error?: string;           // Error message if validation failed
}

/**
 * Solana balance information
 */
export interface SolanaBalance {
  address: string;          // The Solana address
  balance: number;          // Balance in lamports
  balanceInSol: number;     // Balance converted to SOL
  status: 'success' | 'error';
  error?: string;           // Error message if fetch failed
}

/**
 * Solana price information
 */
export interface SOLPrice {
  aud: number;              // SOL price in AUD
  timestamp: number;        // Unix timestamp of price fetch
}

/**
 * JSON-RPC request structure for Solana
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any[];
  id: number;
}

/**
 * JSON-RPC response structure for Solana
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
