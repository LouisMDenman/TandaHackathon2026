/**
 * Tests for Tether (USDT) API client (JSON-RPC)
 */

import { fetchTetherBalance } from '../tether';

// Mock fetch globally
global.fetch = jest.fn();

describe('fetchTetherBalance', () => {
  beforeEach(() => {
    // Clear mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Successful fetches', () => {
    it('should fetch balance successfully (100 USDT)', async () => {
      const mockBalance = '0x5f5e100'; // 100000000 in hex (100 USDT in micro-USDT)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: mockBalance,
        }),
      });

      const result = await fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(100);
      expect(result.balance).toBe('100000000');
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

      const result = await fetchTetherBalance('0x0000000000000000000000000000000000000000');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(0);
      expect(result.balance).toBe('0');
      expect(result.error).toBeUndefined();
    });

    it('should handle empty hex response (0x)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x', // Empty response
        }),
      });

      const result = await fetchTetherBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(0);
      expect(result.balance).toBe('0');
    });

    it('should handle large balances (1 million USDT)', async () => {
      const largeBalance = '0xe8d4a51000'; // 1000000000000 in hex (1M USDT)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: largeBalance,
        }),
      });

      const result = await fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(1000000);
    });

    it('should handle fractional USDT (0.123456)', async () => {
      const fractionalBalance = '0x1e240'; // 123456 in hex (0.123456 USDT)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: fractionalBalance,
        }),
      });

      const result = await fetchTetherBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(0.123456);
      expect(result.balance).toBe('123456');
    });

    it('should normalize address to lowercase for RPC call', async () => {
      const checksummedAddress = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      await fetchTetherBalance(checksummedAddress);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Check that the call data includes lowercase address
      expect(requestBody.params[0].data).toContain(checksummedAddress.slice(2).toLowerCase());
    });

    it('should return original address (not normalized) in result', async () => {
      const checksummedAddress = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x5f5e100',
        }),
      });

      const result = await fetchTetherBalance(checksummedAddress);

      // Result should preserve the original address format
      expect(result.address).toBe(checksummedAddress);
    });

    it('should handle 1 USDT exactly', async () => {
      const oneUsdt = '0xf4240'; // 1000000 in hex (1 USDT)

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: oneUsdt,
        }),
      });

      const result = await fetchTetherBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(1);
      expect(result.balance).toBe('1000000');
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

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.balanceInUsdt).toBe(0);
      expect(result.error).toContain('Network error');
    });

    it('should handle HTTP errors', async () => {
      // Mock all retry attempts to fail with HTTP error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

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

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

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
            result: '0x5f5e100', // 100 USDT
          }),
        });

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(100);
      expect(global.fetch).toHaveBeenCalledTimes(3); // 3 attempts
    });

    it('should fail after max retries', async () => {
      // All calls fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.error).toContain('Persistent error');
      // Should try primary + fallbacks with retries
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Request timeout'));

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.error).toContain('timeout');
    });
  });

  describe('RPC call structure', () => {
    it('should make correct JSON-RPC eth_call request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      const address = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
      await fetchTetherBalance(address);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const [url, options] = fetchCall;

      expect(url).toContain('cloudflare-eth.com');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.jsonrpc).toBe('2.0');
      expect(body.method).toBe('eth_call');
      expect(body.params).toHaveLength(2);
      expect(body.params[1]).toBe('latest');
      expect(body.id).toBeDefined();
    });

    it('should call Tether contract address', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      await fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should call the Tether contract
      expect(requestBody.params[0].to).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    });

    it('should encode balanceOf function call correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0x0',
        }),
      });

      const address = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
      await fetchTetherBalance(address);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Check function call encoding
      const callData = requestBody.params[0].data;

      // Should start with balanceOf selector (0x70a08231)
      expect(callData.startsWith('0x70a08231')).toBe(true);

      // Should be 74 characters long (0x + 8 selector + 64 padded address)
      expect(callData).toHaveLength(74);

      // Should contain the padded address
      expect(callData.toLowerCase()).toContain(address.slice(2).toLowerCase());
    });
  });

  describe('Fallback endpoint behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should try fallback endpoints if primary fails', async () => {
      // Primary fails, first fallback succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockRejectedValueOnce(new Error('Retry 1'))
        .mockRejectedValueOnce(new Error('Retry 2'))
        .mockRejectedValueOnce(new Error('Retry 3'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jsonrpc: '2.0',
            id: 1,
            result: '0x5f5e100',
          }),
        });

      const resultPromise = fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(100);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle very large USDT balances (billions)', async () => {
      // 5 billion USDT = 5,000,000,000,000,000 micro-USDT
      const fiveBillion = '0x11c37937e08000'; // 5B * 10^6 in hex

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: fiveBillion,
        }),
      });

      const result = await fetchTetherBalance('0x5754284f345afc66a98fbb0a0afe71e0f007b949');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(5000000000);
    });

    it('should handle 1 micro-USDT (smallest unit)', async () => {
      const oneMicroUsdt = '0x1';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: oneMicroUsdt,
        }),
      });

      const result = await fetchTetherBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.status).toBe('success');
      expect(result.balanceInUsdt).toBe(0.000001);
      expect(result.balance).toBe('1');
    });

    it('should handle addresses with mixed case', async () => {
      const mixedCaseAddress = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: '0xf4240',
        }),
      });

      const result = await fetchTetherBalance(mixedCaseAddress);

      expect(result.status).toBe('success');
      expect(result.address).toBe(mixedCaseAddress); // Preserved original
      expect(result.balanceInUsdt).toBe(1);
    });
  });
});
