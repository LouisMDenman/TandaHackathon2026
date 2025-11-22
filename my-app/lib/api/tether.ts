/**
 * Tether (USDT) API client using JSON-RPC
 * Fetches USDT token balance from Ethereum nodes via ERC-20 contract calls
 */

import { RPC_ENDPOINTS, API_CONFIG, TETHER_CONTRACT_ADDRESS } from '../tether/constants';
import type { TetherBalance, JsonRpcRequest, JsonRpcResponse } from '../tether/types';
import { encodeBalanceOfCall, hexToBigInt, microUsdtToUsdt, microUsdtToString } from '../tether/utils';

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
 * Fetch the USDT balance for an Ethereum address
 * Uses JSON-RPC eth_call method to query the ERC-20 contract
 */
export async function fetchTetherBalance(address: string): Promise<TetherBalance> {
  try {
    // Normalize address to lowercase for RPC calls
    const normalizedAddress = address.toLowerCase();

    // Encode the balanceOf(address) function call
    const callData = encodeBalanceOfCall(normalizedAddress);

    // Prepare eth_call parameters
    const callParams = {
      to: TETHER_CONTRACT_ADDRESS,
      data: callData,
    };

    // Try primary endpoint first, with fallback to alternates
    let balanceHex: string | undefined;
    try {
      balanceHex = await withRetry(() =>
        makeJsonRpcCall('eth_call', [callParams, 'latest'], RPC_ENDPOINTS.primary)
      );
    } catch (primaryError) {
      // Try fallback endpoints
      let fallbackSuccess = false;

      for (const fallbackUrl of RPC_ENDPOINTS.fallbacks) {
        try {
          balanceHex = await withRetry(() =>
            makeJsonRpcCall('eth_call', [callParams, 'latest'], fallbackUrl)
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

    // Handle empty response or "0x"
    if (balanceHex === '0x' || balanceHex === '0x0') {
      return {
        address,
        balance: '0',
        balanceInUsdt: 0,
        status: 'success',
      };
    }

    // Convert hex balance to bigint (micro-USDT)
    const balanceMicroUsdt = hexToBigInt(balanceHex);
    const balanceUsdt = microUsdtToUsdt(Number(balanceMicroUsdt));

    return {
      address,
      balance: microUsdtToString(balanceMicroUsdt),
      balanceInUsdt: balanceUsdt,
      status: 'success',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      address,
      balance: '0',
      balanceInUsdt: 0,
      status: 'error',
      error: `Failed to fetch USDT balance: ${errorMessage}`,
    };
  }
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
