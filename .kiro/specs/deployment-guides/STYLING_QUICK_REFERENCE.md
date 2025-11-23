# Deployment Guides Styling Quick Reference

## Quick Start

All deployment guide components automatically inherit the styling from `src/app/globals.css`. No additional imports or configuration needed.

## Key CSS Classes

### Component Classes

```css
/* Main container */
.deployment-guide { }

/* Guide steps */
.guide-step { }
.guide-step-content { }
.guide-step-content.expanded { }
.guide-step-content.collapsed { }

/* Platform cards */
.platform-card { }
.platform-logo { }

/* Progress indicators */
.progress-bar-fill { }
.progress-bar-fill.complete { }

/* Checklist items */
.checklist-item { }
.checklist-item.completed { }
.checklist-title { }

/* Code blocks */
.deployment-guide pre { }
.deployment-guide code { }

/* Buttons */
.copy-button { }
.copy-button.copied { }
```

### Utility Classes

```css
/* Animations */
.fade-in { }
.slide-in { }
.scale-in { }
.pulse-subtle { }

/* Effects */
.glass-card { }
.gradient-text { }
.shine-effect { }

/* Loading */
.skeleton { }
.loading-spinner { }
.loading-overlay { }

/* Layout */
.platform-grid { }
.smooth-scroll { }
```

## Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Transitions | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Expand/Collapse | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Troubleshooting | 400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Progress Bar | 500ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Checkbox Pop | 300ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) |

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 640px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Landscape Mobile */
@media (max-width: 896px) and (orientation: landscape) { }
```

## Color Palette

### Light Mode
- Background: `#ffffff`
- Text: `#1f2937`
- Primary: `#3b82f6`
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

### Dark Mode
- Background: `#111827`
- Text: `#f3f4f6`
- Primary: `#60a5fa`
- Success: `#34d399`
- Warning: `#fbbf24`
- Error: `#f87171`

## Common Patterns

### Adding Hover Effect to Button

```tsx
<button className="hover-lift transition-all duration-200">
  Click Me
</button>
```

### Creating a Glass Card

```tsx
<div className="glass-card p-6 rounded-lg">
  Content
</div>
```

### Animated Progress Bar

```tsx
<div className="progress-bar-fill" style={{ width: `${percentage}%` }}>
  {/* Progress shimmer effect is automatic */}
</div>
```

### Skeleton Loader

```tsx
<div className="skeleton h-20 w-full" />
```

## Accessibility Features

### Focus Indicators
- Automatic 2px blue outline on all interactive elements
- 2px offset for visibility
- Enhanced in high contrast mode

### Reduced Motion
- All animations respect `prefers-reduced-motion`
- Automatically reduces to 0.01ms duration
- Maintains opacity transitions only

### Touch Targets
- Minimum 44x44px for all interactive elements
- Automatic on mobile devices
- Enforced via CSS

## Print Optimization

### Hidden Elements
- Buttons, navigation, and interactive elements automatically hidden
- Use `.no-print` class to hide additional elements

### Visible Elements
- All content, code blocks, and text remain visible
- Links show URLs automatically
- Proper page breaks applied

## Performance Tips

### GPU Acceleration
```css
/* Already applied to animated elements */
will-change: transform, opacity;
transform: translateZ(0);
backface-visibility: hidden;
```

### Efficient Animations
- Use `transform` and `opacity` for 60fps
- Avoid animating `width`, `height`, `top`, `left`
- Use `max-height` for expand/collapse

### Loading Optimization
- Use skeleton loaders for perceived performance
- Stagger animations for list items
- Lazy load images

## Troubleshooting

### Animations Not Working
1. Check if `prefers-reduced-motion` is enabled
2. Verify CSS is loaded (check browser dev tools)
3. Ensure proper class names are applied

### Hover Effects Not Showing
1. Check if on touch device (hover disabled on touch)
2. Verify `:hover` pseudo-class is supported
3. Check z-index stacking context

### Dark Mode Issues
1. Ensure `.dark` class is on parent element
2. Check if dark mode colors are defined
3. Verify color contrast ratios

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |

## Examples

### Complete Button with All Effects

```tsx
<button className="
  px-6 py-3
  bg-blue-600 hover:bg-blue-700
  text-white font-semibold
  rounded-lg
  transition-all duration-200
  hover:-translate-y-1
  hover:shadow-lg
  active:translate-y-0
  active:shadow-md
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  shine-effect
">
  Deploy Now
</button>
```

### Platform Card with Hover Effect

```tsx
<div className="
  platform-card
  p-6
  bg-white dark:bg-zinc-900
  border-2 border-gray-200 dark:border-zinc-800
  rounded-xl
  hover:border-blue-500
  hover:-translate-y-1
  hover:shadow-lg
  transition-all duration-300
  cursor-pointer
">
  {/* Card content */}
</div>
```

### Code Block with Copy Button

```tsx
<div className="relative">
  <pre className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg overflow-x-auto">
    <code>{command}</code>
  </pre>
  <button className="
    copy-button
    absolute top-2 right-2
    p-2 rounded-md
    bg-white dark:bg-zinc-800
    border border-gray-300 dark:border-zinc-600
    hover:bg-gray-100 dark:hover:bg-zinc-700
    transition-all duration-200
  ">
    <Copy size={16} />
  </button>
</div>
```

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs - CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Tricks - A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
