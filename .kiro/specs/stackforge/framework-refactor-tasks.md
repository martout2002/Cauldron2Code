# Framework Selection Refactor Tasks

This task list focuses on updating Cauldron2Code to use the new four-category framework selection structure.

## Overview

Refactor the framework selection from the old single "framework" field to four distinct categories:
1. Frontend Framework (Next.js, React, Vue, Angular, Svelte)
2. Backend Framework (None/Next.js API, Express, Fastify, NestJS)
3. Build Tool (Auto, Vite, Webpack)
4. Project Structure (Next.js only, React SPA, Full-stack monorepo, Express API only)

---

## Tasks

- [x] 1. Update TypeScript types and interfaces
  - [x] 1.1 Update ScaffoldConfig interface in src/types/index.ts
    - Replace `framework` field with `frontendFramework`, `backendFramework`, `buildTool`, `projectStructure`
    - Update all type definitions to match new structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 1.2 Update Zustand store in src/lib/store/config-store.ts
    - Update state interface with new framework fields
    - Add logic to auto-adjust backend options when frontend changes
    - Add default values for new fields
    - _Requirements: 1.10_

- [x] 2. Update validation rules
  - [x] 2.1 Update validation rules in src/lib/validation/rules.ts
    - Add `nextjs-api-requires-nextjs` rule
    - Add `nextjs-only-structure` rule
    - Add `express-api-only-no-frontend` warning
    - Add `react-spa-no-backend` warning
    - Add `webpack-svelte-warning` rule
    - Update existing `trpc-monorepo` rule to use `projectStructure`
    - Update existing `vercel-express` rule to use `projectStructure`
    - _Requirements: 1.6, 1.7, 1.10_
  
  - [x] 2.2 Test validation rules
    - Test that Next.js API routes are disabled when React is selected
    - Test that warnings appear for mismatched configurations
    - Verify auto-fix suggestions work correctly
    - _Requirements: 1.7_

- [x] 3. Update Configuration UI
  - [x] 3.1 Update ConfigurationWizard component
    - Reorganize UI into four clear sections
    - Add section headers: "Frontend Framework", "Backend Framework", "Build Tool", "Project Structure"
    - Implement conditional rendering (hide Next.js API option when React selected)
    - Update form state management to use new fields
    - _Requirements: 1.1, 1.8, 1.10_
  
  - [x] 3.2 Update TechStackToggle component
    - Create radio button groups for each category
    - Add descriptions for each option (e.g., "React framework - recommended")
    - Update tooltips with detailed explanations
    - Add visual indicators for recommended options
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.9_
  
  - [x] 3.3 Update PreviewPanel component
    - Display all four framework selections clearly
    - Show how selections affect the generated structure
    - Update file tree preview based on project structure
    - _Requirements: 1.8_

- [-] 4. Update scaffold generator
  - [x] 4.1 Update file structure generator in src/lib/generator/file-structure.ts
    - Create `getNextJsOnlyStructure()` function (with app/api directory)
    - Create `getReactSpaStructure()` function (frontend only)
    - Create `getFullStackMonorepoStructure()` function (apps/web + apps/api)
    - Create `getExpressApiOnlyStructure()` function (backend only)
    - Add logic to select structure based on `projectStructure` field
    - _Requirements: 2.1, 1.11_
  
  - [x] 4.2 Update template generator in src/lib/generator/scaffold-generator.ts
    - Update to use new framework fields instead of old `framework` field
    - Add logic to generate app/api directory for Next.js only structure
    - Add logic to skip frontend files for Express API only
    - Add logic to skip backend files for React SPA
    - Update build tool selection logic (auto-select based on frontend)
    - _Requirements: 2.1, 2.4, 1.11_
  
  - [x] 4.3 Update Next.js templates in src/lib/generator/templates/nextjs-templates.ts
    - Add API route examples in app/api directory
    - Create app/api/hello/route.ts example
    - Create app/api/users/route.ts example
    - Update to only generate API routes when projectStructure is 'nextjs-only'
    - _Requirements: 1.11_
  
  - [ ] 4.4 Create React SPA templates
    - Create new file: src/lib/generator/templates/react-templates.ts
    - Generate Vite config for React SPA
    - Generate src/App.tsx and src/main.tsx
    - Generate React Router setup (optional)
    - _Requirements: 2.1, 2.4_
  
  - [ ] 4.5 Create Vue/Angular/Svelte templates
    - Create new file: src/lib/generator/templates/vue-templates.ts
    - Create new file: src/lib/generator/templates/angular-templates.ts
    - Create new file: src/lib/generator/templates/svelte-templates.ts
    - Generate basic project structure for each framework
    - _Requirements: 2.1, 2.4_
  
  - [ ] 4.6 Update package.json generator in src/lib/generator/templates/package-json.ts
    - Update dependencies based on frontendFramework selection
    - Add Vue/Angular/Svelte dependencies when selected
    - Update build tool dependencies based on buildTool selection
    - Add backend dependencies based on backendFramework selection
    - _Requirements: 2.4_

- [ ] 5. Update documentation generator
  - [ ] 5.1 Update README generator in src/lib/generator/documentation-generator.ts
    - Update project structure section based on projectStructure field
    - Add instructions for running Next.js with API routes
    - Add instructions for running React SPA
    - Add instructions for running monorepo (web + api)
    - Add instructions for running Express API only
    - _Requirements: 9.1, 10.2_
  
  - [ ] 5.2 Update SETUP.md generator
    - Add framework-specific setup instructions
    - Add build tool configuration notes
    - Update based on selected project structure
    - _Requirements: 10.1_

- [ ] 6. Update API endpoints
  - [ ] 6.1 Update validation endpoint in src/app/api/validate/route.ts
    - Update to validate new framework fields
    - Test with new validation rules
    - _Requirements: 1.6, 1.7_
  
  - [ ] 6.2 Update generation endpoint in src/app/api/generate/route.ts
    - Update to handle new framework structure
    - Ensure correct file structure is generated based on projectStructure
    - _Requirements: 2.1_

- [ ] 7. Migration and testing
  - [ ] 7.1 Create migration utility (optional)
    - Create utility to convert old configs to new format
    - Map old `framework: 'next'` to new structure
    - Map old `framework: 'express'` to new structure
    - Map old `framework: 'monorepo'` to new structure
  
  - [ ] 7.2 Test all framework combinations
    - Test Next.js only with API routes
    - Test React SPA with Vite
    - Test Full-stack monorepo (Next.js + Express)
    - Test Express API only
    - Test Vue with Vite
    - Test Angular with Webpack
    - Test Svelte with Vite
    - _Requirements: 2.1, 6.1_
  
  - [ ] 7.3 Update existing tests
    - Update unit tests to use new framework fields
    - Update integration tests for scaffold generation
    - Add tests for new validation rules
    - _Requirements: 1.6, 2.1_

- [ ] 8. Update demo applications
  - [ ] 8.1 Update SaaS dashboard demo configuration
    - Update to use new framework structure
    - Set frontendFramework: 'nextjs', projectStructure: 'nextjs-only'
    - _Requirements: 4.1, 4.3_
  
  - [ ] 8.2 Update public API demo configuration
    - Update to use new framework structure
    - Set projectStructure: 'express-api-only' or 'nextjs-only'
    - _Requirements: 4.1, 4.3_

---

## Testing Checklist

After completing all tasks, verify:

- [ ] Configuration UI shows four distinct framework categories
- [ ] Next.js API routes option is hidden when React/Vue/Angular/Svelte is selected
- [ ] Validation rules correctly identify incompatible combinations
- [ ] Next.js only structure generates app/api directory with example routes
- [ ] React SPA structure generates frontend-only files with Vite config
- [ ] Full-stack monorepo generates apps/web and apps/api directories
- [ ] Express API only generates backend-only files
- [ ] Build tool auto-selection works correctly
- [ ] Generated projects install dependencies successfully
- [ ] Generated projects run dev server successfully
- [ ] Documentation reflects the correct project structure

---

## Notes

- Start with Task 1 (types) as all other tasks depend on it
- Task 2 (validation) should be done before Task 3 (UI) to ensure proper validation
- Tasks 4-6 can be done in parallel after Tasks 1-3 are complete
- Task 7 (testing) should be done last to verify everything works together
