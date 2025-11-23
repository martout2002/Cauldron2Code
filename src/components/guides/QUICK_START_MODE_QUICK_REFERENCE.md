# Quick Start Mode - Quick Reference

## What is Quick Start Mode?

Quick Start Mode is a condensed view of deployment guides that shows only essential commands and configuration, hiding detailed explanations, notes, and supplementary information. Perfect for experienced developers who want to deploy quickly.

## How to Use

### Switching Modes
1. Look for the view mode toggle at the top of any deployment guide
2. Click "Quick Start" for condensed view or "Detailed Guide" for full information
3. Your preference is automatically saved

### In Quick Start Mode
- **Always Visible**: Step titles, commands, code snippets
- **Hidden by Default**: Descriptions, notes, warnings, external links
- **Expandable**: Click "Learn more" on any step to see hidden details

### In Detailed Guide Mode
- **Everything Visible**: All content shown by default
- **No "Learn More" Buttons**: Full information already displayed

## What's Hidden in Quick Start Mode?

| Content Type | Quick Start | Detailed |
|--------------|-------------|----------|
| Step titles | ✅ Visible | ✅ Visible |
| Commands | ✅ Visible | ✅ Visible |
| Code snippets | ✅ Visible | ✅ Visible |
| Step descriptions | ❌ Hidden* | ✅ Visible |
| Notes | ❌ Hidden* | ✅ Visible |
| Warnings | ❌ Hidden* | ✅ Visible |
| External links | ❌ Hidden* | ✅ Visible |
| Substep descriptions | ❌ Hidden* | ✅ Visible |

*Can be revealed by clicking "Learn more"

## Key Features

### Per-Step Expansion
- Each step has its own "Learn more" button
- Expand only the steps you need more information about
- Other steps remain condensed

### Persistent Preferences
- Your view mode choice is saved
- Returns to your preferred mode on next visit
- Works across different guides

### No Data Loss
- Step completion status preserved when switching modes
- Progress tracking continues regardless of view mode
- Expand/collapse states maintained

## Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Toggle view mode, expand/collapse steps
- **Arrow Keys**: Navigate within toggle group

## Use Cases

### Quick Start Mode Best For:
- Experienced developers familiar with deployment
- Quick reference during deployment
- Copy-paste workflow
- Minimal reading, maximum action

### Detailed Guide Mode Best For:
- First-time deployments
- Learning new platforms
- Troubleshooting issues
- Understanding context and best practices

## Tips

1. **Start with Detailed**: First deployment? Use Detailed mode to understand the process
2. **Switch to Quick Start**: Once familiar, switch to Quick Start for faster deployments
3. **Expand as Needed**: In Quick Start, expand only steps where you need clarification
4. **Use Both**: Switch between modes to compare information density

## Technical Details

### Implementation
- **Component**: `GuideStep.tsx`
- **State Management**: Per-step `showDetails` state
- **Persistence**: `GuideProgressManager` via localStorage
- **Accessibility**: Full ARIA support, keyboard navigation

### Browser Support
- All modern browsers with localStorage support
- Graceful degradation if localStorage unavailable
- No external dependencies required

## Troubleshooting

### View mode not persisting?
- Check browser localStorage is enabled
- Clear site data and try again
- Ensure cookies/storage not blocked

### "Learn more" button not appearing?
- Button only shows if step has hidden content
- Check you're in Quick Start mode
- Some steps may not have additional details

### Content not hiding in Quick Start?
- Commands and code always visible (by design)
- Step titles always visible (by design)
- Only descriptions, notes, warnings, and links are hidden

## Related Documentation

- **Full Implementation**: `QUICK_START_MODE_IMPLEMENTATION.md`
- **Test Component**: `__test-quick-start-mode.tsx`
- **Task Summary**: `.kiro/specs/deployment-guides/TASK_18_IMPLEMENTATION.md`

## Requirements Satisfied

✅ 13.1 - Two view modes offered
✅ 13.2 - Quick Start shows essential commands only
✅ 13.3 - Detailed shows full explanations
✅ 13.4 - Switching preserves progress
✅ 13.5 - "Learn more" expands sections

---

**Last Updated**: November 23, 2025
**Version**: 1.0
**Status**: ✅ Complete
