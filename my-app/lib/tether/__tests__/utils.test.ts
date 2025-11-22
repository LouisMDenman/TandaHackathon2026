/**
 * Tests for Tether (USDT) utility functions
 */

import {
  microUsdtToUsdt,
  usdtToMicroUsdt,
  microUsdtToString,
  hexToBigInt,
  padAddressTo32Bytes,
  encodeBalanceOfCall,
} from '../utils';

describe('microUsdtToUsdt', () => {
  it('should convert 1 USDT in micro-USDT to 1', () => {
    const oneUsdtInMicro = 1000000; // 10^6
    expect(microUsdtToUsdt(oneUsdtInMicro)).toBe(1);
  });

  it('should convert 0 micro-USDT to 0', () => {
    expect(microUsdtToUsdt(0)).toBe(0);
  });

  it('should convert fractional USDT correctly', () => {
    const halfUsdt = 500000; // 0.5 USDT
    expect(microUsdtToUsdt(halfUsdt)).toBe(0.5);
  });

  it('should handle very small amounts (1 micro-USDT)', () => {
    const oneMicroUsdt = 1;
    expect(microUsdtToUsdt(oneMicroUsdt)).toBe(0.000001);
  });

  it('should handle large amounts (1 million USDT)', () => {
    const oneMillionUsdt = 1000000000000; // 10^12
    expect(microUsdtToUsdt(oneMillionUsdt)).toBe(1000000);
  });

  it('should handle typical amounts (100 USDT)', () => {
    const hundredUsdt = 100000000; // 100 * 10^6
    expect(microUsdtToUsdt(hundredUsdt)).toBe(100);
  });

  it('should handle all 6 decimal places (0.123456 USDT)', () => {
    const precise = 123456;
    expect(microUsdtToUsdt(precise)).toBe(0.123456);
  });

  it('should handle 1000.50 USDT', () => {
    const amount = 1000500000; // 1000.5 * 10^6
    expect(microUsdtToUsdt(amount)).toBe(1000.5);
  });
});

describe('usdtToMicroUsdt', () => {
  it('should convert 1 USDT to micro-USDT', () => {
    const microUsdt = usdtToMicroUsdt(1);
    expect(microUsdt).toBe(1000000);
  });

  it('should convert 0 USDT to 0 micro-USDT', () => {
    const microUsdt = usdtToMicroUsdt(0);
    expect(microUsdt).toBe(0);
  });

  it('should convert fractional USDT (0.5)', () => {
    const microUsdt = usdtToMicroUsdt(0.5);
    expect(microUsdt).toBe(500000);
  });

  it('should handle large amounts (1 million USDT)', () => {
    const microUsdt = usdtToMicroUsdt(1000000);
    expect(microUsdt).toBe(1000000000000);
  });

  it('should handle small decimals (0.001)', () => {
    const microUsdt = usdtToMicroUsdt(0.001);
    expect(microUsdt).toBe(1000);
  });

  it('should floor sub-micro-USDT precision', () => {
    // USDT has 6 decimals, so 0.0000001 USDT is smaller than 1 micro-USDT
    const microUsdt = usdtToMicroUsdt(0.0000001);
    expect(microUsdt).toBe(0); // Rounds down to 0
  });

  it('should handle all 6 decimal places (0.123456)', () => {
    const microUsdt = usdtToMicroUsdt(0.123456);
    expect(microUsdt).toBe(123456);
  });

  it('should handle 1000.999999 USDT', () => {
    const microUsdt = usdtToMicroUsdt(1000.999999);
    expect(microUsdt).toBe(1000999999);
  });
});

describe('microUsdtToString', () => {
  it('should convert BigInt micro-USDT to string', () => {
    const oneUsdt = BigInt(1000000);
    expect(microUsdtToString(oneUsdt)).toBe('1000000');
  });

  it('should handle zero', () => {
    expect(microUsdtToString(BigInt(0))).toBe('0');
  });

  it('should handle large numbers', () => {
    const large = BigInt('999999999999999999999999');
    expect(microUsdtToString(large)).toBe('999999999999999999999999');
  });

  it('should preserve full precision', () => {
    const precise = BigInt('1234567890123456');
    expect(microUsdtToString(precise)).toBe('1234567890123456');
  });

  it('should handle 1 billion USDT', () => {
    const oneBillion = BigInt('1000000000000000'); // 10^15 micro-USDT
    expect(microUsdtToString(oneBillion)).toBe('1000000000000000');
  });
});

describe('hexToBigInt', () => {
  it('should convert hex string to BigInt', () => {
    const hex = '0x0';
    expect(hexToBigInt(hex)).toBe(BigInt(0));
  });

  it('should handle hex for 1 USDT (1000000)', () => {
    const hex = '0xf4240'; // 1000000 in hex
    expect(hexToBigInt(hex)).toBe(BigInt(1000000));
  });

  it('should handle large hex values', () => {
    const hex = '0xde0b6b3a7640000'; // 1 ETH in Wei (for comparison)
    expect(hexToBigInt(hex)).toBe(BigInt('1000000000000000000'));
  });

  it('should handle hex without 0x prefix', () => {
    const hex = 'f4240'; // 1000000 without 0x
    expect(hexToBigInt(hex)).toBe(BigInt(1000000));
  });
});

describe('padAddressTo32Bytes', () => {
  it('should pad Ethereum address to 32 bytes', () => {
    const address = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
    const padded = padAddressTo32Bytes(address);

    // Should be 66 characters: 0x + 64 hex chars (32 bytes)
    expect(padded).toHaveLength(66);
    expect(padded).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(padded).toBe('0x0000000000000000000000005754284f345afc66a98fbb0a0afe71e0f007b949');
  });

  it('should preserve the address at the end', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const padded = padAddressTo32Bytes(address);

    // Last 40 characters (20 bytes) should be the original address (lowercase)
    expect(padded.slice(-40).toLowerCase()).toBe(address.slice(2).toLowerCase());
  });

  it('should pad with leading zeros', () => {
    const address = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
    const padded = padAddressTo32Bytes(address);

    // Should start with 0x followed by zeros
    expect(padded.startsWith('0x000000000000000000000000')).toBe(true);
  });

  it('should handle checksummed addresses', () => {
    const checksummed = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const padded = padAddressTo32Bytes(checksummed);

    // Should be valid 32-byte hex
    expect(padded).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(padded).toHaveLength(66);
  });

  it('should handle lowercase addresses', () => {
    const lowercase = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const padded = padAddressTo32Bytes(lowercase);

    expect(padded).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(padded).toHaveLength(66);
  });

  it('should pad zero address correctly', () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const padded = padAddressTo32Bytes(zeroAddress);

    expect(padded).toBe('0x0000000000000000000000000000000000000000000000000000000000000000');
  });
});

describe('encodeBalanceOfCall', () => {
  it('should encode balanceOf function call correctly', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbA';
    const encoded = encodeBalanceOfCall(address);

    // Should start with function selector 0x70a08231
    expect(encoded.startsWith('0x70a08231')).toBe(true);

    // Total length should be 74: 0x (2) + selector (8) + padded address (64)
    expect(encoded).toHaveLength(74);

    // Should be valid hex
    expect(encoded).toMatch(/^0x[0-9a-f]{72}$/i);
  });

  it('should use correct function selector for balanceOf', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const encoded = encodeBalanceOfCall(address);

    // balanceOf(address) selector is 0x70a08231
    const selector = encoded.slice(0, 10);
    expect(selector).toBe('0x70a08231');
  });

  it('should include padded address after selector', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbA';
    const encoded = encodeBalanceOfCall(address);

    // Extract the address part (after selector)
    const addressPart = encoded.slice(10);

    // Should be 64 characters (32 bytes)
    expect(addressPart).toHaveLength(64);

    // Should end with the original address (lowercase, without 0x)
    expect(addressPart.endsWith(address.slice(2).toLowerCase())).toBe(true);
  });

  it('should handle checksummed addresses', () => {
    const checksummed = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const encoded = encodeBalanceOfCall(checksummed);

    expect(encoded).toHaveLength(74);
    expect(encoded).toMatch(/^0x70a08231[0-9a-f]{64}$/i);
  });

  it('should produce consistent output for same address', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbA';
    const encoded1 = encodeBalanceOfCall(address);
    const encoded2 = encodeBalanceOfCall(address);

    expect(encoded1).toBe(encoded2);
  });

  it('should produce different outputs for different addresses', () => {
    const address1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbA';
    const address2 = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    const encoded1 = encodeBalanceOfCall(address1);
    const encoded2 = encodeBalanceOfCall(address2);

    expect(encoded1).not.toBe(encoded2);

    // But both should have same selector
    expect(encoded1.slice(0, 10)).toBe(encoded2.slice(0, 10));
  });

  it('should encode zero address correctly', () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const encoded = encodeBalanceOfCall(zeroAddress);

    expect(encoded).toBe('0x70a082310000000000000000000000000000000000000000000000000000000000000000');
  });

  it('should handle Tether contract address', () => {
    // Using a known address for testing
    const tetherTreasury = '0x5754284f345afc66a98fbb0a0afe71e0f007b949';
    const encoded = encodeBalanceOfCall(tetherTreasury);

    expect(encoded).toHaveLength(74);
    expect(encoded.startsWith('0x70a08231')).toBe(true);
    expect(encoded.toLowerCase()).toContain(tetherTreasury.slice(2).toLowerCase());
  });
});

describe('Round-trip conversions', () => {
  it('should maintain precision through USDT <-> micro-USDT conversion', () => {
    const amounts = [0, 1, 0.5, 100, 1000, 0.123456, 999999.999999];

    amounts.forEach((usdt) => {
      const microUsdt = usdtToMicroUsdt(usdt);
      const backToUsdt = microUsdtToUsdt(microUsdt);
      expect(backToUsdt).toBeCloseTo(usdt, 6); // 6 decimal places precision
    });
  });

  it('should handle edge cases in conversions', () => {
    // Maximum safe integer for Number in JavaScript
    const maxSafeUsdt = 9007199254.740991; // ~9 billion USDT
    const microUsdt = usdtToMicroUsdt(maxSafeUsdt);
    const backToUsdt = microUsdtToUsdt(microUsdt);

    expect(backToUsdt).toBeCloseTo(maxSafeUsdt, 6);
  });
});
