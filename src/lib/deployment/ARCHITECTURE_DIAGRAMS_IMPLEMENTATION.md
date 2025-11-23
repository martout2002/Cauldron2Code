# Architecture Diagrams Implementation

## Overview

The Architecture Diagrams feature provides visual representations of deployment workflows and system architectures using Mermaid diagrams. These diagrams help users understand complex deployment processes, service relationships, and troubleshooting paths.

## Implementation Details

### Files Created

1. **src/lib/deployment/architecture-diagrams.ts**
   - Core diagram generation functions
   - Provides Mermaid diagram definitions for various contexts
   - Exports functions for different diagram types

2. **src/components/guides/ArchitectureDiagram.tsx**
   - React component for rendering diagrams
   - Includes expand/collapse functionality
   - Supports fullscreen viewing
   - Provides accessibility features

### Diagram Types

The system generates the following diagram types based on deployment context:

#### 1. Deployment Workflow Diagram
Shows the complete deployment process from code push to production, including:
- Git repository integration
- Platform build process
- Database connections (if applicable)
- Auth provider configuration (if applicable)
- Application deployment

#### 2. Monorepo Architecture Diagram
Visualizes multiple services in a monorepo:
- Service relationships
- Deployment targets
- External service connections

#### 3. Full-Stack Architecture Diagram
Shows application architecture for standard projects:
- Frontend and backend components
- Database connections
- Auth provider integration
- AI API connections
- Redis cache (if applicable)

#### 4. Database Setup Diagram
Illustrates database provisioning workflow:
- Platform-native database provisioning
- External database service setup
- Connection string configuration
- Migration execution

#### 5. Environment Variables Configuration Diagram
Shows the process of configuring environment variables:
- Variable identification
- CLI vs Dashboard configuration methods
- Verification and redeployment

#### 6. OAuth Callback Configuration Diagram
Guides through OAuth setup:
- Application deployment
- Production URL retrieval
- Callback URL configuration
- Testing OAuth flow

#### 7. Troubleshooting Decision Tree
Provides a visual troubleshooting guide:
- Common issue types
- Diagnostic steps
- Resolution paths
- Retry workflow

#### 8. CI/CD Pipeline Diagram
Shows continuous integration and deployment:
- Development workflow
- GitHub Actions integration
- Test and build checks
- Preview and production deployments

## Usage

### In Guide Generator

The `GuideGenerator` automatically generates appropriate diagrams based on the deployment context:

```typescript
const guide = guideGenerator.generateGuide(platform, scaffoldConfig);
// guide.diagrams contains all relevant diagrams
```

### In DeploymentGuide Component

Diagrams are rendered in the guide using the `DiagramSection` component:

```tsx
{guide.diagrams && guide.diagrams.length > 0 && (
  <DiagramSection
    diagrams={guide.diagrams}
    title="Architecture Overview"
    description="Visual diagrams to help you understand the deployment process."
  />
)}
```

### Standalone Usage

Individual diagrams can be generated and used independently:

```typescript
import { getDeploymentWorkflowDiagram } from '@/lib/deployment/architecture-diagrams';

const diagram = getDeploymentWorkflowDiagram(platform, hasDatabase, hasAuth);
```

## Accessibility Features

### Screen Reader Support
- All diagrams include descriptive alt text
- Diagram descriptions are provided in `sr-only` elements
- Buttons have proper ARIA labels

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Expand/collapse buttons support Enter and Space keys
- Fullscreen mode can be toggled with keyboard

### Visual Accessibility
- High contrast colors for diagram elements
- Clear visual hierarchy
- Responsive design for different screen sizes

## Mermaid Diagram Format

All diagrams are provided as Mermaid markdown code blocks:

```
```mermaid
graph TB
    start[Start] --> end[End]
```
```

This format allows for:
- Easy rendering with Mermaid.js
- Export to markdown documentation
- Version control friendly text format
- Future enhancement with interactive rendering

## Future Enhancements

### Planned Features
1. **Interactive Mermaid Rendering**
   - Add Mermaid.js library for live diagram rendering
   - Enable clickable nodes for navigation
   - Support diagram zooming and panning

2. **Diagram Customization**
   - Allow users to customize diagram colors
   - Support light/dark mode themes
   - Enable diagram export as SVG/PNG

3. **Additional Diagram Types**
   - Security architecture diagrams
   - Performance optimization workflows
   - Cost estimation diagrams
   - Scaling architecture diagrams

4. **Diagram Annotations**
   - Add tooltips to diagram nodes
   - Include timing estimates on workflow steps
   - Show cost implications on architecture diagrams

## Requirements Satisfied

- **Requirement 12.2**: Create deployment workflow diagram for complex setups ✓
- **Requirement 12.3**: Create service architecture diagram for monorepos ✓
- **Requirement 12.4**: Add alt text for accessibility ✓

## Testing

### Manual Testing
1. Generate guides for different scaffold configurations
2. Verify appropriate diagrams are included
3. Test expand/collapse functionality
4. Test fullscreen mode
5. Verify accessibility with keyboard navigation
6. Test with screen readers

### Integration Testing
- Verify diagrams are generated for all platform types
- Test with monorepo configurations
- Test with various database and auth combinations
- Verify diagram content matches deployment context

## Notes

- Diagrams are generated server-side (or client-side) as text
- No external API calls required
- Diagrams are included in guide exports
- Mermaid syntax is well-documented and maintainable
- Future migration to live rendering is straightforward

