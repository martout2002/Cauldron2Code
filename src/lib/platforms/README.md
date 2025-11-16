# Platform Integration Foundation

This module provides the foundation for integrating with deployment platforms (Vercel, Railway, Render) to enable automated deployment of generated scaffolds.

## Architecture

The platform integration system consists of several key components:

### 1. Type Definitions (`types.ts`)

Core TypeScript interfaces and types for:
- Platform connections and authentication
- Deployment configurations
- Environment variables
- Deployment status and monitoring
- Error handling

### 2. Platform Service Interface (`platform-service.ts`)

Base interface that all platform integrations must implement:
- **Authentication**: OAuth flows, token management
- **Project Management**: Create projects, check name availability
- **Deployment**: Upload files, configure environment, trigger deployments
- **Monitoring**: Check status, stream build logs
- **Database**: Optional database provisioning (platform-dependent)

### 3. Token Encryption (`token-encryption.ts`)

Secure token storage using AES-256-GCM encryption:
- Encrypts platform access tokens before storage
- Decrypts tokens when needed for API calls
- Uses `TOKEN_ENCRYPTION_KEY` environment variable
- Format: `iv:authTag:encrypted`

**Usage:**
```typescript
import { TokenEncryption } from '@/lib/platforms';

const encryption = new TokenEncryption();
const encrypted = encryption.encrypt('access_token_here');
const decrypted = encryption.decrypt(encrypted);
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Redis Client (`redis-client.ts`)

Redis client wrapper for rate limiting and caching:
- Provides a simple interface for Redis operations
- Falls back to in-memory storage if Redis is not available
- Automatic cleanup of expired items in memory mode

**Usage:**
```typescript
import { getRedisClient } from '@/lib/platforms';

const redis = getRedisClient();
await redis.set('key', 'value', 3600); // expires in 1 hour
const value = await redis.get('key');
```

### 5. Rate Limiter (`rate-limiter.ts`)

Deployment rate limiting to prevent abuse:
- Default: 10 deployments per hour per user
- Uses Redis for distributed rate limiting
- Provides methods to check limits, get remaining deployments, and reset time

**Usage:**
```typescript
import { getDeploymentRateLimiter } from '@/lib/platforms';

const limiter = getDeploymentRateLimiter();
const canDeploy = await limiter.checkLimit(userId);

if (!canDeploy) {
  const info = await limiter.getRateLimitInfo(userId);
  console.log(`Rate limit exceeded. Resets at ${info.reset}`);
}
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Platform OAuth Credentials
VERCEL_CLIENT_ID=your_vercel_client_id
VERCEL_CLIENT_SECRET=your_vercel_client_secret
VERCEL_CALLBACK_URL=http://localhost:3000/api/platforms/vercel/auth/callback

RAILWAY_CLIENT_ID=your_railway_client_id
RAILWAY_CLIENT_SECRET=your_railway_client_secret
RAILWAY_CALLBACK_URL=http://localhost:3000/api/platforms/railway/auth/callback

RENDER_CLIENT_ID=your_render_client_id
RENDER_CLIENT_SECRET=your_render_client_secret
RENDER_CALLBACK_URL=http://localhost:3000/api/platforms/render/auth/callback

# Token Encryption (32 bytes hex)
TOKEN_ENCRYPTION_KEY=your_64_character_hex_key

# Rate Limiting
REDIS_URL=redis://localhost:6379
MAX_DEPLOYMENTS_PER_HOUR=10
DEPLOYMENT_TIMEOUT_MS=300000
```

## Security Considerations

1. **Token Storage**: All platform access tokens are encrypted using AES-256-GCM before storage
2. **HTTP-Only Cookies**: Tokens should be stored in HTTP-only cookies, never in localStorage
3. **Rate Limiting**: Prevents abuse with configurable deployment limits per user
4. **Input Validation**: All user inputs must be validated before use
5. **HTTPS Only**: All platform API calls must use HTTPS

## Next Steps

To implement a platform integration:

1. Create a service class that implements `PlatformService`
2. Implement OAuth authentication flow
3. Implement project creation and file upload
4. Implement deployment triggering and monitoring
5. Add platform-specific error handling
6. Create API routes for OAuth callbacks
7. Add UI components for platform connection

See the design document for detailed implementation examples.

## Development Notes

### Redis Setup

For local development without Redis:
- The system automatically falls back to in-memory storage
- This is suitable for development but NOT for production with multiple instances
- Install Redis locally or use a managed service (Upstash, Redis Cloud) for production

### Testing

When testing platform integrations:
1. Use test/sandbox accounts for platforms
2. Mock platform API calls in unit tests
3. Test rate limiting with different user IDs
4. Verify token encryption/decryption
5. Test error handling and recovery

## Future Enhancements

- Add support for more platforms (AWS Amplify, Netlify, Fly.io)
- Implement actual Redis client with ioredis
- Add deployment analytics and monitoring
- Support for team/organization deployments
- Deployment rollback functionality
- CI/CD integration for automatic deployments
