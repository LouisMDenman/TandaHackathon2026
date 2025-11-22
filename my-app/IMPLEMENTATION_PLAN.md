# Bitcoin Wallet Viewer - Implementation Plan

## Project Overview

A privacy-focused web application that allows users to check their Bitcoin wallet balance by entering their extended public key (xpub/ypub/zpub). The app derives addresses, fetches balances from public APIs, and displays the total in BTC and AUD. No data is stored server-side or client-side.

## Technical Background

### Extended Public Keys (xpub/ypub/zpub)

Extended public keys allow derivation of an unlimited number of Bitcoin addresses without exposing private keys:

- **xpub** (Legacy): BIP32/BIP44 - P2PKH addresses (starts with `1`)
  - Path: m/44'/0'/0'
  - Format: Base58, starts with "xpub"

- **ypub** (Nested SegWit): BIP49 - P2SH-P2WPKH addresses (starts with `3`)
  - Path: m/49'/0'/0'
  - Format: Base58, starts with "ypub"

- **zpub** (Native SegWit): BIP84 - P2WPKH addresses (starts with `bc1`)
  - Path: m/84'/0'/0'
  - Format: Base58, starts with "zpub"

### Address Derivation

For each extended public key, addresses are derived using:
- **External chain** (m/0/0 to m/0/19): Receiving addresses (20 addresses)
- **Internal chain** (m/1/0 to m/1/19): Change addresses (20 addresses)
- **Total**: 40 addresses per wallet

## Architecture

### Technology Stack

**Frontend Framework:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

**Bitcoin Libraries:**
- `bitcoinjs-lib` (v6.x) - Core Bitcoin operations
- `bip32` - Hierarchical Deterministic wallet support
- `bip39` - Mnemonic support (if needed later)
- `tiny-secp256k1` - Elliptic curve operations (required by bitcoinjs-lib)

**API Integrations:**
- Blockchain data: Blockstream API (free, no auth required)
- BTC/AUD pricing: CoinGecko API (free tier, no auth required)

### Component Structure

```
my-app/
├── app/
│   ├── page.tsx                    # Main landing page
│   ├── wallet/
│   │   └── page.tsx                # Wallet viewer page
│   └── api/
│       ├── balance/
│       │   └── route.ts            # Server-side balance fetching
│       └── price/
│           └── route.ts            # Server-side price fetching
├── lib/
│   ├── bitcoin/
│   │   ├── deriveAddresses.ts     # Address derivation logic
│   │   ├── detectKeyType.ts       # Detect xpub/ypub/zpub
│   │   └── types.ts                # TypeScript types
│   └── api/
│       ├── blockstream.ts          # Blockchain API client
│       └── coingecko.ts            # Price API client
└── components/
    ├── WalletInput.tsx             # Extended public key input form
    ├── BalanceDisplay.tsx          # Balance display component
    ├── LoadingState.tsx            # Loading indicator
    └── ErrorDisplay.tsx            # Error handling component
```

## Implementation Phases

### Phase 1: Project Setup & Dependencies

**Tasks:**
1. Install required dependencies
2. Set up project structure (lib, components directories)
3. Configure TypeScript types for Bitcoin operations
4. Create utility functions and constants

**Dependencies to Install:**
```bash
npm install bitcoinjs-lib bip32 tiny-secp256k1
npm install --save-dev @types/bitcoinjs-lib
```

**Files to Create:**
- `lib/bitcoin/types.ts` - TypeScript interfaces
- `lib/bitcoin/constants.ts` - Network parameters, derivation paths
- `lib/utils/format.ts` - Number formatting utilities

### Phase 2: Extended Public Key Processing

**Tasks:**
1. Implement key type detection (xpub/ypub/zpub)
2. Convert ypub/zpub to xpub format for derivation
3. Validate extended public key format
4. Handle error cases (invalid keys, wrong network)

**Key Functions:**

**`lib/bitcoin/detectKeyType.ts`:**
```typescript
export type KeyType = 'xpub' | 'ypub' | 'zpub';

export interface ExtendedKeyInfo {
  type: KeyType;
  key: string;
  network: 'mainnet' | 'testnet';
  valid: boolean;
}

export function detectAndValidateKey(input: string): ExtendedKeyInfo;
```

**`lib/bitcoin/convertKey.ts`:**
```typescript
// Convert ypub/zpub to xpub format for address derivation
export function convertToXpub(key: string, type: KeyType): string;
```

### Phase 3: Address Derivation

**Tasks:**
1. Implement BIP32 address derivation
2. Generate addresses for external chain (0/0 to 0/19)
3. Generate addresses for internal chain (1/0 to 1/19)
4. Convert public keys to appropriate address formats

**Key Functions:**

**`lib/bitcoin/deriveAddresses.ts`:**
```typescript
import { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';

export interface DerivedAddress {
  path: string;
  address: string;
  index: number;
  chain: 'external' | 'internal';
}

export function deriveAddresses(
  xpub: string,
  keyType: KeyType,
  network: bitcoin.Network
): DerivedAddress[];

// Derive single address
export function deriveAddress(
  node: BIP32Interface,
  chain: 0 | 1,  // 0=external, 1=internal
  index: number,
  keyType: KeyType,
  network: bitcoin.Network
): DerivedAddress;

// Convert public key to address based on type
export function publicKeyToAddress(
  publicKey: Buffer,
  keyType: KeyType,
  network: bitcoin.Network
): string;
```

**Address Generation Logic:**
- For **xpub** (Legacy): Use P2PKH - `bitcoin.payments.p2pkh()`
- For **ypub** (Nested SegWit): Use P2SH-P2WPKH - `bitcoin.payments.p2sh({ redeem: p2wpkh })`
- For **zpub** (Native SegWit): Use P2WPKH - `bitcoin.payments.p2wpkh()`

### Phase 4: Blockchain API Integration

**Tasks:**
1. Implement Blockstream API client
2. Fetch address balances
3. Aggregate total balance
4. Handle rate limiting and retries
5. Implement batch request optimization

**API Endpoints:**
- Address balance: `https://blockstream.info/api/address/{address}`
- Address UTXO: `https://blockstream.info/api/address/{address}/utxo`

**Key Functions:**

**`lib/api/blockstream.ts`:**
```typescript
export interface AddressBalance {
  address: string;
  balance: number;  // in satoshis
  received: number;
  sent: number;
}

export async function fetchAddressBalance(
  address: string
): Promise<AddressBalance>;

export async function fetchMultipleBalances(
  addresses: string[]
): Promise<AddressBalance[]>;

export async function calculateTotalBalance(
  addresses: string[]
): Promise<number>; // total in satoshis
```

**Implementation Notes:**
- Batch requests in groups of 10 to avoid rate limiting
- Implement exponential backoff for failed requests
- Use Promise.allSettled() to handle individual address failures
- Only count addresses with transactions (received > 0)

### Phase 5: Price API Integration

**Tasks:**
1. Implement CoinGecko API client
2. Fetch BTC/AUD exchange rate
3. Handle API errors gracefully
4. Cache price data (short-term, in-memory only)

**API Endpoint:**
- `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=aud`

**Key Functions:**

**`lib/api/coingecko.ts`:**
```typescript
export interface BTCPrice {
  aud: number;
  timestamp: number;
}

export async function fetchBTCPrice(): Promise<BTCPrice>;

export function convertBTCToAUD(btcAmount: number, price: number): number;

export function formatCurrency(amount: number, currency: 'BTC' | 'AUD'): string;
```

### Phase 6: API Routes (Server-Side)

**Tasks:**
1. Create server-side API route for balance fetching
2. Create server-side API route for price fetching
3. Implement error handling and validation
4. Add rate limiting protection

**Why Server-Side?**
- Avoid CORS issues with blockchain APIs
- Protect against client-side abuse
- Better error handling and logging
- Potential for caching (future enhancement)

**`app/api/balance/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { xpub, keyType } = await request.json();

    // Validate input
    // Derive addresses
    // Fetch balances
    // Return total

    return NextResponse.json({
      success: true,
      totalSatoshis: total,
      addresses: derivedAddresses.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

**`app/api/price/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const price = await fetchBTCPrice();

    return NextResponse.json({
      success: true,
      price: price.aud,
      timestamp: price.timestamp
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Phase 7: UI Components

**Tasks:**
1. Create wallet input component
2. Create balance display component
3. Implement loading states
4. Add error handling UI
5. Make responsive design

**`components/WalletInput.tsx`:**
- Text input for extended public key
- Dropdown or auto-detect for key type (xpub/ypub/zpub)
- Submit button
- Input validation feedback
- Clear button

**`components/BalanceDisplay.tsx`:**
- Total BTC balance (with 8 decimal places)
- Total AUD value
- Number of addresses scanned
- Timestamp of check
- Clear/Reset button

**`components/LoadingState.tsx`:**
- Progress indicator
- Status messages ("Deriving addresses...", "Checking balances...", "Fetching price...")
- Cancel option (if possible)

**`components/ErrorDisplay.tsx`:**
- Error message display
- Error type indication (validation, network, API)
- Retry button
- Help text with common issues

### Phase 8: Main Wallet Page

**Tasks:**
1. Integrate all components
2. Implement state management
3. Handle API calls
4. Add privacy notices
5. Create user flow

**`app/wallet/page.tsx`:**
```typescript
'use client';

import { useState } from 'react';

export default function WalletPage() {
  const [xpub, setXpub] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate input
    // Call balance API
    // Call price API
    // Display results
  };

  return (
    // UI implementation
  );
}
```

**User Flow:**
1. User lands on page
2. User enters extended public key
3. User selects or app detects key type
4. User clicks "Check Balance"
5. Loading state shows progress
6. Results display: BTC amount, AUD value
7. User can clear and check another wallet

### Phase 9: Landing Page

**Tasks:**
1. Create informative landing page
2. Explain what the app does
3. Add privacy assurances
4. Link to wallet checker
5. Add educational content

**`app/page.tsx` Content:**
- Hero section: "Check Your Bitcoin Balance Privately"
- Features: No signup, no data stored, free to use
- Supported formats: xpub, ypub, zpub
- How it works section
- Security & privacy section
- CTA button to wallet page
- FAQ section (optional)

### Phase 10: Testing & Refinement

**Tasks:**
1. Test with real xpub/ypub/zpub keys
2. Test error handling (invalid keys, network errors)
3. Test with empty wallets
4. Test with wallets containing funds
5. Verify calculations
6. Performance testing with API calls
7. Mobile responsive testing

**Test Cases:**
- Valid xpub with balance
- Valid ypub with balance
- Valid zpub with balance
- Invalid key format
- Empty wallet (no transactions)
- Network timeout simulation
- API rate limiting handling
- Large balance formatting
- Small balance (dust) handling

## Security Considerations

### Privacy
- **No Storage**: All computations happen in-memory, no database
- **No Logging**: Don't log extended public keys or addresses
- **Client-Side Processing**: Where possible, keep data client-side
- **HTTPS Only**: Enforce HTTPS in production
- **No Analytics**: Avoid tracking that could compromise privacy

### Input Validation
- Validate extended public key format before processing
- Sanitize all user inputs
- Implement rate limiting on API routes
- Reject testnet keys (or handle separately)

### API Security
- Use server-side API routes to hide implementation
- Implement request timeouts
- Handle API failures gracefully
- Don't expose internal error details to users

### What Users CAN'T Do With This
- **Cannot spend funds**: Extended public keys only derive addresses, not private keys
- **Cannot see transaction details**: Only balance is shown
- **Cannot track in real-time**: Must manually refresh

### What Users CAN See
- Total balance across all derived addresses
- Current BTC/AUD exchange rate

## API References

### Blockstream API (Free, No Auth)
- Docs: https://github.com/Blockstream/esplora/blob/master/API.md
- Base URL: `https://blockstream.info/api`
- Rate Limit: Reasonable use, no hard limit documented
- Endpoints needed:
  - GET `/address/{address}` - Address stats and balance
  - GET `/address/{address}/utxo` - Address UTXOs

### CoinGecko API (Free Tier, No Auth)
- Docs: https://www.coingecko.com/en/api/documentation
- Base URL: `https://api.coingecko.com/api/v3`
- Rate Limit: 10-50 calls/minute (free tier)
- Endpoint needed:
  - GET `/simple/price?ids=bitcoin&vs_currencies=aud`

## Alternative APIs (Backup Options)

### Blockchain.info (If Blockstream fails)
- Base URL: `https://blockchain.info`
- Endpoint: `/address/{address}?format=json`
- No auth required

### Mempool.space (Another option)
- Base URL: `https://mempool.space/api`
- Similar API structure to Blockstream
- Good fallback option

## Future Enhancements (Out of Scope)

These are NOT part of the initial implementation but could be added later:
- Multi-wallet support (check multiple wallets at once)
- Transaction history display
- Export to CSV
- QR code scanning for mobile
- Address usage visualization
- Custom derivation path support
- Support for other cryptocurrencies
- Price history charts
- Email/SMS alerts for balance changes
- Testnet support

## Error Handling Strategy

### User-Facing Errors
- Invalid extended public key format
- Network connection issues
- API unavailable
- Rate limit exceeded
- No balance found

### Error Messages
- Keep messages user-friendly and actionable
- Provide help text for common issues
- Offer retry mechanism
- Show technical details only in dev mode

## Performance Optimization

### Address Scanning
- Scan in parallel (batch of 10 addresses)
- Use Promise.allSettled() for concurrent requests
- Skip addresses with zero balance in subsequent checks (future enhancement)

### API Caching
- Cache BTC/AUD price for 60 seconds (in-memory only)
- No caching of balance data (always fetch fresh)

### Loading UX
- Show progress during address derivation
- Display running count of addresses checked
- Estimate time remaining based on progress

## Development Workflow

### Step-by-Step Implementation Order

1. **Week 1: Core Bitcoin Logic**
   - Install dependencies
   - Implement key detection and validation
   - Implement address derivation
   - Write unit tests for derivation logic

2. **Week 2: API Integration**
   - Implement Blockstream API client
   - Implement CoinGecko API client
   - Create server-side API routes
   - Test API integrations

3. **Week 3: UI Development**
   - Create all UI components
   - Implement main wallet page
   - Add loading and error states
   - Make responsive design

4. **Week 4: Polish & Testing**
   - End-to-end testing
   - Error handling improvements
   - Performance optimization
   - Create landing page
   - Final QA and deployment

## Success Criteria

The implementation is complete when:
- [ ] Users can enter xpub and see total BTC balance
- [ ] Users can enter ypub and see total BTC balance
- [ ] Users can enter zpub and see total BTC balance
- [ ] BTC balance is displayed in AUD
- [ ] All 40 addresses (20 external + 20 internal) are scanned
- [ ] Invalid keys show helpful error messages
- [ ] Loading states provide feedback
- [ ] No data is stored anywhere (privacy guaranteed)
- [ ] Works on mobile and desktop
- [ ] Handles API failures gracefully

## Conclusion

This implementation plan provides a comprehensive roadmap for building a privacy-focused Bitcoin wallet viewer. The phased approach allows for iterative development and testing, ensuring each component works correctly before moving to the next.

The focus on privacy (no data storage), security (input validation), and user experience (clear feedback, error handling) will result in a tool that users can trust for checking their Bitcoin balances without compromising their privacy.
