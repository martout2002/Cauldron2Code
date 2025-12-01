# GitHub Integration - Developer Guide

## Architecture Overview

The GitHub integration is built into the wizard flow and provides two parallel paths:
1. **GitHub Path**: Authenticated users get automatic repository creation
2. **ZIP Path**: Unauthenticated users get ZIP file download

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Wizard Completion                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Authentication Step                      │
│  - Sign in with GitHub (OAuth)                              │
│  - Skip option available                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Generate Button Click                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              [Check Auth State]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  Authenticated              Not Authenticated
        │                           │
        ▼                           ▼
┌──────────────┐            ┌──────────────┐
│ Show Loading │            │ Show Loading │
│   Screen     │            │   Screen     │
└──────┬───────┘            └──────┬───────┘
       │                           │
       ▼                           ▼
┌──────────────┐            ┌──────────────┐
│ POST /api/   │            │ POST /api/   │
│ github/repos/│            │ generate     │
│ create       │            │              │
└──────┬───────┘            └──────┬───────┘
       │                           │
       ▼                           ▼
┌──────────────┐            ┌──────────────┐
│ Create Repo  │            │ Generate ZIP │
│ Push Files   │            │ Save to Disk │
└──────┬───────┘            └──────┬───────┘
       │                           │
       ▼                           ▼
┌──────────────┐            ┌──────────────┐
│ Show Repo    │            │ Show Download│
│ Success      │            │ Button       │
└──────────────┘            └──────────────┘
```

## Component Architecture

### Core Components

#### 1. GitHubAuthStep Component
**Location**: `src/components/wizard/GitHubAuthStep.tsx`

**Purpose**: Handles GitHub authentication within the wizard flow

**Key Features**:
- OAuth sign-in button
- Authentication status display
- Skip option
- Sign-out functionality
- Pixel art themed UI

**Props**:
```typescript
interface GitHubAuthStepProps {
  onAuthChange: (authenticated: boolean) => void;
  currentAuthState: boolean;
}
```

**State Management**:
- Uses `useState` for local loading states
- Calls parent callback on auth changes
- Polls `/api/github/auth/status` for auth state

#### 2. ConfigurePage Component
**Location**: `src/app/configure/page.tsx`

**Purpose**: Main page that orchestrates the generation flow

**Key Modifications**:
- Added GitHub state tracking
- Modified `handleGenerate()` to route based on auth
- Removed old "Create GitHub Repository" modal
- Added repository URL display in success screen

**State Variables**:
```typescript
const [githubEnabled, setGithubEnabled] = useState(false);
const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
const [repositoryName, setRepositoryName] = useState<string | null>(null);
const [generationError, setGenerationError] = useState<string | null>(null);
```

#### 3. GenerationLoadingScreen Component
**Location**: `src/components/GenerationLoadingScreen.tsx`

**Purpose**: Shows loading animation during generation

**Key Features**:
- Accepts `mode` prop ('github' | 'zip')
- Displays different messages based on mode
- Animated cauldron with pixel art theme

**Props**:
```typescript
interface GenerationLoadingScreenProps {
  projectName?: string;
  mode?: 'github' | 'zip';
}
```

### Supporting Components

#### Repository Name Sanitizer
**Location**: `src/lib/github/repo-name-sanitizer.ts`

**Purpose**: Ensures repository names meet GitHub requirements

**Rules**:
- Only alphanumeric, hyphens, underscores
- Cannot start with hyphen
- Max 100 characters
- Lowercase conversion

**Function**:
```typescript
export function sanitizeRepoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
    .substring(0, 100);
}
```

#### Configuration Store
**Location**: `src/lib/store/config-store.ts`

**Purpose**: Manages wizard configuration state

**New Fields**:
```typescript
interface ConfigStore {
  // ... existing fields
  githubEnabled: boolean;
  githubRepoPrivate: boolean;
  setGithubEnabled: (enabled: boolean) => void;
  setGithubRepoPrivate: (isPrivate: boolean) => void;
}
```

## API Endpoints

### GitHub Authentication

#### POST /api/github/auth/initiate
Initiates OAuth flow with GitHub

**Response**:
```json
{
  "url": "https://github.com/login/oauth/authorize?..."
}
```

#### GET /api/github/auth/callback
Handles OAuth callback from GitHub

**Query Params**:
- `code`: OAuth authorization code
- `state`: CSRF protection token

**Response**: Redirects to wizard with auth cookie set

#### GET /api/github/auth/status
Checks current authentication status

**Response**:
```json
{
  "authenticated": true,
  "user": {
    "login": "username",
    "email": "user@example.com"
  }
}
```

#### POST /api/github/auth/signout
Signs out user and clears auth cookie

**Response**:
```json
{
  "success": true
}
```

### Repository Creation

#### POST /api/github/repos/create
Creates repository and pushes scaffold files

**Request Body**:
```json
{
  "name": "my-project",
  "description": "My awesome project",
  "private": false,
  "config": {
    // Full wizard configuration
  }
}
```

**Response (Success)**:
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

**Response (Error)**:
```json
{
  "error": "Repository already exists",
  "code": "REPO_EXISTS",
  "fallbackAvailable": true
}
```

### ZIP Generation

#### POST /api/generate
Generates ZIP file (existing endpoint)

**Request Body**:
```json
{
  // Full wizard configuration
}
```

**Response**:
```json
{
  "downloadId": "abc123",
  "expiresAt": "2024-01-01T00:00:00Z"
}
```

## State Management

### Authentication State Flow

```
┌─────────────────┐
│  User Visits    │
│  Wizard         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Auth      │
│ Status          │
│ (Cookie Check)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
Authenticated  Not Authenticated
    │              │
    ▼              ▼
Skip Auth Step  Show Auth Step
    │              │
    │         ┌────┴────┐
    │         ▼         ▼
    │    Sign In     Skip
    │         │         │
    │         ▼         │
    │    OAuth Flow    │
    │         │         │
    │         ▼         │
    │    Set Cookie    │
    │         │         │
    └─────────┴─────────┘
              │
              ▼
        Generate Button
```

### Generation State Flow

```
┌─────────────────┐
│ Generate Click  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Set Loading     │
│ State = true    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Duplicate │
│ Request         │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
  Duplicate   First Request
    │              │
    ▼              ▼
  Ignore      Check Auth State
                   │
              ┌────┴────┐
              ▼         ▼
         GitHub Path  ZIP Path
              │         │
              ▼         ▼
         API Call   API Call
              │         │
         ┌────┴────┬────┘
         ▼         ▼
      Success    Error
         │         │
         ▼         ▼
    Show Result  Show Error
         │         │
         ▼         ▼
┌─────────────────────┐
│ Set Loading         │
│ State = false       │
└─────────────────────┘
```

## Error Handling

### Error Categories

#### 1. Authentication Errors
**Codes**: `AUTH_FAILED`, `TOKEN_EXPIRED`, `OAUTH_ERROR`

**Handling**:
```typescript
if (error.code === 'AUTH_FAILED' || error.code === 'TOKEN_EXPIRED') {
  setGenerationError('Authentication failed. Please sign in again.');
  setShowReauthButton(true);
  setShowFallbackButton(true);
}
```

#### 2. Repository Errors
**Codes**: `REPO_EXISTS`, `INVALID_NAME`, `RATE_LIMIT`

**Handling**:
```typescript
if (error.code === 'REPO_EXISTS') {
  setGenerationError('A repository with this name already exists.');
  setShowRenameButton(true);
  setShowFallbackButton(true);
}
```

#### 3. Network Errors
**Codes**: `NETWORK_ERROR`, `TIMEOUT`, `DNS_ERROR`

**Handling**:
```typescript
if (error.code === 'NETWORK_ERROR') {
  setGenerationError('Network connection failed. Please check your internet.');
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

### Error Recovery Pattern

```typescript
const handleGenerate = async () => {
  try {
    setIsGenerating(true);
    setShowLoadingScreen(true);
    setGenerationError(null);
    
    // Prevent duplicates
    if (generationInProgress.current) {
      console.warn('Generation already in progress');
      return;
    }
    generationInProgress.current = true;
    
    // Route based on auth
    if (githubEnabled && isAuthenticated) {
      await handleGitHubGeneration();
    } else {
      await handleZipGeneration();
    }
  } catch (error) {
    handleGenerationError(error);
  } finally {
    setIsGenerating(false);
    setShowLoadingScreen(false);
    generationInProgress.current = false;
  }
};

const handleGenerationError = (error: any) => {
  const errorCode = error.code || 'UNKNOWN_ERROR';
  const errorMessage = getErrorMessage(errorCode);
  
  setGenerationError(errorMessage);
  
  // Always offer fallback
  setShowFallbackButton(true);
  
  // Offer specific recovery actions
  switch (errorCode) {
    case 'AUTH_FAILED':
    case 'TOKEN_EXPIRED':
      setShowReauthButton(true);
      break;
    case 'REPO_EXISTS':
      setShowRenameButton(true);
      break;
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      setShowRetryButton(true);
      break;
  }
  
  // Log for debugging
  console.error('Generation error:', error);
};
```

## Security Considerations

### Token Storage

**Implementation**:
- Tokens stored in httpOnly cookies
- Cookies have secure flag in production
- Cookies have SameSite=Lax for CSRF protection

**Code**:
```typescript
// Setting cookie (server-side)
cookies().set('github_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});
```

### CSRF Protection

**Implementation**:
- State parameter in OAuth flow
- Verified on callback

**Code**:
```typescript
// Generate state
const state = crypto.randomBytes(32).toString('hex');
cookies().set('oauth_state', state, { httpOnly: true });

// Verify state
const savedState = cookies().get('oauth_state')?.value;
if (state !== savedState) {
  throw new Error('CSRF validation failed');
}
```

### Rate Limiting

**Implementation**:
- Existing rate limiter in `src/lib/github/rate-limiter.ts`
- Tracks requests per user
- Returns 429 when limit exceeded

### Input Validation

**Repository Name**:
```typescript
function validateRepoName(name: string): boolean {
  if (!name || name.length === 0) return false;
  if (name.length > 100) return false;
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) return false;
  if (name.startsWith('-')) return false;
  return true;
}
```

## Testing Strategy

### Unit Tests

**Authentication State**:
```typescript
describe('GitHubAuthStep', () => {
  it('should display sign-in button when not authenticated', () => {
    // Test implementation
  });
  
  it('should display user info when authenticated', () => {
    // Test implementation
  });
  
  it('should call onAuthChange when auth state changes', () => {
    // Test implementation
  });
});
```

**Repository Name Sanitization**:
```typescript
describe('sanitizeRepoName', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeRepoName('MyProject')).toBe('myproject');
  });
  
  it('should replace spaces with hyphens', () => {
    expect(sanitizeRepoName('my project')).toBe('my-project');
  });
  
  it('should remove leading hyphens', () => {
    expect(sanitizeRepoName('---test')).toBe('test');
  });
});
```

### Property-Based Tests

**Property 1: Authentication determines workflow**:
```typescript
import fc from 'fast-check';

describe('Property: Authentication determines workflow', () => {
  it('should route to correct API based on auth state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // authenticated
        fc.record({  // config
          projectName: fc.string(),
          // ... other fields
        }),
        async (authenticated, config) => {
          const result = await determineWorkflow(authenticated, config);
          
          if (authenticated) {
            expect(result.endpoint).toBe('/api/github/repos/create');
          } else {
            expect(result.endpoint).toBe('/api/generate');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

**End-to-End GitHub Flow**:
```typescript
describe('GitHub Integration Flow', () => {
  it('should complete full GitHub flow', async () => {
    // 1. Navigate to wizard
    // 2. Complete configuration
    // 3. Authenticate with GitHub
    // 4. Click Generate
    // 5. Verify repository created
    // 6. Verify success screen shown
  });
});
```

## Performance Considerations

### Loading Screen Optimization

- Show immediately on Generate click
- Use CSS animations (GPU accelerated)
- Avoid heavy JavaScript during loading

### API Call Optimization

- Parallel file generation and repository creation where possible
- Stream large files instead of loading into memory
- Use compression for file transfers

### State Management Optimization

- Debounce auth status checks
- Cache authentication state
- Minimize re-renders during generation

## Debugging

### Common Issues

#### Issue: "Loading screen doesn't appear"
**Debug Steps**:
1. Check if `setShowLoadingScreen(true)` is called
2. Verify loading screen component is rendered
3. Check CSS z-index values
4. Look for JavaScript errors in console

#### Issue: "Repository creation fails silently"
**Debug Steps**:
1. Check network tab for API call
2. Verify authentication token in cookies
3. Check server logs for errors
4. Verify GitHub API rate limits

#### Issue: "Authentication state not persisting"
**Debug Steps**:
1. Check if cookies are being set
2. Verify cookie domain and path
3. Check browser cookie settings
4. Look for cookie clearing code

### Logging

**Client-Side**:
```typescript
console.log('[GitHub] Starting generation flow');
console.log('[GitHub] Auth state:', authenticated);
console.log('[GitHub] Config:', config);
```

**Server-Side**:
```typescript
console.log('[GitHub API] Creating repository:', repoName);
console.log('[GitHub API] User:', user.login);
console.log('[GitHub API] Files:', fileCount);
```

## Maintenance

### Adding New Error Types

1. Add error code to error constants
2. Add error message to error messages map
3. Add handling in `handleGenerationError`
4. Add recovery action if applicable
5. Update user documentation

### Modifying OAuth Flow

1. Update OAuth scopes in environment variables
2. Update callback handler
3. Update token validation
4. Test thoroughly with GitHub
5. Update security documentation

### Extending Repository Options

1. Add new fields to config store
2. Update GitHubAuthStep UI
3. Pass new fields to API
4. Update API handler
5. Update tests

## Future Enhancements

### Planned Features

1. **Private Repository Support**
   - Add toggle in GitHub auth step
   - Pass privacy setting to API
   - Update pricing/limits documentation

2. **Organization Repository Support**
   - Add organization selector
   - Handle organization permissions
   - Update OAuth scopes

3. **Branch Selection**
   - Allow custom default branch
   - Support multiple branches
   - Handle branch protection rules

4. **Commit Customization**
   - Custom commit messages
   - Multiple commits for file organization
   - Co-author support

### Technical Debt

1. Add comprehensive error recovery tests
2. Improve loading screen performance
3. Add telemetry for error tracking
4. Implement retry with exponential backoff
5. Add progress indicators for large repositories

## Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Repository Naming Rules](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories)
- [Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
