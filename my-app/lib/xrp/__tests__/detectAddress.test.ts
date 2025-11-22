/**
 * Tests for XRP address detection and validation
 */

import { detectAndValidateXrpAddress, toXAddress } from '../detectAddress';

describe('XRP Address Detection', () => {
  describe('Classic Addresses', () => {
    it('should validate correct classic address', async () => {
      const result = await detectAndValidateXrpAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.valid).toBe(true);
      expect(result.addressType).toBe('classic');
      expect(result.network).toBe('mainnet');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
    });

    it('should validate classic address with destination tag', async () => {
      const result = await detectAndValidateXrpAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:12345');
      expect(result.valid).toBe(true);
      expect(result.destinationTag).toBe(12345);
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
    });

    it('should validate Bitstamp address', async () => {
      const result = await detectAndValidateXrpAddress('rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B');
      expect(result.valid).toBe(true);
      expect(result.addressType).toBe('classic');
    });

    it('should reject invalid classic address', async () => {
      const result = await detectAndValidateXrpAddress('rInvalidAddress123');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject address with invalid checksum', async () => {
      const result = await detectAndValidateXrpAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTX');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject address that does not start with r', async () => {
      const result = await detectAndValidateXrpAddress('1N7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.valid).toBe(false);
    });

    it('should reject address that is too short', async () => {
      const result = await detectAndValidateXrpAddress('rShortAddr');
      expect(result.valid).toBe(false);
    });
  });

  describe('X-Addresses', () => {
    it('should validate correct X-address', async () => {
      // Convert a known classic address to X-address
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      const result = await detectAndValidateXrpAddress(xAddress);

      expect(result.valid).toBe(true);
      expect(result.addressType).toBe('x-address');
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'); // Should return classic address
    });

    it('should extract destination tag from X-address', async () => {
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 12345);
      const result = await detectAndValidateXrpAddress(xAddress);

      expect(result.valid).toBe(true);
      expect(result.destinationTag).toBe(12345);
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
    });

    it('should handle X-address without destination tag', async () => {
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', undefined);
      const result = await detectAndValidateXrpAddress(xAddress);

      expect(result.valid).toBe(true);
      expect(result.destinationTag).toBeUndefined();
    });

    it('should reject invalid X-address', async () => {
      const result = await detectAndValidateXrpAddress('XInvalidXAddress123');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject X-address with invalid format', async () => {
      const result = await detectAndValidateXrpAddress('X123');
      expect(result.valid).toBe(false);
    });
  });

  describe('toXAddress conversion', () => {
    it('should convert classic address to X-address', () => {
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(xAddress).toMatch(/^X/);
      expect(xAddress.length).toBeGreaterThan(40);
    });

    it('should convert classic address with tag to X-address', () => {
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 12345);
      expect(xAddress).toMatch(/^X/);
    });

    it('should create different X-addresses for different tags', () => {
      const xAddress1 = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 100);
      const xAddress2 = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', 200);
      expect(xAddress1).not.toBe(xAddress2);
    });

    it('should create testnet X-address', () => {
      const xAddress = toXAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', undefined, true);
      expect(xAddress).toMatch(/^T/); // Testnet X-addresses start with 'T'
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace', async () => {
      const result = await detectAndValidateXrpAddress('  rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh  ');
      expect(result.valid).toBe(true);
      expect(result.address).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
    });

    it('should reject empty string', async () => {
      const result = await detectAndValidateXrpAddress('');
      expect(result.valid).toBe(false);
    });

    it('should reject non-XRP address formats', async () => {
      const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const result = await detectAndValidateXrpAddress(ethAddress);
      expect(result.valid).toBe(false);
    });

    it('should reject Bitcoin address', async () => {
      const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = await detectAndValidateXrpAddress(btcAddress);
      expect(result.valid).toBe(false);
    });

    it('should reject Solana address', async () => {
      const solAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      const result = await detectAndValidateXrpAddress(solAddress);
      expect(result.valid).toBe(false);
    });

    it('should handle malformed tag format', async () => {
      const result = await detectAndValidateXrpAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:abc');
      // Should not parse the tag, but might still validate the address part
      expect(result.destinationTag).toBeUndefined();
    });

    it('should handle multiple colons', async () => {
      const result = await detectAndValidateXrpAddress('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh:123:456');
      // Should not parse as valid format
      expect(result.destinationTag).toBeUndefined();
    });
  });

  describe('Real-world Addresses', () => {
    // These are actual XRP addresses from exchanges and known entities
    const realAddresses = [
      'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // Ripple Genesis
      'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // Bitstamp
      'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', // Poloniex
    ];

    realAddresses.forEach(address => {
      it(`should validate real address: ${address}`, async () => {
        const result = await detectAndValidateXrpAddress(address);
        expect(result.valid).toBe(true);
        expect(result.addressType).toBe('classic');
        expect(result.network).toBe('mainnet');
      });
    });
  });
});
