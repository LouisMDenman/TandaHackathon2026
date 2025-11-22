/**
 * Tests for Bitcoin address derivation
 */

import {
  publicKeyToAddress,
  deriveAddress,
  deriveAddresses,
  deriveExternalAddresses,
  deriveInternalAddresses,
  getAddressAtPath,
} from '../deriveAddresses';
import { getNodeFromExtendedKey, convertXpubToYpub, convertXpubToZpub } from '../convertKey';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

// Test keys
const xpubKey = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';

const TEST_KEYS = {
  xpub: xpubKey,
  ypub: convertXpubToYpub(xpubKey),
  zpub: convertXpubToZpub(xpubKey),
};

const network = bitcoin.networks.bitcoin;

describe('publicKeyToAddress', () => {
  const node = getNodeFromExtendedKey(TEST_KEYS.xpub, 'mainnet');
  const publicKey = Buffer.from(node.publicKey);

  it('should generate P2PKH address for xpub (Legacy)', () => {
    const address = publicKeyToAddress(publicKey, 'xpub', network);
    expect(address.startsWith('1')).toBe(true);
  });

  it('should generate P2SH-P2WPKH address for ypub (Nested SegWit)', () => {
    const address = publicKeyToAddress(publicKey, 'ypub', network);
    expect(address.startsWith('3')).toBe(true);
  });

  it('should generate P2WPKH address for zpub (Native SegWit)', () => {
    const address = publicKeyToAddress(publicKey, 'zpub', network);
    expect(address.startsWith('bc1')).toBe(true);
  });

  it('should generate different addresses for different key types', () => {
    const xpubAddr = publicKeyToAddress(publicKey, 'xpub', network);
    const ypubAddr = publicKeyToAddress(publicKey, 'ypub', network);
    const zpubAddr = publicKeyToAddress(publicKey, 'zpub', network);

    expect(xpubAddr).not.toBe(ypubAddr);
    expect(xpubAddr).not.toBe(zpubAddr);
    expect(ypubAddr).not.toBe(zpubAddr);
  });

  it('should throw error for unsupported key type', () => {
    expect(() => {
      publicKeyToAddress(publicKey, 'invalid' as any, network);
    }).toThrow(/unsupported/i);
  });
});

describe('deriveAddress', () => {
  const node = bip32.fromBase58(TEST_KEYS.xpub, network);

  it('should derive external address at index 0', () => {
    const address = deriveAddress(node, 0, 0, 'xpub', network);

    expect(address.path).toBe('m/0/0');
    expect(address.index).toBe(0);
    expect(address.chain).toBe('external');
    expect(address.address.startsWith('1')).toBe(true);
  });

  it('should derive internal address at index 0', () => {
    const address = deriveAddress(node, 1, 0, 'xpub', network);

    expect(address.path).toBe('m/1/0');
    expect(address.index).toBe(0);
    expect(address.chain).toBe('internal');
  });

  it('should derive different addresses for different indices', () => {
    const addr0 = deriveAddress(node, 0, 0, 'xpub', network);
    const addr1 = deriveAddress(node, 0, 1, 'xpub', network);
    const addr2 = deriveAddress(node, 0, 2, 'xpub', network);

    expect(addr0.address).not.toBe(addr1.address);
    expect(addr1.address).not.toBe(addr2.address);
    expect(addr0.address).not.toBe(addr2.address);
  });

  it('should derive different addresses for different chains', () => {
    const external = deriveAddress(node, 0, 0, 'xpub', network);
    const internal = deriveAddress(node, 1, 0, 'xpub', network);

    expect(external.address).not.toBe(internal.address);
    expect(external.chain).toBe('external');
    expect(internal.chain).toBe('internal');
  });

  it('should work with different key types', () => {
    const xpubAddr = deriveAddress(node, 0, 0, 'xpub', network);
    const ypubAddr = deriveAddress(node, 0, 0, 'ypub', network);
    const zpubAddr = deriveAddress(node, 0, 0, 'zpub', network);

    expect(xpubAddr.address.startsWith('1')).toBe(true);
    expect(ypubAddr.address.startsWith('3')).toBe(true);
    expect(zpubAddr.address.startsWith('bc1')).toBe(true);
  });
});

describe('deriveAddresses', () => {
  it('should derive 40 addresses (20 external + 20 internal)', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);

    expect(addresses).toHaveLength(40);
  });

  it('should derive 20 external addresses', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const external = addresses.filter(a => a.chain === 'external');

    expect(external).toHaveLength(20);
  });

  it('should derive 20 internal addresses', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const internal = addresses.filter(a => a.chain === 'internal');

    expect(internal).toHaveLength(20);
  });

  it('should have correct indices for external addresses', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const external = addresses.filter(a => a.chain === 'external');

    expect(external[0].index).toBe(0);
    expect(external[19].index).toBe(19);

    // Check all indices are sequential
    external.forEach((addr, i) => {
      expect(addr.index).toBe(i);
    });
  });

  it('should have correct indices for internal addresses', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const internal = addresses.filter(a => a.chain === 'internal');

    expect(internal[0].index).toBe(0);
    expect(internal[19].index).toBe(19);

    internal.forEach((addr, i) => {
      expect(addr.index).toBe(i);
    });
  });

  it('should derive all unique addresses', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const addressStrings = addresses.map(a => a.address);
    const uniqueAddresses = new Set(addressStrings);

    expect(uniqueAddresses.size).toBe(40);
  });

  it('should work with ypub keys', () => {
    const addresses = deriveAddresses(TEST_KEYS.ypub, 'ypub', network);

    expect(addresses).toHaveLength(40);
    addresses.forEach(addr => {
      expect(addr.address.startsWith('3')).toBe(true);
    });
  });

  it('should work with zpub keys', () => {
    const addresses = deriveAddresses(TEST_KEYS.zpub, 'zpub', network);

    expect(addresses).toHaveLength(40);
    addresses.forEach(addr => {
      expect(addr.address.startsWith('bc1')).toBe(true);
    });
  });

  it('should have correct path format', () => {
    const addresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);

    addresses.forEach(addr => {
      expect(addr.path).toMatch(/^m\/[01]\/\d+$/);
    });
  });
});

describe('deriveExternalAddresses', () => {
  it('should derive only external addresses', () => {
    const addresses = deriveExternalAddresses(TEST_KEYS.xpub, 'xpub', network);

    expect(addresses).toHaveLength(20);
    addresses.forEach(addr => {
      expect(addr.chain).toBe('external');
    });
  });

  it('should respect custom limit', () => {
    const addresses = deriveExternalAddresses(TEST_KEYS.xpub, 'xpub', network, 5);

    expect(addresses).toHaveLength(5);
  });

  it('should derive addresses with sequential indices', () => {
    const addresses = deriveExternalAddresses(TEST_KEYS.xpub, 'xpub', network, 10);

    addresses.forEach((addr, i) => {
      expect(addr.index).toBe(i);
      expect(addr.path).toBe(`m/0/${i}`);
    });
  });

  it('should work with different key types', () => {
    const xpubAddrs = deriveExternalAddresses(TEST_KEYS.xpub, 'xpub', network, 5);
    const ypubAddrs = deriveExternalAddresses(TEST_KEYS.ypub, 'ypub', network, 5);
    const zpubAddrs = deriveExternalAddresses(TEST_KEYS.zpub, 'zpub', network, 5);

    xpubAddrs.forEach(addr => expect(addr.address.startsWith('1')).toBe(true));
    ypubAddrs.forEach(addr => expect(addr.address.startsWith('3')).toBe(true));
    zpubAddrs.forEach(addr => expect(addr.address.startsWith('bc1')).toBe(true));
  });
});

describe('deriveInternalAddresses', () => {
  it('should derive only internal addresses', () => {
    const addresses = deriveInternalAddresses(TEST_KEYS.xpub, 'xpub', network);

    expect(addresses).toHaveLength(20);
    addresses.forEach(addr => {
      expect(addr.chain).toBe('internal');
    });
  });

  it('should respect custom limit', () => {
    const addresses = deriveInternalAddresses(TEST_KEYS.xpub, 'xpub', network, 5);

    expect(addresses).toHaveLength(5);
  });

  it('should derive addresses with sequential indices', () => {
    const addresses = deriveInternalAddresses(TEST_KEYS.xpub, 'xpub', network, 10);

    addresses.forEach((addr, i) => {
      expect(addr.index).toBe(i);
      expect(addr.path).toBe(`m/1/${i}`);
    });
  });

  it('should work with different key types', () => {
    const xpubAddrs = deriveInternalAddresses(TEST_KEYS.xpub, 'xpub', network, 5);
    const ypubAddrs = deriveInternalAddresses(TEST_KEYS.ypub, 'ypub', network, 5);
    const zpubAddrs = deriveInternalAddresses(TEST_KEYS.zpub, 'zpub', network, 5);

    xpubAddrs.forEach(addr => expect(addr.address.startsWith('1')).toBe(true));
    ypubAddrs.forEach(addr => expect(addr.address.startsWith('3')).toBe(true));
    zpubAddrs.forEach(addr => expect(addr.address.startsWith('bc1')).toBe(true));
  });
});

describe('getAddressAtPath', () => {
  it('should get specific external address', () => {
    const address = getAddressAtPath(TEST_KEYS.xpub, 'xpub', network, 0, 5);

    expect(address.path).toBe('m/0/5');
    expect(address.index).toBe(5);
    expect(address.chain).toBe('external');
    expect(address.address).toBeTruthy();
  });

  it('should get specific internal address', () => {
    const address = getAddressAtPath(TEST_KEYS.xpub, 'xpub', network, 1, 10);

    expect(address.path).toBe('m/1/10');
    expect(address.index).toBe(10);
    expect(address.chain).toBe('internal');
    expect(address.address).toBeTruthy();
  });

  it('should match addresses from deriveAddresses', () => {
    const allAddresses = deriveAddresses(TEST_KEYS.xpub, 'xpub', network);
    const specificAddress = getAddressAtPath(TEST_KEYS.xpub, 'xpub', network, 0, 3);

    const matchingAddress = allAddresses.find(a => a.path === 'm/0/3');
    expect(specificAddress.address).toBe(matchingAddress?.address);
  });

  it('should work with all key types', () => {
    const xpubAddr = getAddressAtPath(TEST_KEYS.xpub, 'xpub', network, 0, 0);
    const ypubAddr = getAddressAtPath(TEST_KEYS.ypub, 'ypub', network, 0, 0);
    const zpubAddr = getAddressAtPath(TEST_KEYS.zpub, 'zpub', network, 0, 0);

    expect(xpubAddr.address.startsWith('1')).toBe(true);
    expect(ypubAddr.address.startsWith('3')).toBe(true);
    expect(zpubAddr.address.startsWith('bc1')).toBe(true);
  });
});

describe('Address derivation consistency', () => {
  it('should derive addresses consistently with getAddressAtPath', () => {
    const allAddresses = deriveExternalAddresses(TEST_KEYS.xpub, 'xpub', network, 10);

    for (let i = 0; i < 10; i++) {
      const singleAddress = getAddressAtPath(TEST_KEYS.xpub, 'xpub', network, 0, i);
      expect(allAddresses[i].address).toBe(singleAddress.address);
      expect(allAddresses[i].path).toBe(singleAddress.path);
    }
  });
});
