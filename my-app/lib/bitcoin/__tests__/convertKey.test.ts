/**
 * Tests for extended public key conversion utilities
 */

import {
  convertToXpub,
  convertXpubToYpub,
  convertXpubToZpub,
  verifyKeyConversion,
  needsConversion,
  getVersionBytes,
  extractVersionBytes,
  getBitcoinNetwork,
  getNodeFromExtendedKey,
} from '../convertKey';
import { VERSION_BYTES } from '../constants';
import * as bitcoin from 'bitcoinjs-lib';

// Test keys for conversion testing
const xpubKey = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';

// Generate valid ypub and zpub from xpub for testing
const TEST_KEYS = {
  xpub: xpubKey,
  ypub: convertXpubToYpub(xpubKey),
  zpub: convertXpubToZpub(xpubKey),
};

describe('convertToXpub', () => {
  it('should return xpub unchanged', () => {
    const result = convertToXpub(TEST_KEYS.xpub, 'xpub');
    expect(result).toBe(TEST_KEYS.xpub);
  });

  it('should convert ypub to xpub format', () => {
    const result = convertToXpub(TEST_KEYS.ypub, 'ypub');

    expect(result).not.toBe(TEST_KEYS.ypub);
    expect(result.startsWith('xpub')).toBe(true);
  });

  it('should convert zpub to xpub format', () => {
    const result = convertToXpub(TEST_KEYS.zpub, 'zpub');

    expect(result).not.toBe(TEST_KEYS.zpub);
    expect(result.startsWith('xpub')).toBe(true);
  });

  it('should throw error for invalid key', () => {
    expect(() => {
      convertToXpub('invalid_key', 'ypub');
    }).toThrow();
  });

  it('should preserve cryptographic material during conversion', () => {
    const xpubFromYpub = convertToXpub(TEST_KEYS.ypub, 'ypub');

    // Verify the conversion maintained the same public key
    // Note: We compare xpub to xpub since verifyKeyConversion requires both keys to be parseable
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubFromYpub)).toBe(true);
  });
});

describe('convertXpubToYpub', () => {
  it('should convert xpub to ypub format', () => {
    const result = convertXpubToYpub(TEST_KEYS.xpub);

    expect(result).not.toBe(TEST_KEYS.xpub);
    expect(result.startsWith('ypub')).toBe(true);
  });

  it('should throw error for invalid key', () => {
    expect(() => {
      convertXpubToYpub('invalid_key');
    }).toThrow();
  });

  it('should throw error for non-xpub input', () => {
    expect(() => {
      convertXpubToYpub(TEST_KEYS.ypub);
    }).toThrow(/not an xpub/i);
  });

  it('should preserve cryptographic material', () => {
    const ypub = convertXpubToYpub(TEST_KEYS.xpub);
    const xpubFromYpub = convertToXpub(ypub, 'ypub');
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubFromYpub)).toBe(true);
  });

  it('should produce valid Base58Check encoding', () => {
    const ypub = convertXpubToYpub(TEST_KEYS.xpub);

    // Convert back to xpub for parsing (bip32 doesn't understand ypub version bytes)
    const xpubFromYpub = convertToXpub(ypub, 'ypub');
    expect(() => {
      getNodeFromExtendedKey(xpubFromYpub, 'mainnet');
    }).not.toThrow();
  });
});

describe('convertXpubToZpub', () => {
  it('should convert xpub to zpub format', () => {
    const result = convertXpubToZpub(TEST_KEYS.xpub);

    expect(result).not.toBe(TEST_KEYS.xpub);
    expect(result.startsWith('zpub')).toBe(true);
  });

  it('should throw error for invalid key', () => {
    expect(() => {
      convertXpubToZpub('invalid_key');
    }).toThrow();
  });

  it('should throw error for non-xpub input', () => {
    expect(() => {
      convertXpubToZpub(TEST_KEYS.zpub);
    }).toThrow(/not an xpub/i);
  });

  it('should preserve cryptographic material', () => {
    const zpub = convertXpubToZpub(TEST_KEYS.xpub);
    const xpubFromZpub = convertToXpub(zpub, 'zpub');
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubFromZpub)).toBe(true);
  });

  it('should produce valid Base58Check encoding', () => {
    const zpub = convertXpubToZpub(TEST_KEYS.xpub);

    // Convert back to xpub for parsing (bip32 doesn't understand zpub version bytes)
    const xpubFromZpub = convertToXpub(zpub, 'zpub');
    expect(() => {
      getNodeFromExtendedKey(xpubFromZpub, 'mainnet');
    }).not.toThrow();
  });
});

describe('verifyKeyConversion', () => {
  it('should verify correct conversions', () => {
    const ypub = convertXpubToYpub(TEST_KEYS.xpub);
    const xpubFromYpub = convertToXpub(ypub, 'ypub');
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubFromYpub)).toBe(true);

    const zpub = convertXpubToZpub(TEST_KEYS.xpub);
    const xpubFromZpub = convertToXpub(zpub, 'zpub');
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubFromZpub)).toBe(true);
  });

  it('should detect incorrect conversions', () => {
    // Using completely different keys should fail verification
    const result = verifyKeyConversion(TEST_KEYS.xpub, TEST_KEYS.zpub);
    expect(result).toBe(false);
  });

  it('should verify same key against itself', () => {
    expect(verifyKeyConversion(TEST_KEYS.xpub, TEST_KEYS.xpub)).toBe(true);
  });

  it('should handle invalid keys gracefully', () => {
    expect(verifyKeyConversion('invalid1', 'invalid2')).toBe(false);
  });
});

describe('needsConversion', () => {
  it('should return false for xpub', () => {
    expect(needsConversion('xpub')).toBe(false);
  });

  it('should return true for ypub', () => {
    expect(needsConversion('ypub')).toBe(true);
  });

  it('should return true for zpub', () => {
    expect(needsConversion('zpub')).toBe(true);
  });
});

describe('getVersionBytes', () => {
  it('should return correct version bytes for xpub', () => {
    expect(getVersionBytes('xpub')).toBe(VERSION_BYTES.xpub);
    expect(getVersionBytes('xpub')).toBe(0x0488b21e);
  });

  it('should return correct version bytes for ypub', () => {
    expect(getVersionBytes('ypub')).toBe(VERSION_BYTES.ypub);
    expect(getVersionBytes('ypub')).toBe(0x049d7cb2);
  });

  it('should return correct version bytes for zpub', () => {
    expect(getVersionBytes('zpub')).toBe(VERSION_BYTES.zpub);
    expect(getVersionBytes('zpub')).toBe(0x04b24746);
  });
});

describe('extractVersionBytes', () => {
  it('should extract correct version bytes from xpub', () => {
    const versionBytes = extractVersionBytes(TEST_KEYS.xpub);
    expect(versionBytes).toBe(VERSION_BYTES.xpub);
  });

  it('should extract correct version bytes from ypub', () => {
    const versionBytes = extractVersionBytes(TEST_KEYS.ypub);
    expect(versionBytes).toBe(VERSION_BYTES.ypub);
  });

  it('should extract correct version bytes from zpub', () => {
    const versionBytes = extractVersionBytes(TEST_KEYS.zpub);
    expect(versionBytes).toBe(VERSION_BYTES.zpub);
  });

  it('should throw error for invalid key', () => {
    expect(() => {
      extractVersionBytes('invalid_key');
    }).toThrow();
  });

  it('should match getVersionBytes for each key type', () => {
    expect(extractVersionBytes(TEST_KEYS.xpub)).toBe(getVersionBytes('xpub'));
    expect(extractVersionBytes(TEST_KEYS.ypub)).toBe(getVersionBytes('ypub'));
    expect(extractVersionBytes(TEST_KEYS.zpub)).toBe(getVersionBytes('zpub'));
  });
});

describe('getBitcoinNetwork', () => {
  it('should return mainnet network object', () => {
    const network = getBitcoinNetwork('mainnet');
    expect(network).toBe(bitcoin.networks.bitcoin);
  });

  it('should return testnet network object', () => {
    const network = getBitcoinNetwork('testnet');
    expect(network).toBe(bitcoin.networks.testnet);
  });

  it('should return correct network properties', () => {
    const mainnet = getBitcoinNetwork('mainnet');
    expect(mainnet.bech32).toBe('bc');

    const testnet = getBitcoinNetwork('testnet');
    expect(testnet.bech32).toBe('tb');
  });
});

describe('getNodeFromExtendedKey', () => {
  it('should create node from xpub', () => {
    const node = getNodeFromExtendedKey(TEST_KEYS.xpub, 'mainnet');

    expect(node.publicKey).toBeDefined();
    expect(node.chainCode).toBeDefined();
  });

  it('should create node from ypub after conversion', () => {
    // Convert ypub to xpub first (bip32 doesn't understand ypub version bytes)
    const xpubFromYpub = convertToXpub(TEST_KEYS.ypub, 'ypub');
    const node = getNodeFromExtendedKey(xpubFromYpub, 'mainnet');

    expect(node.publicKey).toBeDefined();
  });

  it('should create node from zpub after conversion', () => {
    // Convert zpub to xpub first (bip32 doesn't understand zpub version bytes)
    const xpubFromZpub = convertToXpub(TEST_KEYS.zpub, 'zpub');
    const node = getNodeFromExtendedKey(xpubFromZpub, 'mainnet');

    expect(node.publicKey).toBeDefined();
  });

  it('should throw error for invalid key', () => {
    expect(() => {
      getNodeFromExtendedKey('invalid_key', 'mainnet');
    }).toThrow();
  });

  it('should derive same public key from converted keys', () => {
    const xpubNode = getNodeFromExtendedKey(TEST_KEYS.xpub, 'mainnet');
    const ypub = convertXpubToYpub(TEST_KEYS.xpub);
    const xpubFromYpub = convertToXpub(ypub, 'ypub');
    const ypubNode = getNodeFromExtendedKey(xpubFromYpub, 'mainnet');

    expect(Buffer.from(xpubNode.publicKey).equals(Buffer.from(ypubNode.publicKey))).toBe(true);
    expect(Buffer.from(xpubNode.chainCode).equals(Buffer.from(ypubNode.chainCode))).toBe(true);
  });
});

describe('Conversion edge cases', () => {
  it('should handle conversion chain: xpub -> ypub -> xpub', () => {
    const ypub = convertXpubToYpub(TEST_KEYS.xpub);
    const xpubBack = convertToXpub(ypub, 'ypub');

    // Should produce same xpub (or at least same cryptographic material)
    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubBack)).toBe(true);
  });

  it('should handle conversion chain: xpub -> zpub -> xpub', () => {
    const zpub = convertXpubToZpub(TEST_KEYS.xpub);
    const xpubBack = convertToXpub(zpub, 'zpub');

    expect(verifyKeyConversion(TEST_KEYS.xpub, xpubBack)).toBe(true);
  });
});
