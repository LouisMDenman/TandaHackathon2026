/**
 * Solana API client using JSON-RPC
 * Fetches balance information from Solana nodes
 */

import { RPC_ENDPOINTS, API_CONFIG, SOLANA_CONSTANTS } from '../solana/constants';
import type { SolanaBalance, JsonRpcRequest, JsonRpcResponse } from '../solana/types';

let requestIdCounter = 1;

/**
 * Make a JSON-RPC call to a Solana node
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
 * Convert lamports (smallest Solana unit) to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / SOLANA_CONSTANTS.LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * SOLANA_CONSTANTS.LAMPORTS_PER_SOL);
}

/**
 * Fetch the SOL balance for a Solana address
 * Uses JSON-RPC getBalance method
 */
export async function fetchSolBalance(address: string): Promise<SolanaBalance> {
  try {
    // Try primary endpoint first, with fallback to alternates
    let balanceResult: any;
    try {
      balanceResult = await withRetry(() =>
        makeJsonRpcCall('getBalance', [address], RPC_ENDPOINTS.primary)
      );
    } catch (primaryError) {
      // Try fallback endpoints
      let fallbackSuccess = false;

      for (const fallbackUrl of RPC_ENDPOINTS.fallbacks) {
        try {
          balanceResult = await withRetry(() =>
            makeJsonRpcCall('getBalance', [address], fallbackUrl)
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

    // Ensure balanceResult was assigned
    if (!balanceResult) {
      throw new Error('Failed to fetch balance from any endpoint');
    }

    // Solana returns balance in lamports in the 'value' field
    const balanceLamports = balanceResult.value;
    const balanceSol = lamportsToSol(balanceLamports);

    return {
      address,
      balance: balanceLamports,
      balanceInSol: balanceSol,
      status: 'success',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      address,
      balance: 0,
      balanceInSol: 0,
      status: 'error',
      error: `Failed to fetch balance: ${errorMessage}`,
    };
  }
}

/**
 * Fetch account info (for future use)
 */
export async function fetchAccountInfo(address: string): Promise<any> {
  return await withRetry(() =>
    makeJsonRpcCall('getAccountInfo', [
      address,
      { encoding: 'jsonParsed' }
    ])
  );
}

/**
 * Fetch the current slot (similar to block number, for debugging/testing)
 */
export async function fetchSlot(): Promise<number> {
  return await withRetry(() => makeJsonRpcCall('getSlot', []));
}

/**
 * Get multiple account balances at once (for future batch operations)
 */
export async function fetchMultipleBalances(addresses: string[]): Promise<SolanaBalance[]> {
  const results = await Promise.all(
    addresses.map((address) => fetchSolBalance(address))
  );
  return results;
}
