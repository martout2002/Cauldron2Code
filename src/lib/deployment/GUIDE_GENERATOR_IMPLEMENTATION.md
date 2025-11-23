# Guide Generator Implementation

## Overview

The `GuideGenerator` class orchestrates the creation of complete deployment guides by integrating multiple specialized components:

- **ConfigurationAnalyzer**: Analyzes scaffold configuration to determine deployment requirements
- **StepBuilder**: Builds platform-specific deployment steps
- **ChecklistGenerator**: Creates post-deployment checklist items
- **TroubleshootingBuilder**: Generates troubleshooting sections with common issues

## Requirements Fulfilled

- **Requirement 2.1**: Analyzes scaffold configuration to determine required setup steps
- **Requirement 2.7**: Displays only relevant steps based on user's configuration
- **Requirement 3.1**: Shows steps in numbered, sequential format

## Usage

### Basic Usage

```typescript
import { GuideGenerator, PLATFORMS } from '@/lib/deployment';
import { ScaffoldConfig } from '@/types';

// Create a guide generator instance
const generator = new GuideGenerator();

// Get a platform
const vercel = PLATFORMS.find(p => p.id === 'vercel');

// Your scaffold configuration
const config: ScaffoldConfig = {
  projectName: 'my-app',
  description: 'My awesome app',
  frontendFramework: 'nextjs',
  backendFramework: 'none',
  database: 'prisma-postgres',
  auth: 'nextauth',
  // ... other config properties
};

// Generate the guide
const guide = generator.generateGuide(vercel, config);

// Access guide components
console.log(guide.steps); // Array of deployment steps
console.log(guide.postDeploymentChecklist); // Checklist items
console.log(guide.troubleshooting); // Troubleshooting section
console.log(guide.estimatedTime); // e.g., "15-25 minutes"
```

### Guide Structure

The generated guide includes:

1. **Steps**: Sequential deployment instructions
   - Prerequisites
   - CLI installation (if applicable)
   - Repository setup
   - Platform-specific setup
   - Environment variables configuration
   - Database setup (if required)
   - Build configuration
   - Deployment
   - Verification
   - Monorepo steps (if applicable)

2. **Post-Deployment Checklist**: Tasks to complete after deployment
   - OAuth callback URL updates (if using NextAuth)
   - Database migrations (if using database)
   - AI API key verification (if using AI)
   - Application testing
   - Custom domain setup (optional)
   - Monitoring setup (optional)

3. **Troubleshooting Section**: Common issues and solutions
   - Build failures
   - Application won't start
   - Database connection errors (if using database)
   - Environment variable issues
   - Platform status page link
   - Community support links

## Key Features

### Contextual Guide Generation

The guide generator analyzes your scaffold configuration and includes only relevant steps:

- **Database steps** only appear if you selected a database
- **Authentication steps** only appear if you selected an auth provider
- **AI configuration** only appears if you selected an AI template
- **Monorepo steps** only appear for monorepo projects

### Platform-Specific Instructions

Each platform gets tailored instructions:

- **Vercel**: CLI-based deployment with automatic detection
- **Railway**: CLI-based with native database provisioning
- **Render**: Dashboard-based with detailed UI instructions
- **Netlify**: Dashboard-based optimized for static sites
- **AWS Amplify**: Console-based with AWS ecosystem integration

### Time Estimation

The generator estimates deployment time based on:
- Number of steps
- Complexity of steps (substeps, commands)
- First-time deployment buffer (20% extra time)

### Unique Guide IDs

Each guide gets a unique identifier based on:
- Platform ID
- Framework selection
- Database choice
- Auth provider
- Project structure
- AI template
- Timestamp
- Counter (for same-millisecond uniqueness)

## Advanced Usage

### Custom Requirements

You can generate a guide with custom requirements (useful for testing):

```typescript
import { DeploymentRequirements } from '@/types/deployment-guides';

const customRequirements: DeploymentRequirements = {
  requiresDatabase: true,
  databaseType: 'PostgreSQL',
  requiresAuth: true,
  authProvider: 'NextAuth.js',
  requiresAI: false,
  requiresRedis: false,
  isMonorepo: false,
  framework: 'Next.js',
  buildTool: 'npm',
  environmentVariables: [
    {
      key: 'DATABASE_URL',
      description: 'PostgreSQL connection string',
      required: true,
      example: 'postgresql://...',
      howToGet: 'Create a database',
    },
  ],
};

const guide = generator.generateGuideWithRequirements(vercel, customRequirements);
```

## Integration Points

### With Platform Selector

```typescript
// User selects a platform
const selectedPlatform = PLATFORMS.find(p => p.id === userSelection);

// Generate guide for that platform
const guide = generator.generateGuide(selectedPlatform, scaffoldConfig);

// Display guide to user
renderDeploymentGuide(guide);
```

### With Progress Tracking

```typescript
// Generate guide
const guide = generator.generateGuide(platform, config);

// Load saved progress
const progress = loadProgress(guide.id);

// Mark steps as complete
progress.completedSteps.push(stepId);
saveProgress(guide.id, progress);
```

### With Guide Export

```typescript
// Generate guide
const guide = generator.generateGuide(platform, config);

// Export as markdown
const markdown = exportAsMarkdown(guide);

// Download
downloadFile(markdown, `deploy-to-${platform.id}.md`);
```

## Testing

Run the test file to verify functionality:

```bash
npx tsx src/lib/deployment/__test-guide-generator.ts
```

The test covers:
- Guide generation for all platforms
- Monorepo support
- Static site configuration
- Time estimation
- Guide ID uniqueness
- Required components verification

## Next Steps

The GuideGenerator is now ready for integration with:

1. **Platform Selector UI** (Task 8): Display platform options
2. **Deployment Guide UI** (Task 9-11): Render the generated guide
3. **Progress Persistence** (Task 7): Save user progress
4. **Guide Export** (Task 12): Export guides as markdown

## Architecture

```
GuideGenerator
├── ConfigurationAnalyzer
│   └── Analyzes scaffold config
│       └── Detects requirements
├── StepBuilder
│   └── Builds deployment steps
│       ├── Platform-specific steps
│       ├── Environment variables
│       ├── Database setup
│       └── Monorepo steps
├── ChecklistGenerator
│   └── Creates post-deployment tasks
│       ├── OAuth callbacks
│       ├── Database migrations
│       └── Testing & monitoring
└── TroubleshootingBuilder
    └── Generates troubleshooting
        ├── Common issues
        ├── Platform-specific solutions
        └── Community links
```

## Performance

- **Generation time**: < 10ms for typical configurations
- **Memory usage**: Minimal (all components are lightweight)
- **No external dependencies**: Uses only existing project dependencies
- **Client-side generation**: No server calls required

## Error Handling

The GuideGenerator is designed to be robust:

- All components have sensible defaults
- Missing configuration properties are handled gracefully
- Platform-specific features are checked before use
- Invalid configurations are caught by TypeScript types

## Future Enhancements

Potential improvements for future iterations:

1. **Caching**: Cache generated guides for identical configurations
2. **Customization**: Allow users to customize step order or content
3. **Localization**: Support multiple languages
4. **Video Tutorials**: Embed video links for complex steps
5. **Interactive Terminal**: Simulate commands in browser
6. **AI Assistance**: Use AI to answer deployment questions
