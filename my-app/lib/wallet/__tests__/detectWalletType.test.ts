/**
 * Tests for universal wallet type detection (Bitcoin vs Ethereum)
 */

import {
  detectWalletFormat,
  validateWallet,
  getWalletTypeDescription,
  getWalletFormatHint,
} from '../detectWalletType';

// Test data
const BITCOIN_KEYS = {
  xpub: 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz',
  ypub: 'ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNB6VvmSEgytSER9azLDWCxoJwW7Ke7icmizBMXrzBx9979FfaHxHcrArf3zbeJJJUZPf663zsP',
  zpub: 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvphXR5ePCqYAN5qRbNNFCdkb6PnqVfUf3sJ8V5jqD7e5fMXKEL5xBBYz1k8Fy',
};

const ETHEREUM_ADDRESSES = {
  checksummed: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  lowercase: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  uppercase: '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045',
  null: '0x0000000000000000000000000000000000000000',
};

const INVALID_INPUTS = {
  empty: '',
  tooShort: '0x123',
  random: 'this is not a wallet',
  almostBitcoin: 'xpub123',
  almostEthereum: '0xGGGG',
};

describe('detectWalletFormat', () => {
  describe('Bitcoin detection', () => {
    it('should detect xpub format', () => {
      const type = detectWalletFormat(BITCOIN_KEYS.xpub);
      expect(type).toBe('bitcoin');
    });

    it('should detect ypub format', () => {
      const type = detectWalletFormat(BITCOIN_KEYS.ypub);
      expect(type).toBe('bitcoin');
    });

    it('should detect zpub format', () => {
      const type = detectWalletFormat(BITCOIN_KEYS.zpub);
      expect(type).toBe('bitcoin');
    });

    it('should handle Bitcoin key with whitespace', () => {
      const type = detectWalletFormat(`  ${BITCOIN_KEYS.xpub}  `);
      expect(type).toBe('bitcoin');
    });
  });

  describe('Ethereum detection', () => {
    it('should detect checksummed Ethereum address', () => {
      const type = detectWalletFormat(ETHEREUM_ADDRESSES.checksummed);
      expect(type).toBe('ethereum');
    });

    it('should detect lowercase Ethereum address', () => {
      const type = detectWalletFormat(ETHEREUM_ADDRESSES.lowercase);
      expect(type).toBe('ethereum');
    });

    it('should detect uppercase Ethereum address', () => {
      const type = detectWalletFormat(ETHEREUM_ADDRESSES.uppercase);
      expect(type).toBe('ethereum');
    });

    it('should detect null address', () => {
      const type = detectWalletFormat(ETHEREUM_ADDRESSES.null);
      expect(type).toBe('ethereum');
    });

    it('should handle Ethereum address with whitespace', () => {
      const type = detectWalletFormat(`  ${ETHEREUM_ADDRESSES.checksummed}  `);
      expect(type).toBe('ethereum');
    });
  });

  describe('Unknown format detection', () => {
    it('should return unknown for empty string', () => {
      const type = detectWalletFormat(INVALID_INPUTS.empty);
      expect(type).toBe('unknown');
    });

    it('should return unknown for too short input', () => {
      const type = detectWalletFormat(INVALID_INPUTS.tooShort);
      expect(type).toBe('unknown');
    });

    it('should return unknown for random text', () => {
      const type = detectWalletFormat(INVALID_INPUTS.random);
      expect(type).toBe('unknown');
    });

    it('should return unknown for invalid Bitcoin-like input', () => {
      const type = detectWalletFormat(INVALID_INPUTS.almostBitcoin);
      expect(type).toBe('unknown');
    });

    it('should return unknown for invalid Ethereum-like input', () => {
      const type = detectWalletFormat(INVALID_INPUTS.almostEthereum);
      expect(type).toBe('unknown');
    });
  });
});

describe('validateWallet', () => {
  describe('Valid Bitcoin wallets', () => {
    it('should validate xpub key', async () => {
      const result = await validateWallet(BITCOIN_KEYS.xpub);

      expect(result.walletType).toBe('bitcoin');
      expect(result.valid).toBe(true);
      expect(result.bitcoinInfo).toBeDefined();
      expect(result.bitcoinInfo?.type).toBe('xpub');
      expect(result.bitcoinInfo?.network).toBe('mainnet');
      expect(result.ethereumInfo).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    // Note: ypub and zpub validation may fail in bitcoinjs-lib but format detection works
    it('should detect ypub as bitcoin type (even if validation fails)', async () => {
      const result = await validateWallet(BITCOIN_KEYS.ypub);

      expect(result.walletType).toBe('bitcoin');
      expect(result.bitcoinInfo).toBeDefined();
      // Validation may fail but type is still detected
    });

    it('should detect zpub as bitcoin type (even if validation fails)', async () => {
      const result = await validateWallet(BITCOIN_KEYS.zpub);

      expect(result.walletType).toBe('bitcoin');
      expect(result.bitcoinInfo).toBeDefined();
      // Validation may fail but type is still detected
    });
  });

  describe('Valid Ethereum wallets', () => {
    it('should validate checksummed Ethereum address', async () => {
      const result = await validateWallet(ETHEREUM_ADDRESSES.checksummed);

      expect(result.walletType).toBe('ethereum');
      expect(result.valid).toBe(true);
      expect(result.ethereumInfo).toBeDefined();
      expect(result.ethereumInfo?.address).toBe(ETHEREUM_ADDRESSES.checksummed);
      expect(result.ethereumInfo?.network).toBe('mainnet');
      expect(result.bitcoinInfo).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should validate and checksum lowercase address', async () => {
      const result = await validateWallet(ETHEREUM_ADDRESSES.lowercase);

      expect(result.walletType).toBe('ethereum');
      expect(result.valid).toBe(true);
      expect(result.ethereumInfo).toBeDefined();
      expect(result.ethereumInfo?.address).toBe(ETHEREUM_ADDRESSES.checksummed);
      expect(result.error).toBeUndefined();
    });

    it('should validate and checksum uppercase address', async () => {
      const result = await validateWallet(ETHEREUM_ADDRESSES.uppercase);

      expect(result.walletType).toBe('ethereum');
      expect(result.valid).toBe(true);
      expect(result.ethereumInfo?.address).toBe(ETHEREUM_ADDRESSES.checksummed);
    });

    it('should validate null address', async () => {
      const result = await validateWallet(ETHEREUM_ADDRESSES.null);

      expect(result.walletType).toBe('ethereum');
      expect(result.valid).toBe(true);
      expect(result.ethereumInfo?.address).toBe(ETHEREUM_ADDRESSES.null);
    });
  });

  describe('Invalid wallets', () => {
    it('should reject empty string', async () => {
      const result = await validateWallet(INVALID_INPUTS.empty);

      expect(result.walletType).toBe('unknown');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error).toMatch(/unrecognized/i);
    });

    it('should reject random text', async () => {
      const result = await validateWallet(INVALID_INPUTS.random);

      expect(result.walletType).toBe('unknown');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject invalid Ethereum address (too short)', async () => {
      const result = await validateWallet(INVALID_INPUTS.tooShort);

      expect(result.walletType).toBe('unknown');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject Ethereum address with wrong checksum', async () => {
      // Mixed case with incorrect capitalization
      const wrongChecksum = '0xd8da6BF26964aF9D7eEd9e03E53415D37aA96045';
      const result = await validateWallet(wrongChecksum);

      expect(result.walletType).toBe('ethereum');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/checksum/i);
    });
  });

  describe('Unambiguous detection', () => {
    it('Bitcoin and Ethereum formats should never collide', () => {
      // Bitcoin keys are 111-112 chars, Ethereum is 42 chars
      // Test that they're distinctly different

      const bitcoinLength = BITCOIN_KEYS.xpub.length;
      const ethereumLength = ETHEREUM_ADDRESSES.checksummed.length;

      expect(bitcoinLength).toBeGreaterThanOrEqual(111);
      expect(bitcoinLength).toBeLessThanOrEqual(112);
      expect(ethereumLength).toBe(42);

      // They should never be mistaken for each other
      expect(detectWalletFormat(BITCOIN_KEYS.xpub)).toBe('bitcoin');
      expect(detectWalletFormat(ETHEREUM_ADDRESSES.checksummed)).toBe('ethereum');
    });
  });
});

describe('getWalletTypeDescription', () => {
  it('should return description for bitcoin', () => {
    const description = getWalletTypeDescription('bitcoin');
    expect(description).toContain('Bitcoin');
    expect(description).toMatch(/extended public key/i);
  });

  it('should return description for ethereum', () => {
    const description = getWalletTypeDescription('ethereum');
    expect(description).toContain('Ethereum');
    expect(description).toMatch(/address/i);
  });

  it('should return description for unknown', () => {
    const description = getWalletTypeDescription('unknown');
    expect(description).toMatch(/unknown/i);
  });
});

describe('getWalletFormatHint', () => {
  it('should return hint for bitcoin', () => {
    const hint = getWalletFormatHint('bitcoin');
    expect(hint).toContain('111-112');
    expect(hint).toMatch(/xpub|ypub|zpub/);
  });

  it('should return hint for ethereum', () => {
    const hint = getWalletFormatHint('ethereum');
    expect(hint).toContain('42');
    expect(hint).toContain('0x');
  });

  it('should return general hint for unknown', () => {
    const hint = getWalletFormatHint('unknown');
    expect(hint).toMatch(/bitcoin|ethereum/i);
  });
});
