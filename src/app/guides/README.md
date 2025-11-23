# Deployment Guides - Pages and Routing

This directory contains the page components for the deployment guides feature, which provides users with comprehensive, step-by-step instructions for deploying their generated projects to various hosting platforms.

## Overview

The deployment guides feature consists of two main pages:

1. **Platform Selector Page** (`/guides`) - Displays available deployment platforms
2. **Deployment Guide Page** (`/guides/[platform]/[configId]`) - Shows detailed deployment instructions

## Architecture

```
/guides
├── page.tsx                           # Platform selector page
└── [platform]/
    └── [configId]/
        └── page.tsx                   # Dynamic deployment guide page
```

## Pages

### Platform Selector Page (`/guides`)

**Purpose**: Allow users to choose which deployment platform they want to use.

**Features**:
- Displays all available platforms (Vercel, Railway, Render, Netlify, AWS Amplify)
- Shows recommended platforms based on scaffold configuration
- Provides platform comparison functionality
- Handles navigation to deployment guide page

**Requirements Implemented**:
- 1.1: Display deployment options after scaffold generation
- 1.2: Show platform selector with available platforms
- 1.4: Navigate to guide page on platform selection

**Usage**:
```typescript
// Navigate to platform selector
router.push('/guides');
```

### Deployment Guide Page (`/guides/[platform]/[configId]`)

**Purpose**: Display comprehensive deployment instructions for a specific platform and configuration.

**Features**:
- Loads scaffold configuration from URL parameters
- Generates contextual deployment guide
- Handles invalid platforms or configurations gracefully
- Provides back navigation to platform selector
- Shows loading and error states

**Requirements Implemented**:
- 10.1: Provide unique URL for deployment guide
- 10.2: Bookmarked/shared URLs display same guide with same configuration

**URL Structure**:
```
/guides/[platform]/[configId]

Examples:
- /guides/vercel/1700000000000-abc123
- /guides/railway/1700000000000-def456
- /guides/render/1700000000000-ghi789
```

**URL Parameters**:
- `platform`: Platform ID (vercel, railway, render, netlify, aws-amplify)
- `configId`: Unique identifier for the scaffold configuration

## Guide URL Generation

The guide URL generation system ensures that deployment guides are:
- **Unique**: Each guide has a unique URL based on platform and configuration
- **Bookmarkable**: URLs can be saved and accessed later
- **Shareable**: URLs can be shared with team members

### How It Works

1. **Config Storage**: When a user selects a platform, their scaffold configuration is stored in localStorage with a unique ID
2. **URL Generation**: A URL is generated using the platform ID and config ID
3. **Config Retrieval**: When accessing a guide URL, the configuration is loaded from localStorage
4. **Fallback**: If config is not found, falls back to current config from store

### API

```typescript
import { createGuideUrl, getConfigById } from '@/lib/deployment';

// Generate a guide URL
const url = createGuideUrl('vercel', scaffoldConfig);
// Returns: /guides/vercel/1700000000000-abc123

// Retrieve a configuration
const config = getConfigById('1700000000000-abc123');
```

## State Management

### Configuration Storage

Scaffold configurations are stored in two places:

1. **Zustand Store** (`useConfigStore`): Current/active configuration
2. **localStorage** (`deployment-guide-configs`): Historical configurations for URL access

### Progress Tracking

Guide progress (completed steps, checklist items) is managed by `GuideProgressManager` and stored separately in localStorage.

## Error Handling

The deployment guide page handles several error scenarios:

1. **Invalid Platform**: Shows error if platform ID is not recognized
2. **Missing Configuration**: Shows error if config ID is not found
3. **Generation Failure**: Shows error if guide generation fails
4. **Empty Configuration**: Falls back to current config or shows error

Each error state provides:
- Clear error message
- Navigation back to platform selector
- Option to generate new scaffold

## Navigation Flow

```
1. User completes scaffold generation
   ↓
2. User clicks "View Deployment Guides"
   ↓
3. Platform Selector Page (/guides)
   ↓
4. User selects a platform
   ↓
5. Config is stored with unique ID
   ↓
6. Navigate to /guides/[platform]/[configId]
   ↓
7. Deployment Guide Page loads and displays guide
```

## Integration Points

### From Generation Flow

After scaffold generation, users can access deployment guides:

```typescript
// In generation completion UI
<button onClick={() => router.push('/guides')}>
  View Deployment Guides
</button>
```

### With GitHub Integration

If user has created a GitHub repository, this information can be passed to the guide:

```typescript
// The guide will detect and skip repository creation steps
const config = {
  ...scaffoldConfig,
  githubRepo: 'username/repo-name'
};
```

## Accessibility

Both pages implement accessibility features:

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly content
- Focus management for modals and overlays

## Performance

### Optimization Strategies

1. **Client-Side Rendering**: Pages use 'use client' for interactive features
2. **Lazy Loading**: Components are loaded on demand
3. **Config Caching**: Configurations are cached in localStorage
4. **Cleanup**: Old configurations (>30 days) are automatically cleaned up

### Loading States

Both pages provide loading indicators:
- Platform selector: Instant load (no async operations)
- Deployment guide: Shows spinner while generating guide

## Testing

### Manual Testing

1. Navigate to `/guides`
2. Select a platform
3. Verify guide loads correctly
4. Bookmark the URL
5. Close browser and reopen bookmarked URL
6. Verify guide loads with same configuration

### Test Files

- `src/lib/deployment/__test-guide-url-generator.ts`: Tests URL generation and config storage

## Future Enhancements

Potential improvements for future iterations:

1. **Server-Side Rendering**: Move guide generation to server for better performance
2. **Database Storage**: Store configurations in database instead of localStorage
3. **Guide Versioning**: Track guide versions for updates
4. **Analytics**: Track which platforms are most popular
5. **Guide Feedback**: Allow users to rate guide helpfulness
6. **Export Options**: Add PDF export functionality
7. **Offline Support**: Cache guides for offline access

## Related Documentation

- [Deployment Guides Design](../../.kiro/specs/deployment-guides/design.md)
- [Deployment Guides Requirements](../../.kiro/specs/deployment-guides/requirements.md)
- [Guide Components](../../components/guides/README.md)
- [Guide Generator](../../lib/deployment/GUIDE_GENERATOR_IMPLEMENTATION.md)

## Support

For issues or questions about the deployment guides pages:

1. Check the requirements document for expected behavior
2. Review the design document for architecture details
3. Check browser console for error messages
4. Verify localStorage is enabled and not full
5. Test with a fresh scaffold configuration
