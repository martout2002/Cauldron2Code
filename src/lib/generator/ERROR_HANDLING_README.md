# Error Handling Implementation

This document describes the comprehensive error handling system implemented for StackForge scaffold generation.

## Overview

The error handling system provides robust error recovery, detailed logging, and user-friendly error messages throughout the scaffold generation and download process.

## Components

### 1. Error Logging System (`error-logger.ts`)

**Purpose**: Centralized error logging for scaffold generation with detailed context tracking.

**Features**:
- In-memory error log store with TTL (1 hour)
- Structured error logs with timestamp, step, error type, and context
- Automatic error report generation
- Console logging for debugging

**Usage**:
```typescript
const errorLogger = new GenerationErrorLogger(generationId);
errorLogger.log('creating-structure', error, { projectName: 'my-app' });
const report = errorLogger.generateErrorReport();
```

### 2. Validation Handler (`validation-handler.ts`)

**Purpose**: Manages validation state and prevents generation when errors exist.

**Features**:
- Validates configuration before generation
- Distinguishes between errors (blocking) and warnings (non-blocking)
- Provides user-friendly error guidance with suggestions
- Formats validation messages for display

**Key Functions**:
- `validateForGeneration()`: Determines if generation can proceed
- `getErrorGuidance()`: Provides detailed error explanations
- `getWarningGuidance()`: Provides warning context
- `hasCriticalErrors()`: Identifies blocking errors

### 3. Enhanced File Operations (`file-operations.ts`)

**Improvements**:
- Uses `Promise.allSettled()` for parallel operations with failure tracking
- Returns detailed success/failure information
- Provides context about batch operation failures
- Better error messages with file counts

**Changes**:
- `createDirectories()`: Now reports total failures in error message
- `writeFiles()`: Returns success count and failed file list

### 4. Generation Error Handling (`api/generate/route.ts`)

**Features**:
- Try-catch blocks around each generation step
- Detailed error logging with context
- Partial scaffold generation on failure
- Error report included in failed scaffolds
- Automatic cleanup on errors

**Partial Scaffold Generation**:
When file writing fails, the system:
1. Writes successfully generated files
2. Creates `ERROR_REPORT.md` with detailed error information
3. Creates `PARTIAL_SCAFFOLD_README.md` explaining the situation
4. Packages partial scaffold for download

### 5. Validation Error Handling (`api/validate/route.ts`)

**Improvements**:
- Enhanced error messages with counts
- Helpful validation messages
- Proper HTTP status codes
- Structured error responses

### 6. Download Error Handling (`api/download/[id]/route.ts`)

**Features**:
- Automatic retry support (up to 3 attempts)
- Retry attempt tracking via query parameter
- Detailed error messages with suggestions
- File validation (size, existence)
- Stream error handling
- Dynamic cleanup delay based on file size

**Error Responses**:
```json
{
  "error": "Archive not found",
  "message": "Helpful message",
  "canRetry": true,
  "retryAttempt": 1,
  "suggestion": "Click the download button again to retry"
}
```

### 7. UI Components

#### GenerateButton (`GenerateButton.tsx`)
- Validates configuration before generation
- Prevents generation when errors exist
- Allows generation with warnings
- Shows validation status with color coding
- Integrates with DownloadButton for retry logic

#### DownloadButton (`DownloadButton.tsx`)
- Automatic retry (max 3 attempts)
- 2-second delay between retries
- Manual retry option
- Network error handling
- Fallback options when retries exhausted
- Progress indication during retries

## Error Flow

### Generation Errors

```
User clicks Generate
  ↓
Validation Check
  ↓ (if errors exist)
Show Error → Prevent Generation
  ↓ (if valid)
Start Generation
  ↓
[Error occurs at any step]
  ↓
Log Error with Context
  ↓
Try to Create Partial Scaffold
  ↓
Add Error Report to Scaffold
  ↓
Create Archive (if possible)
  ↓
Show Error + Download Link (if partial scaffold created)
```

### Download Errors

```
User clicks Download
  ↓
Attempt Download (attempt 0)
  ↓ (if fails)
Wait 2 seconds
  ↓
Retry (attempt 1)
  ↓ (if fails)
Wait 2 seconds
  ↓
Retry (attempt 2)
  ↓ (if fails)
Wait 2 seconds
  ↓
Retry (attempt 3)
  ↓ (if fails)
Show Fallback Options
```

## Error Types

### 1. Validation Errors (Blocking)
- **auth-database**: Auth requires database
- **vercel-express**: Express can't deploy to Vercel
- **schema-validation**: Invalid configuration format

### 2. Validation Warnings (Non-blocking)
- **supabase-auth-db**: Recommendation to use Supabase DB with Supabase Auth
- **trpc-monorepo**: tRPC works best in monorepo
- **ai-api-key**: AI features require API key

### 3. Generation Errors
- **FileOperationError**: File system operations failed
- **ArchiveError**: Archive creation failed
- **Template errors**: Code generation failed

### 4. Download Errors
- **404**: Archive not found
- **400**: Invalid download ID
- **500**: Server error during download
- **Network errors**: Connection issues

## User Experience

### Clear Error Messages
All errors include:
- What went wrong
- Why it happened
- What the user can do about it

### Progressive Enhancement
- Errors prevent generation
- Warnings allow generation with notice
- Partial scaffolds provided when possible
- Automatic retries for transient failures

### Helpful Guidance
- Validation errors show specific suggestions
- Download failures offer retry options
- Partial scaffolds include troubleshooting info
- Error reports contain full context

## Testing Recommendations

1. **Validation Testing**
   - Test each validation rule
   - Verify errors block generation
   - Verify warnings allow generation

2. **Generation Error Testing**
   - Simulate file write failures
   - Verify partial scaffold creation
   - Check error report contents

3. **Download Error Testing**
   - Test with missing files
   - Test with network interruptions
   - Verify retry logic
   - Test retry exhaustion

4. **Edge Cases**
   - Empty configurations
   - Very large scaffolds
   - Concurrent generations
   - Rapid retry attempts

## Future Enhancements

1. **Persistent Error Logging**
   - Replace in-memory store with database
   - Long-term error analytics
   - User error history

2. **Advanced Retry Logic**
   - Exponential backoff
   - Circuit breaker pattern
   - Retry queue for failed operations

3. **Error Recovery**
   - Resume failed generations
   - Incremental file writing
   - Checkpoint system

4. **Monitoring**
   - Error rate tracking
   - Alert system for critical errors
   - Performance metrics

## Configuration

### Error Logger TTL
```typescript
// src/lib/generator/error-logger.ts
private readonly TTL = 1000 * 60 * 60; // 1 hour
```

### Download Retry Settings
```typescript
// src/components/DownloadButton.tsx
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds
```

### Archive Cleanup Delay
```typescript
// src/app/api/download/[id]/route.ts
const cleanupDelay = Math.min(10000, Math.max(5000, fileSize / 100000));
```

## Maintenance

### Adding New Error Types
1. Add error class to appropriate file
2. Update error guidance in `validation-handler.ts`
3. Add error handling in relevant API route
4. Update UI components to display new error type

### Modifying Retry Logic
1. Update constants in `DownloadButton.tsx`
2. Adjust retry logic in download API route
3. Update user-facing messages
4. Test with various failure scenarios

## Support

For issues or questions about error handling:
1. Check error logs in browser console
2. Review ERROR_REPORT.md in partial scaffolds
3. Check server logs for generation errors
4. Verify network connectivity for download issues
