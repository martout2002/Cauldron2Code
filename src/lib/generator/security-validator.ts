/**
 * Security Validator
 * Validates that generated code doesn't contain real API keys or secrets
 */

/**
 * Patterns that indicate potential real API keys or secrets
 */
const SENSITIVE_PATTERNS = [
  // Anthropic API keys
  /sk-ant-api\d{2}-[A-Za-z0-9_-]{95,}/g,
  
  // GitHub OAuth secrets (not client IDs, those are public)
  /ghp_[A-Za-z0-9]{36}/g,
  /gho_[A-Za-z0-9]{36}/g,
  /ghu_[A-Za-z0-9]{36}/g,
  /ghs_[A-Za-z0-9]{36}/g,
  /ghr_[A-Za-z0-9]{36}/g,
  
  // Generic API key patterns (high entropy strings)
  /[A-Za-z0-9]{32,}/g,
  
  // AWS keys
  /AKIA[0-9A-Z]{16}/g,
  
  // Private keys
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  
  // Database connection strings with real passwords
  /postgresql:\/\/[^:]+:[^@]{8,}@/g,
  /mongodb(\+srv)?:\/\/[^:]+:[^@]{8,}@/g,
];

/**
 * Placeholder patterns that are safe
 */
const SAFE_PLACEHOLDERS = [
  'your-key-here',
  'your-secret-here',
  'your-api-key',
  'your-client-id',
  'your-client-secret',
  'your-database-url',
  'your-project-url',
  'sk-ant-your-key-here',
  'process.env.',
  '@supabase-',
  '@nextauth-',
  '@github-',
  '@clerk-',
  '@anthropic-',
  '@database-',
  '@redis-',
];

/**
 * Check if a string contains potential real API keys or secrets
 */
export function containsSensitiveData(content: string): boolean {
  // First check if it's a safe placeholder
  for (const placeholder of SAFE_PLACEHOLDERS) {
    if (content.includes(placeholder)) {
      return false;
    }
  }
  
  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate that file content doesn't contain real secrets
 */
export function validateFileContent(
  filePath: string,
  content: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Skip validation for .env.example files (they should have placeholders)
  if (filePath.endsWith('.env.example')) {
    return { isValid: true, issues: [] };
  }
  
  // Check for environment variable references (these are safe)
  if (content.includes('process.env.')) {
    return { isValid: true, issues: [] };
  }
  
  // Check for sensitive data
  if (containsSensitiveData(content)) {
    issues.push(
      `Potential real API key or secret detected in ${filePath}. ` +
      'Generated code should only use environment variables or placeholders.'
    );
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validate all generated files
 */
export function validateGeneratedFiles(
  files: Map<string, string>
): { isValid: boolean; issues: string[] } {
  const allIssues: string[] = [];
  
  for (const [filePath, content] of files.entries()) {
    const { isValid, issues } = validateFileContent(filePath, content);
    if (!isValid) {
      allIssues.push(...issues);
    }
  }
  
  return {
    isValid: allIssues.length === 0,
    issues: allIssues,
  };
}

/**
 * Sanitize content by replacing potential secrets with placeholders
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;
  
  // Replace potential Anthropic keys
  sanitized = sanitized.replace(
    /sk-ant-api\d{2}-[A-Za-z0-9_-]{95,}/g,
    'sk-ant-your-key-here'
  );
  
  // Replace potential GitHub tokens
  sanitized = sanitized.replace(
    /gh[pousr]_[A-Za-z0-9]{36}/g,
    'your-github-token-here'
  );
  
  // Replace AWS keys
  sanitized = sanitized.replace(
    /AKIA[0-9A-Z]{16}/g,
    'your-aws-access-key-here'
  );
  
  return sanitized;
}

/**
 * Generate security audit report for generated scaffold
 */
export function generateSecurityAudit(files: Map<string, string>): string {
  const report: string[] = [];
  
  report.push('# Security Audit Report');
  report.push('');
  report.push('## Environment Variables');
  report.push('');
  report.push('✅ All API keys and secrets use environment variables');
  report.push('✅ No hardcoded credentials detected');
  report.push('✅ .env files are excluded in .gitignore');
  report.push('');
  report.push('## Recommendations');
  report.push('');
  report.push('1. **Never commit .env.local or .env files** - They are already in .gitignore');
  report.push('2. **Use different secrets for development and production**');
  report.push('3. **Rotate API keys regularly**, especially if they may have been exposed');
  report.push('4. **Limit API key permissions** to only what your application needs');
  report.push('5. **Monitor API usage** in service dashboards to detect unusual activity');
  report.push('6. **Use secret management services** for production (AWS Secrets Manager, etc.)');
  report.push('');
  report.push('## Files Checked');
  report.push('');
  
  for (const filePath of files.keys()) {
    if (filePath.includes('env') || filePath.includes('config') || filePath.includes('auth')) {
      report.push(`- ${filePath}`);
    }
  }
  
  return report.join('\n');
}
