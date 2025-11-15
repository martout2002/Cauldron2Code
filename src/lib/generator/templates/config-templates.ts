import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Generate ESLint configuration
 */
export function generateEslintConfig(config: ScaffoldConfigWithFramework): string {
  const isNextJs = config.framework === 'next' || config.framework === 'monorepo';

  if (isNextJs) {
    return `import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
`;
  } else {
    return `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
`;
  }
}

/**
 * Generate TypeScript configuration for Express
 */
export function generateExpressTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        types: ['node'],
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
    null,
    2
  );
}

/**
 * Generate Vercel deployment configuration
 */
export function generateVercelConfig(config: ScaffoldConfigWithFramework): string {
  const vercelConfig: any = {
    buildCommand: config.framework === 'monorepo' ? 'turbo run build --filter=web' : 'npm run build',
    outputDirectory: config.framework === 'monorepo' ? 'apps/web/.next' : '.next',
    framework: 'nextjs',
    installCommand: 'npm install',
  };

  // Add environment variable placeholders based on configuration
  const envVars: Record<string, string> = {};

  // Database environment variables
  if (config.database === 'supabase') {
    envVars.NEXT_PUBLIC_SUPABASE_URL = '@supabase-url';
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = '@supabase-anon-key';
    envVars.SUPABASE_SERVICE_ROLE_KEY = '@supabase-service-role-key';
  } else if (config.database !== 'none') {
    envVars.DATABASE_URL = '@database-url';
  }

  // Authentication environment variables
  if (config.auth === 'nextauth') {
    envVars.NEXTAUTH_SECRET = '@nextauth-secret';
    envVars.NEXTAUTH_URL = '@nextauth-url';
    envVars.GITHUB_ID = '@github-id';
    envVars.GITHUB_SECRET = '@github-secret';
  } else if (config.auth === 'clerk') {
    envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '@clerk-publishable-key';
    envVars.CLERK_SECRET_KEY = '@clerk-secret-key';
  }

  // AI template environment variables
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    envVars.ANTHROPIC_API_KEY = '@anthropic-api-key';
  }

  // Redis environment variables
  if (config.extras.redis) {
    envVars.REDIS_URL = '@redis-url';
  }

  if (Object.keys(envVars).length > 0) {
    vercelConfig.env = envVars;
  }

  return JSON.stringify(vercelConfig, null, 2);
}

/**
 * Generate Dockerfile with security best practices
 */
export function generateDockerfile(config: ScaffoldConfigWithFramework): string {
  if (config.framework === 'monorepo') {
    return `# ============================================
# Multi-stage Dockerfile for Monorepo
# Security: Non-root user, minimal layers, no secrets
# ============================================

FROM node:20-alpine AS base
# Install dependencies only when needed
RUN npm install -g pnpm turbo && \\
    # Create app directory with proper permissions
    mkdir -p /app && \\
    chown -R node:node /app

FROM base AS builder
WORKDIR /app
# Copy only dependency files first for better caching
COPY --chown=node:node package.json pnpm-lock.yaml* ./
COPY --chown=node:node turbo.json ./
COPY --chown=node:node apps/web/package.json ./apps/web/
COPY --chown=node:node packages/ ./packages/

# Install dependencies as non-root user
USER node
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --chown=node:node . .

# Build the application
# Note: Environment variables should be passed at runtime, not build time
RUN turbo build --filter=web

FROM base AS runner
WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Create non-root user for running the app
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs && \\
    chown -R nextjs:nodejs /app

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["pnpm", "--filter=web", "start"]
`;
  } else if (config.framework === 'next') {
    return `# ============================================
# Multi-stage Dockerfile for Next.js
# Security: Non-root user, minimal layers, no secrets
# ============================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat && \\
    mkdir -p /app && \\
    chown -R node:node /app

FROM base AS deps
WORKDIR /app
USER node

# Copy dependency files
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --only=production && \\
    # Copy production dependencies aside
    cp -R node_modules prod_node_modules && \\
    # Install all dependencies for build
    npm ci

FROM base AS builder
WORKDIR /app
USER node

# Copy dependencies and source
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Build application
# Note: Build-time env vars should be prefixed with NEXT_PUBLIC_
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs && \\
    chown -R nextjs:nodejs /app

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/prod_node_modules ./node_modules

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
`;
  } else {
    return `# ============================================
# Multi-stage Dockerfile for Express
# Security: Non-root user, minimal layers, no secrets
# ============================================

FROM node:20-alpine AS base
RUN mkdir -p /app && \\
    chown -R node:node /app

FROM base AS deps
WORKDIR /app
USER node

COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --only=production && \\
    cp -R node_modules prod_node_modules && \\
    npm ci

FROM base AS builder
WORKDIR /app
USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Build TypeScript
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nodejs && \\
    chown -R nodejs:nodejs /app

# Copy only necessary files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/prod_node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nodejs

EXPOSE 4000
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
`;
  }
}

/**
 * Generate docker-compose.yml
 */
export function generateDockerCompose(config: ScaffoldConfigWithFramework): string {
  const hasDatabase = config.database !== 'none';
  const hasRedis = config.extras.redis;

  let compose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "${config.framework === 'express' ? '4000:4000' : '3000:3000'}"
    environment:
      - NODE_ENV=production
`;

  if (hasDatabase && config.database.includes('postgres')) {
    compose += `      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/${config.projectName}
    depends_on:
      - postgres
`;
  }

  if (hasRedis) {
    compose += `      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
`;
  }

  if (hasDatabase && config.database.includes('postgres')) {
    compose += `
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${config.projectName}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
`;
  }

  if (hasRedis) {
    compose += `
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
`;
  }

  if (hasDatabase || hasRedis) {
    compose += `
volumes:
`;
    if (hasDatabase && config.database.includes('postgres')) {
      compose += `  postgres_data:
`;
    }
    if (hasRedis) {
      compose += `  redis_data:
`;
    }
  }

  return compose;
}

/**
 * Generate Railway configuration
 */
export function generateRailwayConfig(config: ScaffoldConfigWithFramework): string {
  const railwayConfig = {
    $schema: 'https://railway.app/railway.schema.json',
    build: {
      builder: 'NIXPACKS',
      buildCommand: config.framework === 'monorepo' ? 'turbo run build' : 'npm run build',
    },
    deploy: {
      startCommand: config.framework === 'monorepo' ? 'pnpm --filter=web start' : 'npm start',
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 10,
    },
  };

  return JSON.stringify(railwayConfig, null, 2);
}

/**
 * Generate Render configuration (render.yaml)
 */
export function generateRenderConfig(config: ScaffoldConfigWithFramework): string {
  const isNextJs = config.framework === 'next' || config.framework === 'monorepo';
  const port = isNextJs ? '3000' : '4000';
  
  // Build the main web service
  let webService = `  - type: web
    name: ${config.projectName}
    runtime: node
    buildCommand: ${config.framework === 'monorepo' ? 'npm install && turbo run build' : 'npm install && npm run build'}
    startCommand: ${config.framework === 'monorepo' ? 'pnpm --filter=web start' : 'npm start'}
    healthCheckPath: ${isNextJs ? '/api/health' : '/health'}
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: ${port}`;

  // Add database environment variables if needed
  if (config.database === 'prisma-postgres' || config.database === 'drizzle-postgres') {
    webService += `
      - key: DATABASE_URL
        fromDatabase:
          name: ${config.projectName}-db
          property: connectionString`;
  }

  // Add Supabase environment variables
  if (config.database === 'supabase') {
    webService += `
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false`;
  }

  // Add MongoDB environment variables
  if (config.database === 'mongodb') {
    webService += `
      - key: DATABASE_URL
        sync: false`;
  }

  // Add authentication environment variables
  if (config.auth === 'nextauth') {
    webService += `
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        sync: false
      - key: GITHUB_ID
        sync: false
      - key: GITHUB_SECRET
        sync: false`;
  }

  if (config.auth === 'clerk') {
    webService += `
      - key: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        sync: false
      - key: CLERK_SECRET_KEY
        sync: false`;
  }

  // Add AI template environment variables
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    const apiKeyMap: Record<string, string> = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      'aws-bedrock': 'AWS_ACCESS_KEY_ID',
      gemini: 'GEMINI_API_KEY',
    };
    const apiKeyName = apiKeyMap[config.aiProvider || 'anthropic'];
    webService += `
      - key: ${apiKeyName}
        sync: false`;
    
    // Add AWS secret key if using Bedrock
    if (config.aiProvider === 'aws-bedrock') {
      webService += `
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_REGION
        value: us-east-1`;
    }
  }

  // Add Redis environment variables
  if (config.extras.redis) {
    webService += `
      - key: REDIS_URL
        fromService:
          name: ${config.projectName}-redis
          type: redis
          property: connectionString`;
  }

  // Build the complete YAML
  let yaml = `# Render Blueprint
# https://render.com/docs/blueprint-spec

services:
${webService}
`;

  // Add PostgreSQL database if needed
  if (config.database === 'prisma-postgres' || config.database === 'drizzle-postgres') {
    yaml += `
  - type: pserv
    name: ${config.projectName}-db
    plan: starter
    ipAllowList: []
    databases:
      - name: ${config.projectName}
        user: ${config.projectName}
`;
  }

  // Add Redis if needed
  if (config.extras.redis) {
    yaml += `
  - type: redis
    name: ${config.projectName}-redis
    plan: starter
    ipAllowList: []
    maxmemoryPolicy: allkeys-lru
`;
  }

  return yaml;
}

/**
 * Generate GitHub Actions workflow
 */
export function generateGithubActionsWorkflow(config: ScaffoldConfigWithFramework): string {
  return `name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

${
  config.deployment.includes('vercel')
    ? `
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
`
    : ''
}
`;
}

/**
 * Generate .dockerignore with security focus
 */
export function generateDockerignore(): string {
  return `# Dependencies
node_modules
npm-debug.log
.pnpm-debug.log

# Build outputs
.next
dist
build
out

# Git
.git
.gitignore
.gitattributes

# Documentation
README.md
CHANGELOG.md
*.md

# ⚠️ SECURITY: Never include these in Docker images
# Environment files with secrets
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local

# Private keys and certificates
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx

# SSH keys
.ssh
id_rsa
id_rsa.pub

# IDE and editor files
.vscode
.idea
*.swp
*.swo
*~
.DS_Store

# Testing and coverage
coverage
.nyc_output
*.test.js
*.spec.js
__tests__
__mocks__

# Logs
*.log
logs

# Temporary files
tmp
temp
*.tmp

# Misc
.turbo
.vercel
.cache

# Database files (should not be in images)
*.db
*.sqlite
*.sqlite3
`;
}

/**
 * Generate EC2 deployment script
 */
export function generateEC2DeployScript(config: ScaffoldConfigWithFramework): string {
  const appName = config.projectName;

  return `#!/bin/bash
set -e

echo "Starting deployment for ${appName}..."

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20 if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Navigate to application directory
cd /var/www/${appName}

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build application
echo "Building application..."
npm run build

# Restart application with PM2
echo "Restarting application..."
pm2 restart ${appName} || pm2 start npm --name "${appName}" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "Deployment completed successfully!"
`;
}

/**
 * Generate systemd service configuration for EC2
 */
export function generateSystemdService(config: ScaffoldConfigWithFramework): string {
  const appName = config.projectName;
  const port = config.framework === 'express' ? '4000' : '3000';
  const workingDir = `/var/www/${appName}`;

  return `[Unit]
Description=${appName} - Node.js application
Documentation=https://github.com/yourusername/${appName}
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${workingDir}
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=${appName}
Environment=NODE_ENV=production
Environment=PORT=${port}
${config.database !== 'none' ? 'Environment=DATABASE_URL=your-database-url' : ''}
${config.auth === 'nextauth' ? 'Environment=NEXTAUTH_SECRET=your-secret\nEnvironment=NEXTAUTH_URL=https://your-domain.com' : ''}
${config.aiTemplate && config.aiTemplate !== 'none' ? 'Environment=ANTHROPIC_API_KEY=your-api-key' : ''}

[Install]
WantedBy=multi-user.target
`;
}

/**
 * Generate nginx reverse proxy configuration for EC2
 */
export function generateNginxConfig(config: ScaffoldConfigWithFramework): string {
  const appName = config.projectName;
  const port = config.framework === 'express' ? '4000' : '3000';

  return `server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration (use certbot to generate certificates)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/${appName}_access.log;
    error_log /var/log/nginx/${appName}_error.log;

    # Proxy settings
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching (for Next.js)
    location /_next/static {
        proxy_pass http://localhost:${port};
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
`;
}

/**
 * Generate EC2 setup instructions script
 */
export function generateEC2SetupScript(config: ScaffoldConfigWithFramework): string {
  const appName = config.projectName;

  return `#!/bin/bash
set -e

echo "Setting up EC2 instance for ${appName}..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
echo "Installing nginx..."
sudo apt-get install -y nginx

# Install certbot for SSL certificates
echo "Installing certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Install git
sudo apt-get install -y git

# Create application directory
sudo mkdir -p /var/www/${appName}
sudo chown -R $USER:$USER /var/www/${appName}

# Clone repository (update with your repo URL)
echo "Clone your repository manually:"
echo "cd /var/www/${appName}"
echo "git clone https://github.com/yourusername/${appName}.git ."

# Install PM2 globally
sudo npm install -g pm2

# Copy nginx configuration
echo "Copy the nginx configuration to /etc/nginx/sites-available/${appName}"
echo "Then create a symlink:"
echo "sudo ln -s /etc/nginx/sites-available/${appName} /etc/nginx/sites-enabled/"

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "Setup complete! Next steps:"
echo "1. Clone your repository to /var/www/${appName}"
echo "2. Copy environment variables to /var/www/${appName}/.env"
echo "3. Run the deployment script: ./deploy.sh"
echo "4. Configure nginx with your domain"
echo "5. Run: sudo certbot --nginx -d your-domain.com"
`;
}

/**
 * Generate .gitignore (enhanced version with security focus)
 */
export function generateEnhancedGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js
bower_components/

# Testing
coverage/
*.test.js.snap
.nyc_output/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ⚠️ SECURITY: Environment variables and secrets
# Never commit these files - they contain sensitive API keys and credentials
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local

# ⚠️ SECURITY: Private keys and certificates
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx

# IDE and Editors
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
*.sublime-project
*.sublime-workspace

# Misc
*.tsbuildinfo
.turbo/
.vercel
.cache/

# Database
*.db
*.sqlite
*.sqlite3
prisma/migrations/*_migration.sql
!prisma/migrations/migration_lock.toml

# ORM
drizzle/

# Docker
.dockerignore

# Temporary files
tmp/
temp/
*.tmp

# OS
Thumbs.db
Desktop.ini

# Build artifacts
*.tgz
*.zip
!archives/.gitkeep

# Lock files (optional - uncomment if you want to ignore them)
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
# bun.lock
`;
}

/**
 * Generate Husky pre-commit hook
 */
export function generateHuskyPreCommit(): string {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run format
`;
}

/**
 * Generate Husky commit-msg hook for commit message linting
 */
export function generateHuskyCommitMsg(): string {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit \${1}
`;
}

/**
 * Generate commitlint configuration
 */
export function generateCommitlintConfig(): string {
  return `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert a previous commit
      ],
    ],
    'subject-case': [0], // Allow any case for subject
  },
};
`;
}
