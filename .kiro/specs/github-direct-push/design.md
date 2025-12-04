# Design Document

## Overview

This design integrates GitHub repository creation directly into the scaffold generation workflow. The system will detect whether a user is authenticated with GitHub and automatically create a repository during the generation process, showing the loading animation throughout. Users who skip GitHub authentication will receive a ZIP file instead.

The design modifies the existing generation flow to support two paths:
1. **GitHub Path**: Authenticate → Generate → Create Repository → Show Success
2. **ZIP Path**: Skip Auth → Generate → Create ZIP → Show Download

## Architecture

### High-Level Flow

```
Wizard Steps → GitHub Auth Step (Optional) → Summary → Generate Button
                                                              ↓
                                            [Check GitHub Auth State]
                                                    ↙         ↘
                                        Authenticated      Not Authenticated
                                              ↓                    ↓
                                    Show Loading Screen    Show Loading Screen
                                              ↓                    ↓
                                    Create GitHub Repo      Generate ZIP File
                                              ↓                    ↓
                                    Push Scaffold Files     Save to Storage
                                              ↓                    ↓
                                    Show Repository URL    Show Download Button
```

### Component Interaction

```
┌─────────────────┐
│  PixelArtWizard │
│                 │
│  - GitHub Auth  │
│  - Summary      │
└────────┬────────┘
         │ onGenerate()
         ↓
┌─────────────────────┐
│  ConfigurePage      │
│                     │
│  handleGenerate()   │
│  - Check auth state │
│  - Route to API     │
└────────┬────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│ GitHub  │ │   ZIP    │
│  API    │ │   API    │
└────┬────┘ └────┬─────┘
     │           │
     ↓           ↓
┌─────────────────────┐
│ GenerationLoading   │
│     Screen          │
└─────────────────────┘
```

## Components and Interfaces

### 1. GitHub Authentication Step Component

**Location**: `src/components/wizard/GitHubAuthStep.tsx`

**Purpose**: Provides GitHub sign-in interface within the wizard

**Interface**:
```typescript
interface GitHubAuthStepProps {
  onAuthChange: (authenticated: boolean) => void;
  currentAuthState: boolean;
}
```

**Responsibilities**:
- Always display the GitHub auth step (never skip)
- Display GitHub sign-in button (active when not authenticated, disabled when authenticated)
- Show current authentication status prominently
- Handle OAuth redirect flow
- Display user information when authenticated
- Show "signed in" state with disabled button when already authenticated

### 2. Modified ConfigurePage Component

**Location**: `src/app/configure/page.tsx`

**Changes**:
- Add GitHub authentication state tracking
- Modify `handleGenerate()` to route based on auth state
- Remove "Create GitHub Repository" button from success screen
- Update success screen to show repository URL directly

**New State**:
```typescript
const [githubEnabled, setGithubEnabled] = useState(false);
const [repositoryUrl, setRepositoryUrl] = useState<string | null>(null);
const [repositoryName, setRepositoryName] = useState<string | null>(null);
```

**Modified handleGenerate Function**:
```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setShowLoadingScreen(true);
  
  if (githubEnabled && isAuthenticated) {
    // GitHub path
    const response = await fetch('/api/github/repos/create', {
      method: 'POST',
      body: JSON.stringify({
        name: config.projectName,
        description: config.description,
        private: false,
        config: config,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      setRepositoryUrl(data.repository.htmlUrl);
      setRepositoryName(data.repository.name);
    }
  } else {
    // ZIP path
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    
    if (response.ok) {
      const data = await response.json();
      setDownloadId(data.downloadId);
    }
  }
  
  setShowLoadingScreen(false);
  setIsGenerating(false);
};
```

### 3. Modified GenerationLoadingScreen

**Location**: `src/components/GenerationLoadingScreen.tsx`

**Changes**:
- Accept optional `mode` prop to display different messages
- Show "Pushing to GitHub..." when in GitHub mode
- Show "Generating..." when in ZIP mode

**Interface**:
```typescript
interface GenerationLoadingScreenProps {
  projectName?: string;
  mode?: 'github' | 'zip';
}
```

### 4. Success Screen Variants

**GitHub Success Screen**:
- Display repository URL prominently
- Show "View Repository" button
- Show repository name and description
- Provide "Create Another" option
- Remove ZIP download option
- Remove "Create GitHub Repository" button

**ZIP Success Screen**:
- Display download button
- Show deployment guides link
- Show optional deployment options
- Provide "Generate Another" option

### 5. Configuration Store Updates

**Location**: `src/lib/store/config-store.ts`

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

## Data Models

### GitHub Configuration

```typescript
interface GitHubConfig {
  enabled: boolean;
  authenticated: boolean;
  repoPrivate: boolean;
  userName?: string;
  userEmail?: string;
}
```

### Generation Result

```typescript
type GenerationResult = 
  | {
      type: 'github';
      repositoryUrl: string;
      repositoryName: string;
      cloneUrl: string;
    }
  | {
      type: 'zip';
      downloadId: string;
    };
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication state determines workflow

*For any* wizard completion, if GitHub authentication is enabled and valid, then the generation flow should create a GitHub repository; otherwise, it should create a ZIP file.

**Validates: Requirements 1.2, 4.1, 8.1, 8.2, 8.3**

### Property 2: Loading screen visibility during generation

*For any* generation request, the loading screen should be visible from the moment "Generate" is clicked until either success or error state is reached.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Success screen matches generation type

*For any* successful generation, if the generation type is GitHub, then the success screen should display repository information; if the generation type is ZIP, then the success screen should display download options.

**Validates: Requirements 3.1, 3.2, 3.3, 4.2, 4.3**

### Property 4: Error handling provides fallback

*For any* failed GitHub repository creation, the system should display an error message and provide an option to download the ZIP file as a fallback.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 5: Repository name sanitization

*For any* project name containing invalid characters, the system should sanitize the name before creating the GitHub repository, ensuring the repository name is valid.

**Validates: Requirements 7.4**

### Property 6: Authentication persistence

*For any* user session, if GitHub authentication is completed, then returning to the wizard should preserve the authentication state and display the authenticated state with a disabled button until explicit sign-out or token expiration.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 9: GitHub auth step always visible

*For any* wizard session, the GitHub auth step should always be displayed, showing either an active sign-in button (when not authenticated) or a disabled button with "signed in" status (when authenticated).

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 7: Duplicate request prevention

*For any* active generation process, subsequent "Generate" button clicks should be ignored until the current process completes or fails.

**Validates: Requirements 2.5**

### Property 8: Repository content completeness

*For any* GitHub repository creation, all generated scaffold files should be included in the initial commit.

**Validates: Requirements 7.5**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Expired token
   - Invalid credentials
   - OAuth flow interruption
   - **Action**: Prompt re-authentication, offer ZIP fallback

2. **Repository Creation Errors**
   - Name already exists
   - Invalid repository name
   - Rate limit exceeded
   - **Action**: Show specific error, offer rename or ZIP fallback

3. **Network Errors**
   - Timeout
   - Connection refused
   - DNS resolution failure
   - **Action**: Show network error, offer retry or ZIP fallback

4. **Generation Errors**
   - Invalid configuration
   - File generation failure
   - Archive creation failure
   - **Action**: Show error details, offer configuration review

### Error Recovery Flow

```
Error Occurs
    ↓
Identify Error Type
    ↓
Display Specific Error Message
    ↓
Offer Primary Action (Retry/Fix)
    ↓
Offer Fallback Action (Download ZIP)
    ↓
Log Error for Debugging
```

### Error Messages

All error messages should follow this structure:
- **Title**: Brief error description
- **Message**: Detailed explanation
- **Primary Action**: Main recovery option
- **Fallback Action**: Alternative option (usually ZIP download)

## Testing Strategy

### Unit Tests

1. **Authentication State Management**
   - Test authentication state persistence
   - Test authentication expiration handling
   - Test sign-out functionality

2. **Workflow Routing**
   - Test GitHub path selection when authenticated
   - Test ZIP path selection when not authenticated
   - Test fallback to ZIP on GitHub errors

3. **UI State Management**
   - Test loading screen visibility
   - Test success screen variants
   - Test error screen display

### Property-Based Tests

Property-based tests will use **fast-check** library for TypeScript/JavaScript. Each test should run a minimum of 100 iterations.

1. **Property 1: Authentication determines workflow**
   - Generate random authentication states
   - Verify correct API endpoint is called
   - **Feature: github-direct-push, Property 1: Authentication state determines workflow**

2. **Property 2: Loading screen visibility**
   - Generate random generation requests
   - Verify loading screen shows immediately
   - Verify loading screen hides on completion
   - **Feature: github-direct-push, Property 2: Loading screen visibility during generation**

3. **Property 3: Success screen matches type**
   - Generate random successful results
   - Verify correct success screen is displayed
   - **Feature: github-direct-push, Property 3: Success screen matches generation type**

4. **Property 4: Error fallback**
   - Generate random error scenarios
   - Verify fallback option is always available
   - **Feature: github-direct-push, Property 4: Error handling provides fallback**

5. **Property 5: Repository name sanitization**
   - Generate random project names with invalid characters
   - Verify sanitized names are valid GitHub repository names
   - **Feature: github-direct-push, Property 5: Repository name sanitization**

6. **Property 6: Authentication persistence**
   - Generate random authentication events
   - Verify state persists across sessions
   - **Feature: github-direct-push, Property 6: Authentication persistence**

7. **Property 7: Duplicate prevention**
   - Generate multiple rapid generate requests
   - Verify only one request is processed
   - **Feature: github-direct-push, Property 7: Duplicate request prevention**

8. **Property 8: Repository completeness**
   - Generate random scaffold configurations
   - Verify all files are included in repository
   - **Feature: github-direct-push, Property 8: Repository content completeness**

### Integration Tests

1. **End-to-End GitHub Flow**
   - Complete wizard with GitHub auth
   - Click Generate
   - Verify repository creation
   - Verify success screen

2. **End-to-End ZIP Flow**
   - Complete wizard without GitHub auth
   - Click Generate
   - Verify ZIP creation
   - Verify download screen

3. **Error Recovery Flow**
   - Trigger GitHub error
   - Verify error display
   - Use ZIP fallback
   - Verify ZIP download

## Implementation Notes

### Wizard Step Order

The GitHub auth step should appear after the summary step but before the final generate action. The wizard flow becomes:

1. Project Name
2. Description
3. Frontend Framework
4. Backend Framework
5. Build Tool
6. Database
7. Authentication
8. Styling
9. Extras
10. AI Templates (if selected)
11. AI Provider (if AI templates selected)
12. Summary
13. **GitHub Authentication** ← Always shown, never skipped
14. Generate (button on GitHub auth step or summary)

**Important UX Pattern**: The GitHub auth step is always displayed in the wizard flow, regardless of authentication status. This provides consistency and clarity:
- **Not Authenticated**: Shows active "Sign in with GitHub" button
- **Already Authenticated**: Shows "signed in" status with disabled button and user information
- This prevents confusion about whether the step was skipped or if authentication is active

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. System redirects to GitHub OAuth
3. GitHub redirects back with code
4. System exchanges code for token
5. System stores token securely
6. System displays authenticated state

### Repository Naming

Repository names must follow GitHub's rules:
- Only alphanumeric characters, hyphens, and underscores
- Cannot start with a hyphen
- Maximum 100 characters

Sanitization logic:
```typescript
function sanitizeRepoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
    .substring(0, 100);
}
```

### State Management

Use Zustand store for GitHub configuration:
- Persist authentication state to localStorage
- Clear on explicit sign-out
- Validate on app load

### API Integration

The existing `/api/github/repos/create` endpoint already handles repository creation. The main changes are:
- Call it directly from `handleGenerate()`
- Remove the separate modal flow
- Integrate with loading screen

## Security Considerations

1. **Token Storage**: Store GitHub tokens in httpOnly cookies, not localStorage
2. **Token Expiration**: Check token validity before each use
3. **Rate Limiting**: Respect GitHub's rate limits (already implemented)
4. **Error Messages**: Don't expose sensitive information in error messages
5. **CSRF Protection**: Use CSRF tokens for OAuth flow

## Performance Considerations

1. **Loading Screen**: Show immediately to provide feedback
2. **Parallel Operations**: Generate files while creating repository
3. **Timeout Handling**: Set reasonable timeouts for GitHub API calls
4. **Retry Logic**: Implement exponential backoff for transient errors
5. **Caching**: Cache authentication status to avoid repeated checks
