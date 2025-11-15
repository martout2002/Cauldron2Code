# GitHub OAuth App Setup Guide

This guide walks you through setting up a GitHub OAuth application for StackForge's GitHub integration feature.

## Prerequisites

- A GitHub account
- Access to GitHub's Developer Settings

## Step-by-Step Setup

### 1. Create a GitHub OAuth App

1. Navigate to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **"OAuth Apps"** in the left sidebar
3. Click the **"New OAuth App"** button

### 2. Configure OAuth App Settings

Fill in the following information:

- **Application name**: `StackForge` (or your preferred name)
- **Homepage URL**: 
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`
- **Application description** (optional): `Full-stack project scaffold generator with GitHub integration`
- **Authorization callback URL**: 
  - Development: `http://localhost:3000/api/github/auth/callback`
  - Production: `https://your-domain.com/api/github/auth/callback`

### 3. Register the Application

1. Click **"Register application"**
2. You'll be redirected to your new OAuth app's settings page

### 4. Get Your Credentials

1. On the OAuth app settings page, you'll see your **Client ID** - copy this
2. Click **"Generate a new client secret"**
3. Copy the generated **Client Secret** immediately (you won't be able to see it again)

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```bash
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/api/github/auth/callback
   ```

3. Generate an encryption key for token storage:
   ```bash
   openssl rand -base64 32
   ```
   
4. Add the encryption key to `.env.local`:
   ```bash
   GITHUB_TOKEN_ENCRYPTION_KEY=your_generated_key
   ```

### 6. Update Callback URL for Production

When deploying to production:

1. Go back to your GitHub OAuth App settings
2. Update the **Authorization callback URL** to your production domain:
   ```
   https://your-domain.com/api/github/auth/callback
   ```
3. Update `GITHUB_CALLBACK_URL` in your production environment variables

## OAuth Scopes

StackForge requests the following GitHub OAuth scopes:

- **`repo`**: Create repositories and push code
- **`user:email`**: Access user email for git commits

These scopes are automatically requested during the OAuth flow and cannot be customized in the OAuth app settings.

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate secrets regularly** - Generate new client secrets periodically
3. **Use different OAuth apps** - Create separate apps for development and production
4. **Restrict callback URLs** - Only add necessary callback URLs to prevent unauthorized redirects
5. **Monitor usage** - Check your OAuth app's usage in GitHub settings

## Troubleshooting

### "The redirect_uri MUST match the registered callback URL"

- Ensure `GITHUB_CALLBACK_URL` in your `.env.local` exactly matches the callback URL registered in your GitHub OAuth app
- Check for trailing slashes - they must match exactly

### "Bad verification code"

- The OAuth code may have expired (they're single-use and short-lived)
- Try the authentication flow again

### "Application suspended"

- Check your GitHub OAuth app status in developer settings
- Ensure you haven't violated GitHub's terms of service

## Testing the Setup

Once configured, you can test the OAuth flow:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the configuration page
3. Complete a scaffold configuration
4. Click "Create GitHub Repository"
5. You should be redirected to GitHub for authorization
6. After approving, you should be redirected back to StackForge

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [OAuth 2.0 Specification](https://oauth.net/2/)
