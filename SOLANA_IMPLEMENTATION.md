# Solana Wallet Balance Checker Implementation

This document provides a comprehensive guide to the Solana wallet balance checking feature added to the application.

## Overview

The Solana implementation allows users to check the balance of Solana addresses (base58-encoded public keys) in real-time, fetching SOL balances and converting them to AUD.

## Architecture

The Solana implementation follows the same architectural pattern as the existing Ethereum implementation:
- **Single address checking** (no extended key derivation like Bitcoin)
- **JSON-RPC communication** with Solana nodes
- **Client-side validation** with async base58 decoding
- **Mainnet only** support

## File Structure

```
my-app/
├── lib/
│   ├── solana/                      # Solana-specific logic
│   │   ├── constants.ts             # RPC endpoints, network config
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── detectAddress.ts         # Address validation
│   │   └── __tests__/
│   │       └── detectAddress.test.ts
│   │
│   ├── api/                         # API clients
│   │   ├── solana.ts                # Solana JSON-RPC client
│   │   ├── coingecko.ts            # Updated with SOL pricing
│   │   └── __tests__/
│   │       └── solana.test.ts
│   │
│   └── wallet/                      # Universal wallet detection
│       ├── detectWalletType.ts      # Updated with Solana support
│       └── __tests__/
│           └── detectWalletType.test.ts
│
└── app/
    └── wallet/
        └── page.tsx                 # Updated with Solana UI
```

## Core Components

### 1. Constants (`lib/solana/constants.ts`)

Defines Solana network configuration and constants:

- **RPC Endpoints**: Primary (mainnet-beta) and fallback endpoints
- **API Configuration**: Timeout (30s), retries (3), retry delay (1s with exponential backoff)
- **Solana Constants**:
  - `LAMPORTS_PER_SOL`: 1,000,000,000 (10^9)
  - `ADDRESS_MIN_LENGTH`: 32 characters
  - `ADDRESS_MAX_LENGTH`: 44 characters
  - `BASE58_ALPHABET`: Valid base58 characters

### 2. Types (`lib/solana/types.ts`)

TypeScript interfaces for type safety:

```typescript
interface SolanaAddressInfo {
  address: string;
  valid: boolean;
  network: NetworkType;
  error?: string;
}

interface SolanaBalance {
  address: string;
  balance: number;        // in lamports
  balanceInSol: number;   // in SOL
  status: 'success' | 'error';
  error?: string;
}

interface SOLPrice {
  aud: number;
  timestamp: number;
}
```

### 3. Address Detection (`lib/solana/detectAddress.ts`)

Validates Solana addresses using:
- **Basic format checking**: Length (32-44 chars) and base58 character validation
- **Base58 decoding**: Uses the `bs58` library to verify proper encoding
- **Public key validation**: Ensures decoded address is exactly 32 bytes

Key functions:
- `looksLikeSolanaAddress()`: Quick synchronous format check
- `detectAndValidateAddress()`: Full async validation with base58 decoding
- `isValidSolanaAddressFormat()`: Synchronous validation for UI feedback

### 4. API Client (`lib/api/solana.ts`)

JSON-RPC client for Solana blockchain interaction:

**Key Features:**
- Connects to Solana mainnet via public RPC endpoints
- Uses `getBalance` JSON-RPC method
- Implements retry logic with exponential backoff
- Falls back to alternative endpoints on failure
- Converts lamports to SOL

**Main Functions:**
- `fetchSolBalance(address)`: Fetches SOL balance for an address
- `lamportsToSol(lamports)`: Converts lamports to SOL
- `solToLamports(sol)`: Converts SOL to lamports

**API Request Structure:**
```json
{
  "jsonrpc": "2.0",
  "method": "getBalance",
  "params": ["<solana-address>"],
  "id": 1
}
```

**API Response Structure:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": { "slot": 123456789 },
    "value": 1000000000
  }
}
```

### 5. Price Integration (`lib/api/coingecko.ts`)

Extended to include Solana price fetching:
- Added `fetchSOLPrice()` function
- Added `convertSOLToAUD()` function
- Updated `formatCurrency()` to support 'SOL' type
- Maintains 60-second in-memory cache for SOL prices

### 6. Wallet Detection (`lib/wallet/detectWalletType.ts`)

Updated universal wallet detector:
- Added `'solana'` to `WalletType` union
- Added `solanaInfo?` to `WalletInfo` interface
- Updated `detectWalletFormat()` to recognize Solana addresses
- Updated `validateWallet()` to validate Solana addresses
- Updated helper functions for Solana support

### 7. Main UI (`app/wallet/page.tsx`)

Enhanced with Solana support:
- Added `handleSolanaCheck()` function
- Updated `handleSubmit()` to route Solana addresses
- Added SOL to `CryptoType` union
- Updated UI text to mention Solana
- Added "How it Works" section for Solana

## User Flow

1. **User enters a Solana address** (e.g., `DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK`)
2. **Client-side validation** checks format and base58 encoding
3. **Balance fetching** via Solana JSON-RPC `getBalance` method
4. **Price fetching** from CoinGecko API for SOL/AUD rate
5. **Display results** showing SOL balance and AUD value

## Example Solana Addresses

For testing purposes, here are some well-known Solana addresses:

- System Program: `11111111111111111111111111111111`
- Token Program: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Metaplex Program: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

## Technical Details

### Address Format

Solana addresses are:
- Base58-encoded Ed25519 public keys
- 32-44 characters long
- Use Bitcoin's base58 alphabet (excludes 0, O, I, l)
- Decode to exactly 32 bytes

### Balance Units

- **Lamport**: Smallest unit (1 SOL = 1,000,000,000 lamports)
- **SOL**: Standard unit (1 SOL = 10^9 lamports)

### API Endpoints

**Primary:**
- `https://api.mainnet-beta.solana.com`

**Fallbacks:**
- `https://solana-api.projectserum.com`
- `https://rpc.ankr.com/solana`

### Error Handling

The implementation includes comprehensive error handling:
- Network timeouts and failures
- Invalid address format
- JSON-RPC errors
- Failed API requests with retry logic
- Exponential backoff (1s, 2s, 4s)

## Testing

Comprehensive test suites included:

1. **Address Detection Tests** (`lib/solana/__tests__/detectAddress.test.ts`)
   - Valid address recognition
   - Invalid address rejection
   - Base58 validation
   - Whitespace handling

2. **API Client Tests** (`lib/api/__tests__/solana.test.ts`)
   - Lamports/SOL conversion
   - Balance fetching
   - Error handling
   - Retry logic
   - JSON-RPC request structure

3. **Wallet Type Detection Tests** (`lib/wallet/__tests__/detectWalletType.test.ts`)
   - Solana address detection
   - Validation integration
   - Type description and hints

## Dependencies

New dependency added:
- **bs58**: ^5.0.0 - Base58 encoding/decoding library

## Security & Privacy

- **No data storage**: All processing happens in real-time
- **Read-only access**: Public addresses cannot be used to spend funds
- **Client-side validation**: Address validation happens in the browser
- **Third-party APIs**: Balance data fetched from public Solana RPC nodes
- **Public information**: Blockchain addresses and balances are publicly visible

## Differences from Bitcoin/Ethereum

| Feature | Bitcoin | Ethereum | Solana |
|---------|---------|----------|--------|
| **Input Type** | Extended public key | Single address | Single address |
| **Derivation** | BIP32/44/49/84 | None | None |
| **Address Format** | Various (Legacy, SegWit, etc.) | Hex with 0x prefix | Base58 |
| **Checksum** | Base58Check | EIP-55 | None (base58 encoding) |
| **Smallest Unit** | Satoshi (10^-8) | Wei (10^-18) | Lamport (10^-9) |
| **Address Length** | Variable | 42 characters | 32-44 characters |

## Future Enhancements

Potential improvements for future iterations:

1. **SPL Token Support**: Check balances of Solana Program Library (SPL) tokens
2. **Staking Information**: Display staked SOL and rewards
3. **Transaction History**: Show recent transactions
4. **Multiple Addresses**: Batch balance checking
5. **Devnet Support**: Allow checking devnet balances
6. **NFT Holdings**: Display Solana NFTs associated with an address

## Troubleshooting

### Common Issues

**"Invalid Solana address format"**
- Ensure address is 32-44 characters
- Check for invalid characters (0, O, I, l not allowed in base58)
- Verify no extra spaces

**"Failed to fetch balance"**
- Check internet connection
- Try again (temporary RPC node issues)
- Address may be new/unused (0 balance is valid)

**"Invalid base58 encoding"**
- Address contains invalid characters
- Address may be corrupted or incomplete
- Verify copying the entire address

## References

- [Solana Documentation](https://docs.solana.com/)
- [Solana JSON-RPC API](https://docs.solana.com/api/http)
- [Base58 Encoding](https://en.wikipedia.org/wiki/Binary-to-text_encoding#Base58)
- [Ed25519](https://ed25519.cr.yp.to/)

## Implementation Checklist

- [x] Create Solana constants and types
- [x] Implement address validation
- [x] Build JSON-RPC client
- [x] Add price fetching support
- [x] Update wallet detection
- [x] Enhance main UI
- [x] Write comprehensive tests
- [x] Create documentation

## Support

For issues or questions about the Solana implementation, please refer to:
- This documentation
- Code comments in implementation files
- Test files for usage examples
