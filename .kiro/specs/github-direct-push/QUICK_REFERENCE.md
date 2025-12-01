# GitHub Integration - Quick Reference

## For Developers

### Key Files

```
src/components/wizard/GitHubAuthStep.tsx       # Auth UI component
src/app/configure/page.tsx                     # Main generation handler
src/components/GenerationLoadingScreen.tsx     # Loading animation
src/lib/github/repo-name-sanitizer.ts          # Name sanitization
src/lib/store/config-store.ts                  # State management
src/app/api/github/auth/initiate/route.ts      # Start OAuth
src/app/api/github/auth/callback/route.ts      # OAuth callback
src/app/api/github/auth/status/route.ts        # Check auth
src/app/api/github/auth/signout/route.ts       # Sign out
src/app/api/github/repos/create/route.ts       # Create repo
```

### Environment Variables

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Common Code Patterns

#### Check Authentication Status
```typescript
const response = await fetch('/api/github/auth/status');
const { authenticated, user } = await response.json();
```

#### Start OAuth Flow
```typescript
const response = await fetch('/api/github/auth/initiate');
const { url } = await response.json();
window.location.href = url;
```

#### Create Repository
```typescript
const response = await fetch('/api/github/repos/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: projectName,
    description: projectDescription,
    private: false,
    config: wizardConfig,
  }),
});
```

#### Handle Errors
```typescript
try {
  await handleGenerate();
} catch (error) {
  const errorCode = error.code || 'UNKNOWN_ERROR';
  setGenerationError(getErrorMessage(errorCode));
  setShowFallbackButton(true);
}
```

#### Sanitize Repository Name
```typescript
import { sanitizeRepoName } from '@/lib/github/repo-name-sanitizer';

const sanitized = sanitizeRepoName('My Project!');
// Result: "my-project"
```

### Error Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| `AUTH_FAILED` | Authentication failed | Re-authenticate |
| `TOKEN_EXPIRED` | Token expired | Re-authenticate |
| `REPO_EXISTS` | Repository name taken | Rename project |
| `INVALID_NAME` | Invalid repository name | Rename project |
| `RATE_LIMIT` | API rate limit hit | Wait and retry |
| `NETWORK_ERROR` | Connection failed | Retry |
| `PUSH_FAILED` | File push failed | Retry or fallback |

### State Variables

#### ConfigurePage
```typescript
const [isGenerating, setIsGenerating] = useState(false);
const [showLoadingScreen, setShowLoadingScreen] = useState(false);
const [githubEnabled, setGithubEnabled] = useState(false);
const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
const [generationError, setGenerationError] = useState<string | null>(null);
```

#### GitHubAuthStep
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [user, setUser] = useState<GitHubUser | null>(null);
```

### API Response Formats

#### Success Response
```json
{
  "success": true,
  "repository": {
    "name": "my-project",
    "fullName": "username/my-project",
    "htmlUrl": "https://github.com/username/my-project",
    "cloneUrl": "https://github.com/username/my-project.git"
  }
}
```

#### Error Response
```json
{
  "error": "Repository already exists",
  "code": "REPO_EXISTS",
  "fallbackAvailable": true,
  "retryable": false
}
```

### Testing Commands

```bash
# Run all tests
npm test

# Run GitHub-specific tests
npm test -- github

# Run with coverage
npm test -- --coverage

# Run property-based tests
npm test -- --run property
```

### Debugging Tips

#### Enable Verbose Logging
```typescript
// In browser console
localStorage.setItem('debug', 'github:*');
```

#### Check Authentication
```typescript
// In browser console
document.cookie.split(';').find(c => c.includes('github_token'));
```

#### View API Calls
```typescript
// In browser console, Network tab
// Filter by: /api/github
```

### Common Tasks

#### Add New Error Type
1. Add code to error constants
2. Add message to error messages map
3. Add handling in `handleGenerationError()`
4. Update ERROR_HANDLING.md

#### Modify OAuth Scopes
1. Update scope in `/api/github/auth/initiate`
2. Update GitHub App settings
3. Test authorization flow
4. Update documentation

#### Change Token Expiration
1. Update `maxAge` in cookie settings
2. Update token validation logic
3. Update user documentation

### Security Checklist

- [ ] Tokens in httpOnly cookies
- [ ] CSRF state validation
- [ ] Input sanitization
- [ ] Rate limiting enabled
- [ ] Secure flag in production
- [ ] No tokens in logs
- [ ] Error messages don't leak info

### Performance Checklist

- [ ] Loading screen shows immediately
- [ ] Parallel operations where possible
- [ ] Authentication status cached
- [ ] Debounced status checks
- [ ] Optimistic UI updates

### Deployment Checklist

- [ ] Environment variables set
- [ ] GitHub OAuth app configured
- [ ] Redirect URIs whitelisted
- [ ] Rate limits configured
- [ ] Error tracking enabled
- [ ] Logs configured
- [ ] Tests passing

## For Users

### Quick Steps

1. **Complete Wizard** → Configure your project
2. **Sign In** → Click "Sign in with GitHub" (or skip)
3. **Generate** → Click "Generate" button
4. **View Repo** → Click "View Repository" to see your code

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Loading stuck | Wait 2-3 minutes, then refresh |
| Auth failed | Clear cookies, try again |
| Repo exists | Change project name |
| Network error | Check internet, retry |
| Rate limit | Wait 5 minutes, retry |

### Keyboard Shortcuts

- `Enter` on auth step → Sign in
- `Esc` on auth step → Skip
- `Enter` on summary → Generate

### Tips

- Use descriptive project names
- Sign in once, stays logged in
- Every error has ZIP fallback
- Can sign out anytime

## Quick Links

- [Full User Guide](./USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Error Reference](./ERROR_HANDLING.md)
- [Integration Flow](./INTEGRATION_FLOW.md)
- [Requirements](./requirements.md)
- [Design](./design.md)
- [Tasks](./tasks.md)
