# Repository URL Persistence Feature

## Overview
Added functionality to store and reuse generated GitHub repository URLs, preventing duplicate repository creation when users navigate through the wizard multiple times.

## Changes Made

### 1. Config Store (`src/lib/store/config-store.ts`)
- Added `githubRepoUrl?: string` field to store the generated repository URL
- Added `setGithubRepoUrl()` method to update the stored URL
- Initialized default value as `undefined`

### 2. Type Definitions (`src/types/index.ts`)
- Added `githubRepoUrl?: string` to `ScaffoldConfig` interface
- Added validation schema for the new field in Zod schema

### 3. Configure Page (`src/app/configure/page.tsx`)
- **Check for existing repo**: At the start of `handleGenerate()`, checks if `config.githubRepoUrl` exists
- **Reuse existing URL**: If URL exists, skips generation and directly shows the success screen with the existing repository
- **Store new URL**: After successful GitHub repo creation, stores the URL using `setGithubRepoUrl()`
- **Clear on reset**: When user clicks "Create Another", clears the stored URL to allow new generation

## User Flow

### First Time Generation
1. User completes wizard configuration
2. User signs in to GitHub (if not already signed in)
3. Clicks "Next" on summary step
4. Repository is created and URL is stored
5. Success screen shows with repository link

### Subsequent Navigation
1. User completes wizard configuration (same or different)
2. If GitHub is enabled, authenticated, AND a repo URL exists:
   - Clicking "Next" on summary immediately shows success screen
   - Uses the stored repository URL
   - No new repository is created
3. If user tries to create with same name (409 conflict):
   - If a stored URL exists, automatically uses the existing repository
   - Shows success screen with "Using Existing Repository" message
   - Prevents duplicate repository creation attempts
4. If user clicks "Create Another":
   - Stored URL is cleared
   - Next generation will create a new repository

## Benefits
- Prevents accidental duplicate repository creation
- Handles 409 conflict errors gracefully by reusing existing repository
- Faster navigation for users who want to review their generated repo
- Maintains state across page refreshes (via Zustand persist)
- Clean UX - users can always create a new repo by clicking "Create Another"
- Reduces GitHub API calls and rate limit consumption
