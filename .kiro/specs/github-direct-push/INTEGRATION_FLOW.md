# GitHub Integration - Flow Documentation

## Overview

This document provides a detailed walkthrough of the GitHub integration flow, from user interaction to repository creation. It includes sequence diagrams, state transitions, and implementation details for each step.

## Complete User Journey

### Journey 1: Authenticated User Creating Repository

```
User Opens Wizard
       ↓
Completes Configuration Steps
       ↓
Reaches GitHub Auth Step
       ↓
[Already Authenticated?]
       ↓ Yes
Auto-Skip to Summary
       ↓
Reviews Configuration
       ↓
Clicks "Generate"
       ↓
Loading Screen Appears
       ↓
Repository Created
       ↓
Files Pushed
       ↓
Success Screen Shows Repository URL
       ↓
User Clicks "View Repository"
       ↓
Opens GitHub in New Tab
```

### Journey 2: New User Authenticating

```
User Opens Wizard
       ↓
Completes Configuration Steps
       ↓
Reaches GitHub Auth Step
       ↓
[Already Authenticated?]
       ↓ No
Shows Sign-In Button
       ↓
User Clicks "Sign in with GitHub"
       ↓
Redirects to GitHub OAuth
       ↓
User Authorizes Application
       ↓
Redirects Back to Wizard
       ↓
Shows Authenticated State
       ↓
Proceeds to Summary
       ↓
Clicks "Generate"
       ↓
[Continue as Journey 1]
```

### Journey 3: User Skipping GitHub

```
User Opens Wizard
       ↓
Completes Configuration Steps
       ↓
Reaches GitHub Auth Step
       ↓
User Clicks "Skip"
       ↓
Proceeds to Summary
       ↓
Clicks "Generate"
       ↓
Loading Screen Appears
       ↓
ZIP File Generated
       ↓
Success Screen Shows Download Button
       ↓
User Downloads ZIP
```

### Journey 4: Error Recovery

```
User Clicks "Generate"
       ↓
Loading Screen Appears
       ↓
Repository Creation Fails
       ↓
Error Screen Shows
       ↓
[User Chooses Action]
       ↓
┌──────────┬──────────┬──────────┐
↓          ↓          ↓          ↓
Retry    Reauth   Rename   Fallback
↓          ↓          ↓          ↓
[Retry]  [OAuth]  [Wizard] [ZIP Gen]
```

## Detailed Sequence Diagrams

### 1. OAuth Authentication Flow

```
User          Browser         App Server      GitHub
 │               │                │              │
 │ Click Sign In │                │              │
 ├──────────────>│                │              │
 │               │ GET /api/github/auth/initiate │
 │               ├───────────────>│              │
 │               │                │ Generate State│
 │               │                │ Set Cookie   │
 │               │                │              │
 │               │ Return OAuth URL              │
 │               │<───────────────┤              │
 │               │                │              │
 │               │ Redirect to GitHub            │
 │               ├──────────────────────────────>│
 │               │                │              │
 │               │                │   Show Auth  │
 │               │                │   Screen     │
 │               │                │              │
 │ Authorize     │                │              │
 ├──────────────────────────────────────────────>│
 │               │                │              │
 │               │ Redirect with code            │
 │               │<──────────────────────────────┤
 │               │                │              │
 │               │ GET /api/github/auth/callback │
 │               ├───────────────>│              │
 │               │                │ Verify State │
 │               │                │              │
 │               │                │ POST /login/oauth/access_token
 │               │                ├─────────────>│
 │               │                │              │
 │               │                │ Return Token │
 │               │                │<─────────────┤
 │               │                │              │
 │               │                │ Set Cookie   │
 │               │                │              │
 │               │ Redirect to Wizard            │
 │               │<───────────────┤              │
 │               │                │              │
 │ Wizard Loads  │                │              │
 │<──────────────┤                │              │
 │               │                │              │
```

### 2. Repository Creation Flow

```
User          Browser         App Server      GitHub API
 │               │                │              │
 │ Click Generate│                │              │
 ├──────────────>│                │              │
 │               │ Show Loading   │              │
 │               │                │              │
 │               │ POST /api/github/repos/create │
 │               ├───────────────>│              │
 │               │                │ Verify Token │
 │               │                │              │
 │               │                │ Sanitize Name│
 │               │                │              │
 │               │                │ Generate Files│
 │               │                │              │
 │               │                │ POST /user/repos
 │               │                ├─────────────>│
 │               │                │              │
 │               │                │ Create Repo  │
 │               │                │              │
 │               │                │ Return Repo  │
 │               │                │<─────────────┤
 │               │                │              │
 │               │                │ Create Blob  │
 │               │                ├─────────────>│
 │               │                │<─────────────┤
 │               │                │              │
 │               │                │ Create Tree  │
 │               │                ├─────────────>│
 │               │                │<─────────────┤
 │               │                │              │
 │               │                │ Create Commit│
 │               │                ├─────────────>│
 │               │                │<─────────────┤
 │               │                │              │
 │               │                │ Update Ref   │
 │               │                ├─────────────>│
 │               │                │<─────────────┤
 │               │                │              │
 │               │ Return Success │              │
 │               │<───────────────┤              │
 │               │                │              │
 │               │ Hide Loading   │              │
 │               │ Show Success   │              │
 │               │                │              │
 │ View Repo URL │                │              │
 │<──────────────┤                │              │
 │               │                │              │
```

### 3. Error Handling Flow

```
User          Browser         App Server      GitHub API
 │               │                │              │
 │ Click Generate│                │              │
 ├──────────────>│                │              │
 │               │ Show Loading   │              │
 │               │                │              │
 │               │ POST /api/github/repos/create │
 │               ├───────────────>│              │
 │               │                │              │
 │               │                │ POST /user/repos
 │               │                ├─────────────>│
 │               │                │              │
 │               │                │ Error: 422   │
 │               │                │ Repo Exists  │
 │               │                │<─────────────┤
 │               │                │              │
 │               │ Return Error   │              │
 │               │<───────────────┤              │
 │               │                │              │
 │               │ Hide Loading   │              │
 │               │ Show Error     │              │
 │               │ Show Actions   │              │
 │               │                │              │
 │ Click Fallback│                │              │
 ├──────────────>│                │              │
 │               │ Show Loading   │              │
 │               │                │              │
 │               │ POST /api/generate            │
 │               ├───────────────>│              │
 │               │                │              │
 │               │                │ Generate ZIP │
 │               │                │              │
 │               │ Return Success │              │
 │               │<───────────────┤              │
 │               │                │              │
 │               │ Hide Loading   │              │
 │               │ Show Download  │              │
 │               │                │              │
```

## State Machine

### Authentication State

```
┌─────────────┐
│ Unauthenticated │
└──────┬──────┘
       │
       │ Sign In Clicked
       ↓
┌─────────────┐
│ Authenticating │
└──────┬──────┘
       │
       ├─ Success ──→ ┌─────────────┐
       │              │ Authenticated │
       │              └──────┬──────┘
       │                     │
       │                     │ Sign Out
       │                     ↓
       └─ Failure ───→ ┌─────────────┐
                       │ Auth Failed  │
                       └──────┬──────┘
                              │
                              │ Retry
                              ↓
                       [Back to Authenticating]
```

### Generation State

```
┌─────────────┐
│    Idle     │
└──────┬──────┘
       │
       │ Generate Clicked
       ↓
┌─────────────┐
│  Generating │
└──────┬──────┘
       │
       ├─ Success ──→ ┌─────────────┐
       │              │  Complete   │
       │              └─────────────┘
       │
       └─ Failure ──→ ┌─────────────┐
                      │   Error     │
                      └──────┬──────┘
                             │
                             ├─ Retry ──→ [Back to Generating]
                             │
                             ├─ Fallback ──→ [Generate ZIP]
                             │
                             └─ Cancel ──→ [Back to Idle]
```

## Component Interactions

### ConfigurePage Component Flow

```typescript
// Initial State
const [isGenerating, setIsGenerating] = useState(false);
const [showLoadingScreen, setShowLoadingScreen] = useState(false);
const [githubEnabled, setGithubEnabled] = useState(false);
const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
const [generationError, setGenerationError] = useState<string | null>(null);

// Generation Handler
const handleGenerate = async () => {
  // 1. Prevent duplicates
  if (generationInProgress.current) {
    console.warn('Generation already in progress');
    return;
  }
  
  // 2. Set loading state
  setIsGenerating(true);
  setShowLoadingScreen(true);
  setGenerationError(null);
  generationInProgress.current = true;
  
  try {
    // 3. Route based on authentication
    if (githubEnabled && isAuthenticated) {
      await handleGitHubGeneration();
    } else {
      await handleZipGeneration();
    }
  } catch (error) {
    // 4. Handle errors
    handleGenerationError(error);
  } finally {
    // 5. Clean up
    setIsGenerating(false);
    setShowLoadingScreen(false);
    generationInProgress.current = false;
  }
};

// GitHub Generation
const handleGitHubGeneration = async () => {
  const response = await fetch('/api/github/repos/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: config.projectName,
      description: config.description,
      private: false,
      config: config,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  const data = await response.json();
  setRepositoryUrl(data.repository.htmlUrl);
  setRepositoryName(data.repository.name);
  setGenerationComplete(true);
};

// ZIP Generation
const handleZipGeneration = async () => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  const data = await response.json();
  setDownloadId(data.downloadId);
  setGenerationComplete(true);
};
```

### GitHubAuthStep Component Flow

```typescript
// Initial State
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [user, setUser] = useState<GitHubUser | null>(null);

// Check authentication on mount
useEffect(() => {
  checkAuthStatus();
}, []);

// Check authentication status
const checkAuthStatus = async () => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/github/auth/status');
    const data = await response.json();
    
    setIsAuthenticated(data.authenticated);
    setUser(data.user || null);
    
    // Notify parent
    onAuthChange(data.authenticated);
  } catch (error) {
    console.error('Failed to check auth status:', error);
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};

// Handle sign in
const handleSignIn = async () => {
  try {
    const response = await fetch('/api/github/auth/initiate');
    const { url } = await response.json();
    
    // Redirect to GitHub
    window.location.href = url;
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
  }
};

// Handle sign out
const handleSignOut = async () => {
  try {
    await fetch('/api/github/auth/signout', { method: 'POST' });
    
    setIsAuthenticated(false);
    setUser(null);
    
    // Notify parent
    onAuthChange(false);
  } catch (error) {
    console.error('Failed to sign out:', error);
  }
};
```

## API Implementation Details

### /api/github/auth/initiate

```typescript
export async function POST(request: Request) {
  // 1. Generate CSRF state
  const state = crypto.randomBytes(32).toString('hex');
  
  // 2. Store state in cookie
  cookies().set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });
  
  // 3. Build OAuth URL
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github/auth/callback`,
    scope: 'repo user:email',
    state: state,
  });
  
  const url = `https://github.com/login/oauth/authorize?${params}`;
  
  // 4. Return URL
  return NextResponse.json({ url });
}
```

### /api/github/auth/callback

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  // 1. Verify state
  const savedState = cookies().get('oauth_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/configure?error=csrf_failed`
    );
  }
  
  // 2. Clear state cookie
  cookies().delete('oauth_state');
  
  // 3. Exchange code for token
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    }
  );
  
  const tokenData = await tokenResponse.json();
  
  if (tokenData.error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/configure?error=oauth_failed`
    );
  }
  
  // 4. Store token in cookie
  cookies().set('github_token', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  // 5. Redirect back to wizard
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/configure?auth=success`
  );
}
```

### /api/github/repos/create

```typescript
export async function POST(request: Request) {
  // 1. Get token from cookie
  const token = cookies().get('github_token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated', code: 'AUTH_FAILED' },
      { status: 401 }
    );
  }
  
  // 2. Parse request body
  const { name, description, private: isPrivate, config } = await request.json();
  
  // 3. Sanitize repository name
  const sanitizedName = sanitizeRepoName(name);
  
  if (!sanitizedName) {
    return NextResponse.json(
      { error: 'Invalid repository name', code: 'INVALID_NAME' },
      { status: 400 }
    );
  }
  
  // 4. Create repository
  const repoResponse = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      name: sanitizedName,
      description: description,
      private: isPrivate,
      auto_init: false,
    }),
  });
  
  if (!repoResponse.ok) {
    const error = await repoResponse.json();
    
    if (repoResponse.status === 422) {
      return NextResponse.json(
        { error: 'Repository already exists', code: 'REPO_EXISTS' },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: error.message, code: 'REPO_CREATE_FAILED' },
      { status: repoResponse.status }
    );
  }
  
  const repository = await repoResponse.json();
  
  // 5. Generate scaffold files
  const files = await generateScaffold(config);
  
  // 6. Push files to repository
  await pushFilesToRepo(token, repository.full_name, files);
  
  // 7. Return success
  return NextResponse.json({
    success: true,
    repository: {
      name: repository.name,
      fullName: repository.full_name,
      htmlUrl: repository.html_url,
      cloneUrl: repository.clone_url,
    },
  });
}
```

## Data Flow

### Configuration Data Flow

```
User Input (Wizard)
       ↓
ConfigStore (Zustand)
       ↓
ConfigurePage State
       ↓
API Request Body
       ↓
Server Processing
       ↓
GitHub API
       ↓
Repository Created
```

### Authentication Data Flow

```
GitHub OAuth
       ↓
Access Token
       ↓
httpOnly Cookie
       ↓
API Request Header
       ↓
GitHub API
       ↓
Repository Operations
```

## Performance Considerations

### Optimization Points

1. **Parallel Operations**
   - Generate files while creating repository
   - Upload files in batches

2. **Caching**
   - Cache authentication status
   - Cache user information
   - Cache generated files temporarily

3. **Loading States**
   - Show loading screen immediately
   - Use optimistic UI updates
   - Provide progress feedback

4. **Error Recovery**
   - Implement retry with exponential backoff
   - Cache partial results
   - Resume from failure point

## Security Considerations

### Token Security
- Stored in httpOnly cookies
- Never exposed to client JavaScript
- Cleared on sign out
- Expire after 7 days

### CSRF Protection
- State parameter in OAuth flow
- Verified on callback
- Stored in httpOnly cookie

### Input Validation
- Sanitize repository names
- Validate configuration
- Check file sizes
- Prevent path traversal

## Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Authentication persists across sessions
- [ ] Repository creation works
- [ ] Files are pushed correctly
- [ ] Error handling works for all error types
- [ ] Fallback to ZIP works
- [ ] Loading screen appears and disappears
- [ ] Success screen shows correct information
- [ ] Sign out clears authentication
- [ ] Duplicate requests are prevented
- [ ] Repository name sanitization works
- [ ] Rate limiting is respected
