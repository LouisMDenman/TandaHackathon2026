/**
 * Tests for CoinGecko API (Ethereum, Solana, and Tether additions)
 * Testing ETH, SOL, and USDT price fetching, conversion, and formatting
 */

import {
  fetchETHPrice,
  fetchSOLPrice,
  fetchUSDTPrice,
  convertETHToAUD,
  convertSOLToAUD,
  convertUSDTToAUD,
  formatCurrency,
} from '../coingecko';

// Mock fetch globally
global.fetch = jest.fn();

// Store original Date.now and setup time control for cache testing
const originalDateNow = Date.now;
let mockTime = originalDateNow.call(Date);

describe('fetchETHPrice', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Advance time by 100 seconds to invalidate any cached data from previous tests
    mockTime += 100000;
    Date.now = jest.fn(() => mockTime);
    // Suppress console.warn during tests that intentionally trigger errors
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore console.warn after each test
    consoleWarnSpy.mockRestore();
  });

  afterAll(() => {
    // Restore Date.now after all tests
    Date.now = originalDateNow;
  });

  it('should fetch ETH price successfully', async () => {
    const mockPrice = 4500.50;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: {
          aud: mockPrice,
        },
      }),
    });

    const result = await fetchETHPrice();

    expect(result.aud).toBe(mockPrice);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('number');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should make correct API call', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4500 },
      }),
    });

    await fetchETHPrice();

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const [url] = fetchCall;

    expect(url).toContain('coingecko.com');
    expect(url).toContain('ethereum');
    expect(url).toContain('vs_currencies=aud');
  });

  it('should cache price for 60 seconds', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4500 },
      }),
    });

    // First call
    const firstResult = await fetchETHPrice();

    // Second call (should use cache)
    const secondResult = await fetchETHPrice();

    expect(firstResult.aud).toBe(4500);
    expect(secondResult.aud).toBe(4500);
    expect(firstResult.timestamp).toBe(secondResult.timestamp);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once due to cache
  });

  it('should handle HTTP errors by returning cached data', async () => {
    // First, populate the cache with a successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4500 },
      }),
    });

    const cachedPrice = await fetchETHPrice();
    expect(cachedPrice.aud).toBe(4500);

    // Now mock an HTTP error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Advance time to invalidate cache
    mockTime += 70000; // 70 seconds

    // Should return cached data despite error
    const result = await fetchETHPrice();
    expect(result.aud).toBe(4500); // Returns cached value
  });

  it('should handle invalid response format by returning cached data', async () => {
    // First, populate the cache with a successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4600 },
      }),
    });

    const cachedPrice = await fetchETHPrice();
    expect(cachedPrice.aud).toBe(4600);

    // Now mock invalid response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        // Missing ethereum key
        someOtherData: {},
      }),
    });

    // Advance time to invalidate cache
    mockTime += 70000; // 70 seconds

    // Should return cached data despite error
    const result = await fetchETHPrice();
    expect(result.aud).toBe(4600); // Returns cached value
  });

  it('should handle network errors by returning cached data', async () => {
    // First, populate the cache with a successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4700 },
      }),
    });

    const cachedPrice = await fetchETHPrice();
    expect(cachedPrice.aud).toBe(4700);

    // Now mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    // Advance time to invalidate cache
    mockTime += 70000; // 70 seconds

    // Should return cached data despite error
    const result = await fetchETHPrice();
    expect(result.aud).toBe(4700); // Returns cached value
  });

  it('should return number price', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ethereum: { aud: 4500.50 },
      }),
    });

    const result = await fetchETHPrice();

    expect(typeof result.aud).toBe('number');
    expect(result.aud).toBe(4500.50);
  });
});

describe('convertETHToAUD', () => {
  it('should convert 1 ETH to AUD', () => {
    const price = 4500;
    const result = convertETHToAUD(1, price);

    expect(result).toBe(4500);
  });

  it('should convert 0 ETH to 0 AUD', () => {
    const price = 4500;
    const result = convertETHToAUD(0, price);

    expect(result).toBe(0);
  });

  it('should convert fractional ETH', () => {
    const price = 4500;
    const result = convertETHToAUD(0.5, price);

    expect(result).toBe(2250);
  });

  it('should handle large amounts', () => {
    const price = 4500;
    const result = convertETHToAUD(100, price);

    expect(result).toBe(450000);
  });

  it('should handle small decimals', () => {
    const price = 4500;
    const result = convertETHToAUD(0.001, price);

    expect(result).toBe(4.5);
  });

  it('should handle very small amounts', () => {
    const price = 4500;
    const result = convertETHToAUD(0.00001, price);

    expect(result).toBeCloseTo(0.045, 10); // Use toBeCloseTo for floating point comparison
  });

  it('should handle different price points', () => {
    expect(convertETHToAUD(1, 3000)).toBe(3000);
    expect(convertETHToAUD(1, 5000)).toBe(5000);
    expect(convertETHToAUD(2, 4000)).toBe(8000);
  });
});

describe('fetchSOLPrice', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Advance time by 100 seconds to invalidate any cached data from previous tests
    mockTime += 100000;
    Date.now = jest.fn(() => mockTime);
    // Suppress console.warn during tests that intentionally trigger errors
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore console.warn after each test
    consoleWarnSpy.mockRestore();
  });

  it('should fetch SOL price successfully', async () => {
    const mockPrice = 245.75;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        solana: {
          aud: mockPrice,
        },
      }),
    });

    const result = await fetchSOLPrice();

    expect(result.aud).toBe(mockPrice);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('number');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should make correct API call', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        solana: { aud: 245 },
      }),
    });

    await fetchSOLPrice();

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const [url] = fetchCall;

    expect(url).toContain('coingecko.com');
    expect(url).toContain('solana');
    expect(url).toContain('vs_currencies=aud');
  });

  it('should cache price for 60 seconds', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        solana: { aud: 245 },
      }),
    });

    // First call
    const firstResult = await fetchSOLPrice();

    // Second call (should use cache)
    const secondResult = await fetchSOLPrice();

    expect(firstResult.aud).toBe(245);
    expect(secondResult.aud).toBe(245);
    expect(firstResult.timestamp).toBe(secondResult.timestamp);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once due to cache
  });
});

describe('convertSOLToAUD', () => {
  it('should convert 1 SOL to AUD', () => {
    const price = 245;
    const result = convertSOLToAUD(1, price);

    expect(result).toBe(245);
  });

  it('should convert 0 SOL to 0 AUD', () => {
    const price = 245;
    const result = convertSOLToAUD(0, price);

    expect(result).toBe(0);
  });

  it('should convert fractional SOL', () => {
    const price = 245;
    const result = convertSOLToAUD(0.5, price);

    expect(result).toBe(122.5);
  });

  it('should handle large amounts', () => {
    const price = 245;
    const result = convertSOLToAUD(100, price);

    expect(result).toBe(24500);
  });
});

describe('formatCurrency', () => {
  describe('ETH formatting', () => {
    it('should format 1 ETH correctly', () => {
      const result = formatCurrency(1, 'ETH');

      expect(result).toContain('1');
      expect(result).toContain('ETH');
      expect(result).not.toContain('BTC');
      expect(result).not.toContain('AUD');
    });

    it('should format fractional ETH', () => {
      const result = formatCurrency(0.5, 'ETH');

      expect(result).toContain('0.5');
      expect(result).toContain('ETH');
    });

    it('should format ETH with 6 decimal places (max)', () => {
      const result = formatCurrency(1.123456789, 'ETH');

      expect(result).toContain('1.123457'); // Should show 6 decimals (rounded)
      expect(result).not.toContain('1.1234567'); // Should not show 7+
      expect(result).toContain('ETH');
    });

    it('should preserve minimum 2 decimal places even with trailing zero', () => {
      const result = formatCurrency(1.1, 'ETH');

      // Implementation preserves at least 2 decimal places
      expect(result).toMatch(/^1\.10\s*ETH$/);
    });

    it('should preserve at least 2 decimal places', () => {
      const result = formatCurrency(1, 'ETH');

      expect(result).toMatch(/1\.00\s*ETH/);
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'ETH');

      expect(result).toContain('0');
      expect(result).toContain('ETH');
    });

    it('should handle very small amounts', () => {
      const result = formatCurrency(0.000001, 'ETH');

      expect(result).toContain('0.000001');
      expect(result).toContain('ETH');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1000.5, 'ETH');

      expect(result).toContain('1000.5');
      expect(result).toContain('ETH');
    });
  });

  describe('BTC formatting (regression test)', () => {
    it('should still format BTC correctly', () => {
      const result = formatCurrency(1, 'BTC');

      expect(result).toContain('1');
      expect(result).toContain('BTC');
      expect(result).not.toContain('ETH');
    });

    it('should format BTC with 8 decimal places', () => {
      const result = formatCurrency(1.123456789, 'BTC');

      expect(result).toContain('1.12345679'); // 8 decimals for BTC (rounded)
      expect(result).toContain('BTC');
    });
  });

  describe('AUD formatting (regression test)', () => {
    it('should format AUD correctly', () => {
      const result = formatCurrency(1000, 'AUD');

      expect(result).toMatch(/1,000\.00/); // Should have comma separator
      expect(result).toContain('$'); // AUD symbol
    });

    it('should format AUD with 2 decimal places', () => {
      const result = formatCurrency(1234.567, 'AUD');

      expect(result).toMatch(/1,234\.57/); // Rounded to 2 decimals
    });
  });

  describe('SOL formatting', () => {
    it('should format 1 SOL correctly', () => {
      const result = formatCurrency(1, 'SOL');

      expect(result).toContain('1');
      expect(result).toContain('SOL');
      expect(result).not.toContain('BTC');
      expect(result).not.toContain('ETH');
    });

    it('should format fractional SOL', () => {
      const result = formatCurrency(0.5, 'SOL');

      expect(result).toContain('0.5');
      expect(result).toContain('SOL');
    });

    it('should format SOL with 6 decimal places (max)', () => {
      const result = formatCurrency(1.123456789, 'SOL');

      expect(result).toContain('1.123457'); // Should show 6 decimals (rounded)
      expect(result).not.toContain('1.1234567'); // Should not show 7+
      expect(result).toContain('SOL');
    });

    it('should preserve at least 2 decimal places', () => {
      const result = formatCurrency(1, 'SOL');

      expect(result).toMatch(/1\.00\s*SOL/);
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'SOL');

      expect(result).toContain('0');
      expect(result).toContain('SOL');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1000.5, 'SOL');

      expect(result).toContain('1000.5');
      expect(result).toContain('SOL');
    });
  });

  describe('Comparison: ETH vs BTC vs SOL formatting', () => {
    it('ETH and SOL should show 6 decimals, BTC should show 8', () => {
      const eth = formatCurrency(1.123456789, 'ETH');
      const btc = formatCurrency(1.123456789, 'BTC');
      const sol = formatCurrency(1.123456789, 'SOL');

      expect(eth).toContain('1.123457'); // 6 decimals (rounded)
      expect(btc).toContain('1.12345679'); // 8 decimals (rounded)
      expect(sol).toContain('1.123457'); // 6 decimals (rounded)
    });

    it('should clearly distinguish between ETH, BTC, and SOL', () => {
      const eth = formatCurrency(1, 'ETH');
      const btc = formatCurrency(1, 'BTC');
      const sol = formatCurrency(1, 'SOL');

      expect(eth).toContain('ETH');
      expect(eth).not.toContain('BTC');
      expect(eth).not.toContain('SOL');

      expect(btc).toContain('BTC');
      expect(btc).not.toContain('ETH');
      expect(btc).not.toContain('SOL');

      expect(sol).toContain('SOL');
      expect(sol).not.toContain('ETH');
      expect(sol).not.toContain('BTC');
    });
  });
});

describe('fetchUSDTPrice', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Advance time by 100 seconds to invalidate any cached data from previous tests
    mockTime += 100000;
    Date.now = jest.fn(() => mockTime);
    // Suppress console.warn during tests that intentionally trigger errors
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore console.warn after each test
    consoleWarnSpy.mockRestore();
  });

  it('should fetch USDT price successfully', async () => {
    const mockPrice = 1.52; // USDT typically close to 1 AUD

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: {
          aud: mockPrice,
        },
      }),
    });

    const result = await fetchUSDTPrice();

    expect(result.aud).toBe(mockPrice);
    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe('number');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should make correct API call', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: { aud: 1.50 },
      }),
    });

    await fetchUSDTPrice();

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const [url] = fetchCall;

    expect(url).toContain('coingecko.com');
    expect(url).toContain('tether');
    expect(url).toContain('vs_currencies=aud');
  });

  it('should cache price for 60 seconds', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        tether: { aud: 1.51 },
      }),
    });

    // First call
    const firstResult = await fetchUSDTPrice();

    // Second call (should use cache)
    const secondResult = await fetchUSDTPrice();

    expect(firstResult.aud).toBe(1.51);
    expect(secondResult.aud).toBe(1.51);
    expect(firstResult.timestamp).toBe(secondResult.timestamp);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once due to cache
  });

  it('should fetch fresh price after cache expires', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tether: { aud: 1.50 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tether: { aud: 1.52 },
        }),
      });

    // First call
    const firstResult = await fetchUSDTPrice();
    expect(firstResult.aud).toBe(1.50);

    // Advance time beyond cache duration (61 seconds)
    mockTime += 61000;

    // Second call (cache expired, should fetch fresh)
    const secondResult = await fetchUSDTPrice();
    expect(secondResult.aud).toBe(1.52);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should use cached price as fallback on API error', async () => {
    // First successful call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: { aud: 1.50 },
      }),
    });

    const firstResult = await fetchUSDTPrice();
    expect(firstResult.aud).toBe(1.50);

    // Expire cache
    mockTime += 61000;

    // Second call fails, but should return cached value
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const secondResult = await fetchUSDTPrice();
    expect(secondResult.aud).toBe(1.50); // Returns cached value
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should handle invalid response format by returning cached data', async () => {
    // First, create a valid cache
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: { aud: 1.50 },
      }),
    });

    await fetchUSDTPrice(); // Cache it

    // Advance time to expire cache
    mockTime += 61000;

    // Now provide invalid response - should return cached value
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        // Missing 'tether' key
        other: { aud: 1.50 },
      }),
    });

    const result = await fetchUSDTPrice();
    expect(result.aud).toBe(1.50); // Should return cached value
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should validate price is a number', async () => {
    // First, create a valid cache
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: { aud: 1.51 },
      }),
    });

    await fetchUSDTPrice(); // Cache it

    // Advance time to expire cache
    mockTime += 61000;

    // Now provide invalid response - should return cached value
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tether: {
          aud: 'not-a-number', // Invalid
        },
      }),
    });

    const result = await fetchUSDTPrice();
    expect(result.aud).toBe(1.51); // Should return cached value
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});

describe('convertUSDTToAUD', () => {
  it('should convert USDT to AUD correctly', () => {
    const usdtAmount = 100;
    const usdtPrice = 1.50;

    const result = convertUSDTToAUD(usdtAmount, usdtPrice);

    expect(result).toBe(150);
  });

  it('should handle zero USDT', () => {
    const result = convertUSDTToAUD(0, 1.50);
    expect(result).toBe(0);
  });

  it('should handle fractional USDT', () => {
    const result = convertUSDTToAUD(0.123456, 1.50);
    expect(result).toBeCloseTo(0.185184, 6);
  });

  it('should handle large amounts', () => {
    const result = convertUSDTToAUD(1000000, 1.52);
    expect(result).toBe(1520000);
  });

  it('should handle price variations', () => {
    const usdtAmount = 100;

    const result1 = convertUSDTToAUD(usdtAmount, 1.45);
    const result2 = convertUSDTToAUD(usdtAmount, 1.55);

    expect(result1).toBe(145);
    expect(result2).toBe(155);
  });
});

describe('formatCurrency - USDT', () => {
  it('should format USDT with 2-6 decimal places', () => {
    const formatted = formatCurrency(100.123456, 'USDT');

    expect(formatted).toContain('USDT');
    expect(formatted).toContain('100.123456');
  });

  it('should format whole numbers with .00', () => {
    const formatted = formatCurrency(100, 'USDT');

    expect(formatted).toBe('100.00 USDT');
  });

  it('should format zero correctly', () => {
    const formatted = formatCurrency(0, 'USDT');

    expect(formatted).toBe('0.00 USDT');
  });

  it('should remove trailing zeros but keep at least 2 decimals', () => {
    const formatted1 = formatCurrency(100.1, 'USDT');
    const formatted2 = formatCurrency(100.12, 'USDT');
    const formatted3 = formatCurrency(100.123, 'USDT');

    expect(formatted1).toBe('100.10 USDT');
    expect(formatted2).toBe('100.12 USDT');
    expect(formatted3).toBe('100.123 USDT');
  });

  it('should handle all 6 decimal places', () => {
    const formatted = formatCurrency(0.123456, 'USDT');

    expect(formatted).toBe('0.123456 USDT');
  });

  it('should handle 1 micro-USDT (0.000001)', () => {
    const formatted = formatCurrency(0.000001, 'USDT');

    expect(formatted).toBe('0.000001 USDT');
  });

  it('should handle large amounts', () => {
    const formatted = formatCurrency(1000000.50, 'USDT');

    expect(formatted).toBe('1000000.50 USDT');
  });

  it('should remove trailing zeros from 6 decimal input', () => {
    const formatted = formatCurrency(100.100000, 'USDT');

    expect(formatted).toBe('100.10 USDT');
  });

  it('should format typical stablecoin amounts', () => {
    const amounts = [1, 10, 100, 1000, 10000];
    amounts.forEach((amount) => {
      const formatted = formatCurrency(amount, 'USDT');
      expect(formatted).toContain(`${amount}.00 USDT`);
    });
  });

  it('should distinguish USDT from other currencies', () => {
    const usdt = formatCurrency(100, 'USDT');
    const eth = formatCurrency(100, 'ETH');
    const btc = formatCurrency(100, 'BTC');

    expect(usdt).toContain('USDT');
    expect(usdt).not.toContain('ETH');
    expect(usdt).not.toContain('BTC');

    expect(eth).not.toContain('USDT');
    expect(btc).not.toContain('USDT');
  });

  describe('USDT vs ETH vs SOL formatting comparison', () => {
    it('should show 6 decimals for USDT, ETH, and SOL', () => {
      const usdt = formatCurrency(1.123456789, 'USDT');
      const eth = formatCurrency(1.123456789, 'ETH');
      const sol = formatCurrency(1.123456789, 'SOL');

      // All should truncate to 6 decimals
      expect(usdt).toContain('1.123457');
      expect(eth).toContain('1.123457');
      expect(sol).toContain('1.123457');
    });

    it('should preserve proper decimal handling for stablecoins', () => {
      // USDT should be formatted like a currency (similar to AUD)
      const usdt1 = formatCurrency(1.5, 'USDT');
      const usdt2 = formatCurrency(1.50, 'USDT');

      expect(usdt1).toBe('1.50 USDT');
      expect(usdt2).toBe('1.50 USDT');
    });
  });
});
