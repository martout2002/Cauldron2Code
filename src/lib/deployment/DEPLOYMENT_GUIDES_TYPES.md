# Deployment Guides - Core Data Structures

This document describes the core data structures and types created for the deployment guides feature.

## Overview

The deployment guides feature provides step-by-step instructions for deploying generated scaffolds to various hosting platforms. This implementation includes:

1. **TypeScript type definitions** for all deployment guide entities
2. **Platform definitions** for 5 major hosting platforms
3. **Platform logos** in SVG format
4. **Helper functions** for platform selection and recommendations

## Files Created

### Type Definitions

**Location:** `src/types/deployment-guides.ts`

Contains all TypeScript interfaces and types for:
- `Platform` - Platform metadata and features
- `DeploymentGuide` - Complete deployment guide structure
- `DeploymentStep` - Individual deployment steps
- `CommandSnippet` - Terminal commands with copy functionality
- `CodeSnippet` - Code examples
- `ChecklistItem` - Post-deployment checklist items
- `TroubleshootingSection` - Common issues and solutions
- `GuideProgress` - Progress tracking state
- `DeploymentRequirements` - Configuration analysis results
- `EnvironmentVariable` - Environment variable definitions

### Platform Definitions

**Location:** `src/lib/deployment/platforms.ts`

Defines 5 hosting platforms:
1. **Vercel** - Best for Next.js and frontend frameworks
2. **Railway** - Best for full-stack apps with databases
3. **Render** - Best for simple deployments with databases
4. **Netlify** - Best for static sites and JAMstack
5. **AWS Amplify** - Best for AWS ecosystem integration

Each platform includes:
- Unique ID and name
- Description and best use cases
- Logo path
- Feature flags (free tier, database support, custom domains)
- Ease of use rating
- Documentation and pricing URLs

### Helper Functions

**`getPlatformById(id: string): Platform | undefined`**
- Retrieves a platform by its ID
- Returns undefined if not found

**`getRecommendedPlatforms(config: ScaffoldConfig): Platform[]`**
- Analyzes scaffold configuration
- Returns recommended platforms based on:
  - Frontend framework (Next.js → Vercel)
  - Project structure (Monorepo → Railway)
  - Database requirements (Database → Render)
  - Static sites (No backend → Netlify)

### Platform Logos

**Location:** `public/icons/platforms/`

Created SVG logos for all platforms:
- `vercel.svg` - Vercel triangle logo
- `railway.svg` - Railway diamond logo
- `render.svg` - Render circular logo
- `netlify.svg` - Netlify diamond logo
- `aws.svg` - AWS Amplify cube logo

All logos use `currentColor` for easy theming and are optimized for web display.

## Type Exports

All deployment guide types are re-exported from the main types index:

```typescript
// Available from '@/types'
import {
  Platform,
  DeploymentGuide,
  DeploymentStep,
  CommandSnippet,
  ChecklistItem,
  // ... and more
} from '@/types';
```

## Usage Examples

### Get a Platform

```typescript
import { getPlatformById } from '@/lib/deployment/platforms';

const vercel = getPlatformById('vercel');
console.log(vercel?.name); // "Vercel"
```

### Get Recommended Platforms

```typescript
import { getRecommendedPlatforms } from '@/lib/deployment/platforms';
import { ScaffoldConfig } from '@/types';

const config: ScaffoldConfig = {
  frontendFramework: 'nextjs',
  backendFramework: 'nextjs-api',
  projectStructure: 'nextjs-only',
  // ... other config
};

const recommended = getRecommendedPlatforms(config);
// Returns [Vercel platform]
```

### Create a Deployment Step

```typescript
import { DeploymentStep } from '@/types';

const step: DeploymentStep = {
  id: 'install-cli',
  title: 'Install Vercel CLI',
  description: 'Install the Vercel CLI globally',
  order: 1,
  required: true,
  commands: [{
    id: 'cmd-1',
    command: 'npm install -g vercel',
    description: 'Install Vercel CLI',
    language: 'bash',
  }],
};
```

## Verification

Run the verification script to test all types and platform definitions:

```bash
npx tsx src/lib/deployment/__verify-types.ts
```

This will verify:
- All 5 platforms are properly defined
- Platform properties are complete
- Helper functions work correctly
- Type structures are valid
- Recommendation logic works as expected

## Next Steps

With these core data structures in place, the next tasks are:

1. **Configuration Analyzer** - Analyze scaffold config to determine deployment requirements
2. **Step Builder** - Generate platform-specific deployment steps
3. **Guide Generator** - Orchestrate guide creation
4. **UI Components** - Build the interactive guide interface

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **1.2** - Platform selector showing multiple platforms
- **1.3** - Platform logos, names, and descriptions
- **14.2** - Platform comparison data structure

All types follow the design document specifications exactly.
