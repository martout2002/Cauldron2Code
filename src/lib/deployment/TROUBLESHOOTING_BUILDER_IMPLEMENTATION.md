# TroubleshootingBuilder Implementation

## Overview

The `TroubleshootingBuilder` class generates comprehensive troubleshooting sections for deployment guides. It creates contextual troubleshooting content based on the deployment platform and project requirements, helping users diagnose and resolve common deployment issues.

## Features

### Core Troubleshooting Issues

The builder generates four main categories of troubleshooting issues:

1. **Build Fails** - Always included
   - Covers dependency issues, TypeScript errors, environment variable problems
   - Platform-specific build solutions
   - Framework-specific guidance

2. **Application Won't Start** - Always included
   - Addresses startup failures, port configuration, runtime errors
   - Platform-specific startup requirements
   - Framework-specific start command issues

3. **Database Connection Errors** - Conditional (only when database is required)
   - Database-specific connection troubleshooting
   - SSL/TLS configuration issues
   - Platform-specific database connectivity

4. **Environment Variable Issues** - Always included
   - Missing or misconfigured environment variables
   - Platform-specific variable management
   - Framework-specific variable requirements (e.g., NEXT_PUBLIC_ prefix)

### Platform-Specific Content

Each troubleshooting issue includes platform-specific solutions:

- **Vercel**: Serverless-specific issues, redeployment requirements
- **Railway**: Automatic PORT variable, internal database URLs
- **Render**: SSL requirements, internal vs external URLs
- **Netlify**: Static site considerations
- **AWS Amplify**: AWS-specific configuration

### Framework-Specific Content

Solutions are tailored to the project's framework:

- **Next.js**: Build-time vs runtime variables, NEXT_PUBLIC_ prefix
- **React**: Build output configuration
- **Other frameworks**: Framework-specific build and start commands

### Database-Specific Content

When a database is required, solutions are customized for the database type:

- **PostgreSQL**: SSL configuration, connection string format
- **MongoDB**: Atlas IP whitelist, connection string format
- **MySQL**: SSL certificates, version compatibility

## Usage

```typescript
import { TroubleshootingBuilder } from '@/lib/deployment';
import { PLATFORMS } from '@/lib/deployment/platforms';

const builder = new TroubleshootingBuilder();
const platform = PLATFORMS.find(p => p.id === 'vercel');

const troubleshooting = builder.buildTroubleshootingSection(
  platform,
  requirements
);

console.log(troubleshooting.commonIssues); // Array of troubleshooting issues
console.log(troubleshooting.platformStatusUrl); // Platform status page
console.log(troubleshooting.communityLinks); // Community support links
```

## Integration with Other Components

The TroubleshootingBuilder works seamlessly with other deployment guide components:

```typescript
import {
  ConfigurationAnalyzer,
  StepBuilder,
  ChecklistGenerator,
  TroubleshootingBuilder,
} from '@/lib/deployment';

// Analyze configuration
const analyzer = new ConfigurationAnalyzer();
const requirements = analyzer.analyze(scaffoldConfig);

// Build deployment steps
const stepBuilder = new StepBuilder();
const steps = stepBuilder.buildSteps(platform, requirements);

// Generate checklist
const checklistGenerator = new ChecklistGenerator();
const checklist = checklistGenerator.generate(platform, requirements, scaffoldConfig);

// Build troubleshooting section
const troubleshootingBuilder = new TroubleshootingBuilder();
const troubleshooting = troubleshootingBuilder.buildTroubleshootingSection(
  platform,
  requirements
);

// Complete deployment guide
const guide = {
  platform,
  steps,
  checklist,
  troubleshooting,
};
```

## Data Structure

### TroubleshootingSection

```typescript
interface TroubleshootingSection {
  commonIssues: TroubleshootingIssue[];
  platformStatusUrl: string;
  communityLinks: ExternalLink[];
}
```

### TroubleshootingIssue

```typescript
interface TroubleshootingIssue {
  title: string;
  symptoms: string[];      // What the user sees
  causes: string[];        // Why it happens
  solutions: string[];     // How to fix it
  relatedLinks?: ExternalLink[];
}
```

## Platform Status URLs

The builder provides accurate status page URLs for each platform:

- **Vercel**: https://www.vercel-status.com
- **Railway**: https://status.railway.app
- **Render**: https://status.render.com
- **Netlify**: https://www.netlifystatus.com
- **AWS Amplify**: https://status.aws.amazon.com

## Community Links

Each platform includes relevant community support resources:

- Official community forums
- Discord servers
- GitHub discussions
- Support pages
- Stack Overflow tags

## Conditional Content

The builder intelligently includes or excludes content based on requirements:

### Database Connection Errors
- **Included when**: `requirements.requiresDatabase === true`
- **Excluded when**: No database is configured
- **Customized for**: PostgreSQL, MongoDB, MySQL

### Authentication Solutions
- **Included when**: `requirements.requiresAuth === true`
- **Covers**: OAuth callback URLs, authentication provider configuration

### Framework-Specific Solutions
- **Next.js**: Environment variable prefixes, build vs runtime variables
- **Other frameworks**: Framework-specific build and deployment considerations

## Testing

Run the test suite to verify functionality:

```bash
# Basic functionality tests
npx tsx src/lib/deployment/__test-troubleshooting.ts

# Integration tests with other components
npx tsx src/lib/deployment/__test-troubleshooting-integration.ts
```

## Example Output

### Build Fails Issue

```typescript
{
  title: 'Build Fails',
  symptoms: [
    'Build process exits with error code',
    'Dependencies fail to install',
    'TypeScript compilation errors',
    // ...
  ],
  causes: [
    'Missing or incorrect environment variables during build',
    'Node.js version mismatch between local and deployment',
    // ...
  ],
  solutions: [
    'Check that all required build-time environment variables are set in Vercel',
    'Verify Node.js version matches your local environment',
    // ...
  ],
  relatedLinks: [
    {
      text: 'Vercel Build Documentation',
      url: 'https://vercel.com/docs/builds',
      type: 'documentation'
    }
  ]
}
```

### Database Connection Errors (PostgreSQL)

```typescript
{
  title: 'Database Connection Errors',
  symptoms: [
    'Application fails to connect to database',
    'Connection timeout errors',
    // ...
  ],
  causes: [
    'Incorrect DATABASE_URL or connection string',
    'Database not accessible from deployment platform',
    // ...
  ],
  solutions: [
    'Verify DATABASE_URL environment variable is correctly set',
    'For PostgreSQL, try adding "?sslmode=require" to your connection string',
    'Check if your connection string includes the correct database name',
    // ...
  ],
  relatedLinks: [
    {
      text: 'Railway Database Documentation',
      url: 'https://docs.railway.app/databases',
      type: 'documentation'
    },
    {
      text: 'PostgreSQL Connection Strings',
      url: 'https://www.postgresql.org/docs/current/libpq-connect.html',
      type: 'documentation'
    }
  ]
}
```

## Requirements Coverage

This implementation satisfies the following requirements from the design document:

- **Requirement 9.1**: Common Issues section with troubleshooting guidance
- **Requirement 9.2**: Build failure troubleshooting steps
- **Requirement 9.3**: Environment variable misconfiguration debugging
- **Requirement 9.4**: Deployment timeout causes and solutions
- **Requirement 9.5**: Platform status page links
- **Requirement 9.6**: Community resource links (Discord, forums)

## Future Enhancements

Potential improvements for future iterations:

1. **Search functionality**: Allow users to search troubleshooting issues
2. **User feedback**: Track which solutions are most helpful
3. **Dynamic content**: Fetch real-time status from platform APIs
4. **AI-powered suggestions**: Use AI to suggest solutions based on error logs
5. **Video tutorials**: Link to video walkthroughs for complex issues
6. **Issue voting**: Let users vote on most common issues
7. **Custom issues**: Allow platforms to add custom troubleshooting content

## Best Practices

When using the TroubleshootingBuilder:

1. **Always include platform and requirements**: Ensures accurate, contextual content
2. **Display issues in order**: Build → Start → Database → Environment Variables
3. **Make issues expandable**: Allow users to focus on relevant issues
4. **Link to logs**: Direct users to platform logs for debugging
5. **Update regularly**: Keep platform URLs and community links current
6. **Test with real deployments**: Verify solutions work in practice

## Maintenance

To maintain the TroubleshootingBuilder:

1. **Update platform URLs**: Verify status and community links quarterly
2. **Add new platforms**: Extend platform-specific solutions as needed
3. **Monitor user feedback**: Track which issues users encounter most
4. **Update for framework changes**: Keep framework-specific solutions current
5. **Test with new database versions**: Verify database solutions remain accurate
