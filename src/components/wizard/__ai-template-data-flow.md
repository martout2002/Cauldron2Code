# AI Template Data Flow Documentation

## Overview
This document explains how AI template data flows through the wizard system, from step configuration to rendered tooltips.

## Data Flow Diagram

```
wizard-steps.ts (Step Configuration)
         ↓
    StepOption with extended properties
    {
      value: 'chatbot',
      label: 'AI Chatbot',
      icon: '/icons/ai/chatbot.svg',
      description: 'Conversational AI...',
      features: ['...'],
      generatedFiles: ['...']
    }
         ↓
WizardStep Component (Step Renderer)
         ↓
useCompatibility Hook (Compatibility Check)
         ↓
OptionWithCompatibility (Enhanced with disabled state)
    {
      ...StepOption,
      isDisabled: false,
      incompatibilityReason?: string
    }
         ↓
OptionGrid Component (Render Options)
         ↓
Tooltip Rendering (Show extended details)
    - Description
    - Features list (if present)
    - Generated files list (if present)
```

## Step-by-Step Flow

### 1. Step Configuration (`wizard-steps.ts`)
```typescript
// Define AI template step with extended properties
{
  id: 'ai-templates',
  title: 'Enchant with AI Magic',
  type: 'option-grid',
  field: 'aiTemplates',
  multiSelect: true,
  options: [
    {
      value: 'chatbot',
      label: 'AI Chatbot',
      icon: '/icons/ai/chatbot.svg',
      description: 'Conversational AI with streaming responses',
      features: [
        'Real-time streaming responses',
        'Conversation history',
        'Markdown rendering',
        'Copy code blocks',
      ],
      generatedFiles: [
        'src/app/api/chat/route.ts',
        'src/app/chat/page.tsx',
      ],
    },
    // ... more options
  ],
}
```

### 2. WizardStep Component (`WizardStep.tsx`)
```typescript
// Render the step with compatibility checking
<OptionGrid
  options={getCompatibleOptions(step.id, step.options)}
  selected={currentValue}
  onSelect={handleUpdate}
  multiSelect={step.multiSelect}
  label={step.title}
/>
```

### 3. useCompatibility Hook (`useCompatibility.ts`)
```typescript
// Enhance options with compatibility information
const getCompatibleOptions = (stepId: string, options: StepOption[]) => {
  return options.map((option): OptionWithCompatibility => {
    const result = evaluateCompatibility(stepId, option.value, config);
    
    return {
      ...option,  // Preserves features and generatedFiles
      isDisabled: !result.isCompatible,
      incompatibilityReason: result.reason,
    };
  });
};
```

### 4. OptionGrid Component (`OptionGrid.tsx`)
```typescript
// Render tooltip with extended details
{shouldShowTooltip && (
  <div className="tooltip">
    {/* Description */}
    {option.description && <p>{option.description}</p>}
    
    {/* Features list (NEW) */}
    {option.features && (
      <div>
        <p>Features:</p>
        <ul>
          {option.features.map(feature => <li>{feature}</li>)}
        </ul>
      </div>
    )}
    
    {/* Generated files list (NEW) */}
    {option.generatedFiles && (
      <div>
        <p>Generated Files:</p>
        <ul>
          {option.generatedFiles.map(file => <li>{file}</li>)}
        </ul>
      </div>
    )}
  </div>
)}
```

## Type Definitions

### StepOption (Base Type)
```typescript
interface StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  features?: string[];        // NEW for AI templates
  generatedFiles?: string[];  // NEW for AI templates
}
```

### OptionWithCompatibility (Enhanced Type)
```typescript
interface OptionWithCompatibility extends StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  features?: string[];        // Inherited from StepOption
  generatedFiles?: string[];  // Inherited from StepOption
  isDisabled: boolean;        // Added by compatibility check
  incompatibilityReason?: string;  // Added by compatibility check
}
```

### Option (OptionGrid Internal Type)
```typescript
interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  isDisabled?: boolean;
  incompatibilityReason?: string;
  features?: string[];        // NEW for AI templates
  generatedFiles?: string[];  // NEW for AI templates
}
```

## Key Design Decisions

### 1. Property Preservation
The spread operator (`...option`) is used throughout to ensure all properties, including the new `features` and `generatedFiles`, are preserved as data flows through the system.

### 2. Conditional Rendering
Tooltips only show features and generated files sections if those properties exist, maintaining backward compatibility with options that don't have these properties.

### 3. Type Safety
All interfaces are properly typed to ensure TypeScript catches any missing or incorrect properties at compile time.

### 4. Separation of Concerns
- **wizard-steps.ts**: Defines step configuration and option data
- **useCompatibility.ts**: Handles compatibility logic
- **OptionGrid.tsx**: Handles rendering and user interaction
- **WizardStep.tsx**: Orchestrates the flow

## Example: Complete Flow for Chatbot Template

1. **Configuration** (wizard-steps.ts)
   ```typescript
   {
     value: 'chatbot',
     features: ['Real-time streaming', '...'],
     generatedFiles: ['src/app/api/chat/route.ts', '...']
   }
   ```

2. **Compatibility Check** (useCompatibility.ts)
   ```typescript
   {
     value: 'chatbot',
     features: ['Real-time streaming', '...'],
     generatedFiles: ['src/app/api/chat/route.ts', '...'],
     isDisabled: false  // Added
   }
   ```

3. **Rendering** (OptionGrid.tsx)
   ```
   Tooltip shows:
   - Description: "Conversational AI with streaming responses"
   - Features: 4 items
   - Generated Files: 2 items
   ```

## Testing the Flow

### Manual Test
1. Navigate to wizard step 9 (AI Templates)
2. Hover over "AI Chatbot" option
3. Verify tooltip shows:
   - Description
   - Features section with 4 items
   - Generated Files section with 2 items

### Programmatic Test
```typescript
import { getWizardSteps } from '@/lib/wizard/wizard-steps';
import { useCompatibility } from '@/lib/wizard/useCompatibility';

// Get AI template step
const steps = getWizardSteps();
const aiStep = steps.find(s => s.id === 'ai-templates');

// Get compatible options
const { getCompatibleOptions } = useCompatibility();
const options = getCompatibleOptions('ai-templates', aiStep.options);

// Verify chatbot option has extended properties
const chatbot = options.find(o => o.value === 'chatbot');
console.assert(chatbot.features.length === 4);
console.assert(chatbot.generatedFiles.length === 2);
```

## Backward Compatibility

### Options Without Extended Properties
Options that don't have `features` or `generatedFiles` (like framework options) will continue to work as before:

```typescript
{
  value: 'nextjs',
  label: 'Next.js',
  description: 'React framework with SSR'
  // No features or generatedFiles
}
```

Tooltip will only show the description, maintaining the original behavior.

### Migration Path
No migration needed! The new properties are optional, so existing options continue to work without modification.

## Performance Considerations

### Tooltip Rendering
- Tooltips are only rendered when `shouldShowTooltip` is true
- No performance impact when not hovering
- Debouncing prevents excessive re-renders

### Data Flow
- Options are memoized in useCompatibility hook
- Spread operator is efficient for small objects
- No deep cloning needed

## Future Enhancements

### Potential Improvements
1. **Lazy Loading**: Load extended details only when hovering
2. **Caching**: Cache tooltip content for frequently hovered options
3. **Virtualization**: For steps with many options (not needed for AI templates)
4. **Rich Content**: Support for images, links, or formatted text in tooltips

### Extensibility
The current design makes it easy to add more properties in the future:
```typescript
interface StepOption {
  // ... existing properties
  features?: string[];
  generatedFiles?: string[];
  // Future additions:
  dependencies?: string[];
  documentation?: string;
  examples?: string[];
}
```

## Conclusion
The data flow is clean, type-safe, and maintainable. Extended properties flow seamlessly from configuration to rendering, with proper preservation at each step. The design is backward compatible and easily extensible for future enhancements.
