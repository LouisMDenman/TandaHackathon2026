/**
 * XRP Ledger API client
 * Handles JSON-RPC calls to fetch account balances
 */

import { XRPBalance, AccountInfoResult } from '../xrp/types';
import { RPC_ENDPOINTS, API_CONFIG } from '../xrp/constants';
import { dropsToXrp } from '../xrp/utils';

interface JsonRpcRequest {
  method: string;
  params: any[];
}

interface JsonRpcResponse {
  result?: any;
  error?: {
    error: string;
    error_code: number;
    error_message: string;
  };
}

/**
 * Fetch XRP balance for an address
 * Tries multiple endpoints with fallback on failure
 * @param address - Classic XRP address (r...)
 * @returns Balance information
 */
export async function fetchXrpBalance(address: string): Promise<XRPBalance> {
  const endpoints = [RPC_ENDPOINTS.primary, ...RPC_ENDPOINTS.fallbacks];
  let lastError: Error | undefined;

  for (const endpoint of endpoints) {
    try {
      const result = await fetchXrpBalanceFromEndpoint(address, endpoint);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`XRP RPC endpoint ${endpoint} failed:`, error);
      continue;
    }
  }

  return {
    address,
    balance: 0,
    balanceInXrp: 0,
    status: 'error',
    error: lastError?.message || 'All XRP RPC endpoints failed',
    accountExists: false,
  };
}

/**
 * Fetch balance from specific endpoint
 * @param address - Classic XRP address
 * @param endpoint - RPC endpoint URL
 * @returns Balance information
 */
async function fetchXrpBalanceFromEndpoint(
  address: string,
  endpoint: string
): Promise<XRPBalance> {
  const request: JsonRpcRequest = {
    method: 'account_info',
    params: [
      {
        account: address,
        ledger_index: 'validated',
        strict: true,
      },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: JsonRpcResponse = await response.json();

    // Handle account not found (unfunded account)
    if (data.error) {
      if (data.error.error === 'actNotFound') {
        return {
          address,
          balance: 0,
          balanceInXrp: 0,
          status: 'success',
          accountExists: false,
          error: 'Account not found or not activated',
        };
      }

      throw new Error(data.error.error_message || 'Unknown RPC error');
    }

    // Parse successful response
    const accountData = data.result.account_data;
    const balanceDrops = parseInt(accountData.Balance, 10);

    return {
      address,
      balance: balanceDrops,
      balanceInXrp: dropsToXrp(balanceDrops),
      status: 'success',
      accountExists: true,
      ownerCount: accountData.OwnerCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error fetching XRP balance');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch multiple balances (for future batch support)
 * @param addresses - Array of classic XRP addresses
 * @returns Array of balance information
 */
export async function fetchMultipleXrpBalances(
  addresses: string[]
): Promise<XRPBalance[]> {
  return Promise.all(addresses.map(addr => fetchXrpBalance(addr)));
}
