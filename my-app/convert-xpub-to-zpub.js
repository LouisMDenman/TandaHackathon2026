/**
 * Ledger Live XPub to ZPub Converter
 *
 * Ledger Live exports xpub for Native SegWit accounts, but you need zpub
 * to derive the correct bc1 addresses.
 *
 * Usage: node convert-xpub-to-zpub.js <your-xpub>
 */

const bs58check = require('bs58check');

// Version bytes
const VERSION_BYTES = {
  xpub: 0x0488b21e,
  ypub: 0x049d7cb2,
  zpub: 0x04b24746,
};

function convertXpubToZpub(xpub) {
  try {
    console.log('\n========================================');
    console.log('LEDGER LIVE XPUB → ZPUB CONVERTER');
    console.log('========================================\n');

    console.log(`Input xpub: ${xpub.substring(0, 20)}...${xpub.substring(xpub.length - 10)}\n`);

    // Decode the Base58Check encoded extended key
    const decoded = bs58check.decode(xpub);

    // Verify length (extended keys are 78 bytes)
    if (decoded.length !== 78) {
      throw new Error(`Invalid extended key length: ${decoded.length} bytes (expected 78)`);
    }

    // Verify it's actually an xpub
    const version = Buffer.from(decoded).readUInt32BE(0);
    console.log(`Version bytes: 0x${version.toString(16).padStart(8, '0')}`);

    if (version !== VERSION_BYTES.xpub) {
      throw new Error(`Input is not an xpub! Version bytes: 0x${version.toString(16)}`);
    }
    console.log('✓ Confirmed: This is an xpub\n');

    // Show key information
    const depth = decoded[4];
    const fingerprint = Buffer.from(decoded.slice(5, 9)).toString('hex');
    const childIndex = Buffer.from(decoded.slice(9, 13)).readUInt32BE(0);

    console.log('Key Information:');
    console.log(`  - Depth: ${depth}`);
    console.log(`  - Fingerprint: ${fingerprint}`);
    console.log(`  - Child Index: ${childIndex} (0x${childIndex.toString(16).padStart(8, '0')})`);

    // Create a new buffer for the converted key
    const converted = Buffer.from(decoded);

    // Replace the version bytes with zpub version
    converted.writeUInt32BE(VERSION_BYTES.zpub, 0);

    // Encode back to Base58Check
    const zpub = bs58check.encode(converted);

    console.log('\n========================================');
    console.log('CONVERSION SUCCESSFUL!');
    console.log('========================================\n');
    console.log('Your zpub (for Native SegWit / bc1 addresses):\n');
    console.log(zpub);
    console.log('\n========================================');
    console.log('\nNOW:');
    console.log('1. Copy the zpub above');
    console.log('2. Paste it into the wallet checker');
    console.log('3. It will detect as "zpub" automatically');
    console.log('4. Click "Check Balance"');
    console.log('5. You should see your correct bc1 addresses and balance!');
    console.log('\n========================================\n');

    return zpub;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nMake sure you:');
    console.error('1. Copied the entire xpub (should start with "xpub")');
    console.error('2. Didn\'t add any extra spaces or characters');
    console.error('3. Exported from the correct account in Ledger Live\n');
    process.exit(1);
  }
}

function convertXpubToYpub(xpub) {
  try {
    const decoded = bs58check.decode(xpub);
    if (decoded.length !== 78) {
      throw new Error('Invalid extended key length');
    }

    const converted = Buffer.from(decoded);
    converted.writeUInt32BE(VERSION_BYTES.ypub, 0);

    return bs58check.encode(converted);
  } catch (error) {
    throw new Error(`Failed to convert: ${error.message}`);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n========================================');
  console.log('LEDGER LIVE XPUB CONVERTER');
  console.log('========================================\n');
  console.log('Usage:');
  console.log('  node convert-xpub-to-zpub.js <your-xpub>\n');
  console.log('Example:');
  console.log('  node convert-xpub-to-zpub.js xpub6C...\n');
  console.log('What this does:');
  console.log('  - Converts Ledger Live xpub → zpub (for Native SegWit/bc1 addresses)');
  console.log('  - Also can convert xpub → ypub (for Nested SegWit/P2SH addresses)\n');
  console.log('Why you need this:');
  console.log('  Ledger Live exports xpub even for Native SegWit accounts,');
  console.log('  but you need zpub to derive the correct bc1 addresses.\n');
  console.log('========================================\n');
  process.exit(0);
}

const xpub = args[0].trim();
const mode = args[1] ? args[1].toLowerCase() : 'zpub';

if (mode === 'ypub') {
  const ypub = convertXpubToYpub(xpub);
  console.log('\nConverted ypub (for Nested SegWit / P2SH addresses):');
  console.log(ypub);
  console.log('\nAddresses will start with: 3...\n');
} else {
  convertXpubToZpub(xpub);
}
