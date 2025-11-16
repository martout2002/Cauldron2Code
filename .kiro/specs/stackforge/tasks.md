# Implementation Plan

- [x] 1. Set up Next.js project structure and core configuration
  - Initialize Next.js 15 project with TypeScript and App Router
  - Configure Tailwind CSS and install shadcn/ui
  - Set up project directory structure (components, lib, types)
  - Configure ESLint, Prettier, and TypeScript strict mode
  - _Requirements: 1.1, 5.1, 6.3_

- [x] 2. Implement data models and validation schemas
  - Create ScaffoldConfig interface with all configuration options
  - Create ValidationRule type and ColorSchemeConfig interface
  - Implement Zod schemas for configuration validation
  - Create DocumentationSection type for dynamic docs
  - _Requirements: 1.2, 1.3, 8.1_

- [x] 3. Build configuration UI components
  - [x] 3.1 Create ConfigurationWizard main component
    - Implement Zustand store for configuration state with new framework structure
    - Create wizard layout with four primary framework selection categories
    - Add form state management with React Hook Form
    - Implement auto-adjustment logic (e.g., disable Next.js API routes when React is selected)
    - _Requirements: 1.1, 1.8, 1.10_
  
  - [x] 3.2 Create TechStackToggle component
    - Build radio/toggle controls for Frontend Framework selection (Next.js, React, Vue, Angular, Svelte)
    - Build radio/toggle controls for Backend Framework selection (None, Express, Fastify, NestJS)
    - Build radio/toggle controls for Build Tool selection (Auto, Vite, Webpack)
    - Build radio/toggle controls for Project Structure selection (Next.js only, React SPA, Full-stack monorepo, Express API only)
    - Add tooltip system with technology explanations for each option
    - Implement visual feedback for selections
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.9_
  
  - [x] 3.3 Create ColorSchemeSelector component
    - Build visual color scheme picker with preview cards
    - Display color palettes for each theme (purple, gold, white, futuristic)
    - Implement real-time preview of selected scheme
    - _Requirements: 8.1, 8.2_
  
  - [x] 3.4 Create ValidationAlert component
    - Display validation errors and warnings
    - Show actionable guidance for resolving conflicts
    - Implement severity-based styling (error vs warning)
    - _Requirements: 1.3, 9.2_
  
  - [x] 3.5 Create PreviewPanel component
    - Show summary of all selected technologies
    - Display estimated bundle size and generation time
    - List files that will be generated
    - _Requirements: 1.4_


- [x] 4. Implement validation engine
  - [x] 4.1 Create validation rule definitions
    - Define framework compatibility rules (nextjs-api-requires-nextjs, nextjs-only-structure, etc.)
    - Define architecture rules (react-spa-no-backend, express-api-only-no-frontend, etc.)
    - Define deployment rules (vercel-express, vercel-nextjs-recommended, etc.)
    - Define all other validation rules (auth-database, ai-api-key, etc.)
    - Implement rule checking functions
    - Create severity classification logic (error, warning, info)
    - _Requirements: 1.6, 1.7, 1.10_
  
  - [x] 4.2 Build real-time validation system
    - Implement validation engine that runs on config changes
    - Add debouncing for performance (<100ms response)
    - Create validation result aggregation
    - _Requirements: 1.2, 5.1_
  
  - [x] 4.3 Create validation API endpoint
    - Implement POST /api/validate route
    - Add Zod schema validation
    - Return structured validation results
    - _Requirements: 1.2, 1.3_

- [x] 5. Build scaffold generation engine
  - [x] 5.1 Create template system foundation
    - Implement template file structure definitions for each project structure type
    - Create string interpolation engine for templates
    - Build file path generation logic based on project structure
    - _Requirements: 2.1, 2.4, 1.11_
  
  - [x] 5.2 Implement base project templates
    - Create Next.js only template (with app/api directory for API routes)
    - Create React SPA template (frontend only with Vite or Webpack)
    - Create Full-stack monorepo template (apps/web + apps/api with Turborepo)
    - Create Express API only template (backend only, no frontend)
    - Create Vue, Angular, and Svelte templates
    - Generate package.json with correct dependencies based on selections
    - _Requirements: 2.1, 2.4, 2.7, 1.11_
  
  - [x] 5.3 Implement color scheme application
    - Create CSS variable generation for each theme
    - Generate Tailwind config with theme colors
    - Apply theme to shadcn/ui components
    - Create globals.css with theme variables
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [x] 5.4 Implement configuration file generation
    - Generate TypeScript config files
    - Create ESLint and Prettier configs
    - Generate deployment configs (vercel.json, Dockerfile, etc.)
    - Create .gitignore with appropriate entries
    - _Requirements: 2.5, 2.7_


- [x] 6. Implement AI template generation
  - [x] 6.1 Create chatbot template
    - Generate /api/chat route with streaming support
    - Create chat UI component with message display
    - Implement Server-Sent Events for real-time responses
    - Add Anthropic SDK integration code
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [x] 6.2 Create document analyzer template
    - Generate /api/analyze route with file upload
    - Create document upload UI component
    - Implement file processing and analysis logic
    - _Requirements: 3.4, 3.5_
  
  - [x] 6.3 Create semantic search template
    - Generate vector database integration code
    - Create search API endpoint
    - Implement embedding generation logic
    - _Requirements: 3.4, 3.5_
  
  - [x] 6.4 Create code assistant template
    - Generate code analysis API endpoint
    - Create code input UI component
    - Implement code suggestion logic
    - _Requirements: 3.4, 3.5_
  
  - [x] 6.5 Create image generator template
    - Generate image generation API endpoint
    - Create image prompt UI component
    - Implement image generation integration
    - _Requirements: 3.4, 3.5_
  
  - [x] 6.6 Add AI dependency management
    - Auto-add Anthropic SDK when AI template selected
    - Generate AI-specific environment variables
    - Create AI configuration documentation
    - _Requirements: 3.2, 3.5_

- [x] 7. Build documentation generation system
  - [x] 7.1 Create DocumentationGenerator class
    - Implement dynamic section building based on config
    - Create template system for documentation
    - Add conditional section inclusion logic
    - _Requirements: 9.1, 10.1, 10.2_
  
  - [x] 7.2 Generate README.md
    - Create project overview section
    - Generate getting started guide with numbered steps
    - Add available scripts documentation
    - Include project structure explanation
    - Add troubleshooting section
    - _Requirements: 9.1, 10.2, 10.7_


  - [x] 7.3 Generate SETUP.md with service integration guides
    - Create Supabase setup instructions with step-by-step guide
    - Generate NextAuth configuration guide with OAuth setup
    - Add Clerk integration instructions
    - Create database connection guides
    - Include API key retrieval instructions
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 7.4 Generate deployment documentation
    - Create Vercel deployment guide
    - Generate Railway deployment instructions
    - Add EC2 deployment guide
    - Include environment variable configuration steps
    - Add OAuth callback URL update instructions
    - _Requirements: 10.5_
  
  - [x] 7.5 Generate .env.example with comprehensive comments
    - Add all required environment variables
    - Include descriptive comments for each variable
    - Provide example values and formats
    - Add links to where to obtain API keys
    - _Requirements: 10.8_
  
  - [x] 7.6 Generate monorepo communication documentation
    - Explain inter-app communication patterns
    - Document shared package usage
    - Add development workflow instructions
    - Include environment variable setup for each app
    - _Requirements: 10.6_

- [x] 8. Implement generation API and file operations
  - [x] 8.1 Create generation API endpoint
    - Implement POST /api/generate route
    - Add configuration validation
    - Create generation progress tracking
    - Return generation ID for download
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [x] 8.2 Build file system operations
    - Implement directory structure creation
    - Create file writing with proper encoding
    - Add parallel file generation for performance
    - Implement error handling for file operations
    - _Requirements: 2.1, 2.4_
  
  - [x] 8.3 Create archive generation
    - Implement zip file creation with archiver
    - Add streaming to avoid memory issues
    - Create temporary file cleanup
    - Generate unique download IDs
    - _Requirements: 2.3, 2.6_


  - [x] 8.4 Implement download endpoint
    - Create GET /api/download/[id] route
    - Add file streaming for large archives
    - Implement automatic cleanup after download
    - Add retry logic for failed downloads
    - _Requirements: 2.3_
  
  - [x] 8.5 Add generation progress tracking
    - Implement progress event system
    - Create progress UI component
    - Add WebSocket or polling for real-time updates
    - Display current generation step to user
    - _Requirements: 2.2_

- [x] 9. Build landing and demo pages
  - [x] 9.1 Create landing page
    - Design hero section with feature overview
    - Add technology showcase section
    - Create call-to-action for configuration
    - Implement responsive layout
    - _Requirements: 5.3, 6.3_
  
  - [x] 9.2 Build demo showcase page
    - Create demo listing with descriptions
    - Add links to live demo applications
    - Display configuration used for each demo
    - Implement "View Source" functionality
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [x] 9.3 Create SaaS dashboard demo
    - Build demo with purple theme
    - Implement authentication flow
    - Create dashboard with data visualization
    - Deploy to Vercel
    - _Requirements: 4.1, 4.3_
  
  - [x] 9.4 Create public API demo
    - Build demo with futuristic theme
    - Implement document analyzer AI template
    - Create API documentation page
    - Deploy to Railway
    - _Requirements: 4.1, 4.3_

- [x] 10. Implement deployment configuration generators
  - [x] 10.1 Create Vercel configuration generator
    - Generate vercel.json with correct settings
    - Add environment variable placeholders
    - Include build and output directory config
    - _Requirements: 2.5_


  - [x] 10.2 Create Docker configuration generator
    - Generate Dockerfile with multi-stage build
    - Create docker-compose.yml with services
    - Add non-root user configuration
    - Include database service if needed
    - _Requirements: 2.5_
  
  - [x] 10.3 Create Railway configuration generator
    - Generate railway.json with build settings
    - Add Nixpacks configuration
    - Include restart policy settings
    - _Requirements: 2.5_
  
  - [x] 10.4 Create EC2 deployment scripts
    - Generate deployment shell scripts
    - Add systemd service configuration
    - Include nginx reverse proxy config
    - _Requirements: 2.5_
  
  - [x] 10.5 Handle multiple deployment targets
    - Generate configs for all selected platforms
    - Create README section explaining each deployment
    - Add platform-specific environment variable notes
    - _Requirements: 7.1, 7.2_

- [ ] 11. Add authentication and database templates
  - [x] 11.1 Create NextAuth integration template
    - Generate auth configuration file
    - Create API route for NextAuth
    - Add session provider wrapper
    - Generate OAuth provider setup code
    - _Requirements: 2.4, 10.4_
  
  - [x] 11.2 Create Supabase integration template
    - Generate Supabase client configuration
    - Create authentication helpers
    - Add database query examples
    - Generate migration files
    - _Requirements: 2.4, 10.3_
  
  - [x] 11.3 Create Clerk integration template
    - Generate Clerk provider setup
    - Create middleware for protected routes
    - Add user management components
    - _Requirements: 2.4, 10.4_
  
  - [x] 11.4 Create Prisma database template
    - Generate Prisma schema file
    - Create database client initialization
    - Add example models and relations
    - Generate migration scripts
    - _Requirements: 2.4, 10.3_


  - [x] 11.5 Create Drizzle database template
    - Generate Drizzle schema definitions
    - Create database connection setup
    - Add query examples
    - Generate migration configuration
    - _Requirements: 2.4, 10.3_

- [x] 12. Implement API layer templates
  - [x] 12.1 Create REST API templates
    - Generate fetch-based API client
    - Create axios-based API client alternative
    - Add error handling and retry logic
    - Generate API route examples
    - _Requirements: 2.4_
  
  - [x] 12.2 Create tRPC integration template
    - Generate tRPC router configuration
    - Create client-side tRPC setup
    - Add example procedures (query, mutation)
    - Generate type-safe API client
    - _Requirements: 2.4, 7.3_
  
  - [x] 12.3 Create GraphQL integration template
    - Generate GraphQL schema
    - Create Apollo Client setup
    - Add example queries and mutations
    - Generate type definitions
    - _Requirements: 2.4_

- [x] 13. Add tooling and extras
  - [x] 13.1 Create GitHub Actions workflow
    - Generate CI/CD workflow file
    - Add build and test steps
    - Include deployment automation
    - Add environment variable configuration
    - _Requirements: 2.5_
  
  - [x] 13.2 Add Prettier and ESLint configuration
    - Generate .prettierrc with project standards
    - Create .eslintrc with recommended rules
    - Add format and lint scripts to package.json
    - _Requirements: 2.4_
  
  - [x] 13.3 Add Husky pre-commit hooks
    - Generate Husky configuration
    - Add pre-commit lint and format checks
    - Create commit message linting
    - _Requirements: 2.4_
  
  - [x] 13.4 Add Redis integration template
    - Generate Redis client setup
    - Create caching helper functions
    - Add connection configuration
    - _Requirements: 2.4_


- [x] 14. Implement styling system templates
  - [x] 14.1 Create Tailwind CSS setup
    - Generate tailwind.config.ts with theme
    - Create globals.css with base styles
    - Add Tailwind plugins configuration
    - _Requirements: 2.4, 8.3_
  
  - [x] 14.2 Add shadcn/ui component integration
    - Generate components.json configuration
    - Add commonly used shadcn components
    - Create component usage examples
    - _Requirements: 2.4_
  
  - [x] 14.3 Create CSS Modules template
    - Generate example module.css files
    - Add CSS Modules configuration
    - Create component examples using modules
    - _Requirements: 2.4_
  
  - [x] 14.4 Create Styled Components template
    - Generate styled-components configuration
    - Add theme provider setup
    - Create example styled components
    - _Requirements: 2.4_

- [x] 15. Add error handling and edge cases
  - [x] 15.1 Implement generation error handling
    - Add try-catch blocks for file operations
    - Create error logging system
    - Generate partial scaffold with error report on failure
    - _Requirements: 2.1, 2.3_
  
  - [x] 15.2 Add validation error handling
    - Prevent generation when errors exist
    - Allow generation with warnings
    - Display clear error messages to user
    - _Requirements: 1.3, 9.2_
  
  - [x] 15.3 Handle download failures
    - Implement automatic retry (max 3 attempts)
    - Add error messages for network issues
    - Create fallback download options
    - _Requirements: 2.3_

- [x] 16. Performance optimizations
  - [x] 16.1 Optimize validation performance
    - Add debouncing to validation checks
    - Cache validation results
    - Ensure <100ms response time
    - _Requirements: 5.1_


  - [x] 16.2 Optimize generation performance
    - Implement parallel file generation
    - Cache common templates in memory
    - Stream zip creation to avoid memory spikes
    - Ensure generation completes within 30 seconds
    - _Requirements: 2.6, 5.1_
  
  - [x] 16.3 Optimize bundle size
    - Configure tree-shaking in build
    - Add code splitting for routes
    - Optimize images and fonts
    - Ensure generated projects have <5MB bundles
    - _Requirements: 5.2_
  
  - [x] 16.4 Use Edge Functions for validation
    - Deploy validation endpoint as Edge Function
    - Optimize for <50ms response time
    - Add caching headers
    - _Requirements: 5.1_

- [x] 17. Cross-platform compatibility
  - [x] 17.1 Test generated scaffolds on macOS
    - Verify dependency installation
    - Test development server startup
    - Validate build process
    - _Requirements: 6.1_
  
  - [x] 17.2 Test generated scaffolds on Linux
    - Verify dependency installation
    - Test development server startup
    - Validate build process
    - _Requirements: 6.1_
  
  - [x] 17.3 Test generated scaffolds on Windows WSL
    - Verify dependency installation
    - Test development server startup
    - Validate build process
    - _Requirements: 6.1_
  
  - [x] 17.4 Ensure Node.js 20+ compatibility
    - Test with Node.js 20 LTS
    - Verify all dependencies support Node 20+
    - Update package.json engines field
    - _Requirements: 6.2_

- [x] 18. Browser compatibility testing
  - [x] 18.1 Test configuration UI in Chrome 120+
    - Verify all interactive elements work
    - Test form submission and validation
    - Check responsive layout
    - _Requirements: 6.3_


  - [x] 18.2 Test configuration UI in Firefox 120+
    - Verify all interactive elements work
    - Test form submission and validation
    - Check responsive layout
    - _Requirements: 6.3_
  
  - [x] 18.3 Test configuration UI in Safari 17+
    - Verify all interactive elements work
    - Test form submission and validation
    - Check responsive layout
    - _Requirements: 6.3_

- [x] 19. Responsive design implementation
  - [x] 19.1 Implement desktop layout (1024px+)
    - Create multi-column configuration layout
    - Add side-by-side preview panel
    - Optimize for large screens
    - _Requirements: 5.3_
  
  - [x] 19.2 Implement tablet layout (768px-1023px)
    - Create single-column configuration layout
    - Stack preview panel below configuration
    - Ensure touch-friendly controls
    - _Requirements: 5.3_
  
  - [ ] 19.3 Test responsive breakpoints
    - Verify layout transitions smoothly
    - Test all interactive elements at each breakpoint
    - Ensure readability at all sizes
    - _Requirements: 5.3_

- [x] 20. Security implementation
  - [x] 20.1 Implement API key protection
    - Ensure no real API keys in generated code
    - Add .env.example with placeholders
    - Update .gitignore to exclude .env files
    - _Requirements: 2.4, 10.8_
  
  - [x] 20.2 Add authentication security defaults
    - Configure httpOnly cookies for NextAuth
    - Enable CSRF protection
    - Add secure session handling
    - _Requirements: 2.4_
  
  - [x] 20.3 Implement Docker security
    - Use non-root user in containers
    - Add multi-stage builds
    - Ensure no secrets in images
    - _Requirements: 2.5_


  - [x] 20.4 Lock dependency versions
    - Pin all dependencies to specific versions
    - Add security audit recommendations to README
    - Minimize dependency footprint
    - _Requirements: 2.4_

- [x] 21. Final integration and polish
  - [x] 21.1 Connect all components together
    - Wire configuration UI to validation engine
    - Connect validation to generation API
    - Link generation to download system
    - _Requirements: 1.1, 2.1, 2.3_
  
  - [x] 21.2 Add loading states and feedback
    - Implement loading spinners for async operations
    - Add success/error toast notifications
    - Create progress indicators
    - _Requirements: 2.2, 5.1_
  
  - [x] 21.3 Polish UI and UX
    - Refine spacing and typography
    - Add smooth transitions and animations
    - Ensure consistent styling across all pages
    - _Requirements: 5.1, 5.3_
  
  - [x] 21.4 Add accessibility features
    - Ensure keyboard navigation works
    - Add ARIA labels to interactive elements
    - Test with screen readers
    - Verify color contrast ratios
    - _Requirements: 5.3, 6.3_
  
  - [x] 21.5 Create comprehensive error messages
    - Write clear, actionable error messages
    - Add helpful suggestions for common issues
    - Include links to documentation where relevant
    - _Requirements: 9.2, 9.3, 10.7_

- [ ]* 22. Testing and quality assurance
  - [ ]* 22.1 Write unit tests for validation logic
    - Test each validation rule independently
    - Verify rule combinations work correctly
    - Test edge cases and boundary conditions
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 22.2 Write unit tests for documentation generation
    - Test README generation for different configs
    - Verify SETUP.md includes correct services
    - Test .env.example generation
    - _Requirements: 9.1, 10.1, 10.8_


  - [ ]* 22.3 Write integration tests for scaffold generation
    - Test full generation flow for common configs
    - Verify file structure is correct
    - Test that generated projects can be extracted
    - Verify dependencies install successfully
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [ ]* 22.4 Write end-to-end tests
    - Test complete user flow from config to download
    - Verify generated projects compile successfully
    - Test AI templates produce working endpoints
    - Verify deployment configs are valid
    - _Requirements: 2.1, 2.3, 3.5, 6.1_
  
  - [ ]* 22.5 Perform manual testing
    - Test all technology combinations
    - Verify documentation accuracy
    - Test on different browsers and devices
    - Validate generated projects work as expected
    - _Requirements: 5.3, 6.1, 6.3_


- [x] 23. GitHub Integration - OAuth Authentication
  - [x] 23.1 Set up GitHub OAuth App
    - Create GitHub OAuth application
    - Configure callback URLs
    - Store client ID and secret in environment variables
    - _Requirements: 11.2, 11.14_
  
  - [x] 23.2 Implement OAuth service
    - Create GitHub OAuth service with initiate, callback, and token refresh methods
    - Implement secure token storage using HTTP-only cookies
    - Add token encryption for storage
    - Implement state parameter for CSRF protection
    - _Requirements: 11.2, 11.3, 11.14_
  
  - [x] 23.3 Create authentication API endpoints
    - Implement `/api/github/auth/initiate` endpoint
    - Implement `/api/github/auth/callback` endpoint
    - Implement `/api/github/auth/status` endpoint
    - Implement `/api/github/auth/signout` endpoint
    - _Requirements: 11.2, 11.13_
  
  - [x] 23.4 Build GitHub authentication UI components
    - Create GitHubAuthButton component with sign-in functionality
    - Display authenticated user info (username, avatar)
    - Add sign-out button for authenticated users
    - Handle authentication errors gracefully
    - _Requirements: 11.2, 11.13_

- [ ] 24. GitHub Integration - Repository Operations
  - [x] 24.1 Implement GitHub repository service
    - Create service for repository creation via GitHub API
    - Implement repository name availability checking
    - Add repository name validation (GitHub naming rules)
    - Handle GitHub API errors and rate limits
    - _Requirements: 11.5, 11.6, 11.8_
  
  - [x] 24.2 Implement Git operations service
    - Create service for git tree creation
    - Implement blob creation for file contents
    - Add commit creation functionality
    - Implement push to remote repository
    - _Requirements: 11.9_
  
  - [x] 24.3 Create repository creation API endpoint
    - Implement `/api/github/repos/check-availability` endpoint
    - Implement `/api/github/repos/create` endpoint
    - Integrate with scaffold generator
    - Add progress tracking for repository creation
    - Handle errors with fallback to ZIP download
    - _Requirements: 11.5, 11.6, 11.7, 11.8, 11.12_
  
  - [x] 24.4 Build repository creation UI components
    - Create CreateRepoModal component with form
    - Add real-time name availability checking
    - Implement repository visibility toggle (public/private)
    - Add description field with character counter
    - Show validation errors inline
    - _Requirements: 11.4, 11.5, 11.6, 11.15_

- [x] 25. GitHub Integration - User Experience
  - [x] 25.1 Create GitHub push progress component
    - Build GitHubPushProgress component
    - Display progress steps: Creating → Initializing → Committing → Pushing
    - Show success state with repository link
    - Handle errors with clear messages
    - Offer ZIP download fallback on failure
    - _Requirements: 11.7, 11.8, 11.12_
  
  - [x] 25.2 Update generation completion UI
    - Add "Create GitHub Repository" button alongside "Download ZIP"
    - Show both options after successful generation
    - Disable GitHub option if not authenticated
    - Add tooltips explaining each option
    - _Requirements: 11.1_
  
  - [x] 25.3 Implement rate limiting
    - Add rate limiting middleware for repository creation
    - Limit to 5 repositories per user per hour
    - Display cooldown timer when limit reached
    - Show clear error message with time remaining
    - _Requirements: 11.11_
  
  - [x] 25.4 Add comprehensive error handling
    - Handle OAuth failures with retry option
    - Handle repository name conflicts with suggestions
    - Handle push failures with ZIP fallback
    - Handle rate limits with clear messaging
    - Handle network timeouts with retry logic
    - Handle invalid tokens with re-authentication
    - _Requirements: 11.6, 11.12_

- [x] 26. GitHub Integration - Documentation and Polish
  - [x] 26.1 Update generated README for GitHub repos
    - Add section about repository being created via Cauldron2Code
    - Include link back to Cauldron2Code
    - Add badge showing technology stack
    - Update deployment instructions for GitHub-connected repos
    - _Requirements: 11.10_
  
  - [x] 26.2 Create initial commit message
    - Generate descriptive commit message
    - Include technology stack summary
    - Add "Generated by Cauldron2Code" attribution
    - List key features included
    - _Requirements: 11.9_
  
  - [x] 26.3 Add .gitignore to generated scaffolds
    - Include comprehensive .gitignore file
    - Cover all selected technologies
    - Exclude environment files
    - Exclude build artifacts and dependencies
    - _Requirements: 11.9_
  
  - [x] 26.4 Polish GitHub integration UI
    - Add smooth transitions for auth flow
    - Implement loading states for all async operations
    - Add success animations for repository creation
    - Ensure consistent styling with rest of app
    - Test accessibility of all GitHub components
    - _Requirements: 11.1, 11.7, 11.8_

- [ ]* 27. GitHub Integration - Testing
  - [ ]* 27.1 Write unit tests for OAuth service
    - Test token encryption/decryption
    - Test state parameter generation and validation
    - Test token refresh logic
    - Test error handling
    - _Requirements: 11.2, 11.14_
  
  - [ ]* 27.2 Write unit tests for repository service
    - Test repository name validation
    - Test availability checking
    - Test repository creation payload
    - Test error response handling
    - _Requirements: 11.5, 11.6_
  
  - [ ]* 27.3 Write integration tests for GitHub flow
    - Test complete OAuth flow (mock GitHub API)
    - Test repository creation and push
    - Test error scenarios and fallbacks
    - Test rate limiting
    - _Requirements: 11.2, 11.8, 11.12_
  
  - [ ]* 27.4 Perform manual testing
    - Test with real GitHub account
    - Create public and private repositories
    - Verify all files are pushed correctly
    - Test error scenarios (name conflicts, rate limits)
    - Verify security (token handling, CSRF protection)
    - _Requirements: 11.1, 11.8, 11.9, 11.14, 11.15_
