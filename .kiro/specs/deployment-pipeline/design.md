# Deployment Pipeline Technical Design

## Overview

The Deployment Pipeline feature extends StackForge to automatically deploy generated scaffolds to hosting platforms. Users can go from configuration → generation → live deployed application in one seamless flow. The system integrates with Vercel, Railway, and Render via their APIs, handling project creation, file uploads, environment variable configuration, and deployment triggering.

## Architecture

```mermaid
graph TB
    A[User Interface] --> B[Deployment Manager]
    B --> C[Platform Authenticator]
    B --> D[Deployment Orchestrator]
    D --> E[Vercel Service]
    D --> F[Railway Service]
    D --> G[Render Service]
    D --> H[Environment Manager]
    D --> I[Progress Tracker]
    E --> J[Platform APIs]
    F --> J
    G --> J
    I --> K[Real-time Updates]
    K --> A
```

### Architecture Layers

1. **Presentation Layer**: Deployment UI components and progress displays
2. **Authentication Layer**: OAuth flows for platform connections
3. **Orchestration Layer**: Deployment workflow management
4. **Platform Integration Layer**: Platform-specific API clients
5. **Monitoring Layer**: Progress tracking and log streaming

## Technology Stack

### New Dependencies

```json
{
  "@vercel/client": "^13.0.0",
  "railway-api-client": "^1.0.0",
  "render-api": "^1.0.0",
  "eventsource": "^2.0.2",
  "zod": "^3.22.0"
}
```

## Data Models

### Platform Connection

```typescript
interface PlatformConnection {
  id: string;
  userId: string;
  platform: 'vercel' | 'railway' | 'render';
  accountId: string;
  accountName: string;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  expiresAt: Date;
  scopes: string[];
  createdAt: Date;
  lastUsedAt: Date;
}
```

### Deployment Configuration

```typescript
interface DeploymentConfig {
  projectName: string;
  platform: 'vercel' | 'railway' | 'render';
  scaffoldConfig: ScaffoldConfig;
  environmentVariables: EnvironmentVariable[];
  services: DeploymentService[]; // For monorepos
  teamId?: string; // For team deployments
}
```

### Deployment Service

```typescript
interface DeploymentService {
  name: string; // e.g., "web", "api"
  type: 'frontend' | 'backend' | 'fullstack';
  buildCommand: string;
  startCommand: string;
  outputDirectory?: string;
  environmentVariables: EnvironmentVariable[];
  dependencies: string[]; // Other services this depends on
}
```

### Environment Variable

```typescript
interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  sensitive: boolean;
  example?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}
```

### Deployment

```typescript
interface Deployment {
  id: string;
  userId: string;
  projectName: string;
  platform: 'vercel' | 'railway' | 'render';
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  deploymentUrl?: string;
  previewUrl?: string;
  services: DeployedService[];
  config: DeploymentConfig;
  buildLogs: string[];
  error?: DeploymentError;
  createdAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
}
```

### Deployed Service

```typescript
interface DeployedService {
  name: string;
  url: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  platformProjectId: string;
  buildLogs: string[];
}
```

### Deployment Error

```typescript
interface DeploymentError {
  code: string;
  message: string;
  step: 'auth' | 'create' | 'upload' | 'configure' | 'build' | 'deploy';
  platformError?: any;
  recoverable: boolean;
  suggestions: string[];
}
```

## Platform Integration Architecture

### Base Platform Service Interface

```typescript
interface PlatformService {
  // Authentication
  initiateOAuth(): Promise<string>; // Returns auth URL
  handleCallback(code: string): Promise<PlatformConnection>;
  refreshToken(connection: PlatformConnection): Promise<PlatformConnection>;
  
  // Project Management
  createProject(config: DeploymentConfig): Promise<PlatformProject>;
  checkProjectNameAvailability(name: string): Promise<boolean>;
  
  // Deployment
  uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void>;
  setEnvironmentVariables(projectId: string, vars: EnvironmentVariable[]): Promise<void>;
  triggerDeployment(projectId: string): Promise<DeploymentStatus>;
  
  // Monitoring
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
  streamBuildLogs(deploymentId: string): AsyncIterableIterator<string>;
  
  // Database (if supported)
  provisionDatabase?(type: 'postgres' | 'mysql' | 'mongodb'): Promise<DatabaseInfo>;
}
```

### Platform Project

```typescript
interface PlatformProject {
  id: string;
  name: string;
  url: string;
  platform: 'vercel' | 'railway' | 'render';
  createdAt: Date;
}
```

### Deployment Status

```typescript
interface DeploymentStatus {
  state: 'queued' | 'building' | 'deploying' | 'ready' | 'error' | 'canceled';
  url?: string;
  readyAt?: Date;
  error?: string;
  buildLogs?: string[];
}
```

### Database Info

```typescript
interface DatabaseInfo {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}
```

## Component Structure

### Pages

```
app/
├── deployments/
│   ├── page.tsx                    # Deployment history list
│   └── [id]/
│       └── page.tsx                # Deployment details
└── api/
    ├── deploy/
    │   ├── initiate/
    │   │   └── route.ts            # POST: Start deployment
    │   ├── status/
    │   │   └── [id]/route.ts       # GET: Check deployment status
    │   └── logs/
    │       └── [id]/route.ts       # GET: Stream build logs (SSE)
    └── platforms/
        ├── vercel/
        │   ├── auth/
        │   │   ├── initiate/route.ts
        │   │   └── callback/route.ts
        │   └── projects/
        │       └── check-name/route.ts
        ├── railway/
        │   └── auth/
        │       ├── initiate/route.ts
        │       └── callback/route.ts
        └── render/
            └── auth/
                ├── initiate/route.ts
                └── callback/route.ts
```

### Key Components

```
components/
├── deployment/
│   ├── PlatformConnector.tsx       # Connect platform accounts
│   ├── DeploymentConfigForm.tsx    # Configure deployment settings
│   ├── EnvironmentVariableInput.tsx # Input for env vars with validation
│   ├── DeploymentProgress.tsx      # Real-time deployment progress
│   ├── BuildLogViewer.tsx          # Expandable build log display
│   ├── PostDeploymentChecklist.tsx # Setup steps after deployment
│   ├── DeploymentSuccessCard.tsx   # Success state with URLs
│   └── DeploymentHistory.tsx       # List of past deployments
```

## Deployment Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant DeployAPI
    participant PlatformService
    participant Platform
    participant ProgressTracker
    
    User->>UI: Click "Deploy Now"
    UI->>DeployAPI: Check platform connection
    alt Not connected
        DeployAPI->>Platform: Initiate OAuth
        Platform->>User: Request permissions
        User->>Platform: Approve
        Platform->>DeployAPI: Return token
    end
    
    UI->>User: Show deployment config form
    User->>UI: Enter project name & env vars
    UI->>DeployAPI: POST /api/deploy/initiate
    DeployAPI->>PlatformService: Create project
    PlatformService->>Platform: Create project API call
    Platform-->>PlatformService: Project created
    
    DeployAPI->>ProgressTracker: Update: "Uploading files"
    ProgressTracker-->>UI: SSE update
    DeployAPI->>PlatformService: Upload scaffold files
    PlatformService->>Platform: Upload files
    
    DeployAPI->>ProgressTracker: Update: "Configuring"
    DeployAPI->>PlatformService: Set environment variables
    PlatformService->>Platform: Configure env vars
    
    DeployAPI->>ProgressTracker: Update: "Building"
    DeployAPI->>PlatformService: Trigger deployment
    PlatformService->>Platform: Start build
    
    loop Poll for status
        DeployAPI->>Platform: Get deployment status
        Platform-->>DeployAPI: Status + logs
        DeployAPI->>ProgressTracker: Update progress
        ProgressTracker-->>UI: SSE update with logs
    end
    
    Platform-->>DeployAPI: Deployment complete
    DeployAPI->>ProgressTracker: Update: "Success"
    ProgressTracker-->>UI: Final update with URL
    UI->>User: Show success + post-deployment checklist
```

## Platform-Specific Implementations

### Vercel Service

```typescript
class VercelService implements PlatformService {
  private client: VercelClient;
  
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    // Use Vercel API to create project
    const response = await this.client.createProject({
      name: config.projectName,
      framework: this.detectFramework(config.scaffoldConfig),
      buildCommand: this.getBuildCommand(config.scaffoldConfig),
      outputDirectory: this.getOutputDirectory(config.scaffoldConfig),
      installCommand: 'npm install',
      devCommand: 'npm run dev',
    });
    
    return {
      id: response.id,
      name: response.name,
      url: `https://${response.name}.vercel.app`,
      platform: 'vercel',
      createdAt: new Date(response.createdAt),
    };
  }
  
  async uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    // Vercel uses git-based deployment, so we create a deployment directly
    const deployment = await this.client.createDeployment({
      name: projectId,
      files: files.map(f => ({
        file: f.path,
        data: f.content,
      })),
      target: 'production',
    });
  }
  
  async setEnvironmentVariables(
    projectId: string, 
    vars: EnvironmentVariable[]
  ): Promise<void> {
    for (const envVar of vars) {
      await this.client.createEnvironmentVariable(projectId, {
        key: envVar.key,
        value: envVar.value,
        type: envVar.sensitive ? 'encrypted' : 'plain',
        target: ['production', 'preview', 'development'],
      });
    }
  }
  
  async *streamBuildLogs(deploymentId: string): AsyncIterableIterator<string> {
    const events = await this.client.getDeploymentEvents(deploymentId);
    for await (const event of events) {
      if (event.type === 'stdout' || event.type === 'stderr') {
        yield event.payload.text;
      }
    }
  }
  
  private detectFramework(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return 'nextjs';
    if (config.frontendFramework === 'react') return 'vite';
    if (config.frontendFramework === 'vue') return 'vue';
    if (config.frontendFramework === 'svelte') return 'svelte';
    return 'nextjs';
  }
  
  private getBuildCommand(config: ScaffoldConfig): string {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'turbo build --filter=web';
    }
    return 'npm run build';
  }
  
  private getOutputDirectory(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return '.next';
    if (config.buildTool === 'vite') return 'dist';
    return 'build';
  }
}
```

### Railway Service

```typescript
class RailwayService implements PlatformService {
  private apiKey: string;
  private baseUrl = 'https://backboard.railway.app/graphql/v2';
  
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    const mutation = `
      mutation CreateProject($name: String!) {
        projectCreate(input: { name: $name }) {
          id
          name
        }
      }
    `;
    
    const response = await this.graphqlRequest(mutation, {
      name: config.projectName,
    });
    
    const project = response.data.projectCreate;
    
    // Create service for the project
    await this.createService(project.id, config);
    
    return {
      id: project.id,
      name: project.name,
      url: `https://${project.name}.up.railway.app`,
      platform: 'railway',
      createdAt: new Date(),
    };
  }
  
  private async createService(
    projectId: string, 
    config: DeploymentConfig
  ): Promise<void> {
    const mutation = `
      mutation CreateService($projectId: String!, $name: String!) {
        serviceCreate(input: { projectId: $projectId, name: $name }) {
          id
        }
      }
    `;
    
    await this.graphqlRequest(mutation, {
      projectId,
      name: config.services[0]?.name || 'web',
    });
  }
  
  async uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    // Railway uses source-based deployment
    // We need to create a deployment from the files
    const mutation = `
      mutation CreateDeployment($serviceId: String!, $files: [FileInput!]!) {
        deploymentCreate(input: { serviceId: $serviceId, files: $files }) {
          id
        }
      }
    `;
    
    // Convert files to Railway format
    const railwayFiles = files.map(f => ({
      path: f.path,
      content: Buffer.from(f.content).toString('base64'),
    }));
    
    await this.graphqlRequest(mutation, {
      serviceId: projectId,
      files: railwayFiles,
    });
  }
  
  async provisionDatabase(type: 'postgres' | 'mysql' | 'mongodb'): Promise<DatabaseInfo> {
    const mutation = `
      mutation CreateDatabase($projectId: String!, $type: String!) {
        databaseCreate(input: { projectId: $projectId, type: $type }) {
          id
          connectionString
        }
      }
    `;
    
    const response = await this.graphqlRequest(mutation, { type });
    const db = response.data.databaseCreate;
    
    // Parse connection string
    const url = new URL(db.connectionString);
    
    return {
      connectionString: db.connectionString,
      host: url.hostname,
      port: parseInt(url.port),
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password,
    };
  }
  
  private async graphqlRequest(query: string, variables: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    
    return response.json();
  }
}
```

### Render Service

```typescript
class RenderService implements PlatformService {
  private apiKey: string;
  private baseUrl = 'https://api.render.com/v1';
  
  async createProject(config: DeploymentConfig): Promise<PlatformProject> {
    // Render doesn't have "projects", only services
    // Create a web service directly
    const service = await this.createWebService(config);
    
    return {
      id: service.id,
      name: service.name,
      url: service.serviceDetails.url,
      platform: 'render',
      createdAt: new Date(service.createdAt),
    };
  }
  
  private async createWebService(config: DeploymentConfig): Promise<any> {
    const response = await fetch(`${this.baseUrl}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web_service',
        name: config.projectName,
        ownerId: await this.getOwnerId(),
        repo: 'https://github.com/stackforge/temp', // Placeholder
        autoDeploy: 'yes',
        branch: 'main',
        buildCommand: this.getBuildCommand(config.scaffoldConfig),
        startCommand: this.getStartCommand(config.scaffoldConfig),
        envVars: config.environmentVariables.map(v => ({
          key: v.key,
          value: v.value,
        })),
        serviceDetails: {
          publishPath: this.getPublishPath(config.scaffoldConfig),
          healthCheckPath: '/api/health',
        },
      }),
    });
    
    return response.json();
  }
  
  async uploadFiles(projectId: string, files: GeneratedFile[]): Promise<void> {
    // Render requires git-based deployment
    // We'll need to create a temporary git repo or use their deploy hook
    // For now, we'll use their manual deploy API
    const response = await fetch(`${this.baseUrl}/services/${projectId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clearCache: 'do_not_clear',
      }),
    });
    
    return response.json();
  }
  
  async provisionDatabase(type: 'postgres' | 'mysql'): Promise<DatabaseInfo> {
    const response = await fetch(`${this.baseUrl}/postgres`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${this.projectName}-db`,
        ownerId: await this.getOwnerId(),
        databaseName: 'myapp',
        databaseUser: 'myapp_user',
        plan: 'starter',
      }),
    });
    
    const db = await response.json();
    
    return {
      connectionString: db.connectionInfo.externalConnectionString,
      host: db.connectionInfo.host,
      port: db.connectionInfo.port,
      database: db.databaseName,
      username: db.databaseUser,
      password: db.connectionInfo.password,
    };
  }
  
  private getBuildCommand(config: ScaffoldConfig): string {
    if (config.projectStructure === 'fullstack-monorepo') {
      return 'npm install && npm run build --filter=web';
    }
    return 'npm install && npm run build';
  }
  
  private getStartCommand(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return 'npm start';
    if (config.backendFramework === 'express') return 'node dist/server.js';
    return 'npm start';
  }
  
  private getPublishPath(config: ScaffoldConfig): string {
    if (config.frontendFramework === 'nextjs') return '.next';
    if (config.buildTool === 'vite') return 'dist';
    return 'build';
  }
  
  private async getOwnerId(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/owners`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    const owners = await response.json();
    return owners[0].owner.id;
  }
}
```

## Environment Variable Detection

```typescript
class EnvironmentVariableDetector {
  detect(config: ScaffoldConfig): EnvironmentVariable[] {
    const vars: EnvironmentVariable[] = [];
    
    // Database variables
    if (config.database !== 'none') {
      vars.push({
        key: 'DATABASE_URL',
        value: '',
        description: 'PostgreSQL connection string',
        required: true,
        sensitive: true,
        example: 'postgresql://user:password@host:5432/dbname',
        validation: {
          pattern: '^postgresql://.+',
        },
      });
    }
    
    // Authentication variables
    if (config.auth === 'nextauth') {
      vars.push(
        {
          key: 'NEXTAUTH_SECRET',
          value: '',
          description: 'Secret for NextAuth.js session encryption',
          required: true,
          sensitive: true,
          example: 'generated-secret-key',
          validation: {
            minLength: 32,
          },
        },
        {
          key: 'NEXTAUTH_URL',
          value: '',
          description: 'Canonical URL of your site',
          required: true,
          sensitive: false,
          example: 'https://your-app.vercel.app',
        }
      );
    }
    
    if (config.auth === 'clerk') {
      vars.push(
        {
          key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          value: '',
          description: 'Clerk publishable key',
          required: true,
          sensitive: false,
        },
        {
          key: 'CLERK_SECRET_KEY',
          value: '',
          description: 'Clerk secret key',
          required: true,
          sensitive: true,
        }
      );
    }
    
    // AI template variables
    if (config.aiTemplate && config.aiTemplate !== 'none') {
      vars.push({
        key: 'ANTHROPIC_API_KEY',
        value: '',
        description: 'Anthropic API key for AI features',
        required: true,
        sensitive: true,
        example: 'sk-ant-...',
        validation: {
          pattern: '^sk-ant-',
        },
      });
    }
    
    // Redis variables
    if (config.extras.redis) {
      vars.push({
        key: 'REDIS_URL',
        value: '',
        description: 'Redis connection URL',
        required: false,
        sensitive: true,
        example: 'redis://localhost:6379',
      });
    }
    
    return vars;
  }
}
```

## Deployment Orchestrator

```typescript
class DeploymentOrchestrator {
  private platformServices: Map<string, PlatformService>;
  private progressTracker: ProgressTracker;
  
  async deploy(config: DeploymentConfig): Promise<Deployment> {
    const deployment: Deployment = {
      id: generateId(),
      userId: getCurrentUserId(),
      projectName: config.projectName,
      platform: config.platform,
      status: 'pending',
      services: [],
      config,
      buildLogs: [],
      createdAt: new Date(),
    };
    
    try {
      // Step 1: Create project on platform
      this.progressTracker.update(deployment.id, 'Creating project...');
      const platformService = this.platformServices.get(config.platform);
      const project = await platformService.createProject(config);
      
      // Step 2: Generate scaffold files
      this.progressTracker.update(deployment.id, 'Generating scaffold...');
      const files = await generateScaffold(config.scaffoldConfig);
      
      // Step 3: Upload files
      this.progressTracker.update(deployment.id, 'Uploading files...');
      await platformService.uploadFiles(project.id, files);
      
      // Step 4: Configure environment variables
      this.progressTracker.update(deployment.id, 'Configuring environment...');
      await platformService.setEnvironmentVariables(
        project.id,
        config.environmentVariables
      );
      
      // Step 5: Trigger deployment
      this.progressTracker.update(deployment.id, 'Starting build...');
      const deploymentStatus = await platformService.triggerDeployment(project.id);
      
      // Step 6: Monitor deployment
      deployment.status = 'building';
      await this.monitorDeployment(deployment, platformService, deploymentStatus.id);
      
      return deployment;
    } catch (error) {
      deployment.status = 'failed';
      deployment.error = this.handleError(error);
      return deployment;
    }
  }
  
  private async monitorDeployment(
    deployment: Deployment,
    service: PlatformService,
    deploymentId: string
  ): Promise<void> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const status = await service.getDeploymentStatus(deploymentId);
      
      // Stream logs
      for await (const log of service.streamBuildLogs(deploymentId)) {
        deployment.buildLogs.push(log);
        this.progressTracker.updateLogs(deployment.id, log);
      }
      
      if (status.state === 'ready') {
        deployment.status = 'success';
        deployment.deploymentUrl = status.url;
        deployment.completedAt = new Date();
        deployment.duration = deployment.completedAt.getTime() - deployment.createdAt.getTime();
        this.progressTracker.complete(deployment.id, status.url);
        return;
      }
      
      if (status.state === 'error' || status.state === 'canceled') {
        deployment.status = 'failed';
        deployment.error = {
          code: 'BUILD_FAILED',
          message: status.error || 'Build failed',
          step: 'build',
          recoverable: true,
          suggestions: [
            'Check build logs for errors',
            'Verify environment variables are correct',
            'Try deploying again',
          ],
        };
        return;
      }
      
      // Update status
      if (status.state === 'building') {
        deployment.status = 'building';
        this.progressTracker.update(deployment.id, 'Building...');
      } else if (status.state === 'deploying') {
        deployment.status = 'deploying';
        this.progressTracker.update(deployment.id, 'Deploying...');
      }
      
      await sleep(5000);
      attempts++;
    }
    
    // Timeout
    deployment.status = 'failed';
    deployment.error = {
      code: 'TIMEOUT',
      message: 'Deployment timed out after 5 minutes',
      step: 'deploy',
      recoverable: true,
      suggestions: [
        'Check deployment status on platform dashboard',
        'The deployment may still complete',
      ],
    };
  }
  
  private handleError(error: any): DeploymentError {
    if (error.code === 'ECONNREFUSED') {
      return {
        code: 'PLATFORM_UNAVAILABLE',
        message: 'Unable to connect to platform API',
        step: 'create',
        recoverable: true,
        suggestions: [
          'Check platform status page',
          'Try again in a few minutes',
          'Use a different platform',
        ],
      };
    }
    
    if (error.status === 401) {
      return {
        code: 'AUTH_FAILED',
        message: 'Authentication failed',
        step: 'auth',
        recoverable: true,
        suggestions: [
          'Reconnect your platform account',
          'Check if your access token has expired',
        ],
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      step: 'deploy',
      recoverable: false,
      suggestions: ['Download ZIP and deploy manually'],
    };
  }
}
```

## Progress Tracking with Server-Sent Events

```typescript
// API Route: /api/deploy/status/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const deploymentId = params.id;
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Subscribe to progress updates
      const unsubscribe = progressTracker.subscribe(deploymentId, (update) => {
        const data = `data: ${JSON.stringify(update)}\n\n`;
        controller.enqueue(encoder.encode(data));
        
        // Close stream when deployment is complete
        if (update.status === 'success' || update.status === 'failed') {
          controller.close();
          unsubscribe();
        }
      });
      
      // Send initial status
      const deployment = await getDeployment(deploymentId);
      const data = `data: ${JSON.stringify(deployment)}\n\n`;
      controller.enqueue(encoder.encode(data));
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Post-Deployment Checklist Generator

```typescript
class PostDeploymentChecklistGenerator {
  generate(deployment: Deployment): ChecklistItem[] {
    const items: ChecklistItem[] = [];
    const config = deployment.config.scaffoldConfig;
    
    // OAuth callback URLs
    if (config.auth === 'nextauth') {
      items.push({
        id: 'oauth-callbacks',
        title: 'Update OAuth Callback URLs',
        description: `Add ${deployment.deploymentUrl}/api/auth/callback/[provider] to your OAuth apps`,
        required: true,
        links: [
          { text: 'GitHub OAuth Settings', url: 'https://github.com/settings/developers' },
          { text: 'Google OAuth Settings', url: 'https://console.cloud.google.com/apis/credentials' },
        ],
      });
    }
    
    // Database migrations
    if (config.database !== 'none') {
      items.push({
        id: 'run-migrations',
        title: 'Run Database Migrations',
        description: 'Initialize your database schema',
        required: true,
        command: this.getMigrationCommand(config),
      });
    }
    
    // AI API keys
    if (config.aiTemplate && config.aiTemplate !== 'none') {
      const hasApiKey = deployment.config.environmentVariables.some(
        v => v.key === 'ANTHROPIC_API_KEY' && v.value
      );
      
      if (!hasApiKey) {
        items.push({
          id: 'ai-api-key',
          title: 'Add AI API Key',
          description: 'AI features require an Anthropic API key',
          required: true,
          links: [
            { text: 'Get API Key', url: 'https://console.anthropic.com/settings/keys' },
          ],
        });
      }
    }
    
    // Custom domain
    items.push({
      id: 'custom-domain',
      title: 'Add Custom Domain (Optional)',
      description: 'Configure a custom domain for your application',
      required: false,
      links: [
        { text: 'Platform Documentation', url: this.getDomainDocsUrl(deployment.platform) },
      ],
    });
    
    // Test application
    items.push({
      id: 'test-app',
      title: 'Test Your Application',
      description: 'Visit your deployed app and verify everything works',
      required: true,
      action: {
        text: 'Open Application',
        url: deployment.deploymentUrl,
      },
    });
    
    return items;
  }
  
  private getMigrationCommand(config: ScaffoldConfig): string {
    if (config.database.includes('prisma')) {
      return 'npx prisma migrate deploy';
    }
    if (config.database.includes('drizzle')) {
      return 'npm run db:migrate';
    }
    return 'npm run migrate';
  }
  
  private getDomainDocsUrl(platform: string): string {
    const urls = {
      vercel: 'https://vercel.com/docs/concepts/projects/custom-domains',
      railway: 'https://docs.railway.app/deploy/custom-domains',
      render: 'https://render.com/docs/custom-domains',
    };
    return urls[platform] || '#';
  }
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  command?: string;
  links?: { text: string; url: string }[];
  action?: { text: string; url: string };
}
```

## Monorepo Deployment Strategy

```typescript
class MonorepoDeploymentStrategy {
  async deploy(config: DeploymentConfig): Promise<Deployment> {
    const services = this.detectServices(config.scaffoldConfig);
    const deployment: Deployment = {
      id: generateId(),
      userId: getCurrentUserId(),
      projectName: config.projectName,
      platform: config.platform,
      status: 'pending',
      services: [],
      config,
      buildLogs: [],
      createdAt: new Date(),
    };
    
    // Deploy services in dependency order
    const deploymentOrder = this.topologicalSort(services);
    
    for (const service of deploymentOrder) {
      const deployedService = await this.deployService(
        service,
        config,
        deployment.services
      );
      deployment.services.push(deployedService);
    }
    
    deployment.status = 'success';
    deployment.completedAt = new Date();
    return deployment;
  }
  
  private detectServices(config: ScaffoldConfig): DeploymentService[] {
    const services: DeploymentService[] = [];
    
    if (config.projectStructure === 'fullstack-monorepo') {
      // Backend service
      services.push({
        name: 'api',
        type: 'backend',
        buildCommand: 'npm run build --filter=api',
        startCommand: 'npm start --filter=api',
        environmentVariables: this.getBackendEnvVars(config),
        dependencies: [],
      });
      
      // Frontend service
      services.push({
        name: 'web',
        type: 'frontend',
        buildCommand: 'npm run build --filter=web',
        startCommand: 'npm start --filter=web',
        outputDirectory: 'apps/web/.next',
        environmentVariables: this.getFrontendEnvVars(config),
        dependencies: ['api'], // Frontend depends on backend
      });
    }
    
    return services;
  }
  
  private async deployService(
    service: DeploymentService,
    config: DeploymentConfig,
    deployedServices: DeployedService[]
  ): Promise<DeployedService> {
    const platformService = this.getPlatformService(config.platform);
    
    // Create project for this service
    const project = await platformService.createProject({
      ...config,
      projectName: `${config.projectName}-${service.name}`,
    });
    
    // Add dependency URLs as environment variables
    const envVars = [...service.environmentVariables];
    for (const dep of service.dependencies) {
      const depService = deployedServices.find(s => s.name === dep);
      if (depService) {
        envVars.push({
          key: `${dep.toUpperCase()}_URL`,
          value: depService.url,
          description: `URL of ${dep} service`,
          required: true,
          sensitive: false,
        });
      }
    }
    
    // Upload files (filtered for this service)
    const files = await this.getServiceFiles(service, config.scaffoldConfig);
    await platformService.uploadFiles(project.id, files);
    
    // Configure environment
    await platformService.setEnvironmentVariables(project.id, envVars);
    
    // Deploy
    const status = await platformService.triggerDeployment(project.id);
    
    // Wait for deployment
    await this.waitForDeployment(platformService, status.id);
    
    return {
      name: service.name,
      url: project.url,
      status: 'success',
      platformProjectId: project.id,
      buildLogs: [],
    };
  }
  
  private topologicalSort(services: DeploymentService[]): DeploymentService[] {
    // Sort services by dependencies (backend before frontend)
    const sorted: DeploymentService[] = [];
    const visited = new Set<string>();
    
    const visit = (service: DeploymentService) => {
      if (visited.has(service.name)) return;
      
      for (const dep of service.dependencies) {
        const depService = services.find(s => s.name === dep);
        if (depService) visit(depService);
      }
      
      visited.add(service.name);
      sorted.push(service);
    };
    
    for (const service of services) {
      visit(service);
    }
    
    return sorted;
  }
  
  private getBackendEnvVars(config: ScaffoldConfig): EnvironmentVariable[] {
    const detector = new EnvironmentVariableDetector();
    return detector.detect(config).filter(v => 
      !v.key.startsWith('NEXT_PUBLIC_')
    );
  }
  
  private getFrontendEnvVars(config: ScaffoldConfig): EnvironmentVariable[] {
    const detector = new EnvironmentVariableDetector();
    return detector.detect(config).filter(v => 
      v.key.startsWith('NEXT_PUBLIC_') || v.key === 'NEXTAUTH_URL'
    );
  }
  
  private async getServiceFiles(
    service: DeploymentService,
    config: ScaffoldConfig
  ): Promise<GeneratedFile[]> {
    const allFiles = await generateScaffold(config);
    
    // Filter files for this service
    const servicePrefix = `apps/${service.name}/`;
    const sharedPrefix = 'packages/';
    
    return allFiles.filter(f => 
      f.path.startsWith(servicePrefix) || 
      f.path.startsWith(sharedPrefix) ||
      f.path === 'package.json' ||
      f.path === 'turbo.json'
    );
  }
}
```

## Security Implementation

### Token Encryption

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class TokenEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    this.key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');
  }
  
  encrypt(token: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedToken: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Rate Limiting

```typescript
class DeploymentRateLimiter {
  private redis: Redis;
  private maxDeployments = 10;
  private windowMs = 60 * 60 * 1000; // 1 hour
  
  async checkLimit(userId: string): Promise<boolean> {
    const key = `deploy:ratelimit:${userId}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, this.windowMs / 1000);
    }
    
    return count <= this.maxDeployments;
  }
  
  async getRemainingDeployments(userId: string): Promise<number> {
    const key = `deploy:ratelimit:${userId}`;
    const count = await this.redis.get(key);
    return Math.max(0, this.maxDeployments - (parseInt(count || '0')));
  }
  
  async getResetTime(userId: string): Promise<Date> {
    const key = `deploy:ratelimit:${userId}`;
    const ttl = await this.redis.ttl(key);
    return new Date(Date.now() + ttl * 1000);
  }
}
```

## Error Handling

### Error Recovery Strategies

```typescript
class DeploymentErrorHandler {
  async handleError(
    error: DeploymentError,
    deployment: Deployment
  ): Promise<RecoveryAction> {
    switch (error.code) {
      case 'AUTH_FAILED':
        return {
          type: 'reconnect',
          message: 'Please reconnect your platform account',
          action: () => this.initiateReauth(deployment.platform),
        };
      
      case 'PROJECT_NAME_TAKEN':
        return {
          type: 'retry',
          message: 'Project name is taken. Try a different name.',
          suggestions: this.generateNameSuggestions(deployment.projectName),
        };
      
      case 'BUILD_FAILED':
        return {
          type: 'manual',
          message: 'Build failed. Review logs and try again.',
          fallback: 'github',
          fallbackMessage: 'Create GitHub repository for manual deployment',
        };
      
      case 'PLATFORM_UNAVAILABLE':
        return {
          type: 'alternative',
          message: 'Platform is currently unavailable',
          alternatives: this.getAlternativePlatforms(deployment.platform),
        };
      
      case 'TIMEOUT':
        return {
          type: 'check',
          message: 'Deployment may still be in progress',
          action: () => this.checkPlatformStatus(deployment),
        };
      
      default:
        return {
          type: 'fallback',
          message: 'Deployment failed',
          fallback: 'download',
          fallbackMessage: 'Download ZIP and deploy manually',
        };
    }
  }
  
  private generateNameSuggestions(name: string): string[] {
    return [
      `${name}-${Date.now()}`,
      `${name}-v2`,
      `${name}-app`,
    ];
  }
  
  private getAlternativePlatforms(current: string): string[] {
    const platforms = ['vercel', 'railway', 'render'];
    return platforms.filter(p => p !== current);
  }
}

interface RecoveryAction {
  type: 'reconnect' | 'retry' | 'manual' | 'alternative' | 'check' | 'fallback';
  message: string;
  action?: () => Promise<void>;
  suggestions?: string[];
  alternatives?: string[];
  fallback?: 'github' | 'download';
  fallbackMessage?: string;
}
```

## UI Components

### DeploymentConfigForm Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { EnvironmentVariableInput } from './EnvironmentVariableInput';

interface DeploymentConfigFormProps {
  scaffoldConfig: ScaffoldConfig;
  platform: 'vercel' | 'railway' | 'render';
  onSubmit: (config: DeploymentConfig) => void;
  onCancel: () => void;
}

export function DeploymentConfigForm({
  scaffoldConfig,
  platform,
  onSubmit,
  onCancel,
}: DeploymentConfigFormProps) {
  const [projectName, setProjectName] = useState('');
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [provisionDb, setProvisionDb] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Detect required environment variables
    const detector = new EnvironmentVariableDetector();
    const detected = detector.detect(scaffoldConfig);
    setEnvVars(detected);
  }, [scaffoldConfig]);
  
  const handleSubmit = () => {
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!projectName) {
      newErrors.projectName = 'Project name is required';
    }
    
    for (const envVar of envVars) {
      if (envVar.required && !envVar.value) {
        newErrors[envVar.key] = `${envVar.key} is required`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      projectName,
      platform,
      scaffoldConfig,
      environmentVariables: envVars,
      services: [],
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Deploy to {platform}</h2>
        <p className="text-gray-600">Configure your deployment settings</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="my-awesome-app"
        />
        {errors.projectName && (
          <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
        )}
      </div>
      
      {scaffoldConfig.database !== 'none' && platform === 'railway' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={provisionDb}
            onChange={(e) => setProvisionDb(e.target.checked)}
            id="provision-db"
          />
          <label htmlFor="provision-db" className="text-sm">
            Provision PostgreSQL database (automatically sets DATABASE_URL)
          </label>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
        <div className="space-y-4">
          {envVars.map((envVar) => (
            <EnvironmentVariableInput
              key={envVar.key}
              envVar={envVar}
              onChange={(value) => {
                setEnvVars(prev =>
                  prev.map(v => v.key === envVar.key ? { ...v, value } : v)
                );
              }}
              error={errors[envVar.key]}
            />
          ))}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Deploy Now
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### DeploymentProgress Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BuildLogViewer } from './BuildLogViewer';

interface DeploymentProgressProps {
  deploymentId: string;
  onComplete: (deployment: Deployment) => void;
  onError: (error: DeploymentError) => void;
}

export function DeploymentProgress({
  deploymentId,
  onComplete,
  onError,
}: DeploymentProgressProps) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource(`/api/deploy/status/${deploymentId}`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setDeployment(update);
      
      if (update.status === 'success') {
        onComplete(update);
        eventSource.close();
      } else if (update.status === 'failed') {
        onError(update.error);
        eventSource.close();
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      onError({
        code: 'CONNECTION_ERROR',
        message: 'Lost connection to deployment server',
        step: 'deploy',
        recoverable: true,
        suggestions: ['Refresh the page to check status'],
      });
    };
    
    return () => eventSource.close();
  }, [deploymentId]);
  
  if (!deployment) {
    return <div>Loading...</div>;
  }
  
  const steps = [
    { key: 'pending', label: 'Creating project' },
    { key: 'building', label: 'Building' },
    { key: 'deploying', label: 'Deploying' },
    { key: 'success', label: 'Complete' },
  ];
  
  const currentStepIndex = steps.findIndex(s => s.key === deployment.status);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Deploying {deployment.projectName}</h2>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div
                className={`w-full h-2 rounded ${
                  index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
              <span className="ml-2 text-sm whitespace-nowrap">
                {step.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Current Status */}
        <div className="flex items-center gap-2 text-lg">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>{steps[currentStepIndex]?.label}...</span>
        </div>
      </div>
      
      {/* Build Logs */}
      {deployment.buildLogs.length > 0 && (
        <div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-blue-600 hover:underline mb-2"
          >
            {showLogs ? 'Hide' : 'Show'} Build Logs
          </button>
          
          {showLogs && (
            <BuildLogViewer logs={deployment.buildLogs} />
          )}
        </div>
      )}
      
      {/* Duration */}
      {deployment.duration && (
        <p className="text-sm text-gray-600">
          Deployment time: {Math.round(deployment.duration / 1000)}s
        </p>
      )}
    </div>
  );
}
```

### PostDeploymentChecklist Component

```typescript
'use client';

import { useState } from 'react';

interface PostDeploymentChecklistProps {
  deployment: Deployment;
}

export function PostDeploymentChecklist({ deployment }: PostDeploymentChecklistProps) {
  const generator = new PostDeploymentChecklistGenerator();
  const items = generator.generate(deployment);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  
  const toggleItem = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const allRequiredComplete = items
    .filter(i => i.required)
    .every(i => completed.has(i.id));
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Post-Deployment Setup</h2>
        <p className="text-gray-600">
          Complete these steps to finalize your deployment
        </p>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-4 border rounded-lg ${
              completed.has(item.id) ? 'bg-green-50 border-green-200' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={completed.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.required && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                
                {item.command && (
                  <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                    {item.command}
                  </div>
                )}
                
                {item.links && (
                  <div className="mt-2 flex gap-2">
                    {item.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {link.text} →
                      </a>
                    ))}
                  </div>
                )}
                
                {item.action && (
                  <a
                    href={item.action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {item.action.text}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {allRequiredComplete && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
          <p className="font-semibold text-green-800">
            ✓ All required steps complete!
          </p>
          <a
            href={deployment.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Live Site
          </a>
        </div>
      )}
    </div>
  );
}
```

## Configuration

### Environment Variables

```bash
# Platform OAuth Credentials
VERCEL_CLIENT_ID=your_vercel_client_id
VERCEL_CLIENT_SECRET=your_vercel_client_secret
VERCEL_CALLBACK_URL=http://localhost:3000/api/platforms/vercel/auth/callback

RAILWAY_CLIENT_ID=your_railway_client_id
RAILWAY_CLIENT_SECRET=your_railway_client_secret
RAILWAY_CALLBACK_URL=http://localhost:3000/api/platforms/railway/auth/callback

RENDER_CLIENT_ID=your_render_client_id
RENDER_CLIENT_SECRET=your_render_client_secret
RENDER_CALLBACK_URL=http://localhost:3000/api/platforms/render/auth/callback

# Token Encryption
TOKEN_ENCRYPTION_KEY=your_32_byte_hex_key

# Rate Limiting
REDIS_URL=redis://localhost:6379

# Deployment Settings
MAX_DEPLOYMENTS_PER_HOUR=10
DEPLOYMENT_TIMEOUT_MS=300000  # 5 minutes
```

## Testing Strategy

### Unit Tests
- Environment variable detection logic
- Deployment orchestration flow
- Error handling and recovery
- Token encryption/decryption
- Rate limiting logic

### Integration Tests
- Platform OAuth flows (mocked)
- Project creation on each platform
- File upload mechanisms
- Environment variable configuration
- Deployment status polling

### End-to-End Tests
- Complete deployment flow for each platform
- Monorepo multi-service deployment
- Error scenarios and fallbacks
- Post-deployment checklist generation

## Performance Considerations

1. **Parallel Operations**: Upload files while configuring environment variables
2. **Streaming**: Stream build logs in real-time using SSE
3. **Caching**: Cache platform connection status for 5 minutes
4. **Timeouts**: 5-minute timeout for deployments with automatic fallback
5. **Rate Limiting**: Prevent abuse with per-user deployment limits

## Security Considerations

1. **Token Storage**: Encrypted HTTP-only cookies for platform tokens
2. **Environment Variables**: Never log or store user-provided secrets
3. **HTTPS Only**: All platform API calls over HTTPS
4. **Input Validation**: Validate all user inputs to prevent injection
5. **Token Revocation**: Immediate revocation on disconnect
6. **Rate Limiting**: Prevent abuse with deployment limits

## Future Enhancements

1. **More Platforms**: AWS Amplify, Netlify, Fly.io, DigitalOcean App Platform
2. **CI/CD Integration**: Automatic deployments on git push
3. **Rollback Support**: One-click rollback to previous deployment
4. **Deployment Analytics**: Track deployment success rates and performance
5. **Team Deployments**: Deploy to organization/team accounts
6. **Custom Build Scripts**: Allow users to customize build process
7. **Preview Deployments**: Automatic preview deployments for branches
8. **Deployment Scheduling**: Schedule deployments for specific times
