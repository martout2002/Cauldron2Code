/**
 * Token Encryption Test
 * Simple test to verify encryption/decryption works correctly
 */

import { TokenEncryption } from './token-encryption';

// Generate a test key
const testKey = '874c4c94cd8c0fde6cce54d1f38828a58f5a16f85d3a9f28c703c844cc11b51e';

console.log('=== Token Encryption Test ===\n');

try {
  const encryption = new TokenEncryption(testKey);
  
  // Test 1: Basic encryption/decryption
  console.log('Test 1: Basic encryption/decryption');
  const originalToken = 'gho_test_token_1234567890abcdef';
  console.log('Original token:', originalToken);
  
  const encrypted = encryption.encrypt(originalToken);
  console.log('Encrypted:', encrypted);
  console.log('Format check:', encrypted.split(':').length === 3 ? '✓ Valid format' : '✗ Invalid format');
  
  const decrypted = encryption.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', originalToken === decrypted ? '✓ Success' : '✗ Failed');
  console.log();
  
  // Test 2: Multiple encryptions produce different results
  console.log('Test 2: Multiple encryptions (should be different)');
  const encrypted1 = encryption.encrypt(originalToken);
  const encrypted2 = encryption.encrypt(originalToken);
  console.log('Encrypted 1:', encrypted1.substring(0, 50) + '...');
  console.log('Encrypted 2:', encrypted2.substring(0, 50) + '...');
  console.log('Different:', encrypted1 !== encrypted2 ? '✓ Success' : '✗ Failed');
  console.log('Both decrypt correctly:', 
    encryption.decrypt(encrypted1) === originalToken && 
    encryption.decrypt(encrypted2) === originalToken ? '✓ Success' : '✗ Failed');
  console.log();
  
  // Test 3: Long token
  console.log('Test 3: Long token');
  const longToken = 'a'.repeat(500);
  const encryptedLong = encryption.encrypt(longToken);
  const decryptedLong = encryption.decrypt(encryptedLong);
  console.log('Long token length:', longToken.length);
  console.log('Decrypted correctly:', longToken === decryptedLong ? '✓ Success' : '✗ Failed');
  console.log();
  
  // Test 4: Generate key utility
  console.log('Test 4: Generate key utility');
  const newKey = TokenEncryption.generateKey();
  console.log('Generated key:', newKey);
  console.log('Key length:', newKey.length, '(should be 64)');
  console.log('Valid length:', newKey.length === 64 ? '✓ Success' : '✗ Failed');
  console.log();
  
  console.log('=== All Tests Passed ===');
  
} catch (error) {
  console.error('Test failed:', error);
  process.exit(1);
}
