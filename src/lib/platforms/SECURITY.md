# Platform Security Features

This document describes the security features implemented for the deployment platform integrations.

## Overview

The platform integration system implements multiple layers of security to protect user tokens, prevent abuse, and ensure secure deployments.

## Security Features

### 1. Token Encryption (AES-256-GCM)

All platform access tokens are encrypted using AES-256-GCM before storage.

**Implementation:** `token-encryption.ts`

**Features:**
- AES-256-GCM encryption algorithm
- Unique initialization vector (IV) for each encryption
- Authentication tag for integrity verification
- 32-byte encryption key from environment variable

**Usage:**
```typescript
import { TokenEncryption } from '@/lib/platforms';

const encryption = new TokenEncryption();
const encrypted = encryption.encrypt('access_token_here');
const decrypted = encryption.decrypt(encrypted);
```

**Environment Variable:**
```bash
TOKEN_ENCRYPTION_KEY=your_64_character_hex_string
```

Generate a new key:
```typescript
import { TokenEncryption } from '@/lib/platforms';
const key = TokenEncryption.generateKey();
```

### 2. Rate Limiting

Prevents abuse by limiting deployments per user per time window.

**Implementation:** `rate-limiter.ts`

**Default Limits:**
- 10 deployments per hour per user
- Configurable via environment variable

**Features:**
- Redis-based rate limiting (with in-memory fallback)
- Automatic expiry of rate limit windows
- Rate limit info API (remaining, reset time)
- Admin reset functionality

**Usage:**
```typescript
import { getDeploymentRateLimiter } from '@/lib/platforms';

const rateLimiter = getDeploymentRateLimiter();
const allowed = await rateLimiter.checkLimit(userId);

if (!allowed) {
  const info = await rateLimiter.getRateLimitInfo(userId);
  console.log(`Rate limit exceeded. Resets at ${info.reset}`);
}
```

**Environment Variables:**
```bash
MAX_DEPLOYMENTS_PER_HOUR=10
REDIS_URL=redis://localhost:6379  # Optional, falls back to in-memory
```

### 3. Input Validation and Sanitization

Validates and sanitizes all user inputs to prevent injection attacks.

**Implementation:** `input-validator.ts` (in deployment module)

**Features:**
- Project name validation (platform-specific rules)
- Environment variable validation
- URL validation
- SQL injection detection
- XSS pattern detection
- Command injection detection
- Security scanning for malicious patterns

**Usage:**
```typescript
import { getInputValidator } from '@/lib/deployment/input-validator';

const validator = getInputValidator();

// Validate project name
const result = validator.validateProjectName('my-app', 'vercel');
if (!result.isValid) {
  console.error(result.error);
}

// Sanitize project name
const sanitized = validator.sanitizeProjectName('My App!');
// Returns: 'my-app'

// Security check
const securityCheck = validator.checkSecurity(userInput);
if (!securityCheck.isValid) {
  console.error('Malicious input detected:', securityCheck.error);
}
```

### 4. Secure Token Handling

Unified interface for secure token management across all platforms.

**Implementation:** `secure-token-handler.ts`

**Features:**
- HTTP-only cookies for token storage
- Never expose tokens in client-side code
- Automatic token revocation on disconnect
- Token expiry checking
- Sanitized connection data for client
- Last used timestamp tracking

**Usage:**
```typescript
import { getSecureTokenHandler } from '@/lib/platforms';

const handler = getSecureTokenHandler();

// Create secure connection
const connection = handler.createSecureConnection(
  userId,
  'vercel',
  accountId,
  accountName,
  accessToken,
  refreshToken,
  expiresAt,
  scopes
);

// Get decrypted token (updates lastUsedAt)
const token = handler.getAccessToken(connection);

// Check if expired
if (handler.isTokenExpired(connection)) {
  // Refresh token logic
}

// Sanitize for client (removes sensitive data)
const clientData = handler.sanitizeConnectionForClient(connection);
```

### 5. Automatic Token Cleanup

Periodically cleans up expired and unused tokens.

**Implementation:** `token-cleanup.ts`

**Features:**
- Automatic cleanup of expired tokens
- Cleanup of unused tokens (1 year inactivity)
- Configurable cleanup interval
- Manual cleanup methods
- Graceful error handling

**Usage:**
```typescript
import { initializeTokenCleanup } from '@/lib/platforms';

// Initialize on app startup
initializeTokenCleanup();
```

**Manual Cleanup:**
```typescript
import { getTokenCleanupService } from '@/lib/platforms';

const cleanup = getTokenCleanupService();

// Clean up all tokens for a user
await cleanup.cleanupUserTokens(userId);

// Clean up specific platform
await cleanup.cleanupPlatformTokens(userId, 'vercel');
```

**Environment Variable:**
```bash
TOKEN_CLEANUP_INTERVAL_MS=3600000  # 1 hour (default)
```

### 6. Rate Limit Middleware

Middleware for easy rate limiting in API routes.

**Implementation:** `rate-limit-middleware.ts`

**Features:**
- Easy integration with Next.js API routes
- Automatic rate limit headers
- Standardized error responses
- Retry-After header support

**Usage:**
```typescript
import { withRateLimit, addRateLimitHeaders } from '@/lib/platforms/rate-limit-middleware';

export async function POST(request: Request) {
  const userId = await getUserId(request);
  
  // Check rate limit
  const rateLimitCheck = await withRateLimit(userId);
  
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response;
  }
  
  // Process request...
  const result = await processRequest();
  
  // Add rate limit headers to response
  const response = NextResponse.json(result);
  return addRateLimitHeaders(response, rateLimitCheck.result);
}
```

## Cookie Security

All platform tokens are stored in HTTP-only cookies with the following settings:

```typescript
const COOKIE_OPTIONS = {
  httpOnly: true,                              // Prevents JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',                             // CSRF protection
  path: '/',                                   // Available site-wide
  maxAge: 60 * 60 * 24 * 365,                 // 1 year
};
```

## Token Revocation

Tokens are automatically revoked when:
1. User explicitly disconnects their account
2. Token expires (platform-dependent)
3. Token is unused for 1 year
4. Manual cleanup is triggered

**Disconnect Endpoints:**
- `POST /api/platforms/vercel/auth/disconnect`
- `POST /api/platforms/railway/auth/disconnect`
- `POST /api/platforms/render/auth/disconnect`

## Security Best Practices

### For Developers

1. **Never log tokens:** Tokens should never appear in logs
2. **Use environment variables:** All secrets in environment variables
3. **Validate all inputs:** Use InputValidator for all user inputs
4. **Check rate limits:** Use rate limiting middleware in deployment endpoints
5. **Sanitize for client:** Use `sanitizeConnectionForClient()` before sending to client
6. **Handle errors gracefully:** Don't expose sensitive error details to client

### For Deployment

1. **Set TOKEN_ENCRYPTION_KEY:** Generate a secure 64-character hex key
2. **Configure Redis:** Use Redis in production for rate limiting
3. **Enable HTTPS:** Ensure secure cookies work properly
4. **Monitor rate limits:** Track rate limit violations
5. **Regular cleanup:** Ensure token cleanup service is running
6. **Rotate keys:** Plan for encryption key rotation

## Environment Variables

Required:
```bash
TOKEN_ENCRYPTION_KEY=your_64_character_hex_string
```

Optional:
```bash
MAX_DEPLOYMENTS_PER_HOUR=10
REDIS_URL=redis://localhost:6379
TOKEN_CLEANUP_INTERVAL_MS=3600000
```

## Testing

Security features can be tested using the test files:
- `__test-encryption.ts` - Token encryption tests
- `__test-rate-limiter.ts` - Rate limiting tests

## Future Enhancements

1. **Token refresh:** Automatic token refresh before expiry
2. **Audit logging:** Log all token access and usage
3. **Anomaly detection:** Detect unusual deployment patterns
4. **IP-based rate limiting:** Additional rate limiting by IP
5. **Token rotation:** Periodic token rotation for enhanced security
6. **Multi-factor authentication:** Additional auth layer for sensitive operations
