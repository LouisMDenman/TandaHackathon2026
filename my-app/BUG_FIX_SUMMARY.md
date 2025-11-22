# Bug Fix: Zero Balance for Valid XPub

## Problem
Users with valid xpubs that have known balances were getting 0 BTC returned.

## Root Cause Analysis

### Issue 1: Gap Limit Not Implemented (Most Likely Cause)
The original code only scanned **20 addresses per chain** (indices 0-19). If a wallet had received funds to addresses beyond index 19, those funds would not be detected.

**Standard wallet behavior** (BIP44) uses a "gap limit" of 20:
- Keep deriving addresses until you find 20 consecutive unused addresses
- This ensures all used addresses are found, even if they're spread out

### Issue 2: XPub Depth Mismatch (Less Common)
Some wallets export xpubs at different depths:
- **Depth 3 (Standard)**: Account level `m/44'/0'/0'` - addresses derive as `m/44'/0'/0'/0/0`, etc.
- **Depth 2**: Coin level - would cause incorrect address generation
- **Depth 1 or 0**: Would cause incorrect address generation

## Solution Implemented

### 1. Gap Limit Scanning
Created new module: `lib/bitcoin/scanAddresses.ts`

**New function**: `scanAddressesWithGapLimit()`
- Scans addresses sequentially
- Checks each address for transactions via Blockstream API
- Stops when it finds 20 consecutive unused addresses
- Supports both external (receiving) and internal (change) chains
- Default max scan: 200 addresses per chain (safety limit)

**How it works:**
```typescript
// For each chain (external and internal):
1. Derive address at index i
2. Check if address has transactions (hasTransactions API call)
3. If used: reset consecutive unused counter
4. If unused: increment consecutive unused counter
5. Stop when consecutive unused >= 20 (gap limit)
6. Safety: stop at 200 addresses max
```

### 2. Updated Wallet Page
Changed `app/wallet/page.tsx` to use `scanAddressesWithGapLimit()` instead of `deriveAddresses()`.

**Before:**
- Scanned exactly 40 addresses (20 external + 20 internal)
- Fast but missed addresses beyond index 19

**After:**
- Scans until gap limit is reached
- Slower but finds all used addresses
- Typical wallets: ~40-60 addresses scanned
- Heavy users: up to 400 addresses scanned (200 per chain)

## Testing & Diagnostics

### Diagnostic Script: `test-derivation.js`
Run this to debug xpub issues:

```bash
node test-derivation.js <your-xpub>
```

**Output:**
- XPub depth (should be 3)
- Fingerprint
- First 5 external addresses (m/0/0 to m/0/4)
- First 5 internal addresses (m/1/0 to m/1/4)

**Usage:**
1. Run the script with your xpub
2. Compare generated addresses with your wallet
3. If addresses match: gap limit was the issue ✓
4. If addresses don't match: check depth or derivation path

### Example Test

```bash
# Test with your xpub
node test-derivation.js xpub6C...

# Expected output:
=== XPUB Information ===
Depth: 3
✓ Depth is correct (3 = account level)

=== First 5 External Addresses ===
m/0/0: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
m/0/1: 1ExAmpLe2...
...
```

## Performance Impact

### Before (Quick Scan)
- Fixed 40 addresses
- ~4-6 seconds total
- 40 API calls to Blockstream

### After (Gap Limit Scan)
- Variable address count (typically 40-60)
- ~5-15 seconds total (depends on how many addresses used)
- More API calls, but batched efficiently

**Optimization:**
- Addresses still batched in groups of 10
- 100ms delay between batches
- Exponential backoff on rate limits
- Promise.allSettled for fault tolerance

## Configuration

### Constants in `lib/bitcoin/constants.ts`

```typescript
// Original quick scan limit
export const ADDRESS_SCAN_LIMIT = 20;

// Gap limit (consecutive unused before stopping)
export const GAP_LIMIT = 20;

// Safety limit in scanAddressesWithGapLimit()
const maxAddresses = 200; // per chain
```

### Adjusting Behavior

**To use quick scan** (20 addresses per chain, fast):
```typescript
import { deriveAddresses } from '@/lib/bitcoin/deriveAddresses';
const addresses = deriveAddresses(key, type, NETWORKS.mainnet);
```

**To use gap limit scan** (thorough, current default):
```typescript
import { scanAddressesWithGapLimit } from '@/lib/bitcoin/scanAddresses';
const addresses = await scanAddressesWithGapLimit(key, type, NETWORKS.mainnet);
```

**To use custom gap limit**:
```typescript
const addresses = await scanAddressesWithGapLimit(
  key,
  type,
  NETWORKS.mainnet,
  50,  // gap limit
  500  // max addresses per chain
);
```

## Files Changed

1. **`lib/bitcoin/constants.ts`**
   - Added `GAP_LIMIT` constant

2. **`lib/bitcoin/scanAddresses.ts`** (NEW)
   - `scanAddressesWithGapLimit()` - Main gap limit scanning function
   - `scanChain()` - Helper for scanning single chain
   - `quickScanAddresses()` - Quick scan without API calls

3. **`app/wallet/page.tsx`**
   - Changed to use `scanAddressesWithGapLimit()`
   - Updated loading message

4. **`test-derivation.js`** (NEW)
   - Diagnostic tool for testing xpub derivation

## Expected Results

After this fix, wallets with funds on addresses beyond index 19 will now be correctly detected.

**Example scenario:**
- User has received payments to addresses m/0/0 through m/0/25
- **Before**: Only scanned m/0/0 to m/0/19, missed balance on m/0/20-25
- **After**: Scans until finding 20 unused consecutive, catches all funds

## Next Steps

1. Test with your xpub:
   ```bash
   node test-derivation.js <your-xpub>
   ```

2. Verify addresses match your wallet

3. Run the updated app:
   ```bash
   npm run dev
   ```

4. Enter your xpub - should now show correct balance

5. If still showing 0:
   - Check xpub depth (should be 3)
   - Verify addresses match using diagnostic script
   - Check if wallet uses non-standard derivation path
   - Verify funds are actually on-chain (check on blockchain explorer)

## Additional Debugging

If balance is still 0 after gap limit scanning:

1. **Check xpub depth**: Must be 3 for standard BIP44
2. **Verify address format**: P2PKH (starts with 1), P2SH (starts with 3), or P2WPKH (starts with bc1)
3. **Check derivation path**: Wallet might use non-standard path
4. **Verify on blockchain explorer**: Manually check first few addresses on blockstream.info
5. **Check network**: Ensure using mainnet, not testnet
6. **API issues**: Check console for API errors

## References

- BIP32: Hierarchical Deterministic Wallets
- BIP44: Multi-Account Hierarchy for Deterministic Wallets
- BIP49: Derivation scheme for P2WPKH-nested-in-P2SH
- BIP84: Derivation scheme for P2WPKH
- Blockstream API: https://github.com/Blockstream/esplora/blob/master/API.md
