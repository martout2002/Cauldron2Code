# Design Document

## Overview

This feature implements a compatibility validation system for the configuration wizard that prevents users from selecting incompatible technology combinations. The system evaluates compatibility rules based on prior selections and provides visual feedback through disabled states and explanatory tooltips.

The design follows a declarative approach where compatibility rules are defined separately from UI components, allowing for easy maintenance and extension. The system integrates seamlessly with the existing Zustand-based state management and React component architecture.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Configuration Wizard                     │
│                                                              │
│  ┌────────────────┐         ┌──────────────────────────┐   │
│  │  WizardStep    │────────▶│   OptionGrid Component   │   │
│  │  Component     │         │                          │   │
│  └────────────────┘         │  ┌────────────────────┐  │   │
│         │                   │  │  Option (enabled)  │  │   │
│         │                   │  └────────────────────┘  │   │
│         ▼                   │  ┌────────────────────┐  │   │
│  ┌────────────────┐         │  │ Option (disabled) │  │   │
│  │ Config Store   │         │  │  + Tooltip        │  │   │
│  │   (Zustand)    │         │  └────────────────────┘  │   │
│  └────────────────┘         └──────────────────────────┘   │
│         │                                                   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Compatibility Validation Engine             │   │
│  │                                                      │   │
│  │  ┌──────────────────┐    ┌────────────────────┐   │   │
│  │  │ Compatibility    │    │  Rule Evaluator    │   │   │
│  │  │ Rules Registry   │───▶│                    │   │   │
│  │  └──────────────────┘    └────────────────────┘   │   │
│  │                                  │                 │   │
│  │                                  ▼                 │   │
│  │                          ┌────────────────────┐   │   │
│  │                          │  Result Cache      │   │   │
│  │                          └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **OptionGrid Component**: Renders options and applies visual disabled states based on compatibility results
2. **Compatibility Rules Registry**: Centralized definition of all compatibility constraints
3. **Rule Evaluator**: Evaluates rules against current configuration state
4. **Result Cache**: Memoizes compatibility results for performance
5. **Config Store**: Provides current configuration state for rule evaluation

## Components and Interfaces

### Compatibility Rule Definition

```typescript
interface CompatibilityRule {
  id: string;
  description: string;
  
  // The step and option this rule applies to
  targetStep: string;
  targetOption: string;
  
  // Condition that determines if option should be disabled
  isIncompatible: (config: ScaffoldConfig) => boolean;
  
  // Message shown in tooltip when disabled
  getIncompatibilityMessage: (config: ScaffoldConfig) => string;
}
```

### Compatibility Result

```typescript
interface CompatibilityResult {
  isCompatible: boolean;
  reason?: string;
  conflictingField?: keyof ScaffoldConfig;
  conflictingValue?: string;
}
```

### Enhanced Option Interface

```typescript
interface OptionWithCompatibility extends StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  
  // Compatibility state
  isDisabled: boolean;
  incompatibilityReason?: string;
}
```

### Compatibility Hook

```typescript
interface UseCompatibilityResult {
  // Check if a specific option is compatible
  isOptionCompatible: (stepId: string, optionValue: string) => CompatibilityResult;
  
  // Get all compatible options for a step
  getCompatibleOptions: (stepId: string, options: StepOption[]) => OptionWithCompatibility[];
  
  // Check if current config has any incompatibilities
  hasIncompatibilities: () => boolean;
}
```

## Data Models

### Compatibility Rules Registry Structure

```typescript
const compatibilityRules: CompatibilityRule[] = [
  {
    id: 'backend-express-requires-non-nextjs-frontend',
    description: 'Express backend requires a non-Next.js frontend',
    targetStep: 'backend',
    targetOption: 'express',
    isIncompatible: (config) => config.frontendFramework === 'nextjs',
    getIncompatibilityMessage: (config) => 
      `Express cannot be used with Next.js. Next.js has its own API routes. Use "Next.js API" or select a different frontend.`
  },
  {
    id: 'backend-nextjs-api-requires-nextjs-frontend',
    description: 'Next.js API requires Next.js frontend',
    targetStep: 'backend',
    targetOption: 'nextjs-api',
    isIncompatible: (config) => config.frontendFramework !== 'nextjs',
    getIncompatibilityMessage: (config) => 
      `Next.js API routes require Next.js as the frontend framework. Currently selected: ${config.frontendFramework}`
  },
  // Additional rules...
];
```

### Configuration State Dependencies

The compatibility system depends on the following configuration fields:

- `frontendFramework`: Affects backend framework compatibility
- `backendFramework`: Affects database and auth compatibility
- `database`: Affects auth provider compatibility
- `projectStructure`: Affects extras compatibility

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Disabled options are unselectable

*For any* configuration state and any option that is marked as disabled due to incompatibility, attempting to select that option should not change the configuration state.

**Validates: Requirements 1.2, 4.3**

### Property 2: State changes trigger compatibility re-evaluation

*For any* configuration change that affects compatibility rules, all dependent options should have their disabled states updated to reflect the new compatibility results.

**Validates: Requirements 1.3, 5.5, 7.5**

### Property 3: Disabled options have consistent visual styling

*For any* set of disabled options in a step, all disabled options should have the same visual styling applied (reduced opacity, no hover effects, disabled cursor).

**Validates: Requirements 1.5**

### Property 4: Compatible configurations have no disabled options

*For any* configuration state where no compatibility rules are violated, all options in all steps should be in the enabled state.

**Validates: Requirements 1.4**

### Property 5: Disabled options display explanatory tooltips

*For any* disabled option, hovering over it should display a tooltip that contains both an explanation of the incompatibility and a reference to the conflicting option or configuration.

**Validates: Requirements 2.1, 2.2, 2.5**

### Property 6: Tooltip visibility timing

*For any* tooltip displayed on hover, removing the cursor from the option should hide the tooltip within 200 milliseconds.

**Validates: Requirements 2.3**

### Property 7: Multiple rules aggregate correctly

*For any* option with multiple compatibility rules, if any rule evaluates to incompatible, the option should be disabled and display the most relevant incompatibility message.

**Validates: Requirements 2.4, 3.4**

### Property 8: Rules are evaluated with current configuration

*For any* compatibility rule evaluation, the rule function should receive the current complete configuration state as input.

**Validates: Requirements 3.1, 3.3**

### Property 9: Disabled options have correct ARIA attributes

*For any* disabled option, the rendered DOM element should have aria-disabled="true" and aria-describedby pointing to an element containing the incompatibility reason.

**Validates: Requirements 4.1, 4.2, 4.4, 4.5**

### Property 10: Compatibility evaluation performance

*For any* configuration change, the compatibility evaluation for all options in the current step should complete within 50 milliseconds.

**Validates: Requirements 8.1**

### Property 11: Results are cached until state changes

*For any* configuration state, evaluating compatibility for the same option multiple times without configuration changes should return cached results without re-executing rule functions.

**Validates: Requirements 8.2**

### Property 12: Initial compatibility precomputation

*For any* wizard step, when the step first loads, compatibility evaluation for all options should complete within 100 milliseconds.

**Validates: Requirements 8.4**

### Property 13: Non-blocking step transitions

*For any* step transition, the navigation should complete and render the new step even if compatibility evaluation is still in progress.

**Validates: Requirements 8.5**

## Error Handling

### Invalid Rule Definitions

- **Error**: Rule references non-existent configuration field
- **Handling**: Log warning in development mode, treat rule as always compatible in production
- **User Impact**: Option remains enabled when it should potentially be disabled

### Rule Evaluation Exceptions

- **Error**: Rule function throws an exception during evaluation
- **Handling**: Catch exception, log error, treat rule as compatible (fail-open)
- **User Impact**: Option remains enabled, user may select incompatible combination
- **Recovery**: Validation at generation time will catch incompatibilities

### Performance Degradation

- **Error**: Compatibility evaluation exceeds time budget
- **Handling**: Log performance warning, allow evaluation to complete
- **User Impact**: Slight delay in UI responsiveness
- **Recovery**: Cache results to prevent repeated slow evaluations

### Missing Tooltip Content

- **Error**: Disabled option has no incompatibility message
- **Handling**: Display generic fallback message: "This option is not compatible with your current selections"
- **User Impact**: Less specific guidance for user
- **Recovery**: None needed, fallback message is functional

## Testing Strategy

### Unit Testing

Unit tests will verify specific compatibility rules and edge cases:

1. **Specific Rule Tests**: Test each defined compatibility rule with known configurations
   - Example: Verify Express is disabled when Next.js frontend is selected
   - Example: Verify Supabase Auth is disabled when MongoDB is selected

2. **Edge Cases**: Test boundary conditions
   - Empty configuration (no selections made)
   - All options selected as "None"
   - Rapid configuration changes

3. **Tooltip Rendering**: Test tooltip content generation
   - Verify tooltip contains conflicting option name
   - Verify tooltip formatting is correct
   - Verify fallback messages for missing content

4. **ARIA Attributes**: Test accessibility attribute generation
   - Verify aria-disabled is set correctly
   - Verify aria-describedby references exist
   - Verify accessibility tree structure

### Property-Based Testing

Property-based tests will verify universal behaviors across all possible configurations using **fast-check** library for TypeScript. Each test will run a minimum of 100 iterations with randomly generated configurations.

1. **Property 1 Test**: Generate random configurations with disabled options, attempt selection, verify state unchanged

2. **Property 2 Test**: Generate random configuration sequences, change prior selections, verify disabled states update

3. **Property 3 Test**: Generate random configurations, verify all disabled options have identical styling classes

4. **Property 4 Test**: Generate random compatible configurations, verify no options are disabled

5. **Property 5 Test**: Generate random configurations with disabled options, verify tooltips contain explanations and conflicting references

6. **Property 6 Test**: Generate random hover events, measure tooltip hide timing

7. **Property 7 Test**: Generate configurations where multiple rules apply, verify correct aggregation

8. **Property 8 Test**: Generate random configurations, verify rules receive complete config object

9. **Property 9 Test**: Generate random configurations with disabled options, verify ARIA attributes

10. **Property 10 Test**: Generate random configurations, measure evaluation time

11. **Property 11 Test**: Generate random configurations, verify repeated evaluations use cache

12. **Property 12 Test**: Generate random step loads, measure precomputation time

13. **Property 13 Test**: Generate random step transitions, verify non-blocking behavior

### Integration Testing

Integration tests will verify the complete flow:

1. **End-to-End Wizard Flow**: Navigate through wizard with various selections, verify compatibility updates at each step
2. **Accessibility Flow**: Navigate with keyboard only, verify disabled options are announced correctly
3. **Performance Flow**: Complete wizard with rapid selections, verify no performance degradation

### Test Data Generation

For property-based tests, we'll generate random configurations using these strategies:

```typescript
// Generator for random valid configurations
const configGenerator = fc.record({
  frontendFramework: fc.constantFrom('nextjs', 'react', 'vue', 'angular', 'svelte'),
  backendFramework: fc.constantFrom('none', 'nextjs-api', 'express', 'fastify', 'nestjs'),
  database: fc.constantFrom('none', 'prisma-postgres', 'drizzle-postgres', 'supabase', 'mongodb'),
  auth: fc.constantFrom('none', 'nextauth', 'supabase', 'clerk'),
  // ... other fields
});

// Generator for configurations that trigger specific incompatibilities
const incompatibleConfigGenerator = fc.record({
  frontendFramework: fc.constant('nextjs'),
  backendFramework: fc.constantFrom('express', 'fastify', 'nestjs'),
  // ... ensures incompatibility
});
```

## Implementation Notes

### Performance Optimization

1. **Memoization**: Use React.useMemo to cache compatibility results per step
2. **Selective Re-evaluation**: Only re-evaluate rules for steps affected by configuration changes
3. **Lazy Evaluation**: Don't evaluate compatibility for steps not yet visited
4. **Debouncing**: Debounce tooltip rendering by 100ms to prevent excessive re-renders

### Accessibility Considerations

1. **Focus Management**: Disabled options remain focusable for keyboard navigation
2. **Screen Reader Announcements**: Use aria-live regions to announce compatibility changes
3. **High Contrast Mode**: Ensure disabled state is visible in high contrast mode
4. **Reduced Motion**: Respect prefers-reduced-motion for tooltip animations

### Backward Compatibility

This feature is additive and doesn't break existing functionality:

- Existing wizard steps continue to work without compatibility rules
- Rules are opt-in per step
- No changes to configuration state structure
- No changes to existing validation logic

## Future Enhancements

1. **Smart Recommendations**: Suggest alternative compatible options when user selects incompatible combination
2. **Dependency Visualization**: Show visual graph of technology dependencies
3. **Preset Configurations**: Offer pre-validated technology stacks (e.g., "JAMstack", "Full-stack Node")
4. **Rule Conflict Detection**: Warn developers when compatibility rules conflict with each other
5. **Dynamic Rule Loading**: Load compatibility rules from external configuration file
