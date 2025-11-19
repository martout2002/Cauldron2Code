# OAuth Setup Guide for Cauldron2Code

This guide walks you through setting up OAuth for all deployment platforms and GitHub integration.

## Prerequisites

- A Cauldron2Code installation
- Access to create OAuth applications on each platform
- Node.js installed for generating encryption keys

## 1. Generate Encryption Keys

First, generate secure encryption keys for storing OAuth tokens:

```bash
# For GitHub token encryption
openssl rand -base64 32

# For platform token encryption (use a different key!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save these keys - you'll need them in your `.env.local` file.

## 2. GitHub OAuth Setup

GitHub OAuth is used for creating repositories directly from Cauldron2Code.

### Steps:

1. Go to https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in the form:
   - **Application name**: `Cauldron2Code` (or your preferred name)
   - **Homepage URL**: 
     - Development: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Application description**: (optional) "Full-stack scaffold generator"
   - **Authorization callback URL**: 
     - Development: `http://localhost:3000/api/github/auth/callback`
     - Production: `https://your-domain.com/api/github/auth/callback`
5. Click **"Register application"**
6. Copy the **Client ID**
7. Click **"Generate a new client secret"** and copy it immediately (you won't see it again!)

### Add to `.env.local`:

```bash
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/auth/callback
GITHUB_TOKEN_ENCRYPTION_KEY=your_generated_base64_key_here

# Rate limiting (optional, defaults shown)
GITHUB_RATE_LIMIT_MAX=5
GITHUB_RATE_LIMIT_WINDOW=3600000
```

### Production Setup:

When deploying to production, update your GitHub OAuth app:
1. Go back to your OAuth app settings
2. Update the **Homepage URL** to your production domain
3. Update the **Authorization callback URL** to `https://your-domain.com/api/github/auth/callback`
4. Update your production environment variables with the production callback URL

---

## 3. Vercel OAuth Setup

Vercel OAuth enables automated deployment to Vercel.

### Steps:

1. Go to https://vercel.com/account/integrations
2. Click **"Create"** to create a new integration
3. Fill in the integration details:
   - **Name**: `Cauldron2Code`
   - **Description**: (optional) "Automated deployment from Cauldron2Code"
   - **Logo**: (optional) Upload your logo
4. Under **"Redirect URLs"**, add:
   - Development: `http://localhost:3000/api/platforms/vercel/auth/callback`
   - Production: `https://your-domain.com/api/platforms/vercel/auth/callback`
5. Under **"Permissions"**, select:
   - ✅ Read and write access to deployments
   - ✅ Read and write access to projects
   - ✅ Read access to teams
6. Click **"Create"**
7. Copy the **Client ID** and **Client Secret**

### Add to `.env.local`:

```bash
VERCEL_CLIENT_ID=your_vercel_client_id_here
VERCEL_CLIENT_SECRET=your_vercel_client_secret_here
VERCEL_CALLBACK_URL=http://localhost:3000/api/platforms/vercel/auth/callback
```

---

## 4. Railway OAuth Setup

**Note**: Railway's OAuth is currently in private beta. You have two options:

### Option A: Contact Railway Support (Recommended for Production)

1. Email Railway support at support@railway.app
2. Request OAuth application credentials for your integration
3. Provide them with:
   - Your application name: "Cauldron2Code"
   - Redirect URL: `http://localhost:3000/api/platforms/railway/auth/callback`
   - Required scopes: Project creation, deployment management
4. They will provide you with Client ID and Client Secret

### Option B: Use API Tokens (Alternative)

For development or personal use, you can use Railway API tokens:

1. Go to https://railway.app/account/tokens
2. Click **"Create Token"**
3. Give it a name: "Cauldron2Code"
4. Copy the token

**Note**: The current implementation expects OAuth. You may need to modify the Railway integration to support API tokens if OAuth is not available.

### Add to `.env.local`:

```bash
RAILWAY_CLIENT_ID=your_railway_client_id_here
RAILWAY_CLIENT_SECRET=your_railway_client_secret_here
RAILWAY_CALLBACK_URL=http://localhost:3000/api/platforms/railway/auth/callback
```

---

## 5. Render OAuth Setup

Render OAuth enables automated deployment to Render.

### Steps:

1. Go to https://dashboard.render.com/oauth/applications
2. Click **"New OAuth Application"**
3. Fill in the form:
   - **Name**: `Cauldron2Code`
   - **Description**: (optional) "Automated deployment from Cauldron2Code"
   - **Redirect URI**: 
     - Development: `http://localhost:3000/api/platforms/render/auth/callback`
     - Production: `https://your-domain.com/api/platforms/render/auth/callback`
   - **Scopes**: Select:
     - ✅ `read` - Read access to services
     - ✅ `write` - Create and manage services
4. Click **"Create OAuth Application"**
5. Copy the **Client ID** and **Client Secret**

### Add to `.env.local`:

```bash
RENDER_CLIENT_ID=your_render_client_id_here
RENDER_CLIENT_SECRET=your_render_client_secret_here
RENDER_CALLBACK_URL=http://localhost:3000/api/platforms/render/auth/callback
```

---

## 6. Shared Configuration

Add these shared settings to your `.env.local`:

```bash
# Token Encryption Key (for all platform tokens)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_ENCRYPTION_KEY=your_64_character_hex_key_here

# Optional: Redis for rate limiting and caching
REDIS_URL=redis://localhost:6379

# Deployment Settings
MAX_DEPLOYMENTS_PER_HOUR=10
DEPLOYMENT_TIMEOUT_MS=300000
```

---

## Complete `.env.local` Example

Here's a complete example with all OAuth providers configured:

```bash
# ============================================
# GitHub OAuth (for repository creation)
# ============================================
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/auth/callback
GITHUB_TOKEN_ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456==

# Rate Limiting
GITHUB_RATE_LIMIT_MAX=5
GITHUB_RATE_LIMIT_WINDOW=3600000

# ============================================
# Vercel OAuth (for deployment)
# ============================================
VERCEL_CLIENT_ID=oac_abc123def456
VERCEL_CLIENT_SECRET=1234567890abcdef1234567890abcdef
VERCEL_CALLBACK_URL=http://localhost:3000/api/platforms/vercel/auth/callback

# ============================================
# Railway OAuth (for deployment)
# ============================================
RAILWAY_CLIENT_ID=your_railway_client_id
RAILWAY_CLIENT_SECRET=your_railway_client_secret
RAILWAY_CALLBACK_URL=http://localhost:3000/api/platforms/railway/auth/callback

# ============================================
# Render OAuth (for deployment)
# ============================================
RENDER_CLIENT_ID=your_render_client_id
RENDER_CLIENT_SECRET=your_render_client_secret
RENDER_CALLBACK_URL=http://localhost:3000/api/platforms/render/auth/callback

# ============================================
# Shared Configuration
# ============================================
TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Optional: Redis
REDIS_URL=redis://localhost:6379

# Deployment Settings
MAX_DEPLOYMENTS_PER_HOUR=10
DEPLOYMENT_TIMEOUT_MS=300000
```

---

## Testing Your OAuth Setup

After configuring all OAuth providers, test each integration:

### 1. Test GitHub OAuth:
```bash
npm run dev
# Navigate to http://localhost:3000/configure
# Click "Sign in with GitHub"
# Authorize the application
# You should see your GitHub username displayed
```

### 2. Test Platform OAuth:
```bash
# Navigate to http://localhost:3000/configure
# Scroll to "Deployment" section
# Click "Connect" for each platform (Vercel, Railway, Render)
# Complete the OAuth flow for each
# Verify connection status shows "Connected"
```

### 3. Test End-to-End Deployment:
```bash
# Configure a project in Cauldron2Code
# Click "Deploy Now"
# Select a connected platform
# Fill in environment variables
# Click "Deploy"
# Monitor deployment progress
# Verify successful deployment
```

---

## Troubleshooting

### "Invalid client_id" error:
- Double-check your Client ID is correct
- Ensure there are no extra spaces or quotes
- Verify the OAuth app exists on the platform

### "Redirect URI mismatch" error:
- Ensure the callback URL in your OAuth app matches exactly
- Check for http vs https
- Verify the port number (3000 for development)

### "Invalid client_secret" error:
- Regenerate the client secret on the platform
- Update your `.env.local` immediately
- Restart your development server

### Token encryption errors:
- Ensure `TOKEN_ENCRYPTION_KEY` is exactly 64 hex characters
- Ensure `GITHUB_TOKEN_ENCRYPTION_KEY` is a valid base64 string
- Generate new keys if needed

### Railway OAuth not available:
- Contact Railway support for OAuth access
- Consider using API tokens as an alternative
- Check Railway's documentation for updates on public OAuth

---

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use different encryption keys** for GitHub and platforms
3. **Rotate secrets regularly** - Update OAuth secrets every 90 days
4. **Use environment-specific OAuth apps** - Separate apps for dev/staging/prod
5. **Enable 2FA** on all platform accounts
6. **Monitor OAuth app usage** - Check for suspicious activity
7. **Revoke unused tokens** - Clean up old OAuth connections

---

## Production Deployment Checklist

When deploying Cauldron2Code to production:

- [ ] Create production OAuth apps for all platforms
- [ ] Update all callback URLs to production domain
- [ ] Generate new encryption keys for production
- [ ] Set all environment variables in production hosting
- [ ] Test OAuth flows in production environment
- [ ] Enable HTTPS (required for OAuth)
- [ ] Set up monitoring for OAuth failures
- [ ] Document OAuth app credentials securely (use a password manager)

---

## Need Help?

- **GitHub OAuth**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Vercel OAuth**: https://vercel.com/docs/integrations
- **Railway**: https://docs.railway.app/reference/public-api
- **Render OAuth**: https://render.com/docs/oauth

For Cauldron2Code-specific issues, check the main README.md or open an issue on GitHub.
