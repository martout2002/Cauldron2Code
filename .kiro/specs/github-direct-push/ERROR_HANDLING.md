# GitHub Integration - Error Handling Reference

## Overview

This document provides a comprehensive reference for all error scenarios in the GitHub integration feature, including error codes, messages, recovery actions, and implementation details.

## Error Handling Philosophy

The GitHub integration follows these principles:

1. **Always Provide Fallback**: Every error offers a ZIP download fallback
2. **Clear Communication**: Error messages explain what went wrong and how to fix it
3. **Graceful Degradation**: Failures don't break the entire application
4. **User Empowerment**: Users can always recover and complete their task
5. **Developer Visibility**: Errors are logged for debugging

## Error Categories

### 1. Authentication Errors

#### AUTH_FAILED
**Cause**: OAuth authentication failed or was cancelled

**User Message**: 
```
Authentication with GitHub failed. Please try signing in again.
```

**Recovery Actions**:
- Primary: "Sign In Again" button → Restart OAuth flow
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'AUTH_FAILED') {
  setGenerationError('Authentication with GitHub failed. Please try signing in again.');
  setShowReauthButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub Auth] Authentication failed:', error.message);
```

---

#### TOKEN_EXPIRED
**Cause**: GitHub access token has expired

**User Message**:
```
Your GitHub session has expired. Please sign in again to continue.
```

**Recovery Actions**:
- Primary: "Sign In Again" button → Restart OAuth flow
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'TOKEN_EXPIRED') {
  setGenerationError('Your GitHub session has expired. Please sign in again to continue.');
  setShowReauthButton(true);
  setShowFallbackButton(true);
  // Clear expired token
  await fetch('/api/github/auth/signout', { method: 'POST' });
}
```

**Logging**:
```typescript
console.error('[GitHub Auth] Token expired for user:', userId);
```

---

#### OAUTH_ERROR
**Cause**: OAuth flow encountered an error (state mismatch, invalid code, etc.)

**User Message**:
```
GitHub authorization encountered an error. Please try again.
```

**Recovery Actions**:
- Primary: "Try Again" button → Restart OAuth flow
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'OAUTH_ERROR') {
  setGenerationError('GitHub authorization encountered an error. Please try again.');
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub OAuth] OAuth error:', {
  error: error.message,
  state: oauthState,
  code: oauthCode
});
```

---

### 2. Repository Errors

#### REPO_EXISTS
**Cause**: A repository with the same name already exists in the user's account

**User Message**:
```
A repository named "{repoName}" already exists in your account. Please choose a different project name.
```

**Recovery Actions**:
- Primary: "Change Name" button → Return to wizard to modify project name
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'REPO_EXISTS') {
  setGenerationError(
    `A repository named "${config.projectName}" already exists in your account. ` +
    `Please choose a different project name.`
  );
  setShowRenameButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub Repo] Repository already exists:', {
  repoName: sanitizedName,
  user: user.login
});
```

---

#### INVALID_NAME
**Cause**: Repository name is invalid even after sanitization

**User Message**:
```
The project name "{projectName}" cannot be converted to a valid repository name. Please choose a different name.
```

**Recovery Actions**:
- Primary: "Change Name" button → Return to wizard to modify project name
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'INVALID_NAME') {
  setGenerationError(
    `The project name "${config.projectName}" cannot be converted to a valid repository name. ` +
    `Please choose a different name.`
  );
  setShowRenameButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub Repo] Invalid repository name:', {
  original: projectName,
  sanitized: sanitizedName
});
```

---

#### RATE_LIMIT
**Cause**: GitHub API rate limit exceeded

**User Message**:
```
GitHub rate limit exceeded. Please wait a few minutes and try again.
```

**Recovery Actions**:
- Primary: "Try Again in 5 Minutes" button → Retry after delay
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'RATE_LIMIT') {
  const resetTime = error.resetAt ? new Date(error.resetAt) : null;
  const waitMinutes = resetTime 
    ? Math.ceil((resetTime.getTime() - Date.now()) / 60000)
    : 5;
  
  setGenerationError(
    `GitHub rate limit exceeded. Please wait ${waitMinutes} minutes and try again.`
  );
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub API] Rate limit exceeded:', {
  limit: error.limit,
  remaining: error.remaining,
  resetAt: error.resetAt
});
```

---

#### PUSH_FAILED
**Cause**: Failed to push files to the repository

**User Message**:
```
Repository was created but failed to push files. You can clone the empty repository and push manually.
```

**Recovery Actions**:
- Primary: "View Repository" button → Open empty repository
- Secondary: "Try Again" button → Retry push operation
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'PUSH_FAILED') {
  setGenerationError(
    'Repository was created but failed to push files. ' +
    'You can clone the empty repository and push manually.'
  );
  setRepositoryUrl(error.repositoryUrl); // Show repo URL even though push failed
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[GitHub Push] Failed to push files:', {
  repoName: repository.name,
  error: error.message,
  filesAttempted: fileCount
});
```

---

### 3. Network Errors

#### NETWORK_ERROR
**Cause**: Network connection failed

**User Message**:
```
Network connection failed. Please check your internet connection and try again.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry the operation
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'NETWORK_ERROR') {
  setGenerationError(
    'Network connection failed. Please check your internet connection and try again.'
  );
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[Network] Connection failed:', {
  endpoint: error.endpoint,
  error: error.message
});
```

---

#### TIMEOUT
**Cause**: Request to GitHub API timed out

**User Message**:
```
Request timed out. This may be due to a slow connection or GitHub being temporarily unavailable.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry the operation
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'TIMEOUT') {
  setGenerationError(
    'Request timed out. This may be due to a slow connection or ' +
    'GitHub being temporarily unavailable.'
  );
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[Network] Request timeout:', {
  endpoint: error.endpoint,
  timeout: error.timeout
});
```

---

#### DNS_ERROR
**Cause**: DNS resolution failed for GitHub

**User Message**:
```
Unable to reach GitHub. Please check your internet connection and DNS settings.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry the operation
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
if (error.code === 'DNS_ERROR') {
  setGenerationError(
    'Unable to reach GitHub. Please check your internet connection and DNS settings.'
  );
  setShowRetryButton(true);
  setShowFallbackButton(true);
}
```

**Logging**:
```typescript
console.error('[Network] DNS resolution failed:', {
  hostname: error.hostname,
  error: error.message
});
```

---

### 4. Generation Errors

#### INVALID_CONFIG
**Cause**: Wizard configuration is invalid or incomplete

**User Message**:
```
Project configuration is invalid. Please review your selections and try again.
```

**Recovery Actions**:
- Primary: "Review Configuration" button → Return to wizard summary
- Fallback: None (must fix configuration)

**Implementation**:
```typescript
if (error.code === 'INVALID_CONFIG') {
  setGenerationError(
    'Project configuration is invalid. Please review your selections and try again.'
  );
  setShowReviewButton(true);
}
```

**Logging**:
```typescript
console.error('[Generation] Invalid configuration:', {
  config: config,
  validationErrors: error.validationErrors
});
```

---

#### FILE_GENERATION_FAILED
**Cause**: Failed to generate scaffold files

**User Message**:
```
Failed to generate project files. Please try again or contact support if the issue persists.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry generation
- Fallback: None (technical issue)

**Implementation**:
```typescript
if (error.code === 'FILE_GENERATION_FAILED') {
  setGenerationError(
    'Failed to generate project files. Please try again or contact support if the issue persists.'
  );
  setShowRetryButton(true);
}
```

**Logging**:
```typescript
console.error('[Generation] File generation failed:', {
  config: config,
  error: error.message,
  stack: error.stack
});
```

---

#### ARCHIVE_CREATION_FAILED
**Cause**: Failed to create ZIP archive

**User Message**:
```
Failed to create project archive. Please try again.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry archive creation
- Fallback: None (technical issue)

**Implementation**:
```typescript
if (error.code === 'ARCHIVE_CREATION_FAILED') {
  setGenerationError('Failed to create project archive. Please try again.');
  setShowRetryButton(true);
}
```

**Logging**:
```typescript
console.error('[Generation] Archive creation failed:', {
  fileCount: files.length,
  error: error.message
});
```

---

### 5. Unknown Errors

#### UNKNOWN_ERROR
**Cause**: Unexpected error occurred

**User Message**:
```
An unexpected error occurred. Please try again or download the ZIP file instead.
```

**Recovery Actions**:
- Primary: "Try Again" button → Retry the operation
- Fallback: "Download ZIP Instead" button → Switch to ZIP workflow

**Implementation**:
```typescript
// Default case for unhandled errors
setGenerationError(
  'An unexpected error occurred. Please try again or download the ZIP file instead.'
);
setShowRetryButton(true);
setShowFallbackButton(true);
```

**Logging**:
```typescript
console.error('[Unknown] Unexpected error:', {
  error: error,
  stack: error.stack,
  context: 'github-integration'
});
```

---

## Error Response Format

All API endpoints return errors in a consistent format:

```typescript
interface ErrorResponse {
  error: string;           // Human-readable error message
  code: string;            // Error code for programmatic handling
  details?: any;           // Additional error details
  fallbackAvailable: boolean; // Whether ZIP fallback is available
  retryable: boolean;      // Whether the operation can be retried
  resetAt?: string;        // For rate limit errors, when to retry
}
```

**Example**:
```json
{
  "error": "A repository named 'my-project' already exists in your account",
  "code": "REPO_EXISTS",
  "details": {
    "repoName": "my-project",
    "existingUrl": "https://github.com/username/my-project"
  },
  "fallbackAvailable": true,
  "retryable": false
}
```

## Error Handling Flow

```typescript
const handleGenerationError = (error: any) => {
  // Extract error information
  const errorCode = error.code || 'UNKNOWN_ERROR';
  const errorMessage = error.error || error.message || 'An unexpected error occurred';
  
  // Display error to user
  setGenerationError(errorMessage);
  
  // Always offer fallback for GitHub errors
  if (githubEnabled) {
    setShowFallbackButton(true);
  }
  
  // Offer specific recovery actions based on error type
  switch (errorCode) {
    case 'AUTH_FAILED':
    case 'TOKEN_EXPIRED':
    case 'OAUTH_ERROR':
      setShowReauthButton(true);
      break;
      
    case 'REPO_EXISTS':
    case 'INVALID_NAME':
      setShowRenameButton(true);
      break;
      
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
    case 'DNS_ERROR':
    case 'RATE_LIMIT':
    case 'PUSH_FAILED':
    case 'FILE_GENERATION_FAILED':
    case 'ARCHIVE_CREATION_FAILED':
      setShowRetryButton(true);
      break;
      
    case 'INVALID_CONFIG':
      setShowReviewButton(true);
      break;
      
    default:
      setShowRetryButton(true);
      break;
  }
  
  // Log error for debugging
  console.error('[Generation Error]', {
    code: errorCode,
    message: errorMessage,
    details: error.details,
    stack: error.stack
  });
  
  // Send to error tracking service (if configured)
  if (typeof window !== 'undefined' && window.errorTracker) {
    window.errorTracker.captureException(error, {
      context: 'github-integration',
      user: user?.login,
      config: config
    });
  }
};
```

## Recovery Action Implementations

### Re-authentication
```typescript
const handleReauth = async () => {
  try {
    // Clear error state
    setGenerationError(null);
    
    // Initiate OAuth flow
    const response = await fetch('/api/github/auth/initiate');
    const { url } = await response.json();
    
    // Redirect to GitHub
    window.location.href = url;
  } catch (error) {
    console.error('[Reauth] Failed to initiate OAuth:', error);
    setGenerationError('Failed to start authentication. Please try again.');
  }
};
```

### Rename Project
```typescript
const handleRename = () => {
  // Clear error state
  setGenerationError(null);
  
  // Return to wizard (project name step)
  setCurrentStep('projectName');
  
  // Optionally show a hint
  setWizardHint('Please choose a different project name');
};
```

### Retry Operation
```typescript
const handleRetry = async () => {
  // Clear error state
  setGenerationError(null);
  
  // Add small delay to avoid immediate retry
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Retry the generation
  await handleGenerate();
};
```

### Fallback to ZIP
```typescript
const handleFallback = async () => {
  try {
    // Clear error state
    setGenerationError(null);
    
    // Disable GitHub mode
    setGithubEnabled(false);
    
    // Show loading screen
    setShowLoadingScreen(true);
    
    // Generate ZIP
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error('ZIP generation failed');
    }
    
    const data = await response.json();
    setDownloadId(data.downloadId);
    
    // Hide loading screen
    setShowLoadingScreen(false);
    
    // Show success screen
    setGenerationComplete(true);
  } catch (error) {
    console.error('[Fallback] ZIP generation failed:', error);
    setGenerationError('Failed to generate ZIP file. Please try again.');
    setShowLoadingScreen(false);
  }
};
```

## Testing Error Scenarios

### Unit Tests
```typescript
describe('Error Handling', () => {
  it('should display auth error and show reauth button', () => {
    const error = { code: 'AUTH_FAILED', error: 'Authentication failed' };
    handleGenerationError(error);
    
    expect(generationError).toBe('Authentication failed');
    expect(showReauthButton).toBe(true);
    expect(showFallbackButton).toBe(true);
  });
  
  it('should display repo exists error and show rename button', () => {
    const error = { code: 'REPO_EXISTS', error: 'Repository exists' };
    handleGenerationError(error);
    
    expect(generationError).toBe('Repository exists');
    expect(showRenameButton).toBe(true);
    expect(showFallbackButton).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('Error Recovery', () => {
  it('should successfully fallback to ZIP on GitHub error', async () => {
    // Mock GitHub API to fail
    mockGitHubAPI.mockRejectedValue({ code: 'NETWORK_ERROR' });
    
    // Attempt GitHub generation
    await handleGenerate();
    
    // Verify error shown
    expect(generationError).toBeTruthy();
    
    // Click fallback button
    await handleFallback();
    
    // Verify ZIP generated
    expect(downloadId).toBeTruthy();
    expect(generationComplete).toBe(true);
  });
});
```

## Monitoring and Alerting

### Metrics to Track
- Error rate by error code
- Fallback usage rate
- Retry success rate
- Time to recovery
- User abandonment after error

### Alert Thresholds
- AUTH_FAILED > 10% of attempts
- RATE_LIMIT > 5% of attempts
- NETWORK_ERROR > 15% of attempts
- UNKNOWN_ERROR > 1% of attempts

### Logging Best Practices
1. Always log error code and message
2. Include relevant context (user, config, etc.)
3. Log stack traces for unexpected errors
4. Don't log sensitive information (tokens, emails)
5. Use structured logging for easy parsing

## User Communication Guidelines

### Error Message Principles
1. **Be Clear**: Explain what went wrong in simple terms
2. **Be Helpful**: Provide actionable next steps
3. **Be Honest**: Don't hide technical issues
4. **Be Empowering**: Always offer a way forward
5. **Be Concise**: Keep messages short and scannable

### Message Structure
```
[What Happened] + [Why It Happened] + [What To Do]
```

**Good Example**:
```
Authentication with GitHub failed. Your session may have expired. 
Please sign in again to continue.
```

**Bad Example**:
```
Error: 401 Unauthorized
```

### Tone Guidelines
- Use friendly, conversational language
- Avoid technical jargon when possible
- Don't blame the user
- Express empathy for the inconvenience
- Maintain confidence that the issue can be resolved
