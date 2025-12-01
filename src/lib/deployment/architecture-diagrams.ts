/**
 * Architecture Diagrams for Deployment Guides
 * 
 * Provides Mermaid diagram definitions for visualizing deployment workflows
 * and service architectures. These diagrams help users understand complex
 * deployment processes and system architectures.
 */

import type { Platform } from '@/types/deployment-guides';

/**
 * Deployment workflow diagram showing the complete deployment process
 */
export function getDeploymentWorkflowDiagram(platform: Platform, hasDatabase: boolean, hasAuth: boolean): string {
  const databaseStep = hasDatabase ? `
    Dev-->>Platform: Configure DATABASE_URL
    Platform-->>Database: Connect to database
    Database-->>Platform: Connection established` : '';

  const authStep = hasAuth ? `
    Dev-->>AuthProvider: Configure OAuth callbacks
    AuthProvider-->>Platform: Verify callback URLs` : '';

  return `\`\`\`mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant Platform as ${platform.name}
    ${hasDatabase ? 'participant Database as Database Service' : ''}
    ${hasAuth ? 'participant AuthProvider as Auth Provider' : ''}
    participant App as Deployed App

    Dev->>Git: Push code to repository
    Git->>Platform: Trigger deployment webhook
    Platform->>Platform: Clone repository
    Platform->>Platform: Install dependencies
    Platform->>Platform: Build application
    ${databaseStep}
    ${authStep}
    Platform->>Platform: Start application
    Platform->>App: Deploy to production URL
    App-->>Dev: Deployment complete
    Dev->>App: Test deployed application
\`\`\``;
}

/**
 * Monorepo architecture diagram showing multiple services
 */
export function getMonorepoArchitectureDiagram(services: string[]): string {
  const serviceNodes = services.map((service) => {
    const serviceId = service.toLowerCase().replace(/\s+/g, '');
    return `    ${serviceId}[${service}]`;
  }).join('\n');

  const serviceConnections = services.length > 1 ? services.slice(0, -1).map((service, index) => {
    const currentId = service.toLowerCase().replace(/\s+/g, '');
    const nextId = services[index + 1]?.toLowerCase().replace(/\s+/g, '') || '';
    return `    ${currentId} -->|API Calls| ${nextId}`;
  }).join('\n') : '';

  return `\`\`\`mermaid
graph TB
    subgraph Monorepo
${serviceNodes}
    end
    
    subgraph Deployment
        vercel[Vercel/Railway/Render]
    end
    
    subgraph External Services
        db[(Database)]
        auth[Auth Provider]
    end
    
${serviceConnections}
    ${services[0]?.toLowerCase().replace(/\s+/g, '')} --> vercel
    ${services.length > 1 ? (services[services.length - 1]?.toLowerCase().replace(/\s+/g, '') || '') + ' --> vercel' : ''}
    vercel --> db
    vercel --> auth
\`\`\``;
}

/**
 * Full-stack application architecture diagram
 */
export function getFullStackArchitectureDiagram(
  hasDatabase: boolean,
  hasAuth: boolean,
  hasAI: boolean,
  hasRedis: boolean
): string {
  const externalServices = [];
  if (hasDatabase) externalServices.push('db[(Database)]');
  if (hasAuth) externalServices.push('auth[Auth Provider]');
  if (hasAI) externalServices.push('ai[AI API]');
  if (hasRedis) externalServices.push('redis[(Redis Cache)]');

  const connections = [];
  if (hasDatabase) connections.push('    api --> db');
  if (hasAuth) connections.push('    api --> auth');
  if (hasAI) connections.push('    api --> ai');
  if (hasRedis) connections.push('    api --> redis');

  return `\`\`\`mermaid
graph LR
    subgraph Client
        browser[Web Browser]
    end
    
    subgraph Application
        frontend[Frontend]
        api[API/Backend]
    end
    
    subgraph External Services
${externalServices.map(s => '        ' + s).join('\n')}
    end
    
    browser --> frontend
    frontend --> api
${connections.join('\n')}
\`\`\``;
}

/**
 * Database setup workflow diagram
 */
export function getDatabaseSetupDiagram(platform: Platform, databaseType: string): string {
  const platformSupportsDB = platform.features.databaseSupport;

  if (platformSupportsDB) {
    return `\`\`\`mermaid
graph TB
    start[Start Database Setup]
    start --> provision[Provision ${databaseType} on ${platform.name}]
    provision --> geturl[Get Connection String]
    geturl --> setenv[Set DATABASE_URL Environment Variable]
    setenv --> migrate[Run Database Migrations]
    migrate --> verify[Verify Connection]
    verify --> complete[Database Setup Complete]
\`\`\``;
  } else {
    return `\`\`\`mermaid
graph TB
    start[Start Database Setup]
    start --> choose[Choose External Database Provider]
    choose --> create[Create ${databaseType} Database]
    create --> geturl[Copy Connection String]
    geturl --> setenv[Set DATABASE_URL on ${platform.name}]
    setenv --> migrate[Run Database Migrations]
    migrate --> verify[Verify Connection]
    verify --> complete[Database Setup Complete]
    
    choose -.-> supabase[Supabase]
    choose -.-> planetscale[PlanetScale]
    choose -.-> atlas[MongoDB Atlas]
\`\`\``;
  }
}

/**
 * Environment variables configuration workflow
 */
export function getEnvVarsConfigDiagram(platform: Platform, _varCount: number): string {
  return `\`\`\`mermaid
graph TB
    start[Start Environment Configuration]
    start --> identify[Identify Required Variables]
    identify --> gather[Gather API Keys & Secrets]
    gather --> method{Configuration Method}
    
    method -->|CLI| cli[Use ${platform.name} CLI]
    method -->|Dashboard| dashboard[Use ${platform.name} Dashboard]
    
    cli --> setcli[Run: ${platform.id} env add]
    dashboard --> navigate[Navigate to Settings]
    navigate --> setui[Add Variables in UI]
    
    setcli --> verify[Verify Variables Set]
    setui --> verify
    verify --> redeploy[Trigger Redeployment]
    redeploy --> complete[Configuration Complete]
\`\`\``;
}

/**
 * OAuth callback configuration diagram
 */
export function getOAuthCallbackDiagram(authProvider: string): string {
  return `\`\`\`mermaid
graph TB
    start[Start OAuth Configuration]
    start --> deploy[Deploy Application]
    deploy --> geturl[Get Production URL]
    geturl --> provider[Open ${authProvider} Dashboard]
    provider --> addcallback[Add Callback URL]
    addcallback --> format[Format: https://your-app.com/api/auth/callback]
    format --> save[Save Configuration]
    save --> test[Test OAuth Flow]
    test --> complete[OAuth Setup Complete]
\`\`\``;
}

/**
 * Troubleshooting decision tree diagram
 */
export function getTroubleshootingDiagram(): string {
  return `\`\`\`mermaid
graph TB
    issue[Deployment Issue]
    issue --> type{Issue Type?}
    
    type -->|Build Fails| build[Check Build Logs]
    type -->|App Won't Start| start[Check Runtime Logs]
    type -->|Database Error| db[Check DATABASE_URL]
    type -->|Auth Error| auth[Check OAuth Config]
    
    build --> buildfix{Common Causes}
    buildfix -->|Missing Deps| installdeps[Run npm install]
    buildfix -->|Wrong Node Version| nodeversion[Update Node Version]
    buildfix -->|Env Vars| checkenv[Verify Environment Variables]
    
    start --> startfix{Common Causes}
    startfix -->|Wrong Port| port[Use PORT env variable]
    startfix -->|Missing Env| envmissing[Add required env vars]
    startfix -->|Start Command| command[Check start command]
    
    db --> dbfix{Common Causes}
    dbfix -->|Wrong Format| format[Check connection string format]
    dbfix -->|SSL Required| ssl[Add ?sslmode=require]
    dbfix -->|Firewall| firewall[Allow platform IP addresses]
    
    auth --> authfix{Common Causes}
    authfix -->|Wrong Callback| callback[Update callback URL]
    authfix -->|Missing Keys| keys[Add auth provider keys]
    authfix -->|Wrong Domain| domain[Use production domain]
    
    installdeps --> retry[Retry Deployment]
    nodeversion --> retry
    checkenv --> retry
    port --> retry
    envmissing --> retry
    command --> retry
    format --> retry
    ssl --> retry
    firewall --> retry
    callback --> retry
    keys --> retry
    domain --> retry
    
    retry --> success[Deployment Successful]
\`\`\``;
}

/**
 * CI/CD pipeline diagram for GitHub Actions integration
 */
export function getCICDPipelineDiagram(platform: Platform): string {
  return `\`\`\`mermaid
graph LR
    subgraph Development
        dev[Developer]
        local[Local Development]
    end
    
    subgraph GitHub
        push[Git Push]
        actions[GitHub Actions]
        tests[Run Tests]
        build[Build Check]
    end
    
    subgraph ${platform.name}
        deploy[Auto Deploy]
        preview[Preview Environment]
        prod[Production]
    end
    
    dev --> local
    local --> push
    push --> actions
    actions --> tests
    tests --> build
    build -->|Success| deploy
    deploy -->|PR| preview
    deploy -->|Main Branch| prod
    build -->|Failure| dev
\`\`\``;
}

/**
 * Get appropriate diagram based on deployment context
 */
export function getDiagramForContext(
  context: {
    platform: Platform;
    hasDatabase?: boolean;
    hasAuth?: boolean;
    hasAI?: boolean;
    hasRedis?: boolean;
    isMonorepo?: boolean;
    services?: string[];
    authProvider?: string;
    databaseType?: string;
    envVarCount?: number;
  }
): { type: string; diagram: string; description: string }[] {
  const diagrams: { type: string; diagram: string; description: string }[] = [];

  // Main deployment workflow
  diagrams.push({
    type: 'deployment-workflow',
    diagram: getDeploymentWorkflowDiagram(
      context.platform,
      context.hasDatabase || false,
      context.hasAuth || false
    ),
    description: 'Complete deployment workflow from code push to production',
  });

  // Architecture diagram
  if (context.isMonorepo && context.services && context.services.length > 0) {
    diagrams.push({
      type: 'monorepo-architecture',
      diagram: getMonorepoArchitectureDiagram(context.services),
      description: 'Monorepo service architecture and deployment structure',
    });
  } else {
    diagrams.push({
      type: 'fullstack-architecture',
      diagram: getFullStackArchitectureDiagram(
        context.hasDatabase || false,
        context.hasAuth || false,
        context.hasAI || false,
        context.hasRedis || false
      ),
      description: 'Application architecture and external service connections',
    });
  }

  // Database setup diagram
  if (context.hasDatabase && context.databaseType) {
    diagrams.push({
      type: 'database-setup',
      diagram: getDatabaseSetupDiagram(context.platform, context.databaseType),
      description: 'Database provisioning and configuration workflow',
    });
  }

  // Environment variables diagram
  if (context.envVarCount && context.envVarCount > 0) {
    diagrams.push({
      type: 'env-vars-config',
      diagram: getEnvVarsConfigDiagram(context.platform, context.envVarCount),
      description: 'Environment variable configuration process',
    });
  }

  // OAuth callback diagram
  if (context.hasAuth && context.authProvider) {
    diagrams.push({
      type: 'oauth-callback',
      diagram: getOAuthCallbackDiagram(context.authProvider),
      description: 'OAuth callback URL configuration steps',
    });
  }

  // Troubleshooting diagram
  diagrams.push({
    type: 'troubleshooting',
    diagram: getTroubleshootingDiagram(),
    description: 'Common deployment issues and resolution paths',
  });

  // CI/CD pipeline diagram
  diagrams.push({
    type: 'cicd-pipeline',
    diagram: getCICDPipelineDiagram(context.platform),
    description: 'Continuous integration and deployment pipeline',
  });

  return diagrams;
}

/**
 * Export diagram as markdown for documentation
 */
export function exportDiagramAsMarkdown(
  type: string,
  diagram: string,
  description: string
): string {
  return `## ${type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

${description}

${diagram}
`;
}

