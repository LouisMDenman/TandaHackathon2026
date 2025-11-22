# Ethereum Wallet Support Implementation

## Overview

This document details the implementation of Ethereum wallet balance checking functionality alongside the existing Bitcoin wallet checker. The implementation follows the same privacy-preserving, client-side-first architecture as the Bitcoin implementation.

## Implementation Date

November 22, 2025

## Requirements

### User Requirements
- Users can enter an Ethereum address (0x...) in the same input field as Bitcoin keys
- System auto-detects whether input is Bitcoin (xpub/ypub/zpub) or Ethereum (0x...)
- Display ETH balance + AUD value (matching Bitcoin UX)
- Support mainnet only (real user wallets)
- Use free, no-API-key endpoints with minimal rate limiting

### Technical Requirements
- No backend changes - maintain client-side architecture
- Format detection must be unambiguous (Bitcoin keys vs Ethereum addresses have distinctly different formats)
- EIP-55 checksum validation for Ethereum addresses
- Reliable public RPC endpoint for balance fetching
- Price data from CoinGecko (consistent with Bitcoin implementation)

## Architecture

### Format Detection

The formats are distinctly different and easily distinguishable:

| Type | Format | Length | Example |
|------|--------|--------|---------|
| Bitcoin | xpub/ypub/zpub... | 111-112 chars | xpub6CUGRUo... |
| Ethereum | 0x[hex] | 42 chars | 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb |

This makes auto-detection straightforward with zero ambiguity.

### Data Flow

#### Bitcoin Flow (Unchanged)
```
Input → Validate → Auto-detect format → Scan addresses → Fetch balances → Display
```

#### Ethereum Flow (New)
```
Input → Validate EIP-55 → Fetch balance (single address) → Display
```

#### Universal Flow
```
User Input
    ↓
detectWalletType() → Identify Bitcoin or Ethereum
    ↓
├─ Bitcoin: handleBitcoinCheck()
│    ├─ Validate extended key
│    ├─ Auto-detect format (xpub/ypub/zpub)
│    ├─ Scan addresses with gap limit
│    ├─ Fetch balances from Blockstream
│    ├─ Fetch BTC/AUD price from CoinGecko
│    └─ Display results
│
└─ Ethereum: handleEthereumCheck()
     ├─ Validate address & EIP-55 checksum
     ├─ Fetch balance via JSON-RPC
     ├─ Fetch ETH/AUD price from CoinGecko
     └─ Display results
```

## Implementation Details

### Phase 1: Core Ethereum Infrastructure

#### 1. Type Definitions (`lib/ethereum/types.ts`)

```typescript
export interface EthereumAddressInfo {
  address: string;          // Checksummed address
  valid: boolean;
  network: NetworkType;
  error?: string;
}

export interface EthereumBalance {
  address: string;
  balance: string;          // Wei as string (precision preservation)
  balanceInEth: number;
  status: 'success' | 'error';
  error?: string;
}

export interface ETHPrice {
  aud: number;
  timestamp: number;
}
```

#### 2. Constants (`lib/ethereum/constants.ts`)

**RPC Endpoints:**
- Primary: `https://cloudflare-eth.com` (Cloudflare Ethereum Gateway)
- Fallbacks: `https://rpc.ankr.com/eth`, `https://eth.llamarpc.com`

**Configuration:**
- Timeout: 30 seconds
- Retries: 3 attempts with exponential backoff
- Wei conversion: 1 ETH = 10^18 Wei

#### 3. Address Validation (`lib/ethereum/detectAddress.ts`)

**EIP-55 Checksum Validation:**
- Uses keccak256 hashing (via js-sha3 library)
- Validates mixed-case checksum encoding
- Accepts all-lowercase or all-uppercase (checksum not applicable)
- Returns checksummed address format

**Key Functions:**
```typescript
looksLikeEthereumAddress(input: string): boolean
toChecksumAddress(address: string): Promise<string>
isValidChecksum(address: string): Promise<boolean>
detectAndValidateAddress(input: string): Promise<EthereumAddressInfo>
```

#### 4. Balance Fetching (`lib/api/ethereum.ts`)

**JSON-RPC Implementation:**
- Method: `eth_getBalance`
- Parameters: `[address, 'latest']`
- Response: Hex-encoded Wei amount

**Features:**
- Retry logic with exponential backoff
- Automatic fallback to alternate RPC endpoints
- Wei ↔ ETH conversion utilities
- Timeout protection (30s per request)

**Key Functions:**
```typescript
fetchEthBalance(address: string): Promise<EthereumBalance>
weiToEth(wei: bigint): number
makeJsonRpcCall(method: string, params: any[]): Promise<any>
```

### Phase 2: Price Integration

#### Updated `lib/api/coingecko.ts`

**New Functions:**
```typescript
fetchETHPrice(): Promise<ETHPrice>
convertETHToAUD(ethAmount: number, price: number): number
weiToAUD(wei: number | bigint, price: number): number
```

**Updated Functions:**
- `formatCurrency()` now accepts `'BTC' | 'ETH' | 'AUD'`
- Separate price caches for BTC and ETH (60-second TTL)

**ETH Formatting:**
- Display: 6 decimal places (vs 8 for BTC)
- Minimum display: 0.0001 ETH
- Trailing zeros removed, minimum 2 decimals preserved

### Phase 3: Universal Wallet Detection

#### `lib/wallet/detectWalletType.ts`

**Central detection logic:**
```typescript
export type WalletType = 'bitcoin' | 'ethereum' | 'unknown';

export interface WalletInfo {
  walletType: WalletType;
  valid: boolean;
  bitcoinInfo?: ExtendedKeyInfo;
  ethereumInfo?: EthereumAddressInfo;
  error?: string;
}
```

**Functions:**
- `detectWalletFormat()` - Quick synchronous format check
- `validateWallet()` - Full async validation (includes EIP-55 checksum)
- `getWalletTypeDescription()` - Human-readable description

### Phase 4: Component Updates

#### 1. WalletInput Component

**Changes:**
- Updated placeholder: "Enter Bitcoin xpub/ypub/zpub or Ethereum address (0x...)..."
- Async validation with 300ms debounce
- Displays appropriate feedback for both Bitcoin and Ethereum
- Shows wallet type description + network info

**Validation States:**
- Validating (spinner)
- Valid Bitcoin / Valid Ethereum (green checkmark + details)
- Invalid (red X + error message)

#### 2. Wallet Page (`app/wallet/page.tsx`)

**State Management:**
```typescript
const [cryptoType, setCryptoType] = useState<'BTC' | 'ETH'>('BTC');
const [totalCrypto, setTotalCrypto] = useState<number>(0);
// ... other state
```

**Flow Branching:**
```typescript
handleSubmit(input: string, info: WalletInfo) {
  if (info.walletType === 'bitcoin') {
    await handleBitcoinCheck(...)
  } else if (info.walletType === 'ethereum') {
    await handleEthereumCheck(...)
  }
}
```

**Bitcoin Handler:**
- Existing flow unchanged
- Sets `cryptoType = 'BTC'`
- Converts satoshis → BTC for display

**Ethereum Handler:**
- Validates address
- Fetches balance via JSON-RPC
- Fetches ETH price
- Sets `cryptoType = 'ETH'`
- Single address (no scanning)

#### 3. BalanceDisplay Component

**Updated Props:**
```typescript
interface BalanceDisplayProps {
  cryptoType: 'BTC' | 'ETH';
  totalCrypto: number;  // BTC or ETH amount
  totalAUD: number;
  addressesScanned: number;
  // ...
}
```

**Display Logic:**
- Dynamic labels: "Total Bitcoin" or "Total Ethereum"
- Format amount using `formatCurrency(amount, cryptoType)`
- Addresses: Shows count for Bitcoin, just "1" for Ethereum
- Zero balance message adapts to crypto type

### Phase 5: UI/UX Updates

#### Header
**Before:** "Bitcoin Wallet Balance Checker"
**After:** "Crypto Wallet Balance Checker"

**Subtitle:** "Check your Bitcoin or Ethereum wallet balance..."

#### Privacy Notice
- Updated to mention both Bitcoin and Ethereum
- Clarifies Bitcoin uses extended public keys, Ethereum uses addresses
- Notes different API providers (Blockstream vs Ethereum RPC)

#### How It Works Section
Divided into two subsections:

**For Bitcoin:**
1. Enter extended key
2. Auto-detect format
3. Derive & scan addresses
4. Check balances & display

**For Ethereum:**
1. Enter address (0x...)
2. Validate EIP-55 checksum
3. Fetch balance & display

## Dependencies

### New Packages
```json
{
  "js-sha3": "^0.9.3"  // Keccak-256 hashing for EIP-55
}
```

### Existing Packages (Unchanged)
- `bitcoinjs-lib`: Bitcoin cryptography
- `bip32`: HD wallet derivation
- `bs58check`: Base58Check encoding
- `next`: React framework
- `react`: UI library

## API Endpoints

### Ethereum Balance
- **Primary:** `https://cloudflare-eth.com`
- **Method:** POST JSON-RPC
- **Endpoint Structure:** `{ "jsonrpc": "2.0", "method": "eth_getBalance", "params": ["0x...", "latest"], "id": 1 }`

### Price Data
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price`
- **Bitcoin:** `?ids=bitcoin&vs_currencies=aud`
- **Ethereum:** `?ids=ethereum&vs_currencies=aud`

## Security Considerations

### 1. Address Validation
- **EIP-55 Checksum:** Protects against typos and transcription errors
- **Format Validation:** Rejects malformed addresses immediately
- **Client-side Only:** Addresses never sent to backend

### 2. RPC Endpoint Security
- **Public Endpoints:** No API keys required (no key leakage risk)
- **Multiple Fallbacks:** If primary fails, tries alternates
- **Timeout Protection:** 30-second timeout prevents hanging

### 3. Privacy
- **No Logging:** All operations client-side
- **No Storage:** No database, no session storage
- **Read-Only:** Cannot sign transactions or access private keys
- **Public Data:** Ethereum addresses and balances are already public on blockchain

### 4. Error Handling
- **Graceful Degradation:** If balance fetch fails, shows error instead of crashing
- **User Feedback:** Clear error messages explain what went wrong
- **Retry Support:** Users can retry failed operations

## Testing Strategy

### Unit Tests
- EIP-55 checksum validation
- Wei ↔ ETH conversions
- Format detection (Bitcoin vs Ethereum)
- Address normalization

### Integration Tests
- Balance fetching from RPC (with mocks)
- Price fetching from CoinGecko (with mocks)
- End-to-end flow for both Bitcoin and Ethereum

### Manual Testing Checklist
- [ ] Enter Bitcoin xpub → Should validate and check Bitcoin
- [ ] Enter Ethereum address → Should validate and check Ethereum
- [ ] Invalid address → Should show appropriate error
- [ ] Wrong checksum → Should catch and warn
- [ ] Zero balance → Should display correctly
- [ ] API failure → Should show error and allow retry
- [ ] Switch between Bitcoin and Ethereum → State resets properly

## Performance Considerations

### Ethereum vs Bitcoin
| Aspect | Bitcoin | Ethereum |
|--------|---------|----------|
| Addresses checked | 20-200 (gap limit) | 1 (single address) |
| API calls | 3-30 (batched) | 1 (single RPC call) |
| Derivation | Complex (BIP32) | None |
| Typical response time | 5-15 seconds | 1-3 seconds |

**Ethereum is significantly faster** due to single-address checking.

### Optimizations
- **Debounced Validation:** 300ms debounce on input validation
- **Price Caching:** 60-second cache for ETH price (same as BTC)
- **Parallel Fetching:** Balance and price fetched concurrently
- **Retry Logic:** Exponential backoff prevents hammering failed endpoints

## Edge Cases Handled

1. **All-lowercase Ethereum address:** Valid (checksum not required)
2. **All-uppercase Ethereum address:** Valid (checksum not required)
3. **Mixed-case with wrong checksum:** Invalid (checksum verification fails)
4. **RPC endpoint failure:** Fallback to alternate endpoints
5. **Zero balance:** Special UI message, no error
6. **Network timeout:** Error message with retry option
7. **Invalid input:** Clear error message explaining format requirements

## Rollout Plan

### Phase 1: Core Implementation ✅
- Ethereum types, constants, validation
- RPC client implementation
- Price API integration

### Phase 2: UI Integration ✅
- Universal wallet detection
- Component updates (Input, Page, Display)
- Error handling and loading states

### Phase 3: Testing ⏳
- Manual testing with real addresses
- Error scenario testing
- Performance testing

### Phase 4: Documentation ✅
- Implementation plan (this document)
- Code comments and JSDoc
- User-facing help text

## Future Enhancements

### Potential Future Features
1. **ERC-20 Token Support**
   - Display balances of popular tokens (USDT, USDC, DAI)
   - Would require additional RPC calls (eth_call to token contracts)

2. **ENS Name Resolution**
   - Support ENS names (e.g., vitalik.eth)
   - Resolve to Ethereum address before balance check

3. **Multi-Address Support**
   - Allow checking multiple Ethereum addresses at once
   - Would match Bitcoin multi-address UX

4. **Historical Balance**
   - Show balance at specific block height
   - Requires archive node access (not available on free RPC)

5. **Transaction History**
   - Display recent transactions
   - Would require blockchain explorer API

### Not Planned
- **Testnet Support:** Real users don't need this
- **NFT Display:** Out of scope for balance checker
- **Smart Contract Interaction:** Read-only balance checker only

## File Structure

```
my-app/
├── lib/
│   ├── ethereum/               # New Ethereum-specific logic
│   │   ├── types.ts           # Ethereum type definitions
│   │   ├── constants.ts       # RPC endpoints, Wei constants
│   │   └── detectAddress.ts   # EIP-55 validation
│   ├── wallet/                # New universal wallet detection
│   │   └── detectWalletType.ts
│   ├── api/
│   │   ├── ethereum.ts        # New Ethereum RPC client
│   │   └── coingecko.ts       # Updated to support ETH
│   └── bitcoin/               # Existing Bitcoin logic (unchanged)
│       ├── types.ts
│       ├── constants.ts
│       ├── detectKeyType.ts
│       ├── autoDetectFormat.ts
│       ├── deriveAddresses.ts
│       ├── scanAddresses.ts
│       └── convertKey.ts
├── components/
│   ├── WalletInput.tsx        # Updated for both BTC & ETH
│   ├── BalanceDisplay.tsx     # Updated for both BTC & ETH
│   ├── LoadingState.tsx       # Unchanged
│   └── ErrorDisplay.tsx       # Unchanged
├── app/
│   └── wallet/
│       └── page.tsx           # Updated with branching logic
└── package.json               # Added js-sha3 dependency
```

## Summary

### What Changed
- ✅ Added Ethereum address validation (EIP-55)
- ✅ Added Ethereum balance fetching (JSON-RPC)
- ✅ Added Ethereum price fetching (CoinGecko)
- ✅ Added universal wallet type detection
- ✅ Updated all UI components to support both cryptocurrencies
- ✅ Maintained privacy-first, client-side architecture

### What Stayed the Same
- ✅ Bitcoin functionality completely unchanged
- ✅ No backend required
- ✅ No data storage
- ✅ Privacy-preserving design
- ✅ Same visual design language
- ✅ Same error handling patterns

### Key Benefits
1. **Unified Experience:** Users enter any wallet type in one field
2. **Auto-Detection:** No need to select Bitcoin vs Ethereum
3. **Fast for Ethereum:** Single address check vs multi-address scan
4. **Free Infrastructure:** No API keys required
5. **Privacy Preserved:** Same client-side-first approach
6. **Easy to Extend:** Clean architecture for future crypto additions

## Conclusion

The Ethereum implementation successfully extends the wallet balance checker to support both Bitcoin and Ethereum while maintaining the core principles of privacy, simplicity, and client-side processing. The distinct formats of Bitcoin extended keys and Ethereum addresses make auto-detection straightforward and unambiguous. The implementation follows the same architectural patterns as the Bitcoin implementation, ensuring consistency and maintainability.

The feature is ready for testing and deployment.
