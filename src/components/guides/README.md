# Deployment Guides UI Components

This directory contains the UI components for the deployment guides feature (Task 8).

## Components

### PlatformCard
A card component that displays information about a deployment platform.

**Features:**
- Platform logo, name, and description
- "Best for" tags showing ideal use cases
- Key features display (free tier, database support, custom domains, build minutes)
- Ease of use badge (beginner/intermediate/advanced)
- Recommended badge for platforms that match the user's project
- Hover effects and accessibility support

**Props:**
- `platform: Platform` - The platform data to display
- `onClick: () => void` - Handler for when the card is clicked
- `isRecommended?: boolean` - Whether to show the recommended badge

### PlatformSelector
The main platform selection interface that displays all available platforms.

**Features:**
- Grid layout of platform cards
- Separate sections for recommended and all platforms
- "Compare All Platforms" button
- Help text explaining each platform's strengths
- Responsive design (mobile, tablet, desktop)

**Props:**
- `onSelectPlatform: (platform: Platform) => void` - Handler for platform selection
- `scaffoldConfig?: ScaffoldConfig` - Optional config to determine recommendations
- `className?: string` - Additional CSS classes

### PlatformComparison
A detailed comparison table/view for all platforms.

**Features:**
- Desktop: Full comparison table with all features side-by-side
- Mobile/Tablet: Individual comparison cards
- Compares: free tier, build minutes, database support, custom domains, ease of use, best for tags
- Links to pricing and documentation
- Recommended badges based on scaffold config
- Select buttons for each platform

**Props:**
- `onBack: () => void` - Handler to return to platform selector
- `onSelectPlatform: (platform: Platform) => void` - Handler for platform selection
- `scaffoldConfig?: ScaffoldConfig` - Optional config to determine recommendations

## Usage Example

```tsx
import { PlatformSelector } from '@/components/guides';
import type { Platform } from '@/types/deployment-guides';

function MyPage() {
  const handleSelectPlatform = (platform: Platform) => {
    // Navigate to guide page or handle selection
    console.log('Selected:', platform.name);
  };

  return (
    <PlatformSelector 
      onSelectPlatform={handleSelectPlatform}
      scaffoldConfig={myConfig} // optional
    />
  );
}
```

## Test Page

A test page is available at `/guides` to preview the platform selector UI.

## Requirements Satisfied

- ✅ 1.2: Display platform selector with all platforms
- ✅ 1.3: Show platform logo, name, and description
- ✅ 1.4: Handle platform selection
- ✅ 14.1: Provide "Compare Platforms" option
- ✅ 14.2: Display comparison table with key features
- ✅ 14.3: Compare pricing, build times, database support, custom domains, ease of use
- ✅ 14.4: Show "Recommended" badges based on scaffold config
- ✅ 14.5: Include links to pricing pages
- ✅ 14.6: Include links to documentation

### CommandBlock
Displays a terminal command with copy functionality and placeholder highlighting.

**Features:**
- Syntax highlighting for bash/powershell/cmd
- One-click copy to clipboard with confirmation
- Placeholder highlighting and replacement instructions
- Command description display
- Pre-filled actual values when available

**Props:**
- `command: CommandSnippet` - The command data to display

### CodeBlock
Displays code snippets with syntax highlighting and copy functionality.

**Features:**
- Syntax highlighting for multiple languages
- Copy to clipboard button
- Optional filename display
- Description text
- Responsive design

**Props:**
- `snippet: CodeSnippet` - The code snippet data to display

### GuideStep
An individual step in the deployment guide with expand/collapse functionality.

**Features:**
- Checkbox to mark step complete
- Expand/collapse with state persistence
- Displays commands, code snippets, substeps
- Shows warnings, notes, and external links
- Quick-start vs detailed view modes
- Progress tracking

**Props:**
- `step: DeploymentStep` - The step data
- `completed: boolean` - Whether the step is marked complete
- `viewMode: 'quick-start' | 'detailed'` - Display mode
- `onToggleComplete: () => void` - Handler for checkbox toggle
- `guideId: string` - Guide ID for state persistence

### GuideProgress
A progress indicator showing completion status.

**Features:**
- Visual progress bar
- Percentage complete
- "X of Y steps complete" text
- Responsive design

**Props:**
- `completed: number` - Number of completed steps
- `total: number` - Total number of steps

### ViewModeToggle
Toggle between quick-start and detailed guide views.

**Features:**
- Two-state toggle (quick-start/detailed)
- Visual indication of current mode
- Persists selection
- Accessible keyboard navigation

**Props:**
- `mode: 'quick-start' | 'detailed'` - Current view mode
- `onChange: (mode: 'quick-start' | 'detailed') => void` - Handler for mode change

### ChecklistSection
Post-deployment checklist with completion tracking.

**Features:**
- Displays required and optional checklist items
- Checkbox completion tracking
- Shows commands using CommandBlock
- External links for additional resources
- Success message when all required items complete
- Progress statistics (required vs optional)
- Persistent completion state

**Props:**
- `items: ChecklistItem[]` - Array of checklist items
- `completedItems: string[]` - Array of completed item IDs
- `onToggleItem: (itemId: string) => void` - Handler for checkbox toggle

### TroubleshootingSection
Common issues and solutions with expandable sections.

**Features:**
- Expandable issue sections
- Displays symptoms, causes, and solutions
- Related documentation links
- Platform status page link
- Community resource links
- Organized, scannable layout

**Props:**
- `troubleshooting: TroubleshootingSection` - Troubleshooting data including common issues, platform status URL, and community links

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Semantic HTML
- Screen reader friendly content
