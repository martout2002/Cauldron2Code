/**
 * Test file for Architecture Diagrams
 * 
 * This file demonstrates and tests the architecture diagram generation
 * functionality. Run this to verify diagrams are generated correctly.
 */

import { PLATFORMS } from './platforms';
import {
  getDeploymentWorkflowDiagram,
  getMonorepoArchitectureDiagram,
  getFullStackArchitectureDiagram,
  getDatabaseSetupDiagram,
  getEnvVarsConfigDiagram,
  getOAuthCallbackDiagram,
  getTroubleshootingDiagram,
  getCICDPipelineDiagram,
  getDiagramForContext,
} from './architecture-diagrams';

console.log('='.repeat(80));
console.log('ARCHITECTURE DIAGRAMS TEST');
console.log('='.repeat(80));

// Test 1: Deployment Workflow Diagram
console.log('\n1. DEPLOYMENT WORKFLOW DIAGRAM (with database and auth)');
console.log('-'.repeat(80));
const workflowDiagram = getDeploymentWorkflowDiagram(PLATFORMS[0], true, true);
console.log(workflowDiagram);

// Test 2: Monorepo Architecture Diagram
console.log('\n2. MONOREPO ARCHITECTURE DIAGRAM');
console.log('-'.repeat(80));
const monorepoServices = ['Frontend', 'Backend API', 'Database'];
const monorepoDiagram = getMonorepoArchitectureDiagram(monorepoServices);
console.log(monorepoDiagram);

// Test 3: Full-Stack Architecture Diagram
console.log('\n3. FULL-STACK ARCHITECTURE DIAGRAM');
console.log('-'.repeat(80));
const fullStackDiagram = getFullStackArchitectureDiagram(true, true, true, true);
console.log(fullStackDiagram);

// Test 4: Database Setup Diagram (Platform-native)
console.log('\n4. DATABASE SETUP DIAGRAM (Platform-native)');
console.log('-'.repeat(80));
const dbSetupDiagram = getDatabaseSetupDiagram(PLATFORMS[1], 'PostgreSQL');
console.log(dbSetupDiagram);

// Test 5: Database Setup Diagram (External)
console.log('\n5. DATABASE SETUP DIAGRAM (External)');
console.log('-'.repeat(80));
const externalDbDiagram = getDatabaseSetupDiagram(PLATFORMS[3], 'PostgreSQL');
console.log(externalDbDiagram);

// Test 6: Environment Variables Configuration Diagram
console.log('\n6. ENVIRONMENT VARIABLES CONFIGURATION DIAGRAM');
console.log('-'.repeat(80));
const envVarsDiagram = getEnvVarsConfigDiagram(PLATFORMS[0], 5);
console.log(envVarsDiagram);

// Test 7: OAuth Callback Configuration Diagram
console.log('\n7. OAUTH CALLBACK CONFIGURATION DIAGRAM');
console.log('-'.repeat(80));
const oauthDiagram = getOAuthCallbackDiagram('NextAuth.js');
console.log(oauthDiagram);

// Test 8: Troubleshooting Decision Tree
console.log('\n8. TROUBLESHOOTING DECISION TREE');
console.log('-'.repeat(80));
const troubleshootingDiagram = getTroubleshootingDiagram();
console.log(troubleshootingDiagram);

// Test 9: CI/CD Pipeline Diagram
console.log('\n9. CI/CD PIPELINE DIAGRAM');
console.log('-'.repeat(80));
const cicdDiagram = getCICDPipelineDiagram(PLATFORMS[0]);
console.log(cicdDiagram);

// Test 10: Context-based Diagram Generation
console.log('\n10. CONTEXT-BASED DIAGRAM GENERATION');
console.log('-'.repeat(80));
const contextDiagrams = getDiagramForContext({
  platform: PLATFORMS[0],
  hasDatabase: true,
  hasAuth: true,
  hasAI: true,
  hasRedis: false,
  isMonorepo: false,
  authProvider: 'NextAuth.js',
  databaseType: 'PostgreSQL',
  envVarCount: 5,
});

console.log(`Generated ${contextDiagrams.length} diagrams for context:`);
contextDiagrams.forEach((diagram, index) => {
  console.log(`\n${index + 1}. ${diagram.type}`);
  console.log(`   Description: ${diagram.description}`);
  console.log(`   Diagram length: ${diagram.diagram.length} characters`);
});

// Test 11: Monorepo Context
console.log('\n11. MONOREPO CONTEXT DIAGRAMS');
console.log('-'.repeat(80));
const monorepoDiagrams = getDiagramForContext({
  platform: PLATFORMS[1],
  hasDatabase: true,
  hasAuth: false,
  hasAI: false,
  hasRedis: true,
  isMonorepo: true,
  services: ['Frontend', 'Backend API', 'Worker Service'],
  databaseType: 'PostgreSQL',
  envVarCount: 8,
});

console.log(`Generated ${monorepoDiagrams.length} diagrams for monorepo:`);
monorepoDiagrams.forEach((diagram, index) => {
  console.log(`\n${index + 1}. ${diagram.type}`);
  console.log(`   Description: ${diagram.description}`);
});

// Validation Tests
console.log('\n' + '='.repeat(80));
console.log('VALIDATION TESTS');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

// Test: All diagrams should contain mermaid code blocks
const testDiagrams = [
  workflowDiagram,
  monorepoDiagram,
  fullStackDiagram,
  dbSetupDiagram,
  envVarsDiagram,
  oauthDiagram,
  troubleshootingDiagram,
  cicdDiagram,
];

testDiagrams.forEach((diagram, index) => {
  const hasMermaid = diagram.includes('```mermaid') && diagram.includes('```');
  if (hasMermaid) {
    console.log(`✓ Test ${index + 1}: Diagram contains valid Mermaid code block`);
    passCount++;
  } else {
    console.log(`✗ Test ${index + 1}: Diagram missing Mermaid code block`);
    failCount++;
  }
});

// Test: Context diagrams should include workflow diagram
const hasWorkflow = contextDiagrams.some(d => d.type === 'deployment-workflow');
if (hasWorkflow) {
  console.log('✓ Test: Context diagrams include deployment workflow');
  passCount++;
} else {
  console.log('✗ Test: Context diagrams missing deployment workflow');
  failCount++;
}

// Test: Monorepo context should include monorepo architecture
const hasMonorepoArch = monorepoDiagrams.some(d => d.type === 'monorepo-architecture');
if (hasMonorepoArch) {
  console.log('✓ Test: Monorepo context includes monorepo architecture');
  passCount++;
} else {
  console.log('✗ Test: Monorepo context missing monorepo architecture');
  failCount++;
}

// Test: Database context should include database setup
const hasDbSetup = contextDiagrams.some(d => d.type === 'database-setup');
if (hasDbSetup) {
  console.log('✓ Test: Database context includes database setup diagram');
  passCount++;
} else {
  console.log('✗ Test: Database context missing database setup diagram');
  failCount++;
}

// Test: Auth context should include OAuth callback
const hasOAuth = contextDiagrams.some(d => d.type === 'oauth-callback');
if (hasOAuth) {
  console.log('✓ Test: Auth context includes OAuth callback diagram');
  passCount++;
} else {
  console.log('✗ Test: Auth context missing OAuth callback diagram');
  failCount++;
}

// Test: All contexts should include troubleshooting
const hasTroubleshooting = contextDiagrams.some(d => d.type === 'troubleshooting');
if (hasTroubleshooting) {
  console.log('✓ Test: Context includes troubleshooting diagram');
  passCount++;
} else {
  console.log('✗ Test: Context missing troubleshooting diagram');
  failCount++;
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n✓ All tests passed! Architecture diagrams are working correctly.');
} else {
  console.log('\n✗ Some tests failed. Please review the implementation.');
}

console.log('='.repeat(80));

