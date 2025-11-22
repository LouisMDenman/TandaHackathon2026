/**
 * Tests for Solana address detection and validation
 */

import {
  looksLikeSolanaAddress,
  isValidBase58,
  detectAndValidateAddress,
  isValidSolanaAddressFormat,
  getAddressDescription,
} from '../detectAddress';

// Real Solana addresses for testing
const VALID_ADDRESSES = {
  // System Program (commonly used address)
  systemProgram: '11111111111111111111111111111111',

  // Token Program
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',

  // Random valid addresses
  random1: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
  random2: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',

  // Metaplex Program
  metaplex: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
};

const INVALID_ADDRESSES = {
  tooShort: '11111',
  tooLong: '11111111111111111111111111111111111111111111111',
  invalidChars: '0OIl1111111111111111111111111111', // Contains invalid base58 chars (0, O, I, l)
  empty: '',
  withSpaces: '1111 1111 1111 1111 1111 1111 1111 1111',
  ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Ethereum address
};

describe('looksLikeSolanaAddress', () => {
  describe('Valid addresses', () => {
    it('should recognize system program address', () => {
      expect(looksLikeSolanaAddress(VALID_ADDRESSES.systemProgram)).toBe(true);
    });

    it('should recognize token program address', () => {
      expect(looksLikeSolanaAddress(VALID_ADDRESSES.tokenProgram)).toBe(true);
    });

    it('should recognize random valid address', () => {
      expect(looksLikeSolanaAddress(VALID_ADDRESSES.random1)).toBe(true);
      expect(looksLikeSolanaAddress(VALID_ADDRESSES.random2)).toBe(true);
    });

    it('should recognize metaplex program address', () => {
      expect(looksLikeSolanaAddress(VALID_ADDRESSES.metaplex)).toBe(true);
    });

    it('should handle address with whitespace after trimming', () => {
      const addressWithWhitespace = `  ${VALID_ADDRESSES.random1}  `;
      expect(looksLikeSolanaAddress(addressWithWhitespace.trim())).toBe(true);
    });
  });

  describe('Invalid addresses', () => {
    it('should reject address that is too short', () => {
      expect(looksLikeSolanaAddress(INVALID_ADDRESSES.tooShort)).toBe(false);
    });

    it('should reject address that is too long', () => {
      expect(looksLikeSolanaAddress(INVALID_ADDRESSES.tooLong)).toBe(false);
    });

    it('should reject address with invalid base58 characters', () => {
      expect(looksLikeSolanaAddress(INVALID_ADDRESSES.invalidChars)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(looksLikeSolanaAddress(INVALID_ADDRESSES.empty)).toBe(false);
    });

    it('should reject Ethereum address', () => {
      expect(looksLikeSolanaAddress(INVALID_ADDRESSES.ethereum)).toBe(false);
    });

    it('should reject random text', () => {
      expect(looksLikeSolanaAddress('not a solana address')).toBe(false);
    });
  });
});

describe('isValidBase58', () => {
  it('should validate strings with only base58 characters', () => {
    expect(isValidBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')).toBe(true);
    expect(isValidBase58(VALID_ADDRESSES.systemProgram)).toBe(true);
    expect(isValidBase58(VALID_ADDRESSES.tokenProgram)).toBe(true);
  });

  it('should reject strings with invalid base58 characters', () => {
    expect(isValidBase58('0')).toBe(false); // Invalid: 0
    expect(isValidBase58('O')).toBe(false); // Invalid: O
    expect(isValidBase58('I')).toBe(false); // Invalid: I
    expect(isValidBase58('l')).toBe(false); // Invalid: l
    expect(isValidBase58('0x123')).toBe(false); // Contains '0' and 'x'
  });
});

describe('detectAndValidateAddress', () => {
  describe('Valid addresses', () => {
    it('should validate system program address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.systemProgram);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.systemProgram);
      expect(result.network).toBe('mainnet');
      expect(result.error).toBeUndefined();
    });

    it('should validate token program address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.tokenProgram);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.tokenProgram);
      expect(result.network).toBe('mainnet');
      expect(result.error).toBeUndefined();
    });

    it('should validate random addresses', async () => {
      const result1 = await detectAndValidateAddress(VALID_ADDRESSES.random1);
      expect(result1.valid).toBe(true);
      expect(result1.address).toBe(VALID_ADDRESSES.random1);

      const result2 = await detectAndValidateAddress(VALID_ADDRESSES.random2);
      expect(result2.valid).toBe(true);
      expect(result2.address).toBe(VALID_ADDRESSES.random2);
    });

    it('should handle address with whitespace', async () => {
      const result = await detectAndValidateAddress(`  ${VALID_ADDRESSES.random1}  `);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.random1);
      expect(result.error).toBeUndefined();
    });

    it('should validate metaplex program address', async () => {
      const result = await detectAndValidateAddress(VALID_ADDRESSES.metaplex);

      expect(result.valid).toBe(true);
      expect(result.address).toBe(VALID_ADDRESSES.metaplex);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid addresses', () => {
    it('should reject address that is too short', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.tooShort);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too short|at least/i);
    });

    it('should reject address that is too long', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.tooLong);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too long|at most/i);
    });

    it('should reject address with invalid characters', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.invalidChars);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid characters|base58/i);
    });

    it('should reject empty string', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.empty);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject Ethereum address', async () => {
      const result = await detectAndValidateAddress(INVALID_ADDRESSES.ethereum);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject random text', async () => {
      const result = await detectAndValidateAddress('not a solana address');

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});

describe('isValidSolanaAddressFormat', () => {
  it('should return true for valid format', () => {
    expect(isValidSolanaAddressFormat(VALID_ADDRESSES.systemProgram)).toBe(true);
    expect(isValidSolanaAddressFormat(VALID_ADDRESSES.tokenProgram)).toBe(true);
    expect(isValidSolanaAddressFormat(VALID_ADDRESSES.random1)).toBe(true);
  });

  it('should return false for invalid format', () => {
    expect(isValidSolanaAddressFormat(INVALID_ADDRESSES.tooShort)).toBe(false);
    expect(isValidSolanaAddressFormat(INVALID_ADDRESSES.tooLong)).toBe(false);
    expect(isValidSolanaAddressFormat(INVALID_ADDRESSES.empty)).toBe(false);
    expect(isValidSolanaAddressFormat(INVALID_ADDRESSES.ethereum)).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isValidSolanaAddressFormat(`  ${VALID_ADDRESSES.random1}  `)).toBe(true);
  });
});

describe('getAddressDescription', () => {
  it('should return description string', () => {
    const description = getAddressDescription();
    expect(description).toContain('Solana');
    expect(description).toContain('base58');
  });
});
