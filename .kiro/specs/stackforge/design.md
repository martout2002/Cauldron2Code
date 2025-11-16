# Cauldron2Code Technical Design

## Overview

Cauldron2Code is a Next.js-based web application that generates customized full-stack project scaffolds. The system uses a configuration-driven approach where users select technologies through an interactive UI, and a generation engine creates a complete, production-ready project with all necessary files, configurations, and documentation.

## Architecture

```mermaid
graph TB
    A[User Interface] --> B[Configuration Manager]
    B --> C[Validation Engine]
    C --> D[AI Suggestion Service]
    B --> E[Scaffold Generator]
    E --> F[File System Builder]
    E --> G[Dependency Manager]
    E --> H[Config Writer]
    E --> I[Documentation Generator]
    F --> J[Archive Creator]
    J --> K[Download Service]
```

### Architecture Layers

1. **Presentation Layer**: Next.js App Router pages and React components
2. **Configuration Layer**: State management and validation logic
3. **Generation Layer**: Template engine and file generation
4. **Documentation Layer**: Dynamic guide generation based on selected services
5. **Delivery Layer**: Archive creation and download handling

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for configuration state
- **Form Handling**: React Hook Form + Zod validation
- **Theme System**: CSS variables for color scheme switching

### Backend (API Routes)
- **Runtime**: Next.js API routes (Edge Functions for validation)
- **Scaffold Generation**: Custom TypeScript generator engine
- **File Operations**: Node.js `fs` + `archiver` for zip creation
- **Template Engine**: Custom string interpolation with EJS-like syntax
- **Validation**: Zod schemas for configuration validation


### AI Integration (Optional)
- **Provider**: Anthropic Claude API
- **Use Cases**: Pre-built templates for chatbot, document analyzer, semantic search, code assistant, image generator
- **Streaming**: Server-Sent Events for real-time responses

## Data Models

### ScaffoldConfig Interface

```typescript
interface ScaffoldConfig {
  // Project basics
  projectName: string;
  description: string;
  
  // Framework choices (new structure)
  frontendFramework: 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte';
  backendFramework: 'none' | 'nextjs-api' | 'express' | 'fastify' | 'nestjs';
  buildTool: 'auto' | 'vite' | 'webpack';
  projectStructure: 'nextjs-only' | 'react-spa' | 'fullstack-monorepo' | 'express-api-only';
  
  // Next.js specific (if applicable)
  nextjsRouter?: 'app' | 'pages';
  
  // Authentication
  auth: 'none' | 'nextauth' | 'supabase' | 'clerk';
  
  // Database & ORM
  database: 'none' | 'prisma-postgres' | 'drizzle-postgres' | 'supabase' | 'mongodb';
  
  // API Layer
  api: 'rest-fetch' | 'rest-axios' | 'trpc' | 'graphql';
  
  // Styling
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  shadcn: boolean;
  
  // Color Scheme
  colorScheme: 'purple' | 'gold' | 'white' | 'futuristic';
  
  // Deployment
  deployment: ('vercel' | 'render' | 'ec2' | 'railway')[];
  
  // AI Templates
  aiTemplate?: 'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator' | 'none';
  
  // Tooling extras
  extras: {
    docker: boolean;
    githubActions: boolean;
    redis: boolean;
    prettier: boolean;
    husky: boolean;
  };
}
```

### ValidationRule Type

```typescript
interface ValidationRule {
  id: string;
  message: string;
  severity: 'error' | 'warning';
  check: (config: ScaffoldConfig) => boolean;
}
```


### ColorSchemeConfig Type

```typescript
interface ColorSchemeConfig {
  name: string;
  displayName: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  cssVariables: Record<string, string>;
  tailwindExtend?: Record<string, any>;
}
```

### DocumentationSection Type

```typescript
interface DocumentationSection {
  title: string;
  order: number;
  content: string;
  applicableWhen: (config: ScaffoldConfig) => boolean;
  subsections?: DocumentationSection[];
}
```

## Framework Selection Logic

### Selection Categories

The framework selection is organized into four logical categories that guide users through architectural decisions:

#### 1. Frontend Framework/Library
- **Next.js** (React framework - recommended): Full-featured React framework with routing, SSR, and API routes
- **React** (library only): Just React, user adds routing and build setup
- **Vue**: Progressive JavaScript framework
- **Angular**: Full-featured TypeScript framework
- **Svelte**: Compiler-based framework

#### 2. Backend Framework
- **None (using Next.js API routes)**: Only available when Next.js is selected as frontend
- **Express**: Minimal and flexible Node.js framework
- **Fastify**: Fast and low overhead web framework
- **NestJS**: Progressive Node.js framework with TypeScript

#### 3. Build Tool
- **Auto (recommended)**: Automatically selects best tool (Vite for React/Vue/Svelte, Next.js bundler for Next.js, Webpack for Angular)
- **Vite**: Fast, modern build tool
- **Webpack**: Mature, highly configurable bundler

#### 4. Project Structure
- **Next.js only**: Frontend + API routes in single Next.js app
- **React SPA**: Frontend-only single page application
- **Full-stack monorepo**: Separate frontend and backend apps in monorepo structure
- **Express API only**: Backend-only API service (no frontend)

### Compatibility Rules

```typescript
const FRAMEWORK_COMPATIBILITY_RULES = [
  {
    condition: (config) => config.frontendFramework !== 'nextjs' && config.backendFramework === 'nextjs-api',
    error: 'Next.js API routes require Next.js as the frontend framework',
    autoFix: () => ({ backendFramework: 'none' })
  },
  {
    condition: (config) => config.projectStructure === 'nextjs-only' && config.frontendFramework !== 'nextjs',
    error: 'Next.js only structure requires Next.js as frontend framework',
    autoFix: () => ({ projectStructure: 'react-spa' })
  },
  {
    condition: (config) => config.projectStructure === 'express-api-only' && config.frontendFramework !== 'none',
    warning: 'Express API only structure will not include frontend code',
  },
  {
    condition: (config) => config.projectStructure === 'react-spa' && config.backendFramework !== 'none',
    warning: 'React SPA structure will not include backend code. Consider Full-stack monorepo.',
  },
  {
    condition: (config) => config.buildTool === 'webpack' && config.frontendFramework === 'svelte',
    warning: 'Vite is recommended for Svelte projects for better performance',
  }
];
```

### Generated File Structures

#### Next.js Only (frontend + API routes)
```
project-name/
├── app/
│   ├── api/                  # API routes directory
│   │   ├── hello/
│   │   │   └── route.ts
│   │   └── users/
│   │       └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

#### React SPA (frontend only)
```
project-name/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts           # If Vite selected
├── tsconfig.json
└── README.md
```

#### Full-stack Monorepo (Next.js + Express)
```
project-name/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── package.json
│   │   └── next.config.ts
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   └── server.ts
│       └── package.json
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   ├── ui/                  # Shared components (optional)
│   └── config/              # Shared configs
├── turbo.json
├── package.json
└── README.md
```

#### Express API Only (no frontend)
```
project-name/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── server.ts
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

## Component Structure

### Pages

```
app/
├── page.tsx                    # Landing page with feature overview
├── configure/
│   └── page.tsx               # Main configuration interface
├── demos/
│   ├── page.tsx               # Demo showcase landing
│   ├── saas-dashboard/        # Demo 1: SaaS app
│   └── public-api/            # Demo 2: Public API service
└── api/
    ├── generate/
    │   └── route.ts           # POST: Generate scaffold
    ├── validate/
    │   └── route.ts           # POST: Validate config
    └── download/
        └── [id]/route.ts      # GET: Download generated scaffold
```

### Key Components

```
components/
├── ConfigurationWizard.tsx    # Main config UI controller
├── TechStackToggle.tsx        # Individual tech toggle with tooltip
├── ColorSchemeSelector.tsx    # Visual color scheme picker
├── ValidationAlert.tsx        # Shows warnings/errors
├── GenerationProgress.tsx     # Progress indicator during generation
├── PreviewPanel.tsx           # Shows what will be generated
└── DownloadButton.tsx         # Trigger download with loading state
```


## Scaffold Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Generator
    participant DocGen
    participant FileSystem
    
    User->>UI: Configure stack & color scheme
    UI->>API: POST /api/validate
    API-->>UI: Validation result
    User->>UI: Click Generate
    UI->>API: POST /api/generate
    API->>Generator: Create scaffold plan
    Generator->>FileSystem: Write base structure
    Generator->>FileSystem: Write package.json
    Generator->>FileSystem: Write config files
    Generator->>FileSystem: Apply color scheme
    Generator->>DocGen: Generate documentation
    DocGen->>FileSystem: Write README.md
    DocGen->>FileSystem: Write SETUP.md
    DocGen->>FileSystem: Write .env.example
    Generator->>FileSystem: Write example code
    FileSystem-->>Generator: Files created
    Generator->>API: Create .zip archive
    API-->>UI: Return download URL
    UI->>User: Trigger download
```

## File Generation Templates

### Monorepo Structure (if selected)

```
project-name/
├── apps/
│   ├── web/              # Next.js app
│   └── api/              # Express API (if monorepo selected)
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── ui/               # Shared UI components (if selected)
│   └── config/           # Shared configs (ESLint, TS)
├── docs/
│   ├── SETUP.md          # Service integration guide
│   └── DEPLOYMENT.md     # Deployment instructions
├── .github/
│   └── workflows/        # CI/CD (if selected)
├── docker-compose.yml    # If Docker selected
├── Dockerfile           # If Docker selected
├── turbo.json           # Turborepo config
├── .env.example         # Environment variables with comments
├── package.json
└── README.md            # Custom generated README
```


## Color Scheme System

### Theme Definitions

```typescript
const COLOR_SCHEMES: Record<string, ColorSchemeConfig> = {
  purple: {
    name: 'purple',
    displayName: 'Purple',
    description: 'Modern and professional with purple accents',
    preview: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      background: '#FAFAFA',
      text: '#1F2937'
    },
    cssVariables: {
      '--color-primary': '139 92 246',
      '--color-secondary': '167 139 250',
      '--color-accent': '196 181 253',
      '--color-background': '250 250 250',
      '--color-foreground': '31 41 55'
    },
    tailwindExtend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)'
      }
    }
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    description: 'Elegant and luxurious with gold tones',
    preview: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FCD34D',
      background: '#FFFBEB',
      text: '#78350F'
    },
    cssVariables: {
      '--color-primary': '245 158 11',
      '--color-secondary': '251 191 36',
      '--color-accent': '252 211 77',
      '--color-background': '255 251 235',
      '--color-foreground': '120 53 15'
    }
  },
  white: {
    name: 'white',
    displayName: 'White',
    description: 'Clean and minimal with neutral tones',
    preview: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#737373',
      background: '#FFFFFF',
      text: '#171717'
    },
    cssVariables: {
      '--color-primary': '0 0 0',
      '--color-secondary': '64 64 64',
      '--color-accent': '115 115 115',
      '--color-background': '255 255 255',
      '--color-foreground': '23 23 23'
    }
  },
  futuristic: {
    name: 'futuristic',
    displayName: 'Futuristic',
    description: 'Cyberpunk-inspired with neon accents',
    preview: {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#0F172A',
      text: '#F1F5F9'
    },
    cssVariables: {
      '--color-primary': '6 182 212',
      '--color-secondary': '139 92 246',
      '--color-accent': '236 72 153',
      '--color-background': '15 23 42',
      '--color-foreground': '241 245 249'
    }
  }
};
```


### Color Scheme Application

When a color scheme is selected, the generator will:

1. **Create CSS Variables File**: Generate `app/globals.css` with theme variables
2. **Configure Tailwind**: Extend `tailwind.config.ts` with theme colors
3. **Apply to Components**: Use theme variables in all generated UI components
4. **Update shadcn/ui**: Configure shadcn components to use theme colors

Example generated `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 139 92 246;
    --color-secondary: 167 139 250;
    --color-accent: 196 181 253;
    --color-background: 250 250 250;
    --color-foreground: 31 41 55;
  }
}
```

## Documentation Generation System

### Dynamic Documentation Builder

The system generates comprehensive documentation based on selected technologies:

```typescript
class DocumentationGenerator {
  private config: ScaffoldConfig;
  private sections: DocumentationSection[];
  
  generateREADME(): string {
    return this.buildDocument([
      this.getProjectOverview(),
      this.getGettingStarted(),
      this.getProjectStructure(),
      this.getAvailableScripts(),
      this.getDeploymentSection(),
      this.getTroubleshooting()
    ]);
  }
  
  generateSETUP(): string {
    return this.buildDocument([
      this.getPrerequisites(),
      this.getDatabaseSetup(),
      this.getAuthSetup(),
      this.getExternalServicesSetup(),
      this.getEnvironmentVariables()
    ]);
  }
}
```


### Service-Specific Documentation Templates

#### Supabase Setup Documentation

```markdown
## Setting Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose a name and database password
   - Wait for the project to be provisioned (2-3 minutes)

2. **Get Your Connection Details**
   - Navigate to Project Settings > API
   - Copy the "Project URL" (starts with https://)
   - Copy the "anon public" key
   - Copy the "service_role" key (keep this secret!)

3. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Set Up Database Tables**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Verify tables were created in the Table Editor

5. **Test the Connection**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/health
   # Should return: {"database": "connected"}
   ```
```

#### NextAuth Setup Documentation

```markdown
## Setting Up NextAuth

1. **Generate Auth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env.local`:
   ```
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Configure OAuth Providers**
   
   **GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Set Homepage URL: `http://localhost:3000`
   - Set Callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and generate Client Secret
   - Add to `.env.local`:
     ```
     GITHUB_ID=your-client-id
     GITHUB_SECRET=your-client-secret
     ```

3. **Test Authentication**
   - Start the dev server: `npm run dev`
   - Visit: `http://localhost:3000/api/auth/signin`
   - Sign in with GitHub
   - You should be redirected to the home page
```


#### Deployment Documentation (Vercel)

```markdown
## Deploying to Vercel

1. **Prepare Your Repository**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Ensure `.env.example` is committed (but not `.env.local`)

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (set to your production URL)
     - `GITHUB_ID`
     - `GITHUB_SECRET`

4. **Update OAuth Callback URLs**
   - Go to your GitHub OAuth App settings
   - Add production callback: `https://your-app.vercel.app/api/auth/callback/github`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Visit your production URL

6. **Verify Deployment**
   - Test authentication flow
   - Check database connections
   - Verify API routes are working
```

## AI Template Implementations

### Chatbot Template

When the chatbot AI template is selected, generate:

```typescript
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages,
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta') {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify(chunk.delta)}\n\n`
              )
            );
          }
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}
```


```typescript
// app/chat/page.tsx
'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            assistantMessage += data.text;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                lastMessage.content = assistantMessage;
              } else {
                newMessages.push({ role: 'assistant', content: assistantMessage });
              }
              return newMessages;
            });
          }
        }
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-foreground'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```


### Document Analyzer Template

```typescript
// app/api/analyze/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const prompt = formData.get('prompt') as string;
  
  const text = await file.text();
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${prompt}\n\nDocument content:\n${text}`
    }]
  });
  
  return Response.json({
    analysis: message.content[0].text
  });
}
```

## Validation Rules

```typescript
const VALIDATION_RULES: ValidationRule[] = [
  // Framework compatibility rules
  {
    id: 'nextjs-api-requires-nextjs',
    message: 'Next.js API routes require Next.js as the frontend framework.',
    severity: 'error',
    check: (cfg) => cfg.backendFramework === 'nextjs-api' && cfg.frontendFramework !== 'nextjs'
  },
  {
    id: 'nextjs-only-structure',
    message: 'Next.js only structure requires Next.js as frontend framework.',
    severity: 'error',
    check: (cfg) => cfg.projectStructure === 'nextjs-only' && cfg.frontendFramework !== 'nextjs'
  },
  {
    id: 'express-api-only-no-frontend',
    message: 'Express API only structure will not include frontend code.',
    severity: 'warning',
    check: (cfg) => cfg.projectStructure === 'express-api-only' && cfg.frontendFramework !== 'none'
  },
  {
    id: 'react-spa-no-backend',
    message: 'React SPA structure will not include backend code. Consider Full-stack monorepo if you need a backend.',
    severity: 'warning',
    check: (cfg) => cfg.projectStructure === 'react-spa' && cfg.backendFramework !== 'none'
  },
  {
    id: 'webpack-svelte-warning',
    message: 'Vite is recommended for Svelte projects for better performance and developer experience.',
    severity: 'warning',
    check: (cfg) => cfg.buildTool === 'webpack' && cfg.frontendFramework === 'svelte'
  },
  
  // API and architecture rules
  {
    id: 'trpc-monorepo',
    message: 'tRPC works best with monorepo or Next.js. Consider using REST for standalone Express.',
    severity: 'warning',
    check: (cfg) => cfg.api === 'trpc' && cfg.projectStructure === 'express-api-only'
  },
  {
    id: 'auth-database',
    message: 'Authentication requires a database. Please select a database option.',
    severity: 'error',
    check: (cfg) => cfg.auth !== 'none' && cfg.database === 'none'
  },
  
  // Deployment rules
  {
    id: 'vercel-express',
    message: 'Standalone Express apps cannot deploy to Vercel. Consider Render, Railway, or EC2.',
    severity: 'error',
    check: (cfg) => cfg.projectStructure === 'express-api-only' && cfg.deployment.includes('vercel')
  },
  {
    id: 'vercel-nextjs-recommended',
    message: 'Vercel is the recommended deployment platform for Next.js applications.',
    severity: 'info',
    check: (cfg) => cfg.frontendFramework === 'nextjs' && !cfg.deployment.includes('vercel')
  },
  
  // AI and services
  {
    id: 'ai-api-key',
    message: 'AI templates require an Anthropic API key. You\'ll need to add ANTHROPIC_API_KEY to your environment.',
    severity: 'warning',
    check: (cfg) => cfg.aiTemplate !== 'none' && cfg.aiTemplate !== undefined
  },
  {
    id: 'supabase-auth-db',
    message: 'When using Supabase auth, Supabase database is recommended for seamless integration.',
    severity: 'warning',
    check: (cfg) => cfg.auth === 'supabase' && cfg.database !== 'supabase'
  }
];
```


## Deployment Configuration Generation

### Vercel Configuration

Generate `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Docker Configuration

Generate `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm turbo

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune --scope=web --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN turbo build --filter=web

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=installer --chown=nextjs:nodejs /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT 3000

CMD ["pnpm", "--filter=web", "start"]
```

Generate `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```


### Railway Configuration

Generate `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Environment Variable Documentation

Generate `.env.example` with comprehensive comments:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database (if Supabase selected)
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (if Prisma/Drizzle with Postgres selected)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Local: postgresql://postgres:postgres@localhost:5432/myapp
# Production: Get from your hosting provider (Railway, Render, etc.)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp

# Authentication (if NextAuth selected)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
# Local: http://localhost:3000
# Production: https://your-domain.com
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (if NextAuth selected)
# GitHub: https://github.com/settings/developers
# Callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Google: https://console.cloud.google.com/apis/credentials
# Callback URL: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Integration (if AI template selected)
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Redis (if Redis selected)
# Local: redis://localhost:6379
# Production: Get from Upstash or Redis Cloud
REDIS_URL=redis://localhost:6379
```


## Monorepo Communication Documentation

When monorepo is selected, generate documentation explaining inter-app communication:

```markdown
## Monorepo Architecture

This project uses Turborepo to manage multiple applications and shared packages.

### Structure

- `apps/web`: Next.js frontend application
- `apps/api`: Express backend API (if selected)
- `packages/shared-types`: TypeScript types shared between apps
- `packages/ui`: Shared React components (if selected)
- `packages/config`: Shared configuration files

### Running the Monorepo

**Development (all apps):**
```bash
pnpm dev
```

**Development (specific app):**
```bash
pnpm --filter=web dev
pnpm --filter=api dev
```

**Build all apps:**
```bash
pnpm build
```

### Communication Between Apps

**Frontend → Backend API:**

The web app communicates with the API using the configured API layer:

```typescript
// apps/web/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchUser(id: string) {
  const response = await fetch(`${API_URL}/api/users/${id}`);
  return response.json();
}
```

**Shared Types:**

Both apps import types from the shared package:

```typescript
// packages/shared-types/src/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// apps/api/src/routes/users.ts
import { User } from '@repo/shared-types';

// apps/web/app/users/page.tsx
import { User } from '@repo/shared-types';
```

### Environment Variables for Monorepo

**apps/web/.env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/api/.env:**
```bash
PORT=4000
DATABASE_URL=postgresql://...
```
```


## Error Handling

### Validation Errors

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public severity: 'error' | 'warning'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Generation Errors

```typescript
class GenerationError extends Error {
  constructor(
    public step: string,
    public originalError: Error
  ) {
    super(`Failed at step: ${step}`);
    this.name = 'GenerationError';
  }
}
```

### Error Recovery

- Validation errors prevent generation from starting
- Generation errors are logged and user receives partial scaffold with error report
- Network errors during download trigger automatic retry (max 3 attempts)
- File system errors during generation are caught and reported with specific file path

## Testing Strategy

### Unit Tests

- Configuration validation logic
- Color scheme application
- Documentation generation for each service type
- Template interpolation engine

### Integration Tests

- Full scaffold generation for common configurations
- Validation rule enforcement
- File structure verification
- Environment variable generation

### End-to-End Tests

- Complete user flow from configuration to download
- Generated project can be extracted and dependencies installed
- Generated projects pass TypeScript compilation
- AI templates produce working endpoints

### Test Configurations

Test scaffold generation with these representative configurations:

1. **Minimal**: Next.js + Tailwind + White theme
2. **Full Stack**: Monorepo + Next.js + Express + Prisma + NextAuth + Purple theme
3. **AI-Powered**: Next.js + Supabase + Chatbot template + Futuristic theme
4. **Multi-Deploy**: Next.js + Docker + Vercel + Railway + Gold theme


## Security Considerations

### API Key Protection

- Never include actual API keys in generated scaffolds
- All sensitive values use environment variable placeholders
- `.env.example` includes comments but no real values
- `.gitignore` includes `.env.local` and `.env` by default

### Authentication Security

- Generated NextAuth configurations use httpOnly cookies
- CSRF protection enabled by default
- Secure session handling with proper secret rotation guidance
- OAuth callback URLs validated

### Docker Security

- Non-root user in Docker containers
- Multi-stage builds to minimize image size
- No secrets in Docker images
- Environment variables passed at runtime

### Dependency Security

- All dependencies locked to specific versions
- Regular security audit recommendations in README
- Minimal dependency footprint
- Only production dependencies in final builds

## Performance Optimizations

### Generation Performance

- Template caching in memory for common configurations
- Parallel file generation where dependencies allow
- Streaming zip creation to avoid memory spikes
- Incremental documentation building

### UI Performance

- Edge Functions for validation (<50ms response time)
- Optimistic UI updates during configuration
- Debounced validation checks
- Progressive enhancement for color scheme preview

### Generated Project Performance

- Tree-shaking enabled in build configuration
- Code splitting for Next.js routes
- Optimized bundle sizes (<5MB for typical configs)
- Image optimization configured by default
- Font optimization with next/font


## Demo Applications

### Demo 1: SaaS Dashboard

**Configuration:**
- Framework: Monorepo (Next.js + Express API)
- Auth: NextAuth with GitHub
- Database: Prisma + PostgreSQL
- Styling: Tailwind + shadcn/ui
- Color Scheme: Purple
- Deployment: Vercel

**Features Demonstrated:**
- User authentication and session management
- Dashboard with data visualization
- API integration between frontend and backend
- Database queries and mutations
- Protected routes

### Demo 2: Public API Service

**Configuration:**
- Framework: Next.js (API routes only)
- Auth: None (public API)
- Database: Supabase
- API: REST with rate limiting
- Color Scheme: Futuristic
- Deployment: Railway
- AI Template: Document Analyzer

**Features Demonstrated:**
- RESTful API endpoints
- Database integration with Supabase
- AI-powered document analysis
- API documentation with examples
- Rate limiting and error handling

Both demos will be deployed and accessible from the Cauldron2Code website, with source code viewable and configuration details displayed.

## Future Enhancements

### Phase 2 Features (Not in Initial Release)

- Custom template upload (users can save their own configurations)
- Team collaboration (share configurations within organizations)
- Version control integration (auto-commit generated scaffold)
- CLI tool for scaffold generation
- More AI templates (RAG, fine-tuning, embeddings)
- Additional deployment targets (AWS Amplify, Netlify, Fly.io)
- Database migration generation
- API documentation generation (Swagger/OpenAPI)
- Storybook integration for component libraries
- More color scheme options and custom theme builder



## GitHub Integration Architecture

### Overview

The GitHub integration allows users to create a repository and push their generated scaffold directly to GitHub, eliminating manual setup steps. This feature uses GitHub OAuth for authentication and the GitHub REST API for repository operations.

### Architecture Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant AuthAPI
    participant GitHub
    participant GenAPI
    participant GitService
    
    User->>UI: Click "Create GitHub Repo"
    UI->>AuthAPI: Check auth status
    alt Not authenticated
        AuthAPI->>GitHub: Initiate OAuth flow
        GitHub->>User: Request permissions
        User->>GitHub: Approve
        GitHub->>AuthAPI: Return access token
        AuthAPI->>UI: Authentication complete
    end
    
    UI->>User: Show repo details form
    User->>UI: Enter name, description, visibility
    UI->>GenAPI: Create repo with config
    GenAPI->>GitHub: Create repository
    GitHub->>GenAPI: Return repo URL
    GenAPI->>GitService: Initialize and push files
    GitService->>GitHub: Push initial commit
    GitHub->>GenAPI: Confirm push
    GenAPI->>UI: Return repo URL
    UI->>User: Display success + repo link
```

### Components

#### 1. GitHub OAuth Service (`/lib/github/oauth.ts`)

Handles GitHub authentication flow:

```typescript
interface GitHubAuthService {
  // Initiate OAuth flow
  initiateAuth(): Promise<string>; // Returns authorization URL
  
  // Handle OAuth callback
  handleCallback(code: string): Promise<GitHubUser>;
  
  // Refresh access token
  refreshToken(refreshToken: string): Promise<string>;
  
  // Revoke access
  revokeAccess(token: string): Promise<void>;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  accessToken: string;
}
```

**OAuth Scopes Required:**
- `repo` - Create repositories and push code
- `user:email` - Access user email for git commits

#### 2. GitHub Repository Service (`/lib/github/repository.ts`)

Manages repository operations:

```typescript
interface GitHubRepositoryService {
  // Create a new repository
  createRepository(options: CreateRepoOptions): Promise<Repository>;
  
  // Check if repository name is available
  checkAvailability(username: string, repoName: string): Promise<boolean>;
  
  // Initialize repository with files
  initializeRepository(repoUrl: string, files: GeneratedFile[]): Promise<void>;
  
  // Push files to repository
  pushFiles(repoUrl: string, files: GeneratedFile[], commitMessage: string): Promise<void>;
}

interface CreateRepoOptions {
  name: string;
  description: string;
  private: boolean;
  autoInit: boolean; // Should be false, we'll push our own files
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  private: boolean;
}

interface GeneratedFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}
```

#### 3. Git Operations Service (`/lib/github/git-operations.ts`)

Handles low-level git operations:

```typescript
interface GitOperationsService {
  // Create initial commit with all files
  createInitialCommit(
    repoUrl: string,
    files: GeneratedFile[],
    author: GitAuthor
  ): Promise<string>; // Returns commit SHA
  
  // Create and push branch
  createBranch(repoUrl: string, branchName: string, fromSha: string): Promise<void>;
  
  // Create tree (directory structure)
  createTree(repoUrl: string, files: GeneratedFile[]): Promise<string>; // Returns tree SHA
  
  // Create blob (file content)
  createBlob(repoUrl: string, content: string, encoding: string): Promise<string>; // Returns blob SHA
}

interface GitAuthor {
  name: string;
  email: string;
}
```

#### 4. GitHub Integration UI Components

**GitHubAuthButton** (`/components/GitHubAuthButton.tsx`)
- Displays "Sign in with GitHub" button
- Shows authenticated user info
- Provides sign-out functionality

**CreateRepoModal** (`/components/CreateRepoModal.tsx`)
- Form for repository details (name, description, visibility)
- Real-time name availability checking
- Validation for GitHub naming conventions

**GitHubPushProgress** (`/components/GitHubPushProgress.tsx`)
- Progress indicator for repository creation
- Steps: Creating repo → Initializing → Committing → Pushing
- Success state with repository link
- Error handling with fallback to ZIP download

### API Endpoints

#### `/api/github/auth/initiate` (GET)
Starts GitHub OAuth flow
- Returns: Authorization URL

#### `/api/github/auth/callback` (GET)
Handles OAuth callback
- Query params: `code`, `state`
- Returns: User info + access token
- Sets secure HTTP-only cookie with token

#### `/api/github/auth/status` (GET)
Checks authentication status
- Returns: User info if authenticated

#### `/api/github/auth/signout` (POST)
Signs out user
- Revokes GitHub token
- Clears auth cookie

#### `/api/github/repos/check-availability` (POST)
Checks if repository name is available
- Body: `{ name: string }`
- Returns: `{ available: boolean, suggestions?: string[] }`

#### `/api/github/repos/create` (POST)
Creates repository and pushes scaffold
- Body: `{ name, description, private, config: ScaffoldConfig }`
- Returns: `{ repoUrl, cloneUrl, htmlUrl }`
- Process:
  1. Generate scaffold files
  2. Create GitHub repository
  3. Initialize git and push files
  4. Return repository URLs

### Data Flow

1. **Authentication Phase**
   - User clicks "Create GitHub Repo"
   - System checks if user is authenticated
   - If not, redirect to GitHub OAuth
   - Store access token securely in HTTP-only cookie

2. **Repository Creation Phase**
   - User enters repository details
   - System validates name availability
   - User confirms creation

3. **Generation & Push Phase**
   - Generate scaffold files (same as ZIP download)
   - Create GitHub repository via API
   - Initialize git repository
   - Create initial commit with all files
   - Push to GitHub main branch
   - Return repository URL to user

### Security Considerations

1. **Token Storage**
   - Access tokens stored in HTTP-only cookies
   - Tokens encrypted at rest
   - Tokens never exposed to client-side JavaScript

2. **OAuth State Parameter**
   - Random state parameter to prevent CSRF
   - State validated on callback

3. **Rate Limiting**
   - Implement rate limiting on repository creation
   - Max 5 repositories per user per hour

4. **Input Validation**
   - Validate repository names against GitHub rules
   - Sanitize all user inputs
   - Validate file contents before pushing

5. **Error Handling**
   - Never expose GitHub API errors directly
   - Provide user-friendly error messages
   - Log detailed errors server-side

### Configuration

Environment variables required:

```bash
# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/auth/callback

# Token encryption
GITHUB_TOKEN_ENCRYPTION_KEY=random_32_byte_key

# Rate limiting
GITHUB_RATE_LIMIT_MAX=5
GITHUB_RATE_LIMIT_WINDOW=3600000 # 1 hour in ms
```

### Error Scenarios & Handling

| Scenario | Error Handling | User Experience |
|----------|---------------|-----------------|
| OAuth fails | Show error message, offer retry | "GitHub authentication failed. Please try again." |
| Repository name taken | Suggest alternatives | "Repository name 'my-app' is taken. Try: my-app-2, my-app-v2" |
| Push fails | Offer ZIP download fallback | "Unable to push to GitHub. Download ZIP instead?" |
| Rate limit exceeded | Show cooldown timer | "Rate limit reached. Try again in 45 minutes." |
| Network timeout | Retry with exponential backoff | "Connection timeout. Retrying..." |
| Invalid token | Re-authenticate user | "Session expired. Please sign in again." |

### Performance Considerations

1. **Parallel Operations**
   - Generate files while creating repository
   - Use Promise.all for independent operations

2. **Streaming**
   - Stream progress updates to UI
   - Use Server-Sent Events for real-time feedback

3. **Caching**
   - Cache user info for 5 minutes
   - Cache repository availability checks for 30 seconds

4. **Timeouts**
   - 30 second timeout for repository creation
   - 60 second timeout for file push
   - Automatic fallback to ZIP download on timeout

### Testing Strategy

1. **Unit Tests**
   - OAuth flow logic
   - Repository name validation
   - Git operations

2. **Integration Tests**
   - Full OAuth flow with GitHub
   - Repository creation and push
   - Error scenarios

3. **E2E Tests**
   - Complete user journey from auth to repo creation
   - Fallback to ZIP download
   - Multiple repository creations

### Future Enhancements

1. **Organization Support**
   - Allow creating repos in user's organizations
   - Organization selection in UI

2. **Branch Protection**
   - Optionally set up branch protection rules
   - Configure CI/CD workflows

3. **Collaboration**
   - Add collaborators during creation
   - Set up team permissions

4. **Templates**
   - Use GitHub repository templates
   - Apply .github folder with workflows
