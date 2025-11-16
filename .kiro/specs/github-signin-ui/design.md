# Design Document

## Overview

This design adds the GitHub authentication UI to the Cauldron2Code configuration page by integrating the existing `GitHubAuthButton` component into the page layout. The component already handles all authentication logic, OAuth flow, and state management - we simply need to make it visible to users.

## Architecture

### Component Integration

The `GitHubAuthButton` component will be added to the `/configure` page between the main configuration wizard and the generate button. This placement ensures users see the authentication option before attempting to generate their project.

**Component Hierarchy:**
```
ConfigurePage
├── ConfigurationWizard
├── ColorSchemeSelector
├── ValidationAlert
├── **GitHub Authentication Section (NEW)**
│   └── GitHubAuthButton
└── GenerateButton
```

### Layout Strategy

The GitHub authentication section will be added as a new section in the main configuration area, maintaining consistency with existing sections (ColorSchemeSelector, ValidationAlert, GenerateButton).

**Responsive Behavior:**
- Mobile (<768px): Full width, stacked layout
- Tablet (768px-1023px): Full width, stacked layout
- Desktop (1024px+): Left column only (not in preview panel)

## Components and Interfaces

### New Section Component Structure

```typescript
// Location: src/app/configure/page.tsx
<div className="mt-6 md:mt-8">
  <div className="bg-white rounded-lg border p-4 md:p-6">
    <h2 className="text-lg md:text-xl font-semibold mb-2">
      GitHub Integration
    </h2>
    <p className="text-sm text-gray-600 mb-4">
      Sign in with GitHub to create repositories directly from Cauldron2Code
    </p>
    <GitHubAuthButton />
  </div>
</div>
```

### Component Import

The `GitHubAuthButton` component needs to be imported at the top of the configure page:

```typescript
import { GitHubAuthButton } from '@/components/GitHubAuthButton';
```

### Styling Consistency

The new section will use the same styling patterns as existing sections:
- White background with rounded corners (`bg-white rounded-lg border`)
- Consistent padding (`p-4 md:p-6`)
- Consistent margin spacing (`mt-6 md:mt-8`)
- Responsive text sizing (`text-lg md:text-xl` for headers)

## Data Models

No new data models are required. The `GitHubAuthButton` component already manages its own state:

```typescript
interface AuthStatus {
  authenticated: boolean;
  user: GitHubUser | null;
}

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}
```

## Error Handling

Error handling is already implemented in the `GitHubAuthButton` component:
- OAuth callback errors are displayed inline
- Authentication failures show error messages
- Sign-out failures are handled gracefully

No additional error handling is needed at the page level.

## Testing Strategy

### Manual Testing

1. **Visual Integration Test**
   - Navigate to `/configure`
   - Verify GitHub section appears between validation alerts and generate button
   - Verify section styling matches other sections
   - Test on mobile, tablet, and desktop viewports

2. **Authentication Flow Test**
   - Click "Sign in with GitHub" button
   - Complete OAuth flow
   - Verify authenticated state displays correctly
   - Refresh page and verify state persists
   - Sign out and verify state updates

3. **Responsive Design Test**
   - Test layout on mobile (320px, 375px, 414px widths)
   - Test layout on tablet (768px, 1024px widths)
   - Test layout on desktop (1280px, 1920px widths)
   - Verify button and text remain readable at all sizes

### Integration Points

The component integrates with existing systems:
- **OAuth API**: `/api/github/auth/initiate`, `/api/github/auth/callback`, `/api/github/auth/status`
- **Cookie Management**: Authentication state stored in HTTP-only cookies
- **URL Parameters**: OAuth callback uses query parameters for success/error states

## Design Decisions

### Placement Rationale

The GitHub authentication section is placed after validation alerts but before the generate button because:
1. Users should configure their project first (wizard)
2. Users should see any validation issues (alerts)
3. Users should authenticate before generating (GitHub section)
4. Users should then generate their project (generate button)

This creates a natural top-to-bottom flow.

### Section vs Inline

We chose to create a dedicated section rather than inline the button because:
1. Provides context about why GitHub authentication is needed
2. Maintains visual consistency with other sections
3. Allows for future expansion (e.g., other Git providers)
4. Makes the feature more discoverable

### Optional vs Required

GitHub authentication remains optional because:
1. Users can download projects without GitHub integration
2. Not all users want to create repositories immediately
3. Maintains flexibility in the user workflow
4. Existing generate button already handles both authenticated and non-authenticated states
