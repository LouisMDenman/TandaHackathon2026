/**
 * Tests for Ethereum API client (JSON-RPC)
 */

import {
  weiToEth,
  ethToWei,
  weiToString,
  fetchEthBalance,
} from '../ethereum';

// Mock fetch globally
global.fetch = jest.fn();

describe('weiToEth', () => {
  it('should convert 1 ETH in Wei to 1', () => {
    const oneEthInWei = BigInt('1000000000000000000'); // 10^18
    expect(weiToEth(oneEthInWei)).toBe(1);
  });

  it('should convert 0 Wei to 0', () => {
    expect(weiToEth(BigInt(0))).toBe(0);
  });

  it('should convert fractional ETH correctly', () => {
    const halfEth = BigInt('500000000000000000'); // 0.5 ETH
    expect(weiToEth(halfEth)).toBe(0.5);
  });

  it('should handle very small amounts', () => {
    const oneWei = BigInt(1);
    expect(weiToEth(oneWei)).toBe(0.000000000000000001);
  });

  it('should handle large amounts', () => {
    const thousandEth = BigInt('1000000000000000000000'); // 1000 ETH
    expect(weiToEth(thousandEth)).toBe(1000);
  });

  it('should handle typical amounts (e.g., 2.5 ETH)', () => {
    const twoPointFiveEth = BigInt('2500000000000000000');
    expect(weiToEth(twoPointFiveEth)).toBe(2.5);
  });
});

describe('ethToWei', () => {
  it('should convert 1 ETH to Wei', () => {
    const wei = ethToWei(1);
    expect(wei).toBe(BigInt('1000000000000000000'));
  });

  it('should convert 0 ETH to 0 Wei', () => {
    const wei = ethToWei(0);
    expect(wei).toBe(BigInt(0));
  });

  it('should convert fractional ETH', () => {
    const wei = ethToWei(0.5);
    expect(wei).toBe(BigInt('500000000000000000'));
  });

  it('should handle large amounts', () => {
    const wei = ethToWei(1000);
    expect(wei).toBe(BigInt('1000000000000000000000'));
  });

  it('should handle small decimals', () => {
    const wei = ethToWei(0.001);
    expect(wei).toBe(BigInt('1000000000000000'));
  });

  it('should round down for sub-Wei precision', () => {
    // JavaScript can't represent all decimals precisely
    const wei = ethToWei(0.0000000000000000001); // Very small amount
    expect(wei).toBe(BigInt(0)); // Rounds down to 0
  });
});

describe('weiToString', () => {
  it('should convert BigInt Wei to string', () => {
    const oneEth = BigInt('1000000000000000000');
    expect(weiToString(oneEth)).toBe('1000000000000000000');
  });

  it('should handle zero', () => {
    expect(weiToString(BigInt(0))).toBe('0');
  });

  it('should handle large numbers', () => {
    const large = BigInt('999999999999999999999999');
    expect(weiToString(large)).toBe('999999999999999999999999');
  });

  it('should preserve full precision', () => {
    const precise = BigInt('1234567890123456789');
    expect(weiToString(precise)).toBe('1234567890123456789');
  });
});

describe('fetchEthBalance', () => {
  beforeEach(() => {
    // Clear mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Successful fetches', () => {
    it('should fetch balance successfully', async () => {
      const mockBalance = '0xde0b6b3a7640000'; // 1 ETH in hex (10^18)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: mockBalance,
        }),
      });

      const result = await fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.status).toBe('success');
      expect(result.balanceInEth).toBe(1);
      expect(result.balance).toBe('1000000000000000000');
      expect(result.error).toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fetch zero balance', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0', // 0 balance
        }),
      });

      const result = await fetchEthBalance('0x0000000000000000000000000000000000000000');

      expect(result.status).toBe('success');
      expect(result.balanceInEth).toBe(0);
      expect(result.balance).toBe('0');
      expect(result.error).toBeUndefined();
    });

    it('should handle large balances', async () => {
      const largeBalance = '0x3635c9adc5dea00000'; // 1000 ETH in hex

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: largeBalance,
        }),
      });

      const result = await fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.status).toBe('success');
      expect(result.balanceInEth).toBe(1000);
    });

    it('should normalize address to lowercase for RPC call', async () => {
      const checksummedAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      await fetchEthBalance(checksummedAddress);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Check that address was normalized to lowercase
      expect(requestBody.params[0]).toBe(checksummedAddress.toLowerCase());
    });

    it('should return original address (not normalized) in result', async () => {
      const checksummedAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      const result = await fetchEthBalance(checksummedAddress);

      // Result should preserve the original address format
      expect(result.address).toBe(checksummedAddress);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      // Use fake timers to speed up retry delays in error tests
      jest.useFakeTimers();
    });

    afterEach(() => {
      // Restore real timers after each test
      jest.useRealTimers();
    });

    it('should handle network errors', async () => {
      // Mock all retry attempts to fail (primary + fallbacks with retries)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const resultPromise = fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.balanceInEth).toBe(0);
      expect(result.error).toContain('Network error');
    });

    it('should handle HTTP errors', async () => {
      // Mock all retry attempts to fail with HTTP error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const resultPromise = fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.error).toMatch(/500|Internal Server Error/);
    });

    it('should handle JSON-RPC errors', async () => {
      // Mock all retry attempts to return JSON-RPC error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            message: 'Invalid params',
          },
        }),
      });

      const resultPromise = fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.error).toMatch(/Invalid params/);
    });

    it('should retry on failure and eventually succeed', async () => {
      // First two calls fail, third succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 1,
            result: '0xde0b6b3a7640000', // 1 ETH
          }),
        });

      const resultPromise = fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('success');
      expect(result.balanceInEth).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(3); // 3 attempts
    });

    it('should fail after max retries', async () => {
      // All calls fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      const resultPromise = fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.error).toContain('Persistent error');
      // Should try primary + fallbacks with retries
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('RPC call structure', () => {
    it('should make correct JSON-RPC request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      await fetchEthBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const [url, options] = fetchCall;

      expect(url).toContain('cloudflare-eth.com');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.jsonrpc).toBe('2.0');
      expect(body.method).toBe('eth_getBalance');
      expect(body.params).toEqual([
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Lowercase
        'latest',
      ]);
      expect(body.id).toBeDefined();
    });
  });
});
