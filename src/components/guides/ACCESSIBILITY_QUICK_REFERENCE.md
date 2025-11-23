# Accessibility Quick Reference for Deployment Guides

## Quick Checklist for Developers

When adding new features to deployment guides, ensure:

### ✅ Keyboard Navigation
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators are visible (blue ring, 2px offset)
- [ ] No keyboard traps
- [ ] Logical tab order

### ✅ ARIA Labels
- [ ] Buttons have descriptive `aria-label` (not just "Click" or "Button")
- [ ] Links indicate external navigation ("opens in new tab")
- [ ] Checkboxes have `role="checkbox"` and `aria-checked`
- [ ] Expandable sections have `aria-expanded` and `aria-controls`
- [ ] Dynamic content has `aria-live` for announcements

### ✅ Semantic HTML
- [ ] Use `<button>` for actions, `<a>` for navigation
- [ ] Use proper heading hierarchy (h1 → h2 → h3)
- [ ] Use `<nav>` for navigation sections
- [ ] Use `<main>`, `<header>`, `<footer>` for page structure
- [ ] Use `<article>` for self-contained content

### ✅ Visual Design
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Don't rely on color alone to convey information
- [ ] Touch targets are at least 44x44px
- [ ] Focus indicators are clearly visible

### ✅ Dynamic Content
- [ ] Use `aria-live="polite"` for non-critical updates
- [ ] Use `role="status"` for status messages
- [ ] Ensure state changes are announced to screen readers

## Common Patterns

### Button with Icon
```tsx
<button
  onClick={handleClick}
  className="..."
  aria-label="Descriptive action text"
>
  <Icon size={20} aria-hidden="true" />
  <span>Button Text</span>
</button>
```

### Checkbox
```tsx
<button
  onClick={handleToggle}
  role="checkbox"
  aria-checked={isChecked}
  aria-label="Mark step 1 as complete"
  className="..."
>
  {isChecked ? <CheckIcon aria-hidden="true" /> : <CircleIcon aria-hidden="true" />}
</button>
```

### Expand/Collapse
```tsx
<button
  onClick={handleToggle}
  aria-expanded={isExpanded}
  aria-controls="content-id"
  aria-label={isExpanded ? "Collapse section" : "Expand section"}
  className="..."
>
  {isExpanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
</button>

<div id="content-id" role="region" aria-labelledby="heading-id">
  {/* Content */}
</div>
```

### External Link
```tsx
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="..."
  aria-label={`${linkText} (opens in new tab)`}
>
  {linkText}
  <ExternalLink size={14} aria-hidden="true" />
</a>
```

### Progress Bar
```tsx
<div
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${percentage}% complete`}
  className="..."
>
  <div style={{ width: `${percentage}%` }} />
</div>
```

### Status Message
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="..."
>
  <p>All required tasks complete!</p>
</div>
```

### Skip Link
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only ..."
  aria-label="Skip to main content"
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {/* Content */}
</main>
```

## Testing Commands

### Run Lighthouse Audit
```bash
# In Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Select "Accessibility" category
# 4. Click "Generate report"
```

### Test with Screen Reader

**Windows (NVDA - Free):**
```
1. Download from https://www.nvaccess.org/
2. Install and run
3. Use Insert+Down Arrow to read
4. Use H to navigate headings
5. Use B to navigate buttons
6. Use K to navigate links
```

**macOS (VoiceOver - Built-in):**
```
1. Press Cmd+F5 to enable
2. Use VO+A to read all
3. Use VO+Right Arrow to navigate
4. Use VO+Space to activate
```

### Check Color Contrast
```bash
# Install axe DevTools extension
# 1. Open Chrome Web Store
# 2. Search "axe DevTools"
# 3. Install extension
# 4. Open DevTools > axe DevTools tab
# 5. Click "Scan ALL of my page"
```

## Common Mistakes to Avoid

❌ **Don't:**
- Use `<div>` with `onClick` instead of `<button>`
- Forget `aria-label` on icon-only buttons
- Use `aria-hidden="true"` on interactive elements
- Skip heading levels (h1 → h3)
- Rely on color alone for information
- Use placeholder as label
- Create keyboard traps
- Forget to test with keyboard only

✅ **Do:**
- Use semantic HTML elements
- Provide descriptive labels
- Test with keyboard navigation
- Test with screen reader
- Ensure sufficient color contrast
- Provide text alternatives for icons
- Make touch targets at least 44x44px
- Respect user preferences (reduced motion)

## Resources

- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

## Need Help?

1. Check `ACCESSIBILITY_IMPLEMENTATION.md` for detailed documentation
2. Review `__test-accessibility.tsx` for testing procedures
3. Run automated accessibility scans
4. Test with keyboard and screen reader
5. Ask team members for accessibility review

## Remember

**Accessibility is not optional—it's a requirement.**

Every user deserves equal access to our deployment guides, regardless of their abilities or the assistive technologies they use.
