/**
 * Tests for formatting utilities
 */

import {
  satoshisToBTC,
  btcToSatoshis,
  formatBTC,
  formatSatoshisAsBTC,
  formatAUD,
  formatNumber,
  btcToAUD,
  satoshisToAUD,
  truncateAddress,
  formatTimestamp,
  getRelativeTime,
  sanitizeNumericInput,
  formatPercentage,
} from '../format';

describe('Bitcoin conversion utilities', () => {
  describe('satoshisToBTC', () => {
    it('should convert satoshis to BTC correctly', () => {
      expect(satoshisToBTC(100000000)).toBe(1);
      expect(satoshisToBTC(50000000)).toBe(0.5);
      expect(satoshisToBTC(1000)).toBe(0.00001);
      expect(satoshisToBTC(0)).toBe(0);
    });

    it('should handle large amounts', () => {
      expect(satoshisToBTC(2100000000000000)).toBe(21000000); // Max BTC supply
    });

    it('should handle decimal precision', () => {
      expect(satoshisToBTC(12345678)).toBe(0.12345678);
    });
  });

  describe('btcToSatoshis', () => {
    it('should convert BTC to satoshis correctly', () => {
      expect(btcToSatoshis(1)).toBe(100000000);
      expect(btcToSatoshis(0.5)).toBe(50000000);
      expect(btcToSatoshis(0.00001)).toBe(1000);
      expect(btcToSatoshis(0)).toBe(0);
    });

    it('should round properly', () => {
      expect(btcToSatoshis(0.123456789)).toBe(12345679); // Rounds up
      expect(btcToSatoshis(0.123456784)).toBe(12345678); // Rounds down
    });

    it('should be inverse of satoshisToBTC', () => {
      const btc = 1.23456789;
      const satoshis = btcToSatoshis(btc);
      expect(satoshisToBTC(satoshis)).toBeCloseTo(btc, 8);
    });
  });
});

describe('Bitcoin formatting utilities', () => {
  describe('formatBTC', () => {
    it('should format BTC with proper decimal places', () => {
      expect(formatBTC(1.0)).toBe('1.00');
      expect(formatBTC(0.5)).toBe('0.50');
      expect(formatBTC(0.12345678)).toBe('0.12345678');
      expect(formatBTC(0)).toBe('0.00');
      expect(formatBTC(1.12300000)).toBe('1.123');
    });

    it('should respect maxDecimals parameter', () => {
      expect(formatBTC(0.123456789, 4)).toBe('0.1235'); // Rounds to 4 decimals
      expect(formatBTC(1.0, 2)).toBe('1.00');
    });

    it('should handle very small amounts', () => {
      expect(formatBTC(0.00000001)).toBe('0.00000001'); // 1 satoshi
    });
  });

  describe('formatSatoshisAsBTC', () => {
    it('should convert and format satoshis correctly', () => {
      expect(formatSatoshisAsBTC(100000000)).toBe('1.00');
      expect(formatSatoshisAsBTC(50000000)).toBe('0.50');
      expect(formatSatoshisAsBTC(12345678)).toBe('0.12345678');
      expect(formatSatoshisAsBTC(0)).toBe('0.00');
    });
  });
});

describe('Currency formatting utilities', () => {
  describe('formatAUD', () => {
    it('should format AUD with currency symbol by default', () => {
      const result = formatAUD(100);
      expect(result).toContain('100');
      expect(result).toContain('$');
      expect(result).toMatch(/100\.00/);
    });

    it('should format without currency symbol when requested', () => {
      const result = formatAUD(100, false);
      expect(result).not.toContain('$');
      expect(result).toContain('100');
    });

    it('should format large amounts with thousands separators', () => {
      const result = formatAUD(1000000);
      expect(result).toMatch(/1,000,000/);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatNumber(999)).toBe('999');
    });
  });
});

describe('Currency conversion utilities', () => {
  describe('btcToAUD', () => {
    it('should convert BTC to AUD correctly', () => {
      expect(btcToAUD(1, 50000)).toBe(50000);
      expect(btcToAUD(0.5, 50000)).toBe(25000);
      expect(btcToAUD(2, 50000)).toBe(100000);
      expect(btcToAUD(0, 50000)).toBe(0);
      expect(btcToAUD(0.12345678, 50000)).toBeCloseTo(6172.839, 2);
    });
  });

  describe('satoshisToAUD', () => {
    it('should convert satoshis to AUD correctly', () => {
      expect(satoshisToAUD(100000000, 50000)).toBe(50000); // 1 BTC
      expect(satoshisToAUD(50000000, 50000)).toBe(25000);  // 0.5 BTC
      expect(satoshisToAUD(1000, 50000)).toBeCloseTo(0.50, 2); // 0.00001 BTC
    });
  });
});

describe('Address utilities', () => {
  describe('truncateAddress', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Example Bitcoin address

    it('should truncate addresses correctly', () => {
      const result = truncateAddress(address);
      expect(result).toBe('1A1zP1eP...v7DivfNa');
      expect(result.length).toBe(19); // 8 + 3 (dots) + 8
    });

    it('should use custom start and end character counts', () => {
      const result = truncateAddress(address, 4, 4);
      expect(result).toBe('1A1z...vfNa');
    });

    it('should not truncate short addresses', () => {
      const shortAddress = '1A1zP1eP';
      expect(truncateAddress(shortAddress, 4, 4)).toBe(shortAddress);
    });

    it('should handle edge case where address length equals start + end', () => {
      const shortAddress = '12345678';
      expect(truncateAddress(shortAddress, 4, 4)).toBe(shortAddress);
    });
  });
});

describe('Timestamp utilities', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp as readable date', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z').getTime();
      const result = formatTimestamp(timestamp);

      // Check that result contains date components
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });
  });

  describe('getRelativeTime', () => {
    const now = Date.now();

    it('should return "just now" for recent timestamps', () => {
      expect(getRelativeTime(now - 30000)).toBe('just now'); // 30 seconds ago
      expect(getRelativeTime(now - 59000)).toBe('just now'); // 59 seconds ago
    });

    it('should return minutes for timestamps within an hour', () => {
      expect(getRelativeTime(now - 60000)).toBe('1 minute ago');
      expect(getRelativeTime(now - 120000)).toBe('2 minutes ago');
      expect(getRelativeTime(now - 3540000)).toBe('59 minutes ago');
    });

    it('should return hours for timestamps within a day', () => {
      expect(getRelativeTime(now - 3600000)).toBe('1 hour ago');
      expect(getRelativeTime(now - 7200000)).toBe('2 hours ago');
      expect(getRelativeTime(now - 82800000)).toBe('23 hours ago');
    });

    it('should return days for older timestamps', () => {
      expect(getRelativeTime(now - 86400000)).toBe('1 day ago');
      expect(getRelativeTime(now - 172800000)).toBe('2 days ago');
      expect(getRelativeTime(now - 604800000)).toBe('7 days ago');
    });
  });
});

describe('Input validation utilities', () => {
  describe('sanitizeNumericInput', () => {
    it('should sanitize valid numeric input', () => {
      expect(sanitizeNumericInput('123')).toBe(123);
      expect(sanitizeNumericInput('123.45')).toBe(123.45);
      expect(sanitizeNumericInput('0.5')).toBe(0.5);
    });

    it('should remove non-numeric characters except decimal point', () => {
      expect(sanitizeNumericInput('$123.45')).toBe(123.45);
      expect(sanitizeNumericInput('1,234.56')).toBe(1234.56);
      expect(sanitizeNumericInput('abc123def')).toBe(123);
    });

    it('should handle whitespace', () => {
      expect(sanitizeNumericInput('  123.45  ')).toBe(123.45);
      expect(sanitizeNumericInput(' 1 2 3 ')).toBe(123);
    });

    it('should return null for invalid input', () => {
      expect(sanitizeNumericInput('abc')).toBeNull();
      expect(sanitizeNumericInput('')).toBeNull();
      expect(sanitizeNumericInput('   ')).toBeNull();
    });

    it('should handle decimal-only input', () => {
      expect(sanitizeNumericInput('.5')).toBe(0.5);
      expect(sanitizeNumericInput('0.5')).toBe(0.5);
    });
  });
});

describe('Percentage utilities', () => {
  describe('formatPercentage', () => {
    it('should format decimal values as percentages', () => {
      expect(formatPercentage(0.05)).toBe('5.00%');
      expect(formatPercentage(0.1)).toBe('10.00%');
      expect(formatPercentage(0.5)).toBe('50.00%');
      expect(formatPercentage(1)).toBe('100.00%');
    });

    it('should respect decimal places parameter', () => {
      expect(formatPercentage(0.12345, 0)).toBe('12%');
      expect(formatPercentage(0.12345, 1)).toBe('12.3%');
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 4)).toBe('12.3450%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('should handle values greater than 1', () => {
      expect(formatPercentage(2.5)).toBe('250.00%');
    });

    it('should handle negative values', () => {
      expect(formatPercentage(-0.05)).toBe('-5.00%');
    });
  });
});
