# Render Platform Integration

This module provides integration with Render's deployment platform, enabling automated deployment of generated scaffolds.

## Features

- OAuth 2.0 authentication flow
- Web service creation and management
- Environment variable configuration
- PostgreSQL database provisioning
- Deployment triggering and monitoring
- Build log streaming

## Setup

### 1. Create a Render OAuth Application

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to Account Settings → OAuth Applications
3. Click "Create OAuth Application"
4. Configure:
   - **Name**: Cauldron2Code (or your preferred name)
   - **Redirect URI**: `http://localhost:3000/api/platforms/render/auth/callback` (for development)
   - **Scopes**: `read`, `write`
5. Save and copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
RENDER_CLIENT_ID=your_render_client_id
RENDER_CLIENT_SECRET=your_render_client_secret
RENDER_CALLBACK_URL=http://localhost:3000/api/platforms/render/auth/callback
```

For production, update the callback URL:
```bash
RENDER_CALLBACK_URL=https://your-domain.com/api/platforms/render/auth/callback
```

## Usage

### OAuth Flow

```typescript
import { renderOAuthService, RenderCookieManager } from '@/lib/platforms/render';

// Initiate OAuth
const state = renderOAuthService.generateState();
await RenderCookieManager.setOAuthState(state);
const authUrl = renderOAuthService.getAuthorizationUrl(state);
// Redirect user to authUrl

// Handle callback
const tokens = await renderOAuthService.exchangeCodeForToken(code);
const user = await renderOAuthService.getUserInfo(tokens.accessToken);
const connection = await renderOAuthService.createConnection(userId, tokens, user);
await RenderCookieManager.setConnection(connection);
```

### Deployment

```typescript
import { RenderService } from '@/lib/platforms/render';

const service = new RenderService(accessToken);

// Create project
const project = await service.createProject({
  projectName: 'my-app',
  platform: 'render',
  scaffoldConfig,
  environmentVariables: [
    { key: 'DATABASE_URL', value: 'postgres://...', required: true, sensitive: true },
  ],
  services: [],
});

// Upload files and deploy
await service.uploadFiles(project.id, files);
await service.setEnvironmentVariables(project.id, envVars);
const deployment = await service.triggerDeployment(project.id);

// Monitor deployment
const status = await service.getDeploymentStatus(deployment.id);
for await (const log of service.streamBuildLogs(deployment.id)) {
  console.log(log);
}
```

### Database Provisioning

```typescript
const dbInfo = await service.provisionDatabase('postgres');
console.log('Connection string:', dbInfo.connectionString);
```

## API Endpoints

The integration provides the following API endpoints:

- `POST /api/platforms/render/auth/initiate` - Start OAuth flow
- `GET /api/platforms/render/auth/callback` - Handle OAuth callback
- `POST /api/platforms/render/auth/disconnect` - Disconnect account
- `GET /api/platforms/render/auth/status` - Check connection status

## Render-Specific Features

### Web Service Configuration

Render services are configured with:
- **Build Command**: Automatically detected from scaffold config
- **Start Command**: Based on framework (Next.js, Express, etc.)
- **Publish Path**: Output directory for static files
- **Health Check**: `/api/health` endpoint
- **Auto Deploy**: Enabled by default

### Database Support

Render supports PostgreSQL databases with:
- Automatic provisioning
- Connection string generation
- Managed backups
- SSL connections

### Deployment Process

1. Create web service with configuration
2. Set environment variables
3. Trigger manual deployment
4. Monitor deployment status
5. Stream build logs

## Limitations

- Render requires git-based deployment for full functionality
- File upload creates a manual deploy (git repo recommended for production)
- Only PostgreSQL databases are supported
- No automatic rollback support

## Security

- Access tokens are encrypted using AES-256-GCM
- Tokens stored in HTTP-only cookies
- CSRF protection via state parameter
- All API calls over HTTPS

## Error Handling

The service throws descriptive errors for:
- Authentication failures
- Project creation errors
- Deployment failures
- API rate limits
- Network issues

## Resources

- [Render API Documentation](https://api-docs.render.com/)
- [Render OAuth Guide](https://render.com/docs/oauth)
- [Render Dashboard](https://dashboard.render.com)
