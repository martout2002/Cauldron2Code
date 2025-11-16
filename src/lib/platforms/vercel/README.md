# Vercel Platform Integration

This module provides complete Vercel platform integration for Cauldron2Code, enabling automated deployment of generated scaffolds to Vercel.

## Features

- **OAuth Authentication**: Secure OAuth 2.0 flow for connecting Vercel accounts
- **Project Management**: Create and configure Vercel projects via API
- **Deployment**: Upload files and trigger deployments
- **Monitoring**: Check deployment status and stream build logs
- **Security**: Encrypted token storage using AES-256-GCM

## Components

### OAuth Service (`oauth.ts`)
Handles Vercel OAuth authentication flow:
- Generate authorization URLs with CSRF protection
- Exchange authorization codes for access tokens
- Fetch user information from Vercel API
- Token encryption/decryption
- State validation for security

### Cookie Manager (`cookie-manager.ts`)
Manages secure HTTP-only cookies for:
- Encrypted access tokens
- OAuth state parameters
- User information (for UI display)
- Connection IDs

### Vercel Service (`vercel-service.ts`)
Implements the `PlatformService` interface:
- Create projects with framework detection
- Upload files via deployment API
- Configure environment variables
- Monitor deployment status
- Stream build logs

## API Endpoints

### Authentication Endpoints

#### `GET /api/platforms/vercel/auth/initiate`
Initiates the Vercel OAuth flow.

**Response:**
```json
{
  "authUrl": "https://vercel.com/oauth/authorize?...",
  "success": true
}
```

#### `GET /api/platforms/vercel/auth/callback`
Handles OAuth callback from Vercel.

**Query Parameters:**
- `code`: Authorization code from Vercel
- `state`: CSRF protection state parameter

**Redirects to:** `/configure?vercel_auth_success=true`

#### `GET /api/platforms/vercel/auth/status`
Check current Vercel connection status.

**Response:**
```json
{
  "connected": true,
  "user": {
    "username": "johndoe",
    "name": "John Doe",
    "avatar": "https://..."
  },
  "connectionId": "uuid"
}
```

#### `POST /api/platforms/vercel/auth/disconnect`
Disconnect Vercel account and clear all cookies.

**Response:**
```json
{
  "success": true,
  "message": "Vercel account disconnected successfully"
}
```

## Environment Variables

Required environment variables (add to `.env.local`):

```bash
# Vercel OAuth Configuration
VERCEL_CLIENT_ID=your_vercel_client_id
VERCEL_CLIENT_SECRET=your_vercel_client_secret
VERCEL_CALLBACK_URL=http://localhost:3000/api/platforms/vercel/auth/callback

# Token Encryption Key (32 bytes hex)
TOKEN_ENCRYPTION_KEY=your_64_character_hex_key
```

## Setup Instructions

### 1. Create Vercel Integration

1. Go to https://vercel.com/account/integrations
2. Click "Create Integration"
3. Set Integration name: "Cauldron2Code"
4. Set Redirect URL: `http://localhost:3000/api/platforms/vercel/auth/callback`
5. Configure required scopes
6. Click "Create"
7. Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add the credentials to your `.env.local` file:

```bash
VERCEL_CLIENT_ID=your_client_id_here
VERCEL_CLIENT_SECRET=your_client_secret_here
```

### 3. Generate Encryption Key

Generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add it to `.env.local`:

```bash
TOKEN_ENCRYPTION_KEY=generated_key_here
```

## Usage Example

```typescript
import { VercelService } from '@/lib/platforms/vercel';
import { vercelOAuthService } from '@/lib/platforms/vercel';

// Create service instance with access token
const connection = await getVercelConnection(); // Your method to get stored connection
const accessToken = vercelOAuthService.decryptToken(connection);
const vercelService = new VercelService(accessToken);

// Create a project
const project = await vercelService.createProject({
  projectName: 'my-awesome-app',
  platform: 'vercel',
  scaffoldConfig: config,
  environmentVariables: [
    {
      key: 'DATABASE_URL',
      value: 'postgresql://...',
      description: 'Database connection string',
      required: true,
      sensitive: true,
    },
  ],
  services: [],
});

// Upload files
await vercelService.uploadFiles(project.id, generatedFiles);

// Monitor deployment
const status = await vercelService.getDeploymentStatus(deploymentId);
console.log(`Deployment status: ${status.state}`);
```

## Security Features

1. **Token Encryption**: All access tokens are encrypted using AES-256-GCM before storage
2. **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies to prevent XSS attacks
3. **CSRF Protection**: State parameter validation prevents CSRF attacks
4. **Secure Transport**: All API calls use HTTPS
5. **Token Isolation**: Each platform has separate token storage

## Framework Detection

The service automatically detects the appropriate Vercel framework preset:

- Next.js → `nextjs`
- React (Vite) → `vite`
- Vue → `vue`
- Svelte → `svelte`

## Build Configuration

Automatically configures:
- **Build Command**: Based on project structure (monorepo support)
- **Output Directory**: Framework-specific (`.next`, `dist`, `build`)
- **Install Command**: `npm install` (default)
- **Dev Command**: `npm run dev`

## Limitations

1. **Database Provisioning**: Vercel doesn't support automatic database provisioning
2. **Token Revocation**: Vercel doesn't provide a token revocation API endpoint
3. **Token Expiration**: Vercel tokens don't expire (1 year cookie lifetime)

## Error Handling

The service handles common errors:
- Invalid OAuth credentials
- Project name conflicts
- API rate limits
- Network failures
- Invalid deployment configurations

All errors are logged and returned with descriptive messages.

## Testing

To test the integration:

1. Set up environment variables
2. Start the development server: `npm run dev`
3. Navigate to `/configure`
4. Click "Connect Vercel Account"
5. Complete OAuth flow
6. Check connection status at `/api/platforms/vercel/auth/status`

## Next Steps

After implementing Vercel integration, the next steps are:
1. Implement Railway integration (Task 3)
2. Implement Render integration (Task 4)
3. Build deployment orchestration system (Task 6)
4. Create deployment UI components (Task 8)

## References

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel OAuth Documentation](https://vercel.com/docs/rest-api/authentication)
- [Vercel Deployments API](https://vercel.com/docs/rest-api/endpoints/deployments)
