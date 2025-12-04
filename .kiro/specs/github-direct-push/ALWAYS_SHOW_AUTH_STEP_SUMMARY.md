# GitHub Auth Step - Always Visible Implementation

## Summary

Updated the GitHub authentication step to always be visible in the wizard flow, with the sign-in button disabled when the user is already authenticated.

## Changes Made

### 1. Requirements Document Updates
- Updated Requirement 1 acceptance criteria to specify the step is **always displayed**
- Clarified button states: active when not authenticated, disabled when authenticated
- Removed concept of "skipping" the step

### 2. Design Document Updates
- Updated component responsibilities to reflect always-visible pattern
- Added new **Property 9** to validate the step is always visible
- Added implementation notes explaining the UX pattern
- Updated Property 6 to mention the disabled button state

### 3. Code Implementation (`src/components/wizard/GitHubAuthStep.tsx`)

#### Key Changes:
- Removed conditional rendering based on authentication status
- Single unified layout that adapts based on `isAuthenticated` state
- Sign-in button is **always present** but disabled when authenticated
- Button text changes: "Sign in with GitHub" → "Signed In" (with checkmark)
- Icon changes: GitHub icon → Success checkmark when authenticated
- Border color changes: white → lime-500 when authenticated

#### Button States:
- **Not Authenticated**: 
  - Active lime-500 button
  - "Sign in with GitHub" text
  - GitHub icon
  
- **Authenticated**: 
  - Disabled gray button
  - "Signed In" text
  - Checkmark icon
  - Sign out button appears below

#### Additional Fixes:
- Fixed deprecated `Github` icon import (now `GithubIcon`)
- Fixed gradient class warning (`bg-gradient-to-r` → `bg-linear-to-r`)
- Fixed TypeScript type inference for `isAuthenticated`

## UX Benefits

1. **Consistency**: Users always see the same step in the wizard flow
2. **Clarity**: Authentication status is immediately visible
3. **No Confusion**: Users won't wonder if the step was skipped
4. **Better Feedback**: Disabled button clearly shows "already signed in" state

## Testing

The component now:
- Always renders the GitHub auth step
- Shows appropriate UI based on authentication state
- Maintains all existing functionality (sign in, sign out, error handling)
- Properly updates the config store with authentication status

## Validation

- ✅ No TypeScript diagnostics
- ✅ Matches updated requirements (Requirement 1)
- ✅ Implements new Property 9 from design document
- ✅ Maintains backward compatibility with existing flows
