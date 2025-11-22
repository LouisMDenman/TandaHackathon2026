/**
 * Tests for Solana API client (JSON-RPC)
 */

import {
  lamportsToSol,
  solToLamports,
  fetchSolBalance,
} from '../solana';

// Mock fetch globally
global.fetch = jest.fn();

describe('lamportsToSol', () => {
  it('should convert 1 SOL in lamports to 1', () => {
    const oneSolInLamports = 1000000000; // 10^9
    expect(lamportsToSol(oneSolInLamports)).toBe(1);
  });

  it('should convert 0 lamports to 0', () => {
    expect(lamportsToSol(0)).toBe(0);
  });

  it('should convert fractional SOL correctly', () => {
    const halfSol = 500000000; // 0.5 SOL
    expect(lamportsToSol(halfSol)).toBe(0.5);
  });

  it('should handle very small amounts', () => {
    const oneLamport = 1;
    expect(lamportsToSol(oneLamport)).toBe(0.000000001);
  });

  it('should handle large amounts', () => {
    const thousandSol = 1000000000000; // 1000 SOL
    expect(lamportsToSol(thousandSol)).toBe(1000);
  });

  it('should handle typical amounts (e.g., 2.5 SOL)', () => {
    const twoPointFiveSol = 2500000000;
    expect(lamportsToSol(twoPointFiveSol)).toBe(2.5);
  });
});

describe('solToLamports', () => {
  it('should convert 1 SOL to lamports', () => {
    const lamports = solToLamports(1);
    expect(lamports).toBe(1000000000);
  });

  it('should convert 0 SOL to 0 lamports', () => {
    const lamports = solToLamports(0);
    expect(lamports).toBe(0);
  });

  it('should convert fractional SOL', () => {
    const lamports = solToLamports(0.5);
    expect(lamports).toBe(500000000);
  });

  it('should handle large amounts', () => {
    const lamports = solToLamports(1000);
    expect(lamports).toBe(1000000000000);
  });

  it('should handle small decimals', () => {
    const lamports = solToLamports(0.001);
    expect(lamports).toBe(1000000);
  });

  it('should round down for sub-lamport precision', () => {
    // JavaScript can't represent all decimals precisely
    const lamports = solToLamports(0.0000000001); // Very small amount
    expect(lamports).toBe(0); // Rounds down to 0
  });
});

describe('fetchSolBalance', () => {
  beforeEach(() => {
    // Clear mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Successful fetches', () => {
    it('should fetch balance successfully', async () => {
      const mockBalance = {
        value: 1000000000, // 1 SOL
        context: { slot: 123456789 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: mockBalance,
        }),
      });

      const result = await fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

      expect(result.status).toBe('success');
      expect(result.balanceInSol).toBe(1);
      expect(result.balance).toBe(1000000000);
      expect(result.error).toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fetch zero balance', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: {
            value: 0,
            context: { slot: 123456789 },
          },
        }),
      });

      const result = await fetchSolBalance('11111111111111111111111111111111');

      expect(result.status).toBe('success');
      expect(result.balanceInSol).toBe(0);
      expect(result.balance).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle large balances', async () => {
      const largeBalance = {
        value: 1000000000000, // 1000 SOL
        context: { slot: 123456789 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: largeBalance,
        }),
      });

      const result = await fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

      expect(result.status).toBe('success');
      expect(result.balanceInSol).toBe(1000);
    });

    it('should preserve original address in result', async () => {
      const address = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: {
            value: 0,
            context: { slot: 123456789 },
          },
        }),
      });

      const result = await fetchSolBalance(address);

      // Result should preserve the original address
      expect(result.address).toBe(address);
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

      const resultPromise = fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('error');
      expect(result.balanceInSol).toBe(0);
      expect(result.error).toContain('Network error');
    });

    it('should handle HTTP errors', async () => {
      // Mock all retry attempts to fail with HTTP error
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const resultPromise = fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

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

      const resultPromise = fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

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
            result: {
              value: 1000000000, // 1 SOL
              context: { slot: 123456789 },
            },
          }),
        });

      const resultPromise = fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.status).toBe('success');
      expect(result.balanceInSol).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(3); // 3 attempts
    });

    it('should fail after max retries', async () => {
      // All calls fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      const resultPromise = fetchSolBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');

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
          result: {
            value: 0,
            context: { slot: 123456789 },
          },
        }),
      });

      const address = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      await fetchSolBalance(address);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const [url, options] = fetchCall;

      // Should call either API route or direct RPC endpoint
      expect(url).toMatch(/solana|\/api\/solana-rpc/);
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(options.body);
      expect(body.jsonrpc).toBe('2.0');
      expect(body.method).toBe('getBalance');
      expect(body.params).toEqual([address]);
      expect(body.id).toBeDefined();
    });
  });
});
