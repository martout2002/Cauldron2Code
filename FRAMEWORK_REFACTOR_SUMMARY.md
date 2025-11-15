# Framework Selection Refactor

## Changes Made

Successfully refactored the framework selection from a single dropdown to separate frontend and backend selections for better clarity and flexibility.

### Type Changes

**Before:**
```typescript
framework: 'next' | 'express' | 'monorepo'
```

**After:**
```typescript
frontend: 'next' | 'none'
backend: 'express' | 'none'
```

### UI Changes

The configuration wizard now has:
- **Frontend Selection**: Choose between Next.js or None
- **Backend Selection**: Choose between Express.js or None
- **Monorepo Detection**: When both Next.js and Express are selected, the system automatically generates a Turborepo monorepo structure

### Backward Compatibility

Added helper functions to maintain compatibility with existing generator code:
- `getFrameworkType()`: Converts frontend/backend selections to legacy framework value
- `addFrameworkProperty()`: Adds the legacy `framework` property to config objects
- `ScaffoldConfigWithFramework`: Extended type that includes the legacy framework property

### Files Updated

1. **src/types/index.ts** - Updated core types and added compatibility helpers
2. **src/lib/store/config-store.ts** - Updated default config
3. **src/components/ConfigurationWizard.tsx** - New UI with separate frontend/backend selections
4. **src/app/api/generate/route.ts** - Added framework property conversion
5. **src/components/PreviewPanel.tsx** - Updated to use new properties
6. **src/lib/validation/rules.ts** - Updated validation rules
7. **src/lib/constants/ai-templates.tsx** - Updated AI compatibility check
8. **src/lib/github/git-operations.ts** - Updated technology detection
9. **src/lib/generator/scaffold-generator.ts** - Updated to accept extended config type

### Benefits

1. **Clearer UX**: Users now understand they can choose frontend and backend independently
2. **More Flexible**: Easier to add more frontend/backend options in the future
3. **Better Semantics**: "Monorepo" is now a structure, not a framework choice
4. **Backward Compatible**: All existing generator code continues to work without changes
