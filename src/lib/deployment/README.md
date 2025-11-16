# Deployment Orchestration System

This module provides a complete deployment orchestration system for automated deployment to hosting platforms, including environment variable management, progress tracking, error handling, and deployment workflow management.

## Features

- **Automatic Detection**: Detects required environment variables based on scaffold configuration
- **Smart Validation**: Validates environment variables with format-specific rules
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **User-Friendly**: Provides descriptions, examples, and helpful error messages

## Core Components

### DeploymentOrchestrator

The main orchestrator that manages the complete deployment workflow from project creation to monitoring.

```typescript
import { getDeploymentOrchestrator } from '@/lib/deployment';
import type { DeploymentConfig } from '@/lib/platforms/types';

const orchestrator = getDeploymentOrchestrator();

const config: DeploymentConfig = {
  projectName: 'my-app',
  platform: 'vercel',
  scaffoldConfig: { /* ... */ },
  environmentVariables: [ /* ... */ ],
  services: [],
};

const deployment = await orchestrator.deploy(config, userId);
// Returns Deployment object with status, logs, and results
```

**Features:**
- Automated project creation on hosting platforms
- Scaffold generation and file upload
- Environment variable configuration
- Build monitoring with real-time progress
- Timeout handling (5 minutes default)
- Automatic retry with exponential backoff for uploads
- Comprehensive error handling

### ProgressTracker

Manages real-time progress updates and build log streaming for deployments.

```typescript
import { getProgressTracker } from '@/lib/deployment';

const tracker = getProgressTracker();

// Subscribe to progress updates
const unsubscribe = tracker.subscribe(deploymentId, (update) => {
  console.log('Status:', update.status);
  console.log('Message:', update.message);
  console.log('Logs:', update.buildLogs);
});

// Update progress
tracker.update(deploymentId, 'Building application...');

// Add build logs
tracker.updateLogs(deploymentId, 'Installing dependencies...');

// Mark as complete
tracker.complete(deploymentId, 'https://my-app.vercel.app');

// Mark as failed
tracker.fail(deploymentId, error);

// Cleanup when done
unsubscribe();
```

**Features:**
- Event-based subscription system for real-time updates
- Build log aggregation
- Automatic cleanup after completion
- Support for Server-Sent Events (SSE)

### DeploymentErrorHandler

Handles deployment errors with classification, recovery strategies, and fallback options.

```typescript
import { getDeploymentErrorHandler } from '@/lib/deployment';

const errorHandler = getDeploymentErrorHandler();

// Handle an error
const recovery = await errorHandler.handleError(error, deployment);

// Recovery action types:
// - 'reconnect': Reconnect platform account
// - 'retry': Retry with suggestions
// - 'manual': Manual intervention needed
// - 'alternative': Try alternative platform
// - 'check': Check status on platform
// - 'fallback': Use GitHub repo or ZIP download

// Classify error severity
const severity = errorHandler.classifyError(error);
// Returns: 'critical' | 'recoverable' | 'temporary'

// Generate user-friendly message
const message = errorHandler.generateUserMessage(error, deployment);
```

**Error Types Handled:**
- `AUTH_FAILED`: Authentication failures
- `PROJECT_NAME_TAKEN`: Name conflicts
- `BUILD_FAILED`: Build errors
- `PLATFORM_UNAVAILABLE`: Platform outages
- `TIMEOUT`: Deployment timeouts
- `UPLOAD_FAILED`: File upload failures
- `RATE_LIMIT_EXCEEDED`: Rate limiting
- `INVALID_CONFIG`: Configuration errors
- `INSUFFICIENT_PERMISSIONS`: Permission errors

**Recovery Strategies:**
- Automatic retry with exponential backoff
- Alternative platform suggestions
- Fallback to GitHub repository creation
- Fallback to ZIP download
- Helpful error messages and suggestions

### EnvironmentVariableDetector

Analyzes a scaffold configuration and generates a list of required environment variables.

```typescript
import { EnvironmentVariableDetector } from '@/lib/deployment';
import type { ScaffoldConfig } from '@/types';

const detector = new EnvironmentVariableDetector();
const config: ScaffoldConfig = {
  // ... your scaffold configuration
  database: 'prisma-postgres',
  auth: 'nextauth',
  aiTemplate: 'chatbot',
  aiProvider: 'anthropic',
};

const envVars = detector.detect(config);
// Returns array of EnvironmentVariable objects
```

### EnvironmentVariableValidator

Validates environment variable values based on their configuration.

```typescript
import { EnvironmentVariableValidator } from '@/lib/deployment';

const validator = new EnvironmentVariableValidator();

// Validate a single variable
const result = validator.validate(envVar, 'postgresql://localhost:5432/db');
if (!result.isValid) {
  console.error(result.error);
}

// Validate all variables
const allResults = validator.validateAll(envVars);

// Check if all required variables are valid
const isValid = validator.areAllValid(envVars);

// Get all errors
const errors = validator.getErrors(envVars);
```

### EnvironmentVariableInput Component

React component for collecting environment variable values with validation.

```typescript
import { EnvironmentVariableInput } from '@/components';

<EnvironmentVariableInput
  envVar={envVar}
  onChange={(value) => handleChange(value)}
  error={validationError}
/>
```

## Environment Variable Types

### Database Variables

- **PostgreSQL** (Prisma/Drizzle): `DATABASE_URL`
- **MongoDB**: `MONGODB_URI`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Authentication Variables

- **NextAuth**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, OAuth provider credentials
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **Supabase Auth**: Uses same keys as Supabase database

### AI Provider Variables

- **Anthropic**: `ANTHROPIC_API_KEY`
- **OpenAI**: `OPENAI_API_KEY`
- **AWS Bedrock**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- **Google Gemini**: `GOOGLE_AI_API_KEY`

### Service Variables

- **Redis**: `REDIS_URL`
- **App URL**: `NEXT_PUBLIC_APP_URL`

## Validation Rules

The validator applies different rules based on the environment variable type:

### URL Validation
- Must use `http://` or `https://` protocol
- Must include a valid hostname

### Database URL Validation
- **PostgreSQL**: Must include database name in path
- **MongoDB**: Supports both `mongodb://` and `mongodb+srv://` protocols
- **Redis**: Supports both `redis://` and `rediss://` protocols

### API Key Validation
- Must not contain spaces
- Must meet minimum length requirements
- Must match provider-specific patterns

### Pattern Validation
- Custom regex patterns for specific formats
- JWT token format validation
- Provider-specific key format validation

### Length Validation
- Minimum length requirements (e.g., 32 characters for secrets)
- Maximum length constraints

## Example Usage

### Complete Deployment Configuration Flow

```typescript
import { 
  EnvironmentVariableDetector, 
  EnvironmentVariableValidator 
} from '@/lib/deployment';

// 1. Detect required variables
const detector = new EnvironmentVariableDetector();
const envVars = detector.detect(scaffoldConfig);

// 2. Collect values from user (using EnvironmentVariableInput component)
// ... user fills in values ...

// 3. Validate all variables
const validator = new EnvironmentVariableValidator();
const errors = validator.getErrors(envVars);

if (Object.keys(errors).length > 0) {
  // Show errors to user
  console.error('Validation errors:', errors);
  return;
}

// 4. Proceed with deployment
const deploymentConfig = {
  projectName: 'my-app',
  platform: 'vercel',
  scaffoldConfig,
  environmentVariables: envVars,
};

// Deploy...
```

## Testing

The module includes comprehensive tests in `__test-environment.ts`:

```bash
# Run tests
npm test src/lib/deployment/__test-environment.ts
```

## Type Definitions

### EnvironmentVariable

```typescript
interface EnvironmentVariable {
  key: string;                    // Variable name (e.g., "DATABASE_URL")
  value: string;                  // Current value
  description: string;            // Human-readable description
  required: boolean;              // Whether this variable is required
  sensitive: boolean;             // Whether to mask the value in UI
  example?: string;               // Example value for guidance
  validation?: {
    pattern?: string;             // Regex pattern for validation
    minLength?: number;           // Minimum length requirement
    maxLength?: number;           // Maximum length requirement
  };
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;               // Whether validation passed
  error?: string;                 // Error message if validation failed
}
```

## Best Practices

1. **Always validate before deployment**: Use the validator to check all variables before initiating deployment
2. **Provide helpful examples**: The detector includes example values for each variable type
3. **Handle optional variables**: Not all variables are required - check the `required` flag
4. **Secure sensitive values**: Use the `sensitive` flag to determine which values should be masked in the UI
5. **Show validation errors inline**: Display validation errors next to the input fields for better UX

## Integration with Deployment Pipeline

This module is designed to integrate with the deployment pipeline:

1. **Configuration Phase**: Detect required variables based on scaffold config
2. **Collection Phase**: Use EnvironmentVariableInput component to collect values
3. **Validation Phase**: Validate all values before deployment
4. **Deployment Phase**: Pass validated variables to platform service

## Deployment Workflow

The complete deployment workflow managed by the orchestrator:

1. **Initialization**: Create deployment record and initialize progress tracking
2. **Project Creation**: Create project on the hosting platform via API
3. **Scaffold Generation**: Generate all project files based on configuration
4. **File Upload**: Upload files to platform (with retry logic)
5. **Environment Configuration**: Set environment variables on platform
6. **Build Trigger**: Initiate the build process
7. **Monitoring**: Poll deployment status every 5 seconds
8. **Log Streaming**: Stream build logs in real-time
9. **Completion**: Mark deployment as success or failed

### Timeout Handling

- Default timeout: 5 minutes
- Configurable via `setDeploymentTimeout(ms)`
- Graceful timeout with helpful suggestions
- Deployment may continue on platform after timeout

### Error Recovery

The system implements multiple recovery strategies:

1. **Automatic Retry**: Upload failures retry up to 3 times with exponential backoff
2. **Alternative Platforms**: Suggest other platforms if one is unavailable
3. **Fallback Options**: Offer GitHub repo or ZIP download as alternatives
4. **User Guidance**: Provide specific suggestions based on error type

## Integration Example

Complete example of deploying a scaffold:

```typescript
import { 
  getDeploymentOrchestrator,
  getProgressTracker,
  EnvironmentVariableDetector,
  EnvironmentVariableValidator 
} from '@/lib/deployment';

// 1. Detect and validate environment variables
const detector = new EnvironmentVariableDetector();
const envVars = detector.detect(scaffoldConfig);

const validator = new EnvironmentVariableValidator();
const errors = validator.getErrors(envVars);

if (Object.keys(errors).length > 0) {
  throw new Error('Invalid environment variables');
}

// 2. Create deployment configuration
const config: DeploymentConfig = {
  projectName: 'my-awesome-app',
  platform: 'vercel',
  scaffoldConfig,
  environmentVariables: envVars,
  services: [],
};

// 3. Subscribe to progress updates
const tracker = getProgressTracker();
const unsubscribe = tracker.subscribe(deploymentId, (update) => {
  console.log(`[${update.status}] ${update.message}`);
  
  if (update.buildLogs && update.buildLogs.length > 0) {
    console.log('Latest logs:', update.buildLogs.slice(-5));
  }
  
  if (update.status === 'success') {
    console.log('Deployed to:', update.deploymentUrl);
  }
  
  if (update.status === 'failed') {
    console.error('Deployment failed:', update.error);
  }
});

// 4. Start deployment
const orchestrator = getDeploymentOrchestrator();
const deployment = await orchestrator.deploy(config, userId);

// 5. Handle result
if (deployment.status === 'success') {
  console.log('Deployment successful!');
  console.log('URL:', deployment.deploymentUrl);
} else {
  console.error('Deployment failed:', deployment.error);
  
  // Get recovery suggestions
  const errorHandler = getDeploymentErrorHandler();
  const recovery = await errorHandler.handleError(deployment.error!, deployment);
  console.log('Recovery:', recovery);
}

// 6. Cleanup
unsubscribe();
```

## API Integration

The orchestrator integrates with platform services via the `PlatformService` interface:

```typescript
interface PlatformService {
  createProject(config: DeploymentConfig): Promise<PlatformProject>;
  uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void>;
  setEnvironmentVariables(projectId: string, vars: EnvironmentVariable[]): Promise<void>;
  triggerDeployment(projectId: string): Promise<DeploymentStatus>;
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
  streamBuildLogs(deploymentId: string): AsyncIterableIterator<string>;
}
```

Supported platforms:
- **Vercel**: Full support with framework detection
- **Railway**: Full support with GraphQL API
- **Render**: Full support with REST API

## Testing

Run tests for the deployment orchestration system:

```bash
# Test environment variable detection and validation
npm test src/lib/deployment/__test-environment.ts

# Test the complete deployment flow (requires platform credentials)
npm test src/lib/deployment/__test-deployment.ts
```

## Future Enhancements

- [ ] Support for environment variable templates
- [ ] Auto-generation of secure secrets
- [ ] Integration with secret management services (AWS Secrets Manager, etc.)
- [ ] Variable dependency detection (e.g., if using OAuth, require callback URLs)
- [ ] Platform-specific variable recommendations
- [ ] Monorepo multi-service deployment
- [ ] Deployment rollback support
- [ ] Deployment analytics and metrics
- [ ] Custom build script support
- [ ] Preview deployment support
