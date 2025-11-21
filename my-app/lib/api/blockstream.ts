/**
 * Blockstream API client for fetching Bitcoin address balances
 * API Documentation: https://github.com/Blockstream/esplora/blob/master/API.md
 */

import { API_CONFIG } from '../bitcoin/constants';

/**
 * Address balance information from Blockstream API
 */
export interface AddressBalance {
  address: string;
  balance: number;  // in satoshis (current unspent balance)
  received: number; // total received in satoshis
  sent: number;     // total sent in satoshis
}

/**
 * Blockstream API address response
 */
interface BlockstreamAddressResponse {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

/**
 * Sleep utility for delays
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch address balance from Blockstream API with retry logic
 *
 * @param address Bitcoin address
 * @param retries Number of retries remaining
 * @returns Address balance information
 */
export async function fetchAddressBalance(
  address: string,
  retries: number = API_CONFIG.retries
): Promise<AddressBalance> {
  const url = `${API_CONFIG.blockstream.mainnet}/address/${address}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited - implement exponential backoff
        const backoffDelay = (API_CONFIG.retries - retries + 1) * 1000;
        await sleep(backoffDelay);
        return fetchAddressBalance(address, retries - 1);
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: BlockstreamAddressResponse = await response.json();

    // Calculate balance from chain stats and mempool stats
    const chainReceived = data.chain_stats.funded_txo_sum;
    const chainSent = data.chain_stats.spent_txo_sum;
    const mempoolReceived = data.mempool_stats.funded_txo_sum;
    const mempoolSent = data.mempool_stats.spent_txo_sum;

    const totalReceived = chainReceived + mempoolReceived;
    const totalSent = chainSent + mempoolSent;
    const balance = totalReceived - totalSent;

    return {
      address,
      balance,
      received: totalReceived,
      sent: totalSent,
    };
  } catch (error) {
    // Retry on network errors with exponential backoff
    if (retries > 0 && error instanceof Error) {
      const backoffDelay = (API_CONFIG.retries - retries + 1) * 1000;
      await sleep(backoffDelay);
      return fetchAddressBalance(address, retries - 1);
    }

    // If all retries exhausted, return zero balance for this address
    // This allows the wallet checker to continue with other addresses
    return {
      address,
      balance: 0,
      received: 0,
      sent: 0,
    };
  }
}

/**
 * Fetch balances for multiple addresses with batch processing
 * Batches requests in groups of 10 to avoid rate limiting
 * Uses Promise.allSettled to handle individual address failures
 *
 * @param addresses Array of Bitcoin addresses
 * @returns Array of address balances
 */
export async function fetchMultipleBalances(
  addresses: string[]
): Promise<AddressBalance[]> {
  const results: AddressBalance[] = [];
  const batchSize = API_CONFIG.batchSize; // 10 addresses per batch

  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);

    // Fetch all addresses in current batch concurrently
    const batchPromises = batch.map(address => fetchAddressBalance(address));
    const batchResults = await Promise.allSettled(batchPromises);

    // Process results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Log error but continue processing
        console.error('Failed to fetch address balance:', result.reason);
      }
    }

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < addresses.length) {
      await sleep(API_CONFIG.requestDelay);
    }
  }

  return results;
}

/**
 * Calculate total balance from an array of addresses
 * Only counts addresses with transactions (received > 0)
 *
 * @param addresses Array of Bitcoin addresses
 * @returns Total balance in satoshis
 */
export async function calculateTotalBalance(
  addresses: string[]
): Promise<number> {
  const balances = await fetchMultipleBalances(addresses);

  // Sum up balances, only for addresses that have received transactions
  const total = balances
    .filter(addressBalance => addressBalance.received > 0)
    .reduce((sum, addressBalance) => sum + addressBalance.balance, 0);

  return total;
}

/**
 * Fetch balances and return summary statistics
 *
 * @param addresses Array of Bitcoin addresses
 * @returns Balance summary with statistics
 */
export async function fetchBalanceSummary(addresses: string[]): Promise<{
  totalBalance: number;
  totalReceived: number;
  totalSent: number;
  addressesWithTransactions: number;
  addressesScanned: number;
  balances: AddressBalance[];
}> {
  const balances = await fetchMultipleBalances(addresses);

  // Calculate statistics
  const addressesWithTransactions = balances.filter(b => b.received > 0).length;
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalReceived = balances.reduce((sum, b) => sum + b.received, 0);
  const totalSent = balances.reduce((sum, b) => sum + b.sent, 0);

  return {
    totalBalance,
    totalReceived,
    totalSent,
    addressesWithTransactions,
    addressesScanned: addresses.length,
    balances,
  };
}

/**
 * Check if an address has any transactions
 *
 * @param address Bitcoin address
 * @returns True if address has received any funds
 */
export async function hasTransactions(address: string): Promise<boolean> {
  const balance = await fetchAddressBalance(address);
  return balance.received > 0;
}

/**
 * Get only addresses with non-zero balances
 *
 * @param addresses Array of Bitcoin addresses
 * @returns Array of addresses with non-zero balances
 */
export async function getAddressesWithBalance(
  addresses: string[]
): Promise<AddressBalance[]> {
  const balances = await fetchMultipleBalances(addresses);
  return balances.filter(b => b.balance > 0);
}
