/**
 * Ethereum API client using JSON-RPC
 * Fetches balance information from Ethereum nodes
 */

import { RPC_ENDPOINTS, API_CONFIG, ETHEREUM_CONSTANTS } from '../ethereum/constants';
import type { EthereumBalance, JsonRpcRequest, JsonRpcResponse } from '../ethereum/types';

let requestIdCounter = 1;

/**
 * Make a JSON-RPC call to an Ethereum node
 */
async function makeJsonRpcCall(
  method: string,
  params: any[],
  rpcUrl: string = RPC_ENDPOINTS.primary
): Promise<any> {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestIdCounter++,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: JsonRpcResponse = await response.json();

    if (data.error) {
      throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }

    throw new Error('Unknown error occurred');
  }
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.retries
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on the last attempt
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Convert Wei (smallest Ethereum unit) to ETH
 */
export function weiToEth(wei: bigint): number {
  return Number(wei) / Number(ETHEREUM_CONSTANTS.WEI_PER_ETH);
}

/**
 * Convert ETH to Wei
 */
export function ethToWei(eth: number): bigint {
  return BigInt(Math.floor(eth * Number(ETHEREUM_CONSTANTS.WEI_PER_ETH)));
}

/**
 * Format Wei as a string to avoid precision loss
 */
export function weiToString(wei: bigint): string {
  return wei.toString();
}

/**
 * Parse a hex string to bigint
 */
function hexToBigInt(hex: string): bigint {
  return BigInt(hex);
}

/**
 * Fetch the ETH balance for an Ethereum address
 * Uses JSON-RPC eth_getBalance method
 */
export async function fetchEthBalance(address: string): Promise<EthereumBalance> {
  try {
    // Normalize address to lowercase for RPC calls
    const normalizedAddress = address.toLowerCase();

    // Try primary endpoint first, with fallback to alternates
    let balanceHex: string | undefined;
    try {
      balanceHex = await withRetry(() =>
        makeJsonRpcCall('eth_getBalance', [normalizedAddress, 'latest'], RPC_ENDPOINTS.primary)
      );
    } catch (primaryError) {
      // Try fallback endpoints
      let fallbackSuccess = false;

      for (const fallbackUrl of RPC_ENDPOINTS.fallbacks) {
        try {
          balanceHex = await withRetry(() =>
            makeJsonRpcCall('eth_getBalance', [normalizedAddress, 'latest'], fallbackUrl)
          );
          fallbackSuccess = true;
          break;
        } catch (fallbackError) {
          // Continue to next fallback
          continue;
        }
      }

      if (!fallbackSuccess) {
        throw primaryError;
      }
    }

    // Ensure balanceHex was assigned
    if (!balanceHex) {
      throw new Error('Failed to fetch balance from any endpoint');
    }

    // Convert hex balance to bigint (Wei)
    const balanceWei = hexToBigInt(balanceHex);
    const balanceEth = weiToEth(balanceWei);

    return {
      address,
      balance: weiToString(balanceWei),
      balanceInEth: balanceEth,
      status: 'success',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      address,
      balance: '0',
      balanceInEth: 0,
      status: 'error',
      error: `Failed to fetch balance: ${errorMessage}`,
    };
  }
}

/**
 * Fetch current gas price (for future use)
 */
export async function fetchGasPrice(): Promise<bigint> {
  const gasPriceHex = await withRetry(() =>
    makeJsonRpcCall('eth_gasPrice', [])
  );
  return hexToBigInt(gasPriceHex);
}

/**
 * Fetch the current block number (for debugging/testing)
 */
export async function fetchBlockNumber(): Promise<number> {
  const blockNumberHex = await withRetry(() =>
    makeJsonRpcCall('eth_blockNumber', [])
  );
  return parseInt(blockNumberHex, 16);
}

/**
 * Check if an address is a smart contract
 * Returns true if the address has code deployed
 */
export async function isContract(address: string): Promise<boolean> {
  const normalizedAddress = address.toLowerCase();
  const code = await withRetry(() =>
    makeJsonRpcCall('eth_getCode', [normalizedAddress, 'latest'])
  );

  // If code is '0x' or '0x0', it's an EOA (Externally Owned Account), not a contract
  return code !== '0x' && code !== '0x0';
}
