/**
 * Tests for XRP utility functions
 */

import { dropsToXrp, xrpToDrops, formatXrp, parseAddressWithTag, calculateReserve } from '../utils';
import { XRP_CONSTANTS } from '../constants';

describe('XRP Utils', () => {
  describe('dropsToXrp', () => {
    it('should convert drops to XRP correctly', () => {
      expect(dropsToXrp(1000000)).toBe(1);
      expect(dropsToXrp(500000)).toBe(0.5);
      expect(dropsToXrp(0)).toBe(0);
      expect(dropsToXrp(2500000)).toBe(2.5);
    });

    it('should handle string input', () => {
      expect(dropsToXrp('1000000')).toBe(1);
      expect(dropsToXrp('2000000')).toBe(2);
    });

    it('should handle large numbers', () => {
      expect(dropsToXrp(100000000)).toBe(100);
      expect(dropsToXrp(1000000000)).toBe(1000);
    });

    it('should handle small numbers', () => {
      expect(dropsToXrp(1)).toBe(0.000001);
      expect(dropsToXrp(10)).toBe(0.00001);
    });
  });

  describe('xrpToDrops', () => {
    it('should convert XRP to drops correctly', () => {
      expect(xrpToDrops(1)).toBe(1000000);
      expect(xrpToDrops(0.5)).toBe(500000);
      expect(xrpToDrops(0)).toBe(0);
      expect(xrpToDrops(2.5)).toBe(2500000);
    });

    it('should handle decimal precision', () => {
      expect(xrpToDrops(100.123456)).toBe(100123456);
      expect(xrpToDrops(0.000001)).toBe(1);
    });

    it('should round to nearest drop', () => {
      expect(xrpToDrops(1.0000005)).toBe(1000001);
      expect(xrpToDrops(1.0000004)).toBe(1000000);
    });
  });

  describe('formatXrp', () => {
    it('should format XRP amounts correctly', () => {
      expect(formatXrp(1)).toBe('1 XRP');
      expect(formatXrp(0.5)).toBe('0.5 XRP');
      expect(formatXrp(0)).toBe('0 XRP');
    });

    it('should remove trailing zeros', () => {
      expect(formatXrp(123.456789)).toBe('123.456789 XRP');
      expect(formatXrp(100.100000)).toBe('100.1 XRP');
      expect(formatXrp(50.000000)).toBe('50 XRP');
    });

    it('should handle very small amounts', () => {
      expect(formatXrp(0.0000001)).toBe('<0.000001 XRP');
      expect(formatXrp(0.0000009)).toBe('<0.000001 XRP');
    });

    it('should handle large amounts', () => {
      expect(formatXrp(1000000)).toBe('1000000 XRP');
      expect(formatXrp(123456.789)).toBe('123456.789 XRP');
    });
  });

  describe('parseAddressWithTag', () => {
    it('should parse address without tag', () => {
      const result = parseAddressWithTag('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.destinationTag).toBeUndefined();
    });

    it('should parse address with tag', () => {
      const result = parseAddressWithTag('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:12345');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.destinationTag).toBe(12345);
    });

    it('should parse address with tag 0', () => {
      const result = parseAddressWithTag('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:0');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.destinationTag).toBe(0);
    });

    it('should parse address with maximum tag value', () => {
      const maxTag = XRP_CONSTANTS.MAX_DESTINATION_TAG;
      const result = parseAddressWithTag(`rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:${maxTag}`);
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.destinationTag).toBe(maxTag);
    });

    it('should reject invalid tags (too large)', () => {
      const result = parseAddressWithTag('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:999999999999');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:999999999999');
      expect(result.destinationTag).toBeUndefined();
    });

    it('should reject negative tags', () => {
      const result = parseAddressWithTag('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:-1');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:-1');
      expect(result.destinationTag).toBeUndefined();
    });

    it('should handle X-addresses with tags', () => {
      const result = parseAddressWithTag('X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4:123');
      expect(result.address).toBe('X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4');
      expect(result.destinationTag).toBe(123);
    });
  });

  describe('calculateReserve', () => {
    it('should calculate reserve correctly', () => {
      expect(calculateReserve(0)).toBe(10000000); // 10 XRP
      expect(calculateReserve(1)).toBe(12000000); // 12 XRP
      expect(calculateReserve(5)).toBe(20000000); // 20 XRP
    });

    it('should calculate reserve for large owner counts', () => {
      expect(calculateReserve(10)).toBe(30000000); // 30 XRP
      expect(calculateReserve(100)).toBe(210000000); // 210 XRP
    });

    it('should use correct constants', () => {
      const reserve = calculateReserve(3);
      const expected = XRP_CONSTANTS.BASE_RESERVE + (3 * XRP_CONSTANTS.OWNER_RESERVE);
      expect(reserve).toBe(expected);
    });
  });
});
