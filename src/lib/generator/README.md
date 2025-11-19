# Scaffold Generator

This module implements the complete scaffold generation engine for Cauldron2Code.

## Overview

The scaffold generator creates complete, production-ready project structures based on user configuration. It supports:

- **Multiple frameworks**: Next.js, Express, and Monorepo (Turborepo)
- **Color schemes**: Purple, Gold, White, and Futuristic themes
- **Styling options**: Tailwind CSS, CSS Modules, and Styled Components
- **Authentication**: NextAuth, Supabase, and Clerk
- **Databases**: Prisma, Drizzle, Supabase, and MongoDB
- **Deployment targets**: Vercel, Railway, and Render
- **AI templates**: Chatbot, Document Analyzer, and more

## Architecture

### Core Components

1. **TemplateEngine** (`template-engine.ts`)
   - String interpolation with `{{variable}}` syntax
   - Context creation from scaffold configuration
   - Template variable resolution

2. **FileStructure** (`file-structure.ts`)
   - Directory structure generation based on framework
   - File path resolution for different project types
   - Utility functions for name normalization

3. **ScaffoldGenerator** (`scaffold-generator.ts`)
   - Main orchestrator for scaffold generation
   - Coordinates file and directory creation
   - Generates metadata about the scaffold

### Template Modules

1. **Package JSON Templates** (`templates/package-json.ts`)
   - Generates package.json for different frameworks
   - Manages dependencies based on configuration
   - Supports monorepo workspace configuration

2. **Next.js Templates** (`templates/nextjs-templates.ts`)
   - Next.js app layout and pages
   - Turborepo configuration for monorepos
   - Shared packages for monorepo structure

3. **Express Templates** (`templates/express-templates.ts`)
   - Express server setup
   - API routes and middleware
   - Standalone and monorepo variants

4. **Styling Templates** (`templates/styling-templates.ts`)
   - CSS variable generation for color schemes
   - Tailwind configuration with theme colors
   - shadcn/ui components.json setup
   - Styled Components theme and global styles

5. **Config Templates** (`templates/config-templates.ts`)
   - TypeScript configuration
   - ESLint and Prettier configs
   - Deployment configurations (Vercel, Railway, Docker)
   - GitHub Actions workflows

## Usage

```typescript
import { ScaffoldGenerator } from '@/lib/generator';
import { ScaffoldConfig } from '@/types';

const config: ScaffoldConfig = {
  projectName: 'my-app',
  description: 'My awesome application',
  framework: 'next',
  // ... other configuration options
};

const generator = new ScaffoldGenerator(config);
const result = await generator.generate();

// result contains:
// - files: Array of { path, content }
// - directories: Array of directory paths
// - metadata: Project information
```

## Generated Structure

### Next.js Standalone
```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── lib/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts (if Tailwind)
├── next.config.ts
└── .env.example
```

### Monorepo
```
my-app/
├── apps/
│   ├── web/          # Next.js application
│   └── api/          # Express API
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── config/       # Shared configurations
├── turbo.json
├── package.json
└── .env.example
```

## Color Scheme Application

Color schemes are applied through:

1. **CSS Variables**: Generated in `globals.css`
2. **Tailwind Config**: Extended with theme colors
3. **Component Theming**: Applied to shadcn/ui components
4. **Styled Components**: Theme object with color values

Example CSS variables for purple theme:
```css
:root {
  --color-primary: 139 92 246;
  --color-secondary: 167 139 250;
  --color-accent: 196 181 253;
  --color-background: 250 250 250;
  --color-foreground: 31 41 55;
}
```

## Deployment Configurations

### Vercel
- Generates `vercel.json` with build settings
- Configures output directory based on framework
- Sets up environment variable placeholders

### Docker
- Multi-stage Dockerfile for optimized builds
- docker-compose.yml with service dependencies
- .dockerignore for efficient builds

### Railway
- railway.json with Nixpacks configuration
- Restart policies and build commands

### GitHub Actions
- CI/CD workflow for build and lint
- Optional deployment to Vercel
- Node.js matrix testing

## Extension Points

To add new features:

1. **New Framework**: Add template in `templates/` and update `scaffold-generator.ts`
2. **New Color Scheme**: Add to `color-schemes.ts` and it will be automatically applied
3. **New Deployment Target**: Add config generator in `config-templates.ts`
4. **New Template Type**: Create new template module and import in generator

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **2.1**: Generate monorepo structure with all selected technologies
- **2.4**: Include package.json with all required dependencies
- **2.5**: Include deployment configuration files
- **2.7**: Use TypeScript exclusively
- **8.3**: Generate CSS variables for color schemes
- **8.4**: Apply theme to generated UI components
- **8.5**: Display selected color scheme consistently
