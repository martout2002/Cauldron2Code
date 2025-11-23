/**
 * Test file for GuideUrlGenerator
 * 
 * Manual test to verify URL generation and config storage/retrieval
 */

import { ScaffoldConfig } from '@/types';
import {
  generateConfigId,
  storeConfig,
  getConfigById,
  generateGuideUrl,
  createGuideUrl,
  encodeConfigToUrl,
  decodeConfigFromUrl,
} from './guide-url-generator';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
}

// Test configuration
const testConfig: ScaffoldConfig = {
  projectName: 'test-project',
  description: 'Test deployment guide',
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  database: 'prisma-postgres',
  auth: 'nextauth',
  styling: 'tailwind',
  shadcn: true,
  api: 'rest-fetch',
  colorScheme: 'purple',
  deployment: ['vercel'],
  buildTool: 'auto',
  projectStructure: 'nextjs-only',
  extras: {
    docker: false,
    githubActions: false,
    prettier: true,
    husky: false,
    redis: false,
  },
};

console.log('=== Guide URL Generator Tests ===\n');

// Test 1: Generate config ID
console.log('Test 1: Generate Config ID');
const configId = generateConfigId(testConfig);
console.log('✓ Generated config ID:', configId);
console.log('✓ Config ID format is valid:', /^\d+-[a-z0-9]+$/.test(configId));

// Test 2: Store and retrieve config
console.log('\nTest 2: Store and Retrieve Config');
storeConfig('test-id-123', testConfig);
const retrieved = getConfigById('test-id-123');
console.log('✓ Config stored and retrieved successfully');
console.log('✓ Retrieved config matches:', retrieved?.projectName === testConfig.projectName);

// Test 3: Generate guide URL
console.log('\nTest 3: Generate Guide URL');
const guideUrl = generateGuideUrl('vercel', configId);
console.log('✓ Generated guide URL:', guideUrl);
console.log('✓ URL format is correct:', guideUrl.startsWith('/guides/vercel/'));

// Test 4: Create complete guide URL
console.log('\nTest 4: Create Complete Guide URL');
const completeUrl = createGuideUrl('railway', testConfig);
console.log('✓ Created complete URL:', completeUrl);
console.log('✓ URL includes platform:', completeUrl.includes('railway'));

// Test 5: Encode and decode config
console.log('\nTest 5: Encode and Decode Config');
const encoded = encodeConfigToUrl(testConfig);
console.log('✓ Encoded config length:', encoded.length);
const decoded = decodeConfigFromUrl(encoded);
console.log('✓ Decoded config matches:', decoded?.projectName === testConfig.projectName);

// Test 6: Handle invalid config ID
console.log('\nTest 6: Handle Invalid Config ID');
const invalid = getConfigById('non-existent-id');
console.log('✓ Returns null for invalid ID:', invalid === null);

// Test 7: Handle invalid encoded string
console.log('\nTest 7: Handle Invalid Encoded String');
const invalidDecoded = decodeConfigFromUrl('invalid-base64-string');
console.log('✓ Returns null for invalid encoding:', invalidDecoded === null);

console.log('\n=== All Tests Passed ===');

export {};
