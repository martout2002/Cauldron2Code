# Design Document: AI Template Integration for Pixel Art Wizard

## Overview

This design integrates AI template selection into the new PixelArtWizard component. The existing AI template infrastructure (AI_TEMPLATES constant, AITemplateCard component, AI provider metadata) will be adapted to work within the wizard's step-based flow. The integration adds two new wizard steps: one for selecting AI templates (multi-select) and one for choosing an AI provider (conditional, only shown if templates are selected).

The design maintains consistency with the pixel art wizard's visual style, animations, and state management patterns while enabling users to configure AI-powered features as part of their project scaffold.

## Architecture

### Component Structure

```
PixelArtWizard (existing)
├── WizardStep (existing)
│   ├── OptionGrid (existing) - will be enhanced for AI templates
│   └── ... other step types
├── NavigationControls (existing)
└── ... other wizard components

New/Modified:
- wizard-steps.ts: Add AI template and AI provider steps
- ScaffoldConfig: Already has aiTemplate and aiProvider fields
- wizard-validation.ts: Add validation for AI selections
- compatibility-rules.ts: Add AI template compatibility rules
```

### Data Flow

1. User selects AI templates in Step 9 (new multi-select option grid)
2. Selection stored in `config.aiTemplate` (will be changed to array)
3. If templates selected, Step 10 (AI provider) is shown
4. Provider selection stored in `config.aiProvider`
5. Configuration persists to localStorage via Zustand
6. Validation ensures provider is selected if templates are chosen

## Components and Interfaces

### Modified Types

```typescript
// src/types/index.ts - Update ScaffoldConfig
export interface ScaffoldConfig {
  // ... existing fields
  
  // AI Templates - change from single to array
  aiTemplates: Array<'chatbot' | 'document-analyzer' | 'semantic-search' | 'code-assistant' | 'image-generator'>;
  aiProvider?: 'anthropic' | 'openai' | 'aws-bedrock' | 'gemini';
  
  // ... rest of fields
}
```

### New Wizard Steps

```typescript
// src/lib/wizard/wizard-steps.ts - Add two new steps

// Step 9: AI Templates (multi-select)
{
  id: 'ai-templates',
  title: 'Enchant with AI Magic',
  subtitle: 'Add intelligent powers to your creation',
  type: 'option-grid',
  field: 'aiTemplates',
  multiSelect: true,
  columns: 3,
  options: [
    {
      value: 'chatbot',
      label: 'AI Chatbot',
      icon: '/icons/ai/chatbot.svg', // Will use lucide-react icons
      description: 'Conversational AI with streaming'
    },
    // ... other AI templates
  ]
}

// Step 10: AI Provider (conditional)
{
  id: 'ai-provider',
  title: 'Choose your AI Oracle',
  subtitle: 'Select the source of your AI wisdom',
  type: 'option-grid',
  field: 'aiProvider',
  columns: 2,
  options: [
    {
      value: 'anthropic',
      label: 'Anthropic Claude',
      icon: '/icons/ai/anthropic.svg',
      description: 'Claude 3.5 Sonnet and other models'
    },
    // ... other providers
  ],
  conditional: (config) => config.aiTemplates.length > 0
}
```

### Validation Rules

```typescript
// src/lib/wizard/wizard-validation.ts - Add AI validation

function validateAITemplateStep(config: ScaffoldConfig): ValidationResult {
  // AI templates are optional, so no validation needed
  return { isValid: true };
}

function validateAIProviderStep(config: ScaffoldConfig): ValidationResult {
  // If templates selected, provider is required
  if (config.aiTemplates.length > 0 && !config.aiProvider) {
    return {
      isValid: false,
      error: 'Please select an AI provider for your templates'
    };
  }
  return { isValid: true };
}
```

### Compatibility Rules

```typescript
// src/lib/wizard/compatibility-rules.ts - Add AI compatibility

// AI templates require Next.js or monorepo
function isAITemplateCompatible(config: ScaffoldConfig): boolean {
  return config.frontendFramework === 'nextjs' || 
         config.projectStructure === 'fullstack-monorepo';
}

// Filter AI provider options based on selected templates
function getCompatibleAIProviders(
  selectedTemplates: string[]
): AIProvider[] {
  // All templates support all providers currently
  // But this allows future filtering
  return ['anthropic', 'openai', 'aws-bedrock', 'gemini'];
}
```

## Data Models

### Configuration State

The ScaffoldConfig type will be updated to use an array for AI templates:

```typescript
interface ScaffoldConfig {
  // ... existing fields
  aiTemplates: string[]; // Changed from aiTemplate?: string
  aiProvider?: 'anthropic' | 'openai' | 'aws-bedrock' | 'gemini';
}
```

Default configuration:
```typescript
const defaultConfig: ScaffoldConfig = {
  // ... existing defaults
  aiTemplates: [], // Empty array by default
  aiProvider: undefined, // No default provider
};
```

### Step Configuration

```typescript
interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  type: StepType;
  field: keyof ScaffoldConfig;
  options?: StepOption[];
  multiSelect?: boolean;
  columns?: number;
  conditional?: (config: ScaffoldConfig) => boolean; // New: conditional rendering
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: AI template options display required information
*For any* AI template option rendered in the wizard, the output should contain the template's title, icon, description, and list of supported providers.
**Validates: Requirements 1.2**

### Property 2: AI template selection updates configuration
*For any* AI template, when selected, that template should appear in the config.aiTemplates array.
**Validates: Requirements 1.3**

### Property 3: Multiple AI template selections are stored
*For any* set of AI templates, when all are selected, all should be present in the config.aiTemplates array.
**Validates: Requirements 1.4**

### Property 4: Incompatible frameworks disable AI templates
*For any* framework selection that is incompatible with AI templates (not Next.js or monorepo), all AI template options should be disabled.
**Validates: Requirements 1.5**

### Property 5: AI provider step shows when templates selected
*For any* configuration with at least one AI template in the aiTemplates array, the AI provider selection step should be rendered.
**Validates: Requirements 2.1**

### Property 6: Only compatible providers are shown
*For any* set of selected AI templates, only AI providers that support all selected templates should be displayed as options.
**Validates: Requirements 2.2**

### Property 7: AI provider selection updates configuration
*For any* AI provider, when selected, config.aiProvider should be set to that provider's ID.
**Validates: Requirements 2.3**

### Property 8: AI provider step skipped when no templates
*For any* configuration with an empty aiTemplates array, the AI provider selection step should not be rendered.
**Validates: Requirements 2.4**

### Property 9: Validation fails without provider when templates selected
*For any* configuration with non-empty aiTemplates array and undefined aiProvider, validation should fail with an appropriate error message.
**Validates: Requirements 4.1**

### Property 10: Incompatible selections are prevented
*For any* framework/AI template combination where the framework doesn't support AI templates, the template selection should be disabled or blocked.
**Validates: Requirements 4.2**

### Property 11: Framework changes clear incompatible templates
*For any* configuration with AI templates selected, when the framework is changed to an incompatible option, the aiTemplates array should be cleared.
**Validates: Requirements 4.3**

### Property 12: Validation errors are announced to screen readers
*For any* validation error that occurs, an ARIA live region should be updated with the error message for screen reader accessibility.
**Validates: Requirements 4.4**

### Property 13: AI template persistence round-trip
*For any* set of AI templates, selecting them and then reloading the page should restore the same selections from localStorage.
**Validates: Requirements 5.1, 5.2**

### Property 14: AI provider persistence round-trip
*For any* AI provider, selecting it and then reloading the page should restore the same provider selection from localStorage.
**Validates: Requirements 5.3, 5.4**



## Error Handling

### Validation Errors

1. **Missing Provider Error**: When AI templates are selected but no provider is chosen
   - Error message: "Please select an AI provider for your templates"
   - Displayed in validation alert component
   - Prevents navigation to next step

2. **Incompatible Framework Error**: When user tries to select AI templates with incompatible framework
   - Options are disabled with explanation text
   - Message: "AI templates require Next.js or monorepo structure"
   - No error thrown, just prevention

### State Consistency

1. **Framework Change Cleanup**: When framework changes to incompatible option
   - Automatically clear aiTemplates array
   - Clear aiProvider if set
   - No error shown, silent cleanup

2. **Persistence Failures**: If localStorage is unavailable
   - Gracefully degrade to in-memory state only
   - Log warning to console
   - Continue wizard functionality

### Edge Cases

1. **Empty Template Selection**: User can proceed with no AI templates selected
   - This is valid - AI templates are optional
   - Provider step is skipped automatically

2. **All Templates Incompatible**: If framework doesn't support any AI templates
   - All options shown as disabled
   - Explanation text displayed
   - User can still proceed (with no selections)

## Testing Strategy

### Unit Tests

Unit tests will verify specific behaviors and edge cases:

1. **Step Configuration Tests**
   - Verify AI template step has correct configuration
   - Verify AI provider step has correct configuration
   - Test conditional rendering logic for provider step

2. **Validation Tests**
   - Test validation passes with no templates selected
   - Test validation passes with templates and provider
   - Test validation fails with templates but no provider
   - Test validation error messages are correct

3. **Compatibility Tests**
   - Test AI templates disabled for non-Next.js frameworks
   - Test AI templates enabled for Next.js
   - Test AI templates enabled for monorepo structure
   - Test provider filtering based on selected templates

4. **State Management Tests**
   - Test template selection updates config
   - Test provider selection updates config
   - Test framework change clears incompatible templates
   - Test multi-select behavior for templates

### Property-Based Tests

Property-based tests will verify universal properties across all inputs using fast-check library. Each test will run a minimum of 100 iterations.

1. **Property 2: AI template selection updates configuration**
   - Generate random AI template IDs
   - Select each template
   - Verify it appears in config.aiTemplates

2. **Property 3: Multiple AI template selections are stored**
   - Generate random sets of AI template IDs
   - Select all templates in the set
   - Verify all appear in config.aiTemplates

3. **Property 4: Incompatible frameworks disable AI templates**
   - Generate random framework configurations
   - For incompatible frameworks, verify templates are disabled
   - For compatible frameworks, verify templates are enabled

4. **Property 5: AI provider step shows when templates selected**
   - Generate random non-empty template arrays
   - Verify provider step is rendered
   - Generate empty template arrays
   - Verify provider step is not rendered

5. **Property 7: AI provider selection updates configuration**
   - Generate random AI provider IDs
   - Select each provider
   - Verify config.aiProvider is set correctly

6. **Property 9: Validation fails without provider when templates selected**
   - Generate random non-empty template arrays
   - Set aiProvider to undefined
   - Verify validation fails

7. **Property 11: Framework changes clear incompatible templates**
   - Generate random template selections
   - Change framework to incompatible option
   - Verify aiTemplates is cleared

8. **Property 13: AI template persistence round-trip**
   - Generate random template selections
   - Save to localStorage
   - Clear state
   - Restore from localStorage
   - Verify selections match

9. **Property 14: AI provider persistence round-trip**
   - Generate random provider selections
   - Save to localStorage
   - Clear state
   - Restore from localStorage
   - Verify selection matches

### Integration Tests

Integration tests will verify the complete user flow:

1. **Complete AI Template Flow**
   - Navigate to AI template step
   - Select multiple templates
   - Verify provider step appears
   - Select provider
   - Verify configuration is complete
   - Verify persistence works

2. **Framework Compatibility Flow**
   - Select Next.js framework
   - Navigate to AI template step
   - Verify templates are enabled
   - Select templates
   - Change framework to React (non-Next.js)
   - Verify templates are cleared

3. **Skip Provider Flow**
   - Navigate to AI template step
   - Don't select any templates
   - Proceed to next step
   - Verify provider step is skipped

### Accessibility Tests

1. **Keyboard Navigation**
   - Test arrow key navigation through AI template options
   - Test Enter/Space key selection
   - Test Tab key navigation

2. **Screen Reader Announcements**
   - Test ARIA labels on AI template options
   - Test validation error announcements
   - Test step change announcements

3. **Focus Management**
   - Test focus moves to first option when step loads
   - Test focus is maintained during selection
   - Test focus returns correctly when navigating back

## Implementation Notes

### Migration Strategy

1. **Update ScaffoldConfig Type**
   - Change `aiTemplate?: string` to `aiTemplates: string[]`
   - Update default config to use empty array
   - Update Zod schema for validation

2. **Add Wizard Steps**
   - Add AI template step (index 8) to wizard-steps.ts
   - Add AI provider step (index 9) to wizard-steps.ts
   - Update TOTAL_WIZARD_STEPS constant to 10

3. **Enhance OptionGrid Component**
   - Already supports multi-select via multiSelect prop
   - Verify it works correctly with AI template options
   - Add disabled state styling if needed

4. **Add Conditional Step Logic**
   - Add conditional rendering support to WizardStep component
   - Check conditional function before rendering step
   - Skip conditional steps in navigation

5. **Update Validation**
   - Add AI template validation to wizard-validation.ts
   - Add AI provider validation to wizard-validation.ts
   - Ensure validation runs on step change

6. **Add Compatibility Rules**
   - Add AI template compatibility check to compatibility-rules.ts
   - Add provider filtering logic
   - Integrate with OptionGrid disabled state

### Performance Considerations

1. **Asset Preloading**
   - AI template icons should be preloaded with other wizard assets
   - Use existing asset-preloader.ts infrastructure

2. **State Updates**
   - Use Zustand's built-in optimization for state updates
   - Avoid unnecessary re-renders with proper memoization

3. **Conditional Rendering**
   - Provider step only renders when needed
   - Reduces unnecessary DOM operations

### Backward Compatibility

The existing generator code expects `aiTemplate` (singular) and `aiProvider` fields. To maintain compatibility:

1. **Config Transformation**
   - Add helper function to transform array to single value for generator
   - Use first selected template if multiple are selected
   - Or generate multiple AI features if generator supports it

2. **Migration Path**
   - Old configs with `aiTemplate` string will be migrated to `aiTemplates` array
   - Zustand persist middleware handles version migration

### Visual Design

The AI template step will follow the pixel art wizard's established patterns:

1. **Step Title**: "Enchant with AI Magic" (pixel font, large, white with shadow)
2. **Step Subtitle**: "Add intelligent powers to your creation" (pixel font, medium, gray)
3. **Option Cards**: Same style as other option grids
   - Pixel art borders
   - Hover effects with scale and glow
   - Selection checkmark animation
   - Disabled state with reduced opacity

4. **Icons**: Use lucide-react icons for AI templates
   - MessageSquare for chatbot
   - FileText for document analyzer
   - Search for semantic search
   - Code for code assistant
   - Image for image generator

5. **Provider Icons**: Use provider logos or lucide-react icons
   - Custom SVG logos for Anthropic, OpenAI, AWS, Google
   - Fallback to generic icons if logos unavailable
