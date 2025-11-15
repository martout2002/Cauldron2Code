# GitHub Authentication Integration Guide

This document explains how to integrate the GitHub authentication button into your application.

## Component Overview

The `GitHubAuthButton` component provides a complete GitHub OAuth authentication flow with:

- Sign in with GitHub functionality
- Display of authenticated user information (avatar, name, username)
- Sign out functionality
- Error handling and user feedback
- Loading states for all async operations

## Basic Usage

### 1. Import the Component

```tsx
import { GitHubAuthButton } from '@/components/GitHubAuthButton';
```

### 2. Add to Your Page

```tsx
export default function ConfigurePage() {
  const [isGitHubAuthenticated, setIsGitHubAuthenticated] = useState(false);

  return (
    <div>
      <h2>GitHub Integration</h2>
      <GitHubAuthButton 
        onAuthChange={(authenticated) => {
          setIsGitHubAuthenticated(authenticated);
          console.log('GitHub auth status:', authenticated);
        }}
      />
      
      {isGitHubAuthenticated && (
        <p>You can now create GitHub repositories!</p>
      )}
    </div>
  );
}
```

## Integration with Configure Page

Here's how to integrate the GitHub auth button into the configuration page:

```tsx
'use client';

import { useState } from 'react';
import { ConfigurationWizard } from '@/components/ConfigurationWizard';
import { GitHubAuthButton } from '@/components/GitHubAuthButton';
import { GenerateButton } from '@/components/GenerateButton';
import { useConfigStore } from '@/lib/store/config-store';

export default function ConfigurePage() {
  const { config } = useConfigStore();
  const [isGitHubAuthenticated, setIsGitHubAuthenticated] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Section */}
        <div>
          <h1 className="text-3xl font-bold mb-6">Configure Your Stack</h1>
          <ConfigurationWizard />
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          {/* GitHub Authentication */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              GitHub Integration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sign in with GitHub to create repositories directly from StackForge
            </p>
            <GitHubAuthButton 
              onAuthChange={setIsGitHubAuthenticated}
            />
          </div>

          {/* Generation Options */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Generate Your Project
            </h2>
            <GenerateButton config={config} />
            
            {/* Future: Add CreateRepoButton here when task 24 is implemented */}
            {isGitHubAuthenticated && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                ✓ GitHub connected - Repository creation will be available after generation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Component Props

### GitHubAuthButton

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onAuthChange` | `(authenticated: boolean) => void` | No | Callback fired when authentication status changes |
| `className` | `string` | No | Additional CSS classes to apply to the container |

## Authentication Flow

### Sign In Flow

1. User clicks "Sign in with GitHub"
2. Component calls `/api/github/auth/initiate`
3. User is redirected to GitHub OAuth page
4. User authorizes the application
5. GitHub redirects back to `/api/github/auth/callback`
6. Callback endpoint validates and stores the session
7. User is redirected back to `/configure` with success message
8. Component automatically detects authentication and updates UI

### Sign Out Flow

1. User clicks "Sign Out"
2. Component calls `/api/github/auth/signout`
3. Server revokes the GitHub token and clears cookies
4. Component updates to show "Sign in with GitHub" button

## Error Handling

The component handles various error scenarios:

- **OAuth Errors**: Displayed when GitHub returns an error
- **Network Errors**: Shown when API calls fail
- **Invalid State**: Detected and prevented (CSRF protection)
- **Token Expiration**: Automatically clears session and prompts re-authentication

## Styling

The component uses Tailwind CSS and follows the existing design system:

- **Authenticated State**: Green background with user info
- **Sign In Button**: Dark gray background (GitHub style)
- **Error Messages**: Red background with alert icon
- **Loading States**: Spinner animations

## Security Features

1. **HTTP-Only Cookies**: Access tokens stored securely
2. **Token Encryption**: Tokens encrypted at rest using AES-256-GCM
3. **CSRF Protection**: State parameter validated on callback
4. **Secure Flag**: Cookies marked secure in production
5. **SameSite**: Cookies use SameSite=Lax for CSRF protection

## Testing

To test the GitHub authentication:

1. Set up environment variables (see `.env.example`)
2. Create a GitHub OAuth App (see `GITHUB_OAUTH_SETUP.md`)
3. Start the development server
4. Navigate to the configure page
5. Click "Sign in with GitHub"
6. Authorize the application
7. Verify you're redirected back and see your user info

## Troubleshooting

### "Failed to initiate authentication"

- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Verify `GITHUB_CALLBACK_URL` matches your OAuth app settings

### "Invalid state parameter"

- This is a security feature preventing CSRF attacks
- Try clearing cookies and signing in again
- Ensure cookies are enabled in your browser

### "Session expired"

- The access token may have been revoked
- Click "Sign in with GitHub" to re-authenticate

## Next Steps

After implementing GitHub authentication (Task 23), the next tasks will add:

- **Task 24**: Repository creation and file pushing
- **Task 25**: Progress tracking and user experience improvements
- **Task 26**: Documentation and polish

The `GitHubAuthButton` component is designed to work seamlessly with these future features.
