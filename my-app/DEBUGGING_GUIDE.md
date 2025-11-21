# Debugging Guide - Zero Balance Issue

## Debug Logging Added

I've added comprehensive logging throughout the entire balance checking flow. When you run the app with your xpub, you'll see detailed console output showing exactly what's happening at each step.

## How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console:**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12`
   - Safari: Enable Developer menu, then press `Cmd+Option+C`

3. **Enter your xpub and click "Check Balance"**

4. **Watch the console output** - it will show detailed information

## What the Logs Show

### 1. Initial Information
```
========================================
=== WALLET BALANCE CHECK STARTED ===
========================================
Timestamp: 2025-11-22T...
Input key type: xpub
Input key: xpub6C...FG7QUc
```

### 2. Validation Step
```
--- STEP 1: VALIDATION ---
Validation result: {
  valid: true,
  type: 'xpub',
  network: 'mainnet',
  key: '...'
}
```

### 3. Gap Limit Scanning
```
--- STEP 2: ADDRESS SCANNING ---
=== GAP LIMIT SCAN START ===
Input xpub: xpub6C...
Key type: xpub
Network: mainnet
Gap limit: 20, Max addresses: 200
Node depth: 3 (should be 3 for account level)  ⬅️ IMPORTANT!
Node index: 0
Node fingerprint: 3442193e

=== SCANNING EXTERNAL CHAIN (m/0/x) ===
  [DERIVE] path=m/0/0, keyType=xpub, address=1A1z..., pubkey=02a1...
  [DERIVE] path=m/0/1, keyType=xpub, address=1ExA..., pubkey=03c5...
  [DERIVE] path=m/0/2, keyType=xpub, address=1Pqw..., pubkey=02f4...

  [external/0] Checking 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa...
    [API] Fetching https://blockstream.info/api/address/1A1z...
    [API] Response status: 200 OK
    [API] Balance data:
      - Received: 50000000 sats  ⬅️ CHECK THIS!
      - Sent: 0 sats
      - Balance: 50000000 sats  ⬅️ CHECK THIS!
      - Tx count: 1
    ✓ HAS TRANSACTIONS (used count: 1)

  [external/1] Checking 1ExAmpLe2...
    [API] Fetching https://blockstream.info/api/address/1ExAmpLe2...
    [API] Response status: 200 OK
    [API] Balance data:
      - Received: 0 sats
      - Sent: 0 sats
      - Balance: 0 sats
      - Tx count: 0
    ✗ No transactions (gap: 1/20)

  ... continues until gap limit reached ...

  EXTERNAL CHAIN COMPLETE:
    - Scanned: 21 addresses
    - Used: 1 addresses  ⬅️ CHECK THIS!
    - Final gap: 20 consecutive unused
    - Stopped reason: gap limit reached

=== SCANNING INTERNAL CHAIN (m/1/x) ===
  ... similar output for change addresses ...
```

### 4. Balance Calculation
```
--- STEP 3: BALANCE CHECKING ---
=== CALCULATING TOTAL BALANCE ===
Processing 42 addresses...

Balance Summary:
  Total addresses checked: 42
  Addresses with transactions: 1  ⬅️ CHECK THIS!

  Used addresses:
    1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa: 50000000 sats (received: 50000000, sent: 0)

  TOTAL BALANCE: 50000000 satoshis (0.5 BTC)  ⬅️ FINAL RESULT!
=== BALANCE CALCULATION COMPLETE ===
```

### 5. Price and Completion
```
--- STEP 4: PRICE FETCHING ---
BTC price: 95000 AUD
Total value: 47500 AUD

========================================
=== WALLET BALANCE CHECK COMPLETE ===
========================================
```

## Key Things to Check

### ✅ **1. Node Depth**
```
Node depth: 3 (should be 3 for account level)
```
**Expected:** 3 (account level: m/44'/0'/0')
**If different:** Your xpub might not be at the standard derivation level

### ✅ **2. Derived Addresses**
```
[DERIVE] path=m/0/0, keyType=xpub, address=1A1z...
[DERIVE] path=m/0/1, keyType=xpub, address=1ExA...
[DERIVE] path=m/0/2, keyType=xpub, address=1Pqw...
```
**Check:** Do these addresses match the first few addresses in your actual wallet?

### ✅ **3. API Responses**
```
[API] Balance data:
  - Received: 50000000 sats
  - Sent: 0 sats
  - Balance: 50000000 sats
```
**If all show 0:** The addresses are correct but have no funds
**If API fails:** Check network connection or API rate limits

### ✅ **4. Used Address Count**
```
Used: 1 addresses
Addresses with transactions: 1
```
**If 0:** No addresses have ever received funds (empty wallet)
**If > 0 but balance is 0:** Funds were received and then spent

### ✅ **5. Total Balance**
```
TOTAL BALANCE: 50000000 satoshis (0.5 BTC)
```
**This is the final answer!**

## Common Issues & Solutions

### Issue 1: Node depth is not 3
```
Node depth: 2 (should be 3 for account level)  ⚠️
```
**Problem:** Your xpub is at a different derivation level
**Solution:** Your wallet might export xpub at a different level. Try:
- Exporting the xpub again from your wallet
- Checking if your wallet has an option for "account xpub" vs "master xpub"
- Different wallets use different conventions

### Issue 2: Derived addresses don't match your wallet
```
First 3 external addresses: ['1A1z...', '1ExA...', '1Pqw...']
```
**Problem:** Addresses don't match what you see in your wallet
**Solution:**
- Your wallet might use a non-standard derivation path
- Check if your wallet uses ypub (P2SH-wrapped SegWit) or zpub (native SegWit) instead
- Some wallets use custom derivation schemes

### Issue 3: All addresses show 0 balance
```
Addresses with transactions: 0
TOTAL BALANCE: 0 satoshis (0 BTC)
```
**Two possibilities:**
1. **Wallet is actually empty** - you've never received any funds
2. **Wrong derivation** - addresses are incorrect (see Issue 2)

**To verify:**
- Copy the first derived address from console
- Paste it into a blockchain explorer (blockstream.info)
- Check if that address has transactions
- If no transactions: derivation is wrong
- If has transactions but shows as "used: 0": API issue

### Issue 4: API errors
```
[API] Response status: 429 Too Many Requests
[API] Rate limited, backing off for 1000ms
```
**Problem:** Hitting Blockstream API rate limits
**Solution:** Wait a few minutes and try again

### Issue 5: Addresses match but balance is 0
```
✓ HAS TRANSACTIONS (used count: 5)
TOTAL BALANCE: 0 satoshis (0 BTC)
```
**Problem:** Funds were received but fully spent
**Check the logs:**
```
1A1z...: 0 sats (received: 50000000, sent: 50000000)
```
This shows the address received 0.5 BTC but spent all of it.

## Testing with Diagnostic Script

For a quick check of address derivation without API calls:

```bash
node test-derivation.js <your-xpub>
```

This will show:
- XPub depth
- First 5 external addresses
- First 5 internal addresses
- No API calls (instant results)

**Compare these addresses with your wallet app!**

## Sharing Debug Output

If you need help debugging, copy the console output and check for:

1. **Sanitize your xpub:** Never share your full xpub publicly!
   The logs already truncate it to: `xpub6C...FG7QUc`

2. **Share these key lines:**
   - Node depth
   - First 3 derived addresses
   - Used address count
   - Total balance

3. **Don't share:**
   - Full xpub
   - Full addresses (first few chars + last few chars is fine)

## Next Steps Based on Results

### If node depth ≠ 3:
→ Check wallet export settings, try different xpub export option

### If addresses don't match wallet:
→ Try ypub or zpub instead of xpub, or vice versa

### If addresses match but balance is 0:
→ Check those addresses on blockstream.info directly
→ If they show balance there but not in app: file a bug report

### If everything looks correct but still 0:
→ Share the debug output (sanitized) for further analysis

## Reducing Log Verbosity

If the logs are too verbose, you can reduce them by editing these files:

**Less verbose API logging:**
- Remove logs from `lib/api/blockstream.ts` lines 60-101

**Less verbose scanning:**
- Remove logs from `lib/bitcoin/scanAddresses.ts` lines 118-133

**Keep only summary:**
- Keep logs in `app/wallet/page.tsx` for high-level flow
- Remove detailed per-address logs
