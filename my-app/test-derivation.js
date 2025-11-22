/**
 * Diagnostic script to test xpub derivation and identify issues
 * Run with: node test-derivation.js <your-xpub>
 */

const { BIP32Factory } = require('bip32');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');

const bip32 = BIP32Factory(ecc);

// Get xpub from command line
const xpubArg = process.argv[2];

if (!xpubArg) {
  console.error('Usage: node test-derivation.js <xpub>');
  process.exit(1);
}

try {
  console.log('Testing xpub:', xpubArg.substring(0, 20) + '...\n');

  // Parse the xpub
  const node = bip32.fromBase58(xpubArg, bitcoin.networks.bitcoin);

  // Check depth
  console.log('=== XPUB Information ===');
  console.log('Depth:', node.depth);
  console.log('Index:', node.index);
  console.log('Fingerprint:', node.fingerprint.toString('hex'));

  if (node.depth !== 3) {
    console.log('\n⚠️  WARNING: xpub depth is', node.depth, 'but expected 3 (account level)');
    console.log('   Standard BIP44 account-level xpubs should be at depth 3 (m/44\'/0\'/0\')');
    console.log('   This might cause address derivation issues.');
  } else {
    console.log('✓ Depth is correct (3 = account level)');
  }

  console.log('\n=== First 5 External Addresses (m/0/0 to m/0/4) ===');
  for (let i = 0; i < 5; i++) {
    const child = node.derive(0).derive(i);
    const address = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin
    }).address;
    console.log(`m/0/${i}: ${address}`);
  }

  console.log('\n=== First 5 Internal/Change Addresses (m/1/0 to m/1/4) ===');
  for (let i = 0; i < 5; i++) {
    const child = node.derive(1).derive(i);
    const address = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin
    }).address;
    console.log(`m/1/${i}: ${address}`);
  }

  console.log('\n=== Diagnostic Complete ===');
  console.log('Compare these addresses with your wallet to verify they match.');
  console.log('If they don\'t match, your wallet might use:');
  console.log('  - A different derivation path');
  console.log('  - A different xpub depth level');
  console.log('  - A non-standard address scheme');
  console.log('\nIf they DO match but you still see 0 balance:');
  console.log('  - Your funds might be on addresses beyond index 19');
  console.log('  - Solution: Implement gap limit scanning (scan until 20 unused addresses)');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
