# GitHub Authentication Quick Start

## 🚀 Setup (5 minutes)

### 1. Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Name**: StackForge
   - **Homepage**: http://localhost:3000
   - **Callback**: http://localhost:3000/api/github/auth/callback
4. Copy Client ID and generate Client Secret

### 2. Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Generate encryption key
openssl rand -base64 32

# Edit .env.local with your values
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/auth/callback
GITHUB_TOKEN_ENCRYPTION_KEY=your_generated_key_here
```

### 3. Use the Component
```tsx
import { GitHubAuthButton } from '@/components/GitHubAuthButton';

export default function Page() {
  return <GitHubAuthButton />;
}
```

## 📚 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/github/auth/initiate` | GET | Start OAuth flow |
| `/api/github/auth/callback` | GET | Handle OAuth callback |
| `/api/github/auth/status` | GET | Check auth status |
| `/api/github/auth/signout` | POST | Sign out user |

## 🔒 Security Features

✅ AES-256-GCM token encryption
✅ HTTP-only cookies
✅ CSRF protection via state parameter
✅ Timing-safe comparisons
✅ Secure flag in production

## 🎨 Component States

1. **Loading**: Checking authentication status
2. **Not Authenticated**: "Sign in with GitHub" button
3. **Authenticated**: User avatar, name, and sign-out button
4. **Error**: Error message with retry option

## 📖 Full Documentation

- **Setup Guide**: `GITHUB_OAUTH_SETUP.md`
- **Integration Guide**: `GITHUB_AUTH_INTEGRATION.md`
- **Implementation Details**: `TASK_23_IMPLEMENTATION_SUMMARY.md`

## 🐛 Troubleshooting

**"Failed to initiate authentication"**
→ Check environment variables are set

**"Invalid state parameter"**
→ Clear cookies and try again

**"The redirect_uri MUST match"**
→ Ensure GITHUB_CALLBACK_URL matches OAuth app settings exactly

## ✨ What's Next?

After authentication is working:
- Task 24: Repository creation
- Task 25: Progress tracking
- Task 26: Documentation generation
