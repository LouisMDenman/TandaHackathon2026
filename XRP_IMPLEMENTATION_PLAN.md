# XRP Wallet Balance Checker - Implementation Plan

## Table of Contents
1. [Overview](#overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Technical Specifications](#technical-specifications)
4. [Implementation Steps](#implementation-steps)
5. [Testing Strategy](#testing-strategy)
6. [Integration Points](#integration-points)
7. [Dependencies](#dependencies)
8. [Success Criteria](#success-criteria)

---

## Overview

### Goal
Extend the existing multi-blockchain wallet balance checker to support XRP (Ripple), enabling users to:
- Enter XRP wallet addresses (classic or X-address format)
- Include optional destination tags for exchange wallets
- Retrieve and display XRP balance in both XRP and AUD
- Follow the existing architectural patterns used for Bitcoin, Ethereum, and Solana

### Scope
- **Address Formats**: Classic addresses (starting with 'r') and X-addresses (starting with 'X')
- **Destination Tags**: Support both embedded (X-address) and explicit format (rAddress:tag)
- **Network**: Mainnet only (testnet can be added later if needed)
- **RPC Provider**: Public Ripple servers (s1.ripple.com:51234) as primary
- **Price Data**: CoinGecko API for XRP/AUD conversion

---

## Architecture Analysis

### Current System Overview

The wallet balance checker follows a modular architecture with these key components:

```
Universal Wallet Detection Layer (lib/wallet/)
              ↓
    Blockchain-Specific Modules (lib/bitcoin/, lib/ethereum/, lib/solana/)
              ↓
         API Clients (lib/api/)
              ↓
      Frontend Integration (app/wallet/, components/)
```

### Patterns to Follow

1. **Module Structure**: Create `lib/xrp/` with separate files for types, constants, validation, and utilities
2. **API Integration**: JSON-RPC pattern (similar to Ethereum and Solana)
3. **Error Handling**: Retry logic with exponential backoff and fallback endpoints
4. **Type Safety**: Comprehensive TypeScript interfaces for all data structures
5. **Testing**: Unit tests with mocked API responses for all new modules

### Key Differences from Existing Implementations

| Feature | Bitcoin | Ethereum | Solana | **XRP (New)** |
|---------|---------|----------|--------|---------------|
| **Address Validation** | Complex (multiple formats) | EIP-55 checksum | Base58 | Base58 + X-address |
| **API Type** | REST (Blockstream) | JSON-RPC | JSON-RPC | JSON-RPC |
| **Unit Conversion** | Satoshi (10^8) | Wei (10^18) | Lamports (10^9) | Drops (10^6) |
| **HD Derivation** | Yes (xpub/ypub/zpub) | No | No | No |
| **Special Features** | Gap limit scanning | Contract detection | Server proxy | Destination tags |

---

## Technical Specifications

### XRP Address Formats

#### Classic Address
- **Format**: Base58-encoded, 25-34 characters
- **Prefix**: Always starts with 'r'
- **Example**: `rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h`
- **Checksum**: 4-byte checksum (similar to Bitcoin)
- **Base58 Alphabet**: `rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz`

#### X-Address
- **Format**: Base58-encoded with embedded destination tag
- **Prefix**: Always starts with 'X'
- **Example**: `X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4`
- **Benefits**: Combines address + destination tag + network in single string
- **Encoding**: Uses tag 0x05 for mainnet, 0x04 for testnet

#### Destination Tags
- **Purpose**: Route payments to specific accounts at exchanges/services
- **Range**: 0 to 2^32-1 (unsigned 32-bit integer)
- **Formats Supported**:
  - Embedded in X-address: `X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4`
  - Explicit with colon: `rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:12345`
  - Separate input field (optional future enhancement)

### JSON-RPC API Specification

#### Endpoint Configuration
- **Primary**: `https://s1.ripple.com:51234/`
- **Fallback**: `https://s2.ripple.com:51234/`
- **Alternative Options**:
  - `https://xrplcluster.com/` (community cluster)
  - `https://xrpl.ws/` (WebSocket also available)

#### Request Format
```json
{
  "method": "account_info",
  "params": [
    {
      "account": "rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h",
      "ledger_index": "validated",
      "strict": true
    }
  ]
}
```

#### Successful Response
```json
{
  "result": {
    "account_data": {
      "Account": "rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h",
      "Balance": "1000000000",
      "Flags": 0,
      "LedgerEntryType": "AccountRoot",
      "OwnerCount": 0,
      "PreviousTxnID": "...",
      "PreviousTxnLgrSeq": 12345,
      "Sequence": 1
    },
    "ledger_current_index": 123456,
    "validated": true,
    "status": "success"
  }
}
```

#### Error Response (Account Not Found)
```json
{
  "result": {
    "error": "actNotFound",
    "error_code": 19,
    "error_message": "Account not found.",
    "request": { ... },
    "status": "error"
  }
}
```

### Unit Conversion
- **Base Unit**: Drops (smallest unit)
- **Standard Unit**: XRP
- **Conversion**: 1 XRP = 1,000,000 drops (10^6)
- **Precision**: Display to 6 decimal places
- **Reserve**: Minimum account reserve is 10 XRP (10,000,000 drops)

### Price Data
- **Source**: CoinGecko API
- **Endpoint**: `/simple/price?ids=ripple&vs_currencies=aud`
- **Cache**: 60-second TTL (same as BTC/ETH/SOL)
- **Fallback**: Use expired cache if API fails

---

## Implementation Steps

### Phase 1: Core XRP Module Setup

#### Step 1.1: Create `lib/xrp/types.ts`

Define TypeScript interfaces for XRP-specific data structures:

```typescript
export type NetworkType = 'mainnet' | 'testnet';
export type AddressType = 'classic' | 'x-address';

export interface XRPAddressInfo {
  address: string;
  valid: boolean;
  network: NetworkType;
  addressType: AddressType;
  destinationTag?: number;
  error?: string;
}

export interface XRPBalance {
  address: string;
  balance: number; // in drops
  balanceInXrp: number;
  status: 'success' | 'error';
  error?: string;
  accountExists?: boolean;
  ownerCount?: number;
}

export interface XRPPrice {
  aud: number;
  timestamp: number;
}

export interface AccountInfoResult {
  account_data: {
    Account: string;
    Balance: string;
    Flags: number;
    LedgerEntryType: string;
    OwnerCount: number;
    Sequence: number;
  };
  ledger_current_index: number;
  validated: boolean;
}
```

#### Step 1.2: Create `lib/xrp/constants.ts`

Define configuration constants and RPC endpoints:

```typescript
export const RPC_ENDPOINTS = {
  primary: 'https://s1.ripple.com:51234/',
  fallbacks: [
    'https://s2.ripple.com:51234/',
    'https://xrplcluster.com/'
  ]
};

export const XRP_CONSTANTS = {
  DROPS_PER_XRP: 1000000,
  MIN_ACCOUNT_RESERVE: 10000000, // 10 XRP in drops
  BASE_RESERVE: 10000000,
  OWNER_RESERVE: 2000000, // 2 XRP per object
  ADDRESS_LENGTH_MIN: 25,
  ADDRESS_LENGTH_MAX: 35,
  MAX_DESTINATION_TAG: 4294967295, // 2^32 - 1
};

export const ADDRESS_PATTERNS = {
  CLASSIC: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  X_ADDRESS: /^X[1-9A-HJ-NP-Za-km-z]{46}$/,
  WITH_TAG: /^(r[1-9A-HJ-NP-Za-km-z]{24,34}):(\d+)$/,
};

export const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};
```

#### Step 1.3: Create `lib/xrp/utils.ts`

Utility functions for conversions and parsing:

```typescript
import { XRP_CONSTANTS } from './constants';

/**
 * Convert drops to XRP
 * @param drops - Amount in drops
 * @returns Amount in XRP (decimal)
 */
export function dropsToXrp(drops: number | string): number {
  const dropsNum = typeof drops === 'string' ? parseInt(drops, 10) : drops;
  return dropsNum / XRP_CONSTANTS.DROPS_PER_XRP;
}

/**
 * Convert XRP to drops
 * @param xrp - Amount in XRP
 * @returns Amount in drops (integer)
 */
export function xrpToDrops(xrp: number): number {
  return Math.round(xrp * XRP_CONSTANTS.DROPS_PER_XRP);
}

/**
 * Format XRP amount for display
 * @param xrp - Amount in XRP
 * @returns Formatted string with appropriate decimals
 */
export function formatXrp(xrp: number): string {
  if (xrp === 0) return '0 XRP';
  if (xrp < 0.000001) return '<0.000001 XRP';
  return `${xrp.toFixed(6).replace(/\.?0+$/, '')} XRP`;
}

/**
 * Parse destination tag from address string
 * @param input - Address string (may include :tag)
 * @returns {address, destinationTag}
 */
export function parseAddressWithTag(input: string): {
  address: string;
  destinationTag?: number;
} {
  const match = input.match(/^([rX][1-9A-HJ-NP-Za-km-z]+):(\d+)$/);

  if (match) {
    const tag = parseInt(match[2], 10);
    if (tag >= 0 && tag <= XRP_CONSTANTS.MAX_DESTINATION_TAG) {
      return { address: match[1], destinationTag: tag };
    }
  }

  return { address: input };
}

/**
 * Calculate total reserve requirement
 * @param ownerCount - Number of objects owned by account
 * @returns Required reserve in drops
 */
export function calculateReserve(ownerCount: number): number {
  return XRP_CONSTANTS.BASE_RESERVE + (ownerCount * XRP_CONSTANTS.OWNER_RESERVE);
}
```

#### Step 1.4: Create `lib/xrp/detectAddress.ts`

Address validation with checksum verification:

```typescript
import { isValidClassicAddress, isValidXAddress, classicAddressToXAddress, xAddressToClassicAddress } from 'xrpl';
import { XRPAddressInfo, NetworkType, AddressType } from './types';
import { ADDRESS_PATTERNS } from './constants';
import { parseAddressWithTag } from './utils';

/**
 * Detect and validate XRP address
 * @param input - Address string (classic, X-address, or with tag)
 * @returns Address validation info
 */
export async function detectAndValidateXrpAddress(input: string): Promise<XRPAddressInfo> {
  const trimmed = input.trim();

  // Parse potential destination tag
  const { address, destinationTag } = parseAddressWithTag(trimmed);

  // Detect address type
  if (ADDRESS_PATTERNS.CLASSIC.test(address)) {
    return validateClassicAddress(address, destinationTag);
  } else if (ADDRESS_PATTERNS.X_ADDRESS.test(address)) {
    return validateXAddress(address);
  }

  return {
    address: trimmed,
    valid: false,
    network: 'mainnet',
    addressType: 'classic',
    error: 'Invalid XRP address format',
  };
}

/**
 * Validate classic XRP address (starts with 'r')
 */
function validateClassicAddress(address: string, destinationTag?: number): XRPAddressInfo {
  try {
    const isValid = isValidClassicAddress(address);

    if (!isValid) {
      return {
        address,
        valid: false,
        network: 'mainnet',
        addressType: 'classic',
        error: 'Invalid classic address checksum',
      };
    }

    return {
      address,
      valid: true,
      network: 'mainnet', // Classic addresses don't encode network
      addressType: 'classic',
      destinationTag,
    };
  } catch (error) {
    return {
      address,
      valid: false,
      network: 'mainnet',
      addressType: 'classic',
      error: error instanceof Error ? error.message : 'Address validation failed',
    };
  }
}

/**
 * Validate X-address (starts with 'X')
 */
function validateXAddress(address: string): XRPAddressInfo {
  try {
    const isValid = isValidXAddress(address);

    if (!isValid) {
      return {
        address,
        valid: false,
        network: 'mainnet',
        addressType: 'x-address',
        error: 'Invalid X-address format',
      };
    }

    // Decode X-address to get classic address, tag, and network
    const decoded = xAddressToClassicAddress(address, false);

    return {
      address: decoded.classicAddress, // Store classic address for API calls
      valid: true,
      network: decoded.test ? 'testnet' : 'mainnet',
      addressType: 'x-address',
      destinationTag: decoded.tag === false ? undefined : decoded.tag,
    };
  } catch (error) {
    return {
      address,
      valid: false,
      network: 'mainnet',
      addressType: 'x-address',
      error: error instanceof Error ? error.message : 'X-address validation failed',
    };
  }
}

/**
 * Convert classic address to X-address
 */
export function toXAddress(classicAddress: string, destinationTag?: number, isTestnet = false): string {
  return classicAddressToXAddress(classicAddress, destinationTag || false, isTestnet);
}
```

---

### Phase 2: API Integration

#### Step 2.1: Create `lib/api/xrp.ts`

JSON-RPC client for XRP balance fetching:

```typescript
import { XRPBalance, AccountInfoResult } from '../xrp/types';
import { RPC_ENDPOINTS, API_CONFIG } from '../xrp/constants';
import { dropsToXrp } from '../xrp/utils';

interface JsonRpcRequest {
  method: string;
  params: any[];
}

interface JsonRpcResponse {
  result?: any;
  error?: {
    error: string;
    error_code: number;
    error_message: string;
  };
}

/**
 * Fetch XRP balance for an address
 * @param address - Classic XRP address (r...)
 * @returns Balance information
 */
export async function fetchXrpBalance(address: string): Promise<XRPBalance> {
  const endpoints = [RPC_ENDPOINTS.primary, ...RPC_ENDPOINTS.fallbacks];
  let lastError: Error | undefined;

  for (const endpoint of endpoints) {
    try {
      const result = await fetchXrpBalanceFromEndpoint(address, endpoint);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`XRP RPC endpoint ${endpoint} failed:`, error);
      continue;
    }
  }

  return {
    address,
    balance: 0,
    balanceInXrp: 0,
    status: 'error',
    error: lastError?.message || 'All XRP RPC endpoints failed',
    accountExists: false,
  };
}

/**
 * Fetch balance from specific endpoint
 */
async function fetchXrpBalanceFromEndpoint(
  address: string,
  endpoint: string
): Promise<XRPBalance> {
  const request: JsonRpcRequest = {
    method: 'account_info',
    params: [
      {
        account: address,
        ledger_index: 'validated',
        strict: true,
      },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: JsonRpcResponse = await response.json();

    // Handle account not found
    if (data.error) {
      if (data.error.error === 'actNotFound') {
        return {
          address,
          balance: 0,
          balanceInXrp: 0,
          status: 'success',
          accountExists: false,
          error: 'Account not found or not activated',
        };
      }

      throw new Error(data.error.error_message || 'Unknown RPC error');
    }

    // Parse successful response
    const accountData = data.result.account_data;
    const balanceDrops = parseInt(accountData.Balance, 10);

    return {
      address,
      balance: balanceDrops,
      balanceInXrp: dropsToXrp(balanceDrops),
      status: 'success',
      accountExists: true,
      ownerCount: accountData.OwnerCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error fetching XRP balance');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch multiple balances (for future batch support)
 */
export async function fetchMultipleXrpBalances(
  addresses: string[]
): Promise<XRPBalance[]> {
  return Promise.all(addresses.map(addr => fetchXrpBalance(addr)));
}
```

#### Step 2.2: Update `lib/api/coingecko.ts`

Add XRP price fetching:

```typescript
// Add to existing file

export interface XRPPrice {
  aud: number;
  timestamp: number;
}

const xrpPriceCache: { price: XRPPrice | null; expiry: number } = {
  price: null,
  expiry: 0,
};

/**
 * Fetch current XRP price in AUD
 * @returns XRP price with timestamp
 */
export async function fetchXRPPrice(): Promise<XRPPrice> {
  const now = Date.now();

  // Return cached price if still valid
  if (xrpPriceCache.price && now < xrpPriceCache.expiry) {
    return xrpPriceCache.price;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=aud',
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price: XRPPrice = {
      aud: data.ripple?.aud || 0,
      timestamp: now,
    };

    // Cache for 60 seconds
    xrpPriceCache.price = price;
    xrpPriceCache.expiry = now + 60000;

    return price;
  } catch (error) {
    console.error('Error fetching XRP price:', error);

    // Return expired cache if available
    if (xrpPriceCache.price) {
      return xrpPriceCache.price;
    }

    // Return zero if no cache available
    return { aud: 0, timestamp: now };
  }
}
```

---

### Phase 3: Wallet Detection Integration

#### Step 3.1: Update `lib/wallet/detectWalletType.ts`

Add XRP to universal wallet detection:

```typescript
// Update type definition
export type WalletType = 'bitcoin' | 'ethereum' | 'solana' | 'xrp' | 'unknown';

// Update WalletInfo interface
export interface WalletInfo {
  walletType: WalletType;
  valid: boolean;
  bitcoinInfo?: BitcoinKeyInfo;
  ethereumInfo?: EthereumAddressInfo;
  solanaInfo?: SolanaAddressInfo;
  xrpInfo?: XRPAddressInfo; // Add this
}

// In detectWalletFormat function, add XRP detection
function detectWalletFormat(input: string): WalletType {
  const trimmed = input.trim();

  // Check for XRP addresses (classic or X-address)
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}(:\d+)?$/.test(trimmed)) {
    return 'xrp';
  }
  if (/^X[1-9A-HJ-NP-Za-km-z]{46}$/.test(trimmed)) {
    return 'xrp';
  }

  // ... existing checks for BTC, ETH, SOL ...

  return 'unknown';
}

// Update validateWallet function
export async function validateWallet(input: string): Promise<WalletInfo> {
  const format = detectWalletFormat(input);

  // ... existing cases for bitcoin, ethereum, solana ...

  if (format === 'xrp') {
    const xrpInfo = await detectAndValidateXrpAddress(input);
    return {
      walletType: 'xrp',
      valid: xrpInfo.valid,
      xrpInfo,
    };
  }

  return {
    walletType: 'unknown',
    valid: false,
  };
}
```

---

### Phase 4: Frontend Integration

#### Step 4.1: Update `app/wallet/page.tsx`

Add XRP handling to the main wallet page:

```typescript
// Update type
type CryptoType = 'BTC' | 'ETH' | 'SOL' | 'XRP';

// Add XRP handler function
const handleXrpCheck = async (address: string) => {
  setViewState('loading');
  setCryptoType('XRP');

  try {
    // Fetch balance
    const balanceResult = await fetchXrpBalance(address);

    if (balanceResult.status === 'error') {
      throw new Error(balanceResult.error || 'Failed to fetch XRP balance');
    }

    // Fetch price
    const priceData = await fetchXRPPrice();

    const totalXrp = balanceResult.balanceInXrp;
    const totalAudValue = totalXrp * priceData.aud;

    setTotalCrypto(totalXrp);
    setTotalAUD(totalAudValue);
    setAddressesScanned(1);

    if (!balanceResult.accountExists) {
      setErrorWarning('Account not found or not activated. XRP accounts need a minimum 10 XRP reserve to be activated.');
    }

    setViewState('results');
  } catch (error) {
    console.error('Error checking XRP balance:', error);
    setErrorWarning(error instanceof Error ? error.message : 'Failed to check XRP balance');
    setViewState('error');
  }
};

// Update the wallet check handler
const handleCheckWallet = async () => {
  const walletInfo = await validateWallet(walletInput);

  if (!walletInfo.valid) {
    setErrorWarning('Invalid wallet address or key');
    setViewState('error');
    return;
  }

  // ... existing cases ...

  if (walletInfo.walletType === 'xrp' && walletInfo.xrpInfo) {
    await handleXrpCheck(walletInfo.xrpInfo.address);
  }
};
```

#### Step 4.2: Update `components/BalanceDisplay.tsx` (if needed)

Check if there's any crypto-specific display logic that needs XRP support:

```typescript
// Add XRP to crypto type if not already
type CryptoType = 'BTC' | 'ETH' | 'SOL' | 'XRP';

// Update any display logic that's crypto-specific
const getCryptoLabel = (crypto: CryptoType) => {
  switch(crypto) {
    case 'BTC': return 'Bitcoin';
    case 'ETH': return 'Ethereum';
    case 'SOL': return 'Solana';
    case 'XRP': return 'XRP (Ripple)';
  }
};
```

---

### Phase 5: Testing

#### Step 5.1: Create `lib/xrp/__tests__/utils.test.ts`

Test utility functions:

```typescript
import { dropsToXrp, xrpToDrops, formatXrp, parseAddressWithTag, calculateReserve } from '../utils';
import { XRP_CONSTANTS } from '../constants';

describe('XRP Utils', () => {
  describe('dropsToXrp', () => {
    it('should convert drops to XRP correctly', () => {
      expect(dropsToXrp(1000000)).toBe(1);
      expect(dropsToXrp(500000)).toBe(0.5);
      expect(dropsToXrp(0)).toBe(0);
      expect(dropsToXrp('2000000')).toBe(2);
    });
  });

  describe('xrpToDrops', () => {
    it('should convert XRP to drops correctly', () => {
      expect(xrpToDrops(1)).toBe(1000000);
      expect(xrpToDrops(0.5)).toBe(500000);
      expect(xrpToDrops(0)).toBe(0);
      expect(xrpToDrops(100.123456)).toBe(100123456);
    });
  });

  describe('formatXrp', () => {
    it('should format XRP amounts correctly', () => {
      expect(formatXrp(1)).toBe('1 XRP');
      expect(formatXrp(0.5)).toBe('0.5 XRP');
      expect(formatXrp(0)).toBe('0 XRP');
      expect(formatXrp(123.456789)).toBe('123.456789 XRP');
      expect(formatXrp(100.100000)).toBe('100.1 XRP');
      expect(formatXrp(0.0000001)).toBe('<0.000001 XRP');
    });
  });

  describe('parseAddressWithTag', () => {
    it('should parse address without tag', () => {
      const result = parseAddressWithTag('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.address).toBe('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.destinationTag).toBeUndefined();
    });

    it('should parse address with tag', () => {
      const result = parseAddressWithTag('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:12345');
      expect(result.address).toBe('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.destinationTag).toBe(12345);
    });

    it('should reject invalid tags', () => {
      const result = parseAddressWithTag('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:999999999999');
      expect(result.destinationTag).toBeUndefined();
    });
  });

  describe('calculateReserve', () => {
    it('should calculate reserve correctly', () => {
      expect(calculateReserve(0)).toBe(10000000); // 10 XRP
      expect(calculateReserve(1)).toBe(12000000); // 12 XRP
      expect(calculateReserve(5)).toBe(20000000); // 20 XRP
    });
  });
});
```

#### Step 5.2: Create `lib/xrp/__tests__/detectAddress.test.ts`

Test address validation:

```typescript
import { detectAndValidateXrpAddress, toXAddress } from '../detectAddress';

describe('XRP Address Detection', () => {
  describe('Classic Addresses', () => {
    it('should validate correct classic address', async () => {
      const result = await detectAndValidateXrpAddress('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.valid).toBe(true);
      expect(result.addressType).toBe('classic');
      expect(result.network).toBe('mainnet');
    });

    it('should validate classic address with destination tag', async () => {
      const result = await detectAndValidateXrpAddress('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:12345');
      expect(result.valid).toBe(true);
      expect(result.destinationTag).toBe(12345);
    });

    it('should reject invalid classic address', async () => {
      const result = await detectAndValidateXrpAddress('rInvalidAddress123');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject address with invalid checksum', async () => {
      const result = await detectAndValidateXrpAddress('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4X'); // Wrong checksum
      expect(result.valid).toBe(false);
    });
  });

  describe('X-Addresses', () => {
    it('should validate correct X-address', async () => {
      const result = await detectAndValidateXrpAddress('X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4');
      expect(result.valid).toBe(true);
      expect(result.addressType).toBe('x-address');
    });

    it('should extract destination tag from X-address', async () => {
      const xAddress = toXAddress('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h', 12345);
      const result = await detectAndValidateXrpAddress(xAddress);
      expect(result.valid).toBe(true);
      expect(result.destinationTag).toBe(12345);
    });

    it('should reject invalid X-address', async () => {
      const result = await detectAndValidateXrpAddress('XInvalidXAddress123');
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace', async () => {
      const result = await detectAndValidateXrpAddress('  rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h  ');
      expect(result.valid).toBe(true);
    });

    it('should reject empty string', async () => {
      const result = await detectAndValidateXrpAddress('');
      expect(result.valid).toBe(false);
    });

    it('should reject non-XRP address formats', async () => {
      const result = await detectAndValidateXrpAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      expect(result.valid).toBe(false);
    });
  });
});
```

#### Step 5.3: Create `lib/api/__tests__/xrp.test.ts`

Test API client:

```typescript
import { fetchXrpBalance } from '../xrp';

describe('XRP API', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('fetchXrpBalance', () => {
    it('should fetch balance successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h',
              Balance: '100000000',
              OwnerCount: 0,
            },
          },
        }),
      });

      const result = await fetchXrpBalance('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(100);
      expect(result.accountExists).toBe(true);
    });

    it('should handle account not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          error: {
            error: 'actNotFound',
            error_code: 19,
            error_message: 'Account not found.',
          },
        }),
      });

      const result = await fetchXrpBalance('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');

      expect(result.status).toBe('success');
      expect(result.accountExists).toBe(false);
      expect(result.balanceInXrp).toBe(0);
    });

    it('should retry on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              account_data: {
                Account: 'rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h',
                Balance: '50000000',
                OwnerCount: 0,
              },
            },
          }),
        });

      const result = await fetchXrpBalance('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(50);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 40000))
      );

      const promise = fetchXrpBalance('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      jest.advanceTimersByTime(31000);

      const result = await promise;
      expect(result.status).toBe('error');

      jest.useRealTimers();
    });
  });
});
```

#### Step 5.4: Update `lib/wallet/__tests__/detectWalletType.test.ts`

Add XRP test cases:

```typescript
describe('detectWalletType', () => {
  // ... existing tests ...

  describe('XRP Detection', () => {
    it('should detect classic XRP address', async () => {
      const result = await validateWallet('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h');
      expect(result.walletType).toBe('xrp');
      expect(result.valid).toBe(true);
      expect(result.xrpInfo?.addressType).toBe('classic');
    });

    it('should detect X-address', async () => {
      const result = await validateWallet('X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4');
      expect(result.walletType).toBe('xrp');
      expect(result.valid).toBe(true);
      expect(result.xrpInfo?.addressType).toBe('x-address');
    });

    it('should detect classic address with destination tag', async () => {
      const result = await validateWallet('rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:12345');
      expect(result.walletType).toBe('xrp');
      expect(result.valid).toBe(true);
      expect(result.xrpInfo?.destinationTag).toBe(12345);
    });
  });
});
```

---

### Phase 6: Dependencies & Documentation

#### Step 6.1: Install Dependencies

```bash
npm install xrpl
```

The `xrpl` package provides:
- Address validation (classic and X-address)
- Encoding/decoding utilities
- Checksum verification
- Type definitions

#### Step 6.2: Run Tests

```bash
npm test
```

Verify all tests pass, including:
- Unit tests for XRP utils
- Address validation tests
- API client tests
- Integration tests for wallet detection

---

## Integration Points

### 1. Universal Wallet Detection
- **File**: `lib/wallet/detectWalletType.ts`
- **Changes**: Add XRP to `WalletType` union, add XRP detection logic
- **Impact**: Enables automatic routing to XRP handler

### 2. API Layer
- **Files**: `lib/api/xrp.ts`, `lib/api/coingecko.ts`
- **Changes**: New XRP client, add XRP price function
- **Impact**: Provides balance and price data

### 3. Frontend
- **File**: `app/wallet/page.tsx`
- **Changes**: Add `handleXrpCheck` function, update crypto type
- **Impact**: Enables UI to display XRP balances

### 4. Components
- **Files**: `components/WalletInput.tsx`, `components/BalanceDisplay.tsx`
- **Changes**: Ensure XRP type support (may be automatic)
- **Impact**: UI displays XRP correctly

---

## Dependencies

### Production Dependencies

```json
{
  "xrpl": "^3.0.0"
}
```

**Why `xrpl`?**
- Official XRP Ledger JavaScript library
- Provides address validation and encoding
- Includes TypeScript types
- Well-maintained and actively developed
- ~200KB gzipped (reasonable size)

### No Additional Dev Dependencies
- Use existing Jest + ts-jest setup for testing
- No additional build tools required

---

## Success Criteria

### Functional Requirements
- [ ] User can enter classic XRP address and see balance ✓
- [ ] User can enter X-address and see balance ✓
- [ ] User can enter address with destination tag (format: rAddress:tag) ✓
- [ ] Balance displays in XRP with correct decimals (6 places) ✓
- [ ] Balance displays in AUD using current exchange rate ✓
- [ ] Unfunded accounts show appropriate message ✓
- [ ] Invalid addresses show clear error messages ✓
- [ ] System uses fallback RPC endpoints on failure ✓

### Technical Requirements
- [ ] All unit tests pass ✓
- [ ] Test coverage >80% for new code ✓
- [ ] Follows existing architecture patterns ✓
- [ ] Type-safe TypeScript throughout ✓
- [ ] Error handling with retries ✓
- [ ] API timeout protection ✓
- [ ] Price caching (60s TTL) ✓

### Code Quality
- [ ] Consistent with existing code style ✓
- [ ] Proper JSDoc comments ✓
- [ ] No console errors or warnings ✓
- [ ] Handles edge cases gracefully ✓

---

## Implementation Checklist

### Phase 1: Core Module
- [ ] Create `lib/xrp/types.ts`
- [ ] Create `lib/xrp/constants.ts`
- [ ] Create `lib/xrp/utils.ts`
- [ ] Create `lib/xrp/detectAddress.ts`

### Phase 2: API Integration
- [ ] Create `lib/api/xrp.ts`
- [ ] Update `lib/api/coingecko.ts`

### Phase 3: Wallet Detection
- [ ] Update `lib/wallet/detectWalletType.ts`

### Phase 4: Frontend
- [ ] Update `app/wallet/page.tsx`
- [ ] Verify `components/WalletInput.tsx`
- [ ] Verify `components/BalanceDisplay.tsx`

### Phase 5: Testing
- [ ] Create `lib/xrp/__tests__/utils.test.ts`
- [ ] Create `lib/xrp/__tests__/detectAddress.test.ts`
- [ ] Create `lib/api/__tests__/xrp.test.ts`
- [ ] Update `lib/wallet/__tests__/detectWalletType.test.ts`

### Phase 6: Finalization
- [ ] Install `xrpl` dependency
- [ ] Run all tests
- [ ] Manual testing with real addresses
- [ ] Code review
- [ ] Documentation complete

---

## Testing Strategy

### Unit Tests
- **Utils**: Test all conversion and formatting functions
- **Validation**: Test address detection with valid/invalid inputs
- **API**: Test with mocked responses (success, errors, timeouts)

### Integration Tests
- **Wallet Detection**: Test full flow from input to wallet type detection
- **End-to-End**: Test complete balance checking flow

### Manual Testing
Use these real XRP addresses for testing:

**Funded Account**:
- Classic: `rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h` (Bitstamp)
- X-address: `X7AcgcsBL6XDcUb289X4mJ8djcdyKaB5K4` (same account)

**With Destination Tag**:
- `rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h:12345`

**Unfunded Account** (will show as not activated):
- Generate a new random address using the validation logic

---

## Risk Mitigation

### Potential Issues & Solutions

1. **RPC Endpoint Rate Limiting**
   - **Solution**: Multiple fallback endpoints, retry with exponential backoff

2. **X-Address Adoption**
   - **Solution**: Support both classic and X-address formats

3. **Destination Tag Confusion**
   - **Solution**: Clear error messages, support multiple input formats

4. **Price API Failures**
   - **Solution**: Cached pricing with fallback to expired cache

5. **Account Reserve Confusion**
   - **Solution**: Display helpful message for unfunded accounts

---

## Future Enhancements

### Phase 2 Features (Optional)
- [ ] Testnet support
- [ ] Transaction history
- [ ] NFT balance display
- [ ] Trust line balances (issued currencies)
- [ ] Account reserve breakdown
- [ ] QR code scanning for addresses
- [ ] Separate destination tag input field
- [ ] Address book/favorites

---

## References

### Documentation
- **XRP Ledger**: https://xrpl.org/
- **xrpl.js Library**: https://js.xrpl.org/
- **X-Address Format**: https://xrpaddress.info/
- **Public RPC Servers**: https://xrpl.org/public-servers.html
- **CoinGecko API**: https://www.coingecko.com/en/api

### Example Addresses
- **Ripple Genesis Account**: `rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh`
- **Bitstamp (with high balance)**: `rN7n7otQDd6FczFgLdlqtyMVrn3LUHcJ4h`

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Author**: Claude Code Implementation Plan Generator
