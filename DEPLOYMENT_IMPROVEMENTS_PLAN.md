# Deployment System Improvements Plan

## Overview

This document outlines recommended improvements to the deployment system based on the analysis of the current implementation.

## ✅ Completed

1. **Added Deployment Targets UI Section**
   - Location: `src/components/ConfigurationWizard.tsx`
   - Allows users to select: Vercel, Railway, Render, EC2
   - Multi-select checkboxes (at least one required)
   - Properly integrated with validation system

## 🎯 High Priority Improvements

### 1. Add Next.js Health Check Endpoint

**Why**: Docker health checks reference `/api/health` but the endpoint isn't generated for Next.js projects.

**Implementation**:

```typescript
// Add to src/lib/generator/templates/nextjs-templates.ts

export function generateHealthCheckRoute(): string {
  return `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
`;
}
```

**Integration**: Add to `scaffold-generator.ts`:

```typescript
// In generateConfigFiles() method
if (this.isNextJs()) {
  files.push({
    path: 'app/api/health/route.ts',
    content: generateHealthCheckRoute(),
  });
}
```

### 2. Add Render Configuration File

**Why**: Render is a supported deployment target but no `render.yaml` is generated.

**Implementation**:

```typescript
// Add to src/lib/generator/templates/config-templates.ts

/**
 * Generate Render configuration
 */
export function generateRenderConfig(config: ScaffoldConfigWithFramework): string {
  const isNextJs = config.framework === 'next' || config.framework === 'monorepo';
  const port = isNextJs ? '3000' : '4000';
  
  const services: any[] = [{
    type: 'web',
    name: config.projectName,
    env: 'node',
    buildCommand: config.framework === 'monorepo' 
      ? 'npm install && turbo run build' 
      : 'npm install && npm run build',
    startCommand: config.framework === 'monorepo'
      ? 'pnpm --filter=web start'
      : 'npm start',
    healthCheckPath: isNextJs ? '/api/health' : '/health',
    envVars: [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: port },
    ],
  }];

  // Add database service if needed
  if (config.database === 'prisma-postgres' || config.database === 'drizzle-postgres') {
    services.push({
      type: 'pserv',
      name: `${config.projectName}-db`,
      env: 'docker',
      plan: 'starter',
      ipAllowList: [],
    });
    
    services[0].envVars.push({
      key: 'DATABASE_URL',
      fromDatabase: {
        name: `${config.projectName}-db`,
        property: 'connectionString',
      },
    });
  }

  // Add Redis if configured
  if (config.extras.redis) {
    services.push({
      type: 'redis',
      name: `${config.projectName}-redis`,
      plan: 'starter',
      ipAllowList: [],
    });
    
    services[0].envVars.push({
      key: 'REDIS_URL',
      fromService: {
        name: `${config.projectName}-redis`,
        type: 'redis',
        property: 'connectionString',
      },
    });
  }

  return `# Render Blueprint
# https://render.com/docs/blueprint-spec

services:
${services.map(service => `  - type: ${service.type}
    name: ${service.name}
    env: ${service.env}
    ${service.buildCommand ? `buildCommand: ${service.buildCommand}` : ''}
    ${service.startCommand ? `startCommand: ${service.startCommand}` : ''}
    ${service.healthCheckPath ? `healthCheckPath: ${service.healthCheckPath}` : ''}
    ${service.plan ? `plan: ${service.plan}` : ''}
    ${service.envVars ? `envVars:\n${service.envVars.map((ev: any) => 
      ev.fromDatabase 
        ? `      - key: ${ev.key}\n        fromDatabase:\n          name: ${ev.fromDatabase.name}\n          property: ${ev.fromDatabase.property}`
        : ev.fromService
        ? `      - key: ${ev.key}\n        fromService:\n          name: ${ev.fromService.name}\n          type: ${ev.fromService.type}\n          property: ${ev.fromService.property}`
        : `      - key: ${ev.key}\n        value: ${ev.value}`
    ).join('\n')}` : ''}`).join('\n\n')}
`;
}
```

**Integration**: Add to `scaffold-generator.ts`:

```typescript
// In generateConfigFiles() method
if (this.config.deployment.includes('render')) {
  files.push({
    path: 'render.yaml',
    content: generateRenderConfig(this.config),
  });
}
```

### 3. Add Environment Variable Validation Script

**Why**: Helps catch missing environment variables before deployment.

**Implementation**:

```typescript
// Add to src/lib/generator/templates/config-templates.ts

/**
 * Generate environment variable validation script
 */
export function generateEnvValidationScript(config: ScaffoldConfigWithFramework): string {
  const requiredVars: string[] = [];
  
  // Add based on configuration
  if (config.database === 'prisma-postgres' || config.database === 'drizzle-postgres') {
    requiredVars.push('DATABASE_URL');
  }
  
  if (config.database === 'supabase') {
    requiredVars.push('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  if (config.auth === 'nextauth') {
    requiredVars.push('NEXTAUTH_SECRET', 'NEXTAUTH_URL');
  }
  
  if (config.auth === 'clerk') {
    requiredVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY');
  }
  
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    const apiKeyMap: Record<string, string> = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      'aws-bedrock': 'AWS_ACCESS_KEY_ID',
      gemini: 'GEMINI_API_KEY',
    };
    requiredVars.push(apiKeyMap[config.aiProvider || 'anthropic']);
  }
  
  if (config.extras.redis) {
    requiredVars.push('REDIS_URL');
  }

  return `#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Run this before deployment to ensure all required variables are set
 */

const requiredVars = ${JSON.stringify(requiredVars, null, 2)};

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => {
    console.error(\`   - \${varName}\`);
  });
  console.error('\\nPlease set these variables in your .env.local file or deployment platform.');
  console.error('See .env.example for reference.\\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set!');
process.exit(0);
`;
}
```

**Integration**: Add to `scaffold-generator.ts`:

```typescript
// In generateConfigFiles() method
files.push({
  path: 'scripts/validate-env.js',
  content: generateEnvValidationScript(this.config),
});
```

**Add to package.json scripts**:
```json
{
  "scripts": {
    "validate:env": "node scripts/validate-env.js",
    "prebuild": "npm run validate:env"
  }
}
```

## 🎨 Medium Priority Improvements

### 4. Add Deployment Status Badges

**Why**: Professional touch for GitHub repositories, shows deployment status at a glance.

**Implementation**: Modify `documentation-generator.ts`:

```typescript
private generateTechStackBadge(): string {
  const badges: string[] = [];
  
  // Framework badges
  badges.push(`![${this.config.frontendFramework}](https://img.shields.io/badge/${this.config.frontendFramework}-blue)`);
  
  // Deployment badges
  this.config.deployment.forEach(platform => {
    const badgeColor = {
      vercel: 'black',
      railway: 'purple',
      render: 'green',
      ec2: 'orange',
    }[platform] || 'blue';
    
    badges.push(`![${platform}](https://img.shields.io/badge/deploy-${platform}-${badgeColor})`);
  });
  
  return badges.join(' ');
}
```

### 5. Enhance GitHub Actions for Multiple Platforms

**Why**: Automate deployments to Railway and Render, not just Vercel.

**Implementation**: Modify `generateGithubActionsWorkflow()`:

```typescript
// Add Railway deployment
${config.deployment.includes('railway') ? `
  deploy-railway:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}
` : ''}

// Add Render deployment
${config.deployment.includes('render') ? `
  deploy-render:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: \${{ secrets.RENDER_SERVICE_ID }}
          api-key: \${{ secrets.RENDER_API_KEY }}
` : ''}
```

### 6. Add Pre-deployment Checklist Generator

**Why**: Helps users ensure they've completed all necessary steps before deploying.

**Implementation**: Add to `documentation-generator.ts`:

```typescript
private generatePreDeploymentChecklist(): string {
  const checks: string[] = [
    '- [ ] All environment variables documented in .env.example',
    '- [ ] .env.local is in .gitignore',
    '- [ ] Build succeeds locally (`npm run build`)',
    '- [ ] All tests pass (`npm test`)',
    '- [ ] Code is committed to Git',
  ];
  
  if (this.hasDatabase()) {
    checks.push('- [ ] Database is set up and accessible');
    checks.push('- [ ] Database migrations are up to date');
  }
  
  if (this.hasAuth()) {
    checks.push('- [ ] OAuth providers are configured');
    checks.push('- [ ] Callback URLs are updated for production');
  }
  
  if (this.hasAI()) {
    checks.push('- [ ] AI API keys are ready for production');
    checks.push('- [ ] AI usage limits are understood');
  }
  
  if (this.config.extras.docker) {
    checks.push('- [ ] Docker image builds successfully');
    checks.push('- [ ] No secrets in Docker image');
  }
  
  return checks.join('\n');
}
```

## 🔮 Low Priority / Future Enhancements

### 7. Add Deployment Cost Estimator

Generate a cost estimation guide based on selected services:

```markdown
## Estimated Monthly Costs

### Vercel
- Hobby: $0/month (limited)
- Pro: $20/month per user

### Railway
- Starter: $5/month
- Developer: $10/month

### Database (PostgreSQL)
- Railway: $5/month (1GB)
- Supabase: $25/month (8GB)
```

### 8. Add Deployment Rollback Scripts

For EC2 deployments, add rollback capability:

```bash
#!/bin/bash
# deploy/rollback.sh
pm2 stop ${projectName}
git reset --hard HEAD~1
npm install
npm run build
pm2 restart ${projectName}
```

### 9. Add Monitoring Setup

Generate monitoring configurations for:
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (APM)
- New Relic (performance monitoring)

### 10. Add Load Testing Scripts

Generate basic load testing with Artillery or k6:

```yaml
# load-test.yml
config:
  target: 'https://your-app.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: '/'
      - get:
          url: '/api/health'
```

## 📋 Implementation Priority

1. **Week 1**: High Priority (Items 1-3)
   - Health check endpoint
   - Render config file
   - Environment validation script

2. **Week 2**: Medium Priority (Items 4-6)
   - Deployment badges
   - Enhanced GitHub Actions
   - Pre-deployment checklist

3. **Future**: Low Priority (Items 7-10)
   - Cost estimator
   - Rollback scripts
   - Monitoring setup
   - Load testing

## 🧪 Testing Plan

For each improvement:

1. **Unit Tests**: Test file generation functions
2. **Integration Tests**: Test full scaffold generation with deployment options
3. **Manual Tests**: Deploy to each platform to verify configurations work
4. **Documentation**: Update guides with new features

## 📝 Notes

- All improvements maintain backward compatibility
- Security best practices are maintained throughout
- Documentation is updated alongside code changes
- Each improvement is independently deployable
