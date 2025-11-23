# Wizard State Persistence Test Guide

This guide provides step-by-step instructions to test that wizard state persistence is working correctly.

## Prerequisites

- The wizard should be accessible at `/configure`
- Browser localStorage should be enabled
- Browser console should be open for debugging

## Test 1: Basic State Persistence

### Steps:
1. Navigate to `/configure`
2. Enter a project name: `test-persistence-app`
3. Click "Next" to go to Step 2
4. Enter a description: `Testing state persistence`
5. Click "Next" to go to Step 3
6. Select a frontend framework (e.g., Next.js)
7. Open browser DevTools → Application → Local Storage
8. Verify two keys exist:
   - `cauldron2code-wizard`
   - `cauldron2code-config`

### Expected Results:
- ✅ Both localStorage keys should exist
- ✅ `cauldron2code-wizard` should contain: `currentStep: 2`, `completedSteps: [0, 1]`
- ✅ `cauldron2code-config` should contain the project name, description, and frontend framework

## Test 2: State Restoration on Page Reload

### Steps:
1. Continue from Test 1 (you should be on Step 3)
2. Refresh the page (F5 or Cmd+R)
3. Wait for the wizard to load

### Expected Results:
- ✅ Wizard should restore to Step 3 (not Step 1)
- ✅ Project name should still be `test-persistence-app`
- ✅ Description should still be `Testing state persistence`
- ✅ Frontend framework selection should be preserved
- ✅ No data loss should occur

## Test 3: Navigation Preserves All Inputs

### Steps:
1. Continue from Test 2 (Step 3)
2. Click "Back" to go to Step 2
3. Verify description is still present
4. Click "Back" to go to Step 1
5. Verify project name is still present
6. Click "Next" twice to return to Step 3
7. Verify frontend framework selection is still present

### Expected Results:
- ✅ All inputs should be preserved when navigating backward
- ✅ All inputs should be preserved when navigating forward
- ✅ No data should be lost during navigation

## Test 4: Multi-Step Configuration Persistence

### Steps:
1. Start fresh: Clear localStorage and reload
2. Complete all 8 steps with the following data:
   - Step 1: Project name: `full-stack-app`
   - Step 2: Description: `A complete full-stack application`
   - Step 3: Frontend: Next.js
   - Step 4: Backend: Express
   - Step 5: Database: Prisma + PostgreSQL
   - Step 6: Auth: NextAuth
   - Step 7: Styling: Tailwind CSS
   - Step 8: Extras: Select ESLint and Prettier
3. After completing Step 8, refresh the page

### Expected Results:
- ✅ Wizard should restore to Step 8
- ✅ All selections from all steps should be preserved
- ✅ Configuration should be complete and ready for generation

## Test 5: Persistence Indicator

### Steps:
1. Navigate to `/configure?debug=true` (enables debug mode)
2. Make any change (e.g., update project name)
3. Observe the debug panel in the bottom-left corner

### Expected Results:
- ✅ Debug panel should show "Wizard State: ✓ Saved"
- ✅ Debug panel should show "Config State: ✓ Saved"
- ✅ Debug panel should display current step and completed steps
- ✅ Debug panel should show project name, frontend, and backend selections
- ✅ "Saving..." indicator should appear briefly after changes

## Test 6: State Validation

### Steps:
1. Open browser console
2. Run the following commands:

```javascript
// Import persistence utilities
import { validatePersistedState, getPersistedStateSummary } from '@/lib/wizard/wizard-persistence';

// Validate state
const validation = validatePersistedState();
console.log('State validation:', validation);

// Get state summary
const summary = getPersistedStateSummary();
console.log('State summary:', summary);
```

### Expected Results:
- ✅ `validation.isValid` should be `true`
- ✅ `validation.issues` should be an empty array
- ✅ `summary` should show correct current step and configuration

## Test 7: State Export and Import

### Steps:
1. Complete a few wizard steps
2. Open browser console
3. Export state:

```javascript
import { exportState } from '@/lib/wizard/wizard-persistence';
const exported = exportState();
console.log(exported);
// Copy the output
```

4. Clear localStorage
5. Refresh the page (wizard should start from Step 1)
6. Import state:

```javascript
import { importState } from '@/lib/wizard/wizard-persistence';
const result = importState(/* paste exported state here */);
console.log(result);
```

7. Refresh the page

### Expected Results:
- ✅ Export should produce valid JSON with wizard and config state
- ✅ After clearing localStorage, wizard should start fresh
- ✅ After importing state, wizard should restore to previous state
- ✅ All data should be preserved after import

## Test 8: Concurrent Tab Behavior

### Steps:
1. Open `/configure` in Tab 1
2. Complete Steps 1-3
3. Open `/configure` in Tab 2 (new tab)
4. Verify Tab 2 shows the same state as Tab 1
5. In Tab 2, go to Step 4 and make a selection
6. Switch back to Tab 1 and refresh

### Expected Results:
- ✅ Tab 2 should load with the same state as Tab 1
- ✅ Changes in Tab 2 should persist to localStorage
- ✅ Tab 1 should show updated state after refresh
- ⚠️ Note: Real-time sync between tabs is not implemented (by design)

## Test 9: Clear State and Reset

### Steps:
1. Complete several wizard steps
2. Open browser console
3. Clear state:

```javascript
import { clearPersistedState } from '@/lib/wizard/wizard-persistence';
clearPersistedState();
```

4. Refresh the page

### Expected Results:
- ✅ After clearing state, wizard should start from Step 1
- ✅ All inputs should be reset to defaults
- ✅ No previous data should remain

## Test 10: Edge Cases

### Test 10a: Partial State
1. Manually edit localStorage to remove `completedSteps`
2. Refresh the page
3. Verify wizard still works (may show warnings in console)

### Test 10b: Corrupted State
1. Manually edit localStorage to have invalid JSON
2. Refresh the page
3. Verify wizard falls back to default state

### Test 10c: Version Mismatch
1. Manually edit localStorage to change version number
2. Refresh the page
3. Verify wizard handles version migration gracefully

### Expected Results:
- ✅ Wizard should handle missing data gracefully
- ✅ Wizard should handle corrupted data by resetting to defaults
- ✅ Wizard should handle version mismatches appropriately

## Debugging Tips

### View localStorage in Console:
```javascript
// View wizard state
console.log(JSON.parse(localStorage.getItem('cauldron2code-wizard')));

// View config state
console.log(JSON.parse(localStorage.getItem('cauldron2code-config')));
```

### Monitor localStorage Changes:
```javascript
// Add event listener for storage changes
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.newValue);
});
```

### Enable Debug Mode:
- Add `?debug=true` to the URL: `/configure?debug=true`
- This shows the persistence debug panel

## Success Criteria

All tests should pass with the following outcomes:
- ✅ State persists to localStorage after each step
- ✅ State is restored correctly on page reload
- ✅ Navigation preserves all user inputs
- ✅ Multi-step configurations are fully preserved
- ✅ Persistence indicator shows save status
- ✅ State validation confirms data integrity
- ✅ Export/import functionality works correctly
- ✅ Edge cases are handled gracefully

## Requirements Coverage

This test guide covers the following requirements:
- **7.1**: Store user inputs in configuration state after each step ✅
- **7.2**: Persist configuration state to browser storage ✅
- **7.3**: Restore previously entered configuration data on return ✅
- **7.6**: Compile full configuration object when all steps complete ✅
