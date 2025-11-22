/**
 * Ethereum wallet types and interfaces
 */

export type NetworkType = 'mainnet' | 'testnet';

/**
 * Information about a validated Ethereum address
 */
export interface EthereumAddressInfo {
  address: string;          // The normalized address (checksummed)
  valid: boolean;           // Whether the address is valid
  network: NetworkType;     // Network type (mainnet for production)
  error?: string;           // Error message if validation failed
}

/**
 * Ethereum balance information
 */
export interface EthereumBalance {
  address: string;          // The Ethereum address
  balance: string;          // Balance in Wei (as string to avoid precision loss)
  balanceInEth: number;     // Balance converted to ETH
  status: 'success' | 'error';
  error?: string;           // Error message if fetch failed
}

/**
 * Ethereum price information
 */
export interface ETHPrice {
  aud: number;              // ETH price in AUD
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
