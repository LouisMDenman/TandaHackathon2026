/**
 * Tests for Ethereum address detection and validation (EIP-55)
 */

import {
  looksLikeEthereumAddress,
  toChecksumAddress,
  isValidChecksum,
  detectAndValidateAddress,
  isValidEthereumAddressFormat,
  normalizeAddress,
  getAddressDescription,
} from '../detectAddress';

// Real Ethereum addresses for testing (with known checksums)
const VALID_ADDRESSES = {
  // Vitalik Buterin's address (EIP-55 checksummed)
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  vitalikLower: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  vitalikUpper: '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045',

  // Null address (all zeros)
  null: '0x0000000000000000000000000000000000000000',

  // Random valid address (checksummed)
  random: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
  randomLower: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',

  // Another checksummed address
  another: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
};

const INVALID_ADDRESSES = {
  tooShort: '0x123',
  tooLong: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045FF',
  noPrefix: 'd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  invalidHex: '0xGGGG6BF26964aF9D7eEd9e03E53415D37aA96045',
  wrongChecksum: '0xd8da6BF26964aF9D7eEd9e03E53415D37aA96045', // lowercase 'd' should be 'D'
};

describe('looksLikeEthereumAddress', () => {
  describe('Valid addresses', () => {
    it('should recognize checksummed address', () => {
      expect(looksLikeEthereumAddress(VALID_ADDRESSES.vitalik)).toBe(true);
    });

    it('should recognize lowercase address', () => {
      expect(looksLikeEthereumAddress(VALID_ADDRESSES.vitalikLower)).toBe(true);
    });

    it('should recognize uppercase address', () => {
      expect(looksLikeEthereumAddress(VALID_ADDRESSES.vitalikUpper)).toBe(true);
    });

    it('should recognize null address', () => {
      expect(looksLikeEthereumAddress(VALID_ADDRESSES.null)).toBe(true);
    });

    it('should handle address with whitespace after trimming', () => {
      const addressWithWhitespace = `  ${VALID_ADDRESSES.vitalik}  `;
      expect(looksLikeEthereumAddress(addressWithWhitespace.trim())).toBe(true);
    });
  });

  describe('Invalid addresses', () => {
    it('should reject address that is too short', () => {
      expect(looksLikeEthereumAddress(INVALID_ADDRESSES.tooShort)).toBe(false);
    });

    it('should reject address that is too long', () => {
      expect(looksLikeEthereumAddress(INVALID_ADDRESSES.tooLong)).toBe(false);
    });

    it('should reject address without 0x prefix', () => {
      expect(looksLikeEthereumAddress(INVALID_ADDRESSES.noPrefix)).toBe(false);
    });

    it('should reject address with invalid hex characters', () => {
      expect(looksLikeEthereumAddress(INVALID_ADDRESSES.invalidHex)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(looksLikeEthereumAddress('')).toBe(false);
    });

    it('should reject random text', () => {
      expect(looksLikeEthereumAddress('not an address')).toBe(false);
    });
  });
});

describe('toChecksumAddress', () => {
  it('should convert lowercase address to checksummed format', async () => {
    const checksummed = await toChecksumAddress(VALID_ADDRESSES.vitalikLower);
    expect(checksummed).toBe(VALID_ADDRESSES.vitalik);
  });

  it('should preserve already checksummed address', async () => {
    const checksummed = await toChecksumAddress(VALID_ADDRESSES.vitalik);
    expect(checksummed).toBe(VALID_ADDRESSES.vitalik);
  });

  it('should convert uppercase address to checksummed format', async () => {
    const checksummed = await toChecksumAddress(VALID_ADDRESSES.vitalikUpper);
    expect(checksummed).toBe(VALID_ADDRESSES.vitalik);
  });

  it('should handle address with whitespace after trimming', async () => {
    const addressWithWhitespace = `  ${VALID_ADDRESSES.vitalikLower}  `;
    const checksummed = await toChecksumAddress(addressWithWhitespace.trim());
    expect(checksummed).toBe(VALID_ADDRESSES.vitalik);
  });

  it('should checksum null address correctly', async () => {
    const checksummed = await toChecksumAddress(VALID_ADDRESSES.null);
    expect(checksummed).toBe(VALID_ADDRESSES.null); // All zeros, no letters to capitalize
  });

  it('should checksum another address correctly', async () => {
    const checksummed = await toChecksumAddress(VALID_ADDRESSES.randomLower);
    expect(checksummed).toBe(VALID_ADDRESSES.random);
  });
});

describe('isValidChecksum', () => {
  describe('Valid checksums', () => {
    it('should validate correct checksum (Vitalik)', async () => {
      const isValid = await isValidChecksum(VALID_ADDRESSES.vitalik);
      expect(isValid).toBe(true);
    });

    it('should validate all lowercase address (checksum not required)', async () => {
      const isValid = await isValidChecksum(VALID_ADDRESSES.vitalikLower);
      expect(isValid).toBe(true);
    });

    it('should validate all uppercase address (checksum not required)', async () => {
      const isValid = await isValidChecksum(VALID_ADDRESSES.vitalikUpper);
      expect(isValid).toBe(true);
    });

    it('should validate another checksummed address', async () => {
      const isValid = await isValidChecksum(VALID_ADDRESSES.random);
      expect(isValid).toBe(true);
    });

    it('should validate null address', async () => {
      const isValid = await isValidChecksum(VALID_ADDRESSES.null);
      expect(isValid).toBe(true);
    });
  });

  describe('Invalid checksums', () => {
    it('should reject address with wrong checksum', async () => {
      const isValid = await isValidChecksum(INVALID_ADDRESSES.wrongChecksum);
      expect(isValid).toBe(false);
    });

    it('should reject mixed case with incorrect capitalization', async () => {
      // Create an address with wrong capitalization
      const wrongChecksum = '0xD8da6BF26964aF9D7eEd9e03E53415D37aA96045'; // 'D' should be 'd'
      const isValid = await isValidChecksum(wrongChecksum);
      expect(isValid).toBe(false);
    });
  });
});

describe('detectAndValidateAddress', () => {
  describe('Valid addresses', () => {
    it('should validate and checksum a lowercase address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.vitalikLower);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.vitalik); // Should be checksummed
      expect(result.network).toBe('mainnet');
      expect(result.error).toBeUndefined();
    });

    it('should validate an already checksummed address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.vitalik);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.vitalik);
      expect(result.network).toBe('mainnet');
      expect(result.error).toBeUndefined();
    });

    it('should validate all uppercase address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.vitalikUpper);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.vitalik); // Should be converted to checksummed
      expect(result.network).toBe('mainnet');
      expect(result.error).toBeUndefined();
    });

    it('should handle address with whitespace', async () => {
      const result = await detectAndValidateAddress(`  ${VALID_ADDRESSES.vitalikLower}  `);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.vitalik);
      expect(result.error).toBeUndefined();
    });

    it('should validate null address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.null);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.null);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid addresses', () => {
    it('should reject address with wrong format (too short)', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.tooShort);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/42 characters/i);
    });

    it('should reject address with wrong format (too long)', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.tooLong);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/42 characters/i);
    });

    it('should reject address without 0x prefix', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.noPrefix);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/42 characters|0x/i);
    });

    it('should reject address with invalid hex', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.invalidHex);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject address with invalid checksum', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.wrongChecksum);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/checksum/i);
    });

    it('should reject empty string', async () => {
      const result = await detectAndValidateAddress('');

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject random text', async () => {
      const result = await detectAndValidateAddress('not an ethereum address');

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});

describe('isValidEthereumAddressFormat', () => {
  it('should return true for valid format', () => {
    expect(isValidEthereumAddressFormat(VALID_ADDRESSES.vitalik)).toBe(true);
    expect(isValidEthereumAddressFormat(VALID_ADDRESSES.vitalikLower)).toBe(true);
    expect(isValidEthereumAddressFormat(VALID_ADDRESSES.null)).toBe(true);
  });

  it('should return false for invalid format', () => {
    expect(isValidEthereumAddressFormat(INVALID_ADDRESSES.tooShort)).toBe(false);
    expect(isValidEthereumAddressFormat(INVALID_ADDRESSES.noPrefix)).toBe(false);
    expect(isValidEthereumAddressFormat('')).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isValidEthereumAddressFormat(`  ${VALID_ADDRESSES.vitalik}  `)).toBe(true);
  });
});

describe('normalizeAddress', () => {
  it('should convert address to lowercase', () => {
    expect(normalizeAddress(VALID_ADDRESSES.vitalik)).toBe(VALID_ADDRESSES.vitalikLower);
  });

  it('should handle already lowercase address', () => {
    expect(normalizeAddress(VALID_ADDRESSES.vitalikLower)).toBe(VALID_ADDRESSES.vitalikLower);
  });

  it('should convert uppercase address', () => {
    expect(normalizeAddress(VALID_ADDRESSES.vitalikUpper)).toBe(VALID_ADDRESSES.vitalikLower);
  });
});

describe('getAddressDescription', () => {
  it('should return description string', () => {
    const description = getAddressDescription();
    expect(description).toContain('Ethereum');
    expect(description).toContain('0x');
  });
});
