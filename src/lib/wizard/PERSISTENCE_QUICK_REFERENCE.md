# Wizard Persistence - Quick Reference

## TL;DR

State persistence is **automatic**. You don't need to do anything special - just use the stores normally.

## Basic Usage

```typescript
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useConfigStore } from '@/lib/store/config-store';

function MyComponent() {
  // Get state (automatically restored from localStorage)
  const { currentStep, nextStep } = useWizardStore();
  const { config, updateConfig } = useConfigStore();
  
  // Update state (automatically persisted to localStorage)
  updateConfig({ projectName: 'my-app' });
  nextStep();
  
  // That's it! No manual save/load needed.
}
```

## Storage Keys

- **Wizard State:** `localStorage['cauldron2code-wizard']`
- **Config State:** `localStorage['cauldron2code-config']`

## Debug Mode

Enable debug panel:
```
/configure?debug=true
```

## Utilities

```typescript
import {
  hasPersistedWizardState,
  getPersistedStateSummary,
  clearPersistedState,
  exportState,
  importState,
} from '@/lib/wizard/wizard-persistence';

// Check if state exists
if (hasPersistedWizardState()) {
  console.log('State found!');
}

// Get summary
const summary = getPersistedStateSummary();
console.log(summary);

// Clear state (for testing)
clearPersistedState();

// Export state (for backup)
const json = exportState();
console.log(json);

// Import state (from backup)
importState(json);
```

## Browser Console

```javascript
// View wizard state
JSON.parse(localStorage.getItem('cauldron2code-wizard'))

// View config state
JSON.parse(localStorage.getItem('cauldron2code-config'))

// Clear all state
localStorage.removeItem('cauldron2code-wizard');
localStorage.removeItem('cauldron2code-config');

// Verify persistence
import { verifyPersistence } from '@/lib/wizard/__verify-persistence';
verifyPersistence();
```

## Common Tasks

### Reset wizard to start
```typescript
import { useWizardStore } from '@/lib/wizard/wizard-state';
import { useConfigStore } from '@/lib/store/config-store';

useWizardStore.getState().resetWizard();
useConfigStore.getState().resetConfig();
```

### Check if user has started wizard
```typescript
import { hasPersistedConfigState } from '@/lib/wizard/wizard-persistence';

if (hasPersistedConfigState()) {
  // User has started wizard
  // Offer to continue or start fresh
}
```

### Get current progress
```typescript
import { getPersistedStateSummary } from '@/lib/wizard/wizard-persistence';

const summary = getPersistedStateSummary();
console.log(`User is on step ${summary.currentStep}`);
console.log(`Project: ${summary.projectName}`);
```

## Troubleshooting

### State not persisting?
1. Check if localStorage is enabled
2. Check browser console for errors
3. Verify storage keys exist in DevTools

### State not restoring?
1. Check hydration flags: `_hasHydrated`
2. Verify stored data is valid JSON
3. Clear state and try again

### Need to debug?
1. Add `?debug=true` to URL
2. Check debug panel in bottom-left
3. Run `verifyPersistence()` in console

## Documentation

- **Technical Details:** `STATE_PERSISTENCE_IMPLEMENTATION.md`
- **Flow Diagrams:** `PERSISTENCE_FLOW.md`
- **Test Guide:** `src/app/configure/__test-persistence.md`
- **Task Summary:** `.kiro/specs/pixel-art-wizard/TASK_11_SUMMARY.md`

## Key Points

✅ **Automatic** - No manual save/load
✅ **Transparent** - Works behind the scenes
✅ **Reliable** - Battle-tested Zustand middleware
✅ **Fast** - Synchronous localStorage
✅ **Debuggable** - Debug mode and utilities
✅ **Robust** - Handles edge cases

## When to Use Utilities

Most of the time, you **don't need** the utilities. They're for:
- Debugging during development
- Testing persistence behavior
- Building admin/debug tools
- Implementing export/import features

For normal wizard usage, just use the stores directly.
