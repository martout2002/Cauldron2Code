# Wizard State Persistence Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WIZARD COMPONENT LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  PixelInput      │  │  OptionGrid      │  │ CheckboxGroup │ │
│  │  (text input)    │  │  (selections)    │  │  (multi-sel)  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │          │
│           └─────────────────────┼─────────────────────┘          │
│                                 │                                │
│                                 ▼                                │
│                    ┌─────────────────────────┐                  │
│                    │  handleConfigUpdate()   │                  │
│                    └────────────┬────────────┘                  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE LAYER                         │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │   useWizardStore         │  │   useConfigStore         │    │
│  │   ─────────────          │  │   ─────────────          │    │
│  │   • currentStep          │  │   • config object        │    │
│  │   • completedSteps       │  │   • updateConfig()       │    │
│  │   • stepData             │  │   • resetConfig()        │    │
│  │   • nextStep()           │  │                          │    │
│  │   • previousStep()       │  │                          │    │
│  └────────────┬─────────────┘  └────────────┬─────────────┘    │
│               │                              │                  │
│               │    ┌────────────────────┐    │                  │
│               └────►  persist middleware ◄────┘                  │
│                    └──────────┬─────────┘                       │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER STORAGE LAYER                       │
│                                                                  │
│  localStorage                                                    │
│  ├── cauldron2code-wizard                                       │
│  │   └── { currentStep, completedSteps, stepData }             │
│  │                                                              │
│  └── cauldron2code-config                                       │
│      └── { config: { projectName, frameworks, ... } }          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Persistence Cycle

### 1. User Input → Store Update

```
User types "my-app"
    ↓
PixelInput onChange fires
    ↓
handleConfigUpdate({ projectName: "my-app" })
    ↓
useConfigStore.updateConfig()
    ↓
Store state updated
```

### 2. Store Update → localStorage

```
Store state updated
    ↓
Zustand persist middleware detects change
    ↓
Serializes state to JSON
    ↓
Writes to localStorage['cauldron2code-config']
    ↓
"Saved" indicator appears
```

### 3. Page Reload → State Restoration

```
User refreshes page
    ↓
Zustand persist middleware initializes
    ↓
Reads from localStorage
    ↓
Deserializes JSON to state
    ↓
onRehydrateStorage callback fires
    ↓
setHasHydrated(true)
    ↓
Wizard waits for hydration
    ↓
UI renders with restored state
```

## Data Flow Example

### Scenario: User completes first 3 steps

```
Step 1: Enter project name
─────────────────────────
User input: "my-awesome-app"
    ↓
updateConfig({ projectName: "my-awesome-app" })
    ↓
localStorage['cauldron2code-config'] = {
  state: {
    config: {
      projectName: "my-awesome-app",
      ...defaults
    }
  }
}

Step 2: Enter description
─────────────────────────
User input: "A cool app"
    ↓
updateConfig({ description: "A cool app" })
    ↓
localStorage['cauldron2code-config'] = {
  state: {
    config: {
      projectName: "my-awesome-app",
      description: "A cool app",
      ...defaults
    }
  }
}

Step 3: Select frontend
─────────────────────────
User selects: "nextjs"
    ↓
updateConfig({ frontendFramework: "nextjs" })
    ↓
localStorage['cauldron2code-config'] = {
  state: {
    config: {
      projectName: "my-awesome-app",
      description: "A cool app",
      frontendFramework: "nextjs",
      ...defaults
    }
  }
}

Wizard state after each step:
─────────────────────────
After Step 1: currentStep = 1, completedSteps = [0]
After Step 2: currentStep = 2, completedSteps = [0, 1]
After Step 3: currentStep = 3, completedSteps = [0, 1, 2]

localStorage['cauldron2code-wizard'] = {
  state: {
    currentStep: 3,
    completedSteps: [0, 1, 2],
    stepData: {}
  }
}
```

## Restoration Example

### Scenario: User returns after closing browser

```
User opens /configure
    ↓
Zustand reads localStorage
    ↓
Wizard state restored:
  • currentStep = 3
  • completedSteps = [0, 1, 2]
    ↓
Config state restored:
  • projectName = "my-awesome-app"
  • description = "A cool app"
  • frontendFramework = "nextjs"
    ↓
Wizard renders Step 3
    ↓
All previous inputs visible
    ↓
User can continue from Step 3
```

## Component Integration

```typescript
// PixelArtWizard.tsx
export function PixelArtWizard() {
  // 1. Get state from stores
  const { currentStep, nextStep, previousStep } = useWizardStore();
  const { config, updateConfig } = useConfigStore();
  
  // 2. Wait for hydration
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (wizardHydrated && configHydrated) {
      setIsReady(true);
    }
  }, [wizardHydrated, configHydrated]);
  
  // 3. Handle updates (automatically persisted)
  const handleConfigUpdate = (updates) => {
    updateConfig(updates); // ← Triggers persistence
  };
  
  // 4. Handle navigation (automatically persisted)
  const handleNext = () => {
    markStepComplete(currentStep); // ← Triggers persistence
    nextStep(); // ← Triggers persistence
  };
  
  // 5. Render with restored state
  return (
    <WizardStep
      config={config} // ← Restored from localStorage
      onUpdate={handleConfigUpdate}
    />
  );
}
```

## Persistence Guarantees

### ✅ What IS Persisted

- Current wizard step
- Completed steps
- All configuration selections
- Project name and description
- Framework choices
- Database and auth selections
- Styling preferences
- Extras and deployment targets

### ❌ What is NOT Persisted

- Animation states (isTransitioning)
- Validation errors (ephemeral)
- Loading states (ephemeral)
- UI-only state (collapsed panels, etc.)

### 🔄 When Persistence Happens

- **Immediately** after any state change
- **Automatically** via Zustand middleware
- **Synchronously** to localStorage
- **No debouncing** (changes are infrequent)

### 📦 Storage Format

```json
// Wizard State
{
  "state": {
    "currentStep": 2,
    "completedSteps": [0, 1],
    "stepData": {}
  },
  "version": 1
}

// Config State
{
  "state": {
    "config": {
      "projectName": "my-app",
      "description": "My app description",
      "frontendFramework": "nextjs",
      "backendFramework": "nextjs-api",
      "database": "prisma-postgres",
      "auth": "nextauth",
      "styling": "tailwind",
      "extras": {
        "docker": false,
        "githubActions": false,
        "prettier": true
      }
    }
  },
  "version": 1
}
```

## Debug Mode Visualization

Enable debug mode to see persistence in real-time:

```
/configure?debug=true
```

Shows:
```
┌─────────────────────────────┐
│  Persistence Debug          │
├─────────────────────────────┤
│  Wizard State: ✓ Saved      │
│  Config State: ✓ Saved      │
├─────────────────────────────┤
│  Current Step: 3            │
│  Completed: 2 steps         │
├─────────────────────────────┤
│  Project: my-app            │
│  Frontend: nextjs           │
│  Backend: nextjs-api        │
├─────────────────────────────┤
│  ● Saving...                │
└─────────────────────────────┘
```

## Summary

The persistence system provides:

1. **Automatic** - No manual save/load
2. **Transparent** - Works behind the scenes
3. **Reliable** - Zustand's battle-tested middleware
4. **Fast** - Synchronous localStorage writes
5. **Debuggable** - Debug mode and utilities
6. **Robust** - Handles edge cases gracefully

All user data is preserved across:
- Page refreshes
- Browser restarts
- Navigation away and back
- Tab closes and reopens
