# Deployment Guides Styling Examples

## Overview

This document provides visual examples of the styling implementation for deployment guide components.

## Component Examples

### 1. Platform Card

#### Before Styling
```tsx
// Basic card with minimal styling
<div className="border p-4">
  <img src={logo} alt={name} />
  <h3>{name}</h3>
  <p>{description}</p>
</div>
```

#### After Styling
```tsx
// Polished card with hover effects, animations, and responsive design
<button className="
  group relative w-full p-6
  bg-white dark:bg-zinc-900
  border-2 border-gray-200 dark:border-zinc-800
  rounded-xl
  hover:border-blue-500 dark:hover:border-blue-400
  hover:shadow-lg hover:-translate-y-1
  transition-all duration-300
  focus:outline-none focus:ring-2 focus:ring-blue-500
">
  {/* Gradient border reveal on hover */}
  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
    bg-gradient-to-r from-blue-500 to-purple-600 transition-opacity" />
  
  {/* Content with smooth transitions */}
  <img className="transition-transform group-hover:scale-1.05" />
  <h3 className="transition-colors group-hover:text-blue-600" />
</button>
```

**Features Added:**
- ✅ Hover lift effect (-translate-y-1)
- ✅ Gradient border reveal
- ✅ Smooth transitions (300ms)
- ✅ Focus ring for accessibility
- ✅ Dark mode support
- ✅ Logo scale on hover

---

### 2. Code Block

#### Before Styling
```tsx
// Basic pre/code block
<pre>
  <code>{command}</code>
</pre>
```

#### After Styling
```tsx
// Enhanced code block with gradient background, custom scrollbar, and copy button
<div className="relative rounded-lg border border-gray-300 dark:border-zinc-700 
  bg-gray-50 dark:bg-zinc-900 overflow-hidden">
  
  {/* Gradient background */}
  <pre className="p-4 overflow-x-auto
    bg-gradient-to-br from-gray-50 to-gray-100
    dark:from-zinc-900 dark:to-zinc-800
    scrollbar-thin scrollbar-thumb-gray-400">
    <code className="font-mono text-sm">{command}</code>
  </pre>
  
  {/* Animated copy button */}
  <button className="
    absolute top-2 right-2 p-2 rounded-md
    bg-white dark:bg-zinc-800
    hover:scale-105 active:scale-95
    transition-transform duration-200
    copy-button
  ">
    <Copy className="transition-colors" />
  </button>
</div>
```

**Features Added:**
- ✅ Gradient background
- ✅ Custom scrollbar styling
- ✅ Copy button with scale animation
- ✅ Success feedback animation
- ✅ Syntax highlighting support
- ✅ Placeholder highlighting

---

### 3. Progress Bar

#### Before Styling
```tsx
// Basic progress bar
<div className="w-full bg-gray-200">
  <div style={{ width: `${percentage}%` }} className="bg-blue-500" />
</div>
```

#### After Styling
```tsx
// Animated progress bar with shimmer effect
<div className="w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
  <div 
    className="h-full transition-all duration-500 ease-out
      bg-gradient-to-r from-blue-500 to-blue-600
      relative overflow-hidden
      progress-bar-fill"
    style={{ width: `${percentage}%` }}
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      animate-shimmer" />
  </div>
</div>
```

**Features Added:**
- ✅ Smooth width transition (500ms)
- ✅ Shimmer animation
- ✅ Gradient background
- ✅ Color change on completion
- ✅ Rounded corners
- ✅ Dark mode support

---

### 4. Guide Step

#### Before Styling
```tsx
// Basic step container
<div>
  <h3>{title}</h3>
  <p>{description}</p>
  {isExpanded && <div>{content}</div>}
</div>
```

#### After Styling
```tsx
// Polished step with smooth expand/collapse
<article className="
  rounded-lg border border-gray-300 dark:border-zinc-700
  bg-white dark:bg-zinc-900
  overflow-hidden
  guide-step
  fade-in
">
  {/* Header with hover effect */}
  <div className="flex items-start gap-4 p-4 
    bg-gray-50 dark:bg-zinc-800
    transition-colors hover:bg-gray-100">
    
    {/* Animated checkbox */}
    <button className="checkbox-icon transition-transform hover:scale-110">
      {completed ? <CheckCircle2 className="text-green-600 animate-pop" /> : <Circle />}
    </button>
    
    {/* Animated chevron */}
    <button className="chevron-icon transition-transform duration-300"
      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
      <ChevronRight />
    </button>
  </div>
  
  {/* Smooth expand/collapse content */}
  <div className={`guide-step-content transition-all duration-300 
    ${isExpanded ? 'expanded' : 'collapsed'}`}>
    {content}
  </div>
</article>
```

**Features Added:**
- ✅ Smooth expand/collapse (300ms)
- ✅ Checkbox pop animation
- ✅ Chevron rotation
- ✅ Hover effects
- ✅ Fade-in animation
- ✅ Proper ARIA labels

---

### 5. Checklist Item

#### Before Styling
```tsx
// Basic checklist item
<div>
  <input type="checkbox" checked={completed} />
  <span>{title}</span>
</div>
```

#### After Styling
```tsx
// Animated checklist item with completion effects
<div className={`
  p-6 transition-all duration-300
  checklist-item
  ${completed ? 'completed bg-gray-50 dark:bg-zinc-800/50 opacity-70' : ''}
`}>
  <div className="flex items-start gap-4">
    {/* Animated checkbox */}
    <button className="
      mt-1 shrink-0 p-1 rounded-md
      hover:bg-gray-200 dark:hover:bg-zinc-700
      transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-500
    ">
      {completed ? (
        <CheckCircle2 className="text-green-600 dark:text-green-400 
          checkbox-icon checked animate-checkbox-pop" />
      ) : (
        <Circle className="text-gray-400 dark:text-gray-600" />
      )}
    </button>
    
    {/* Title with line-through animation */}
    <h3 className={`
      text-lg font-semibold transition-all duration-300
      checklist-title
      ${completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}
    `}>
      {title}
    </h3>
  </div>
</div>
```

**Features Added:**
- ✅ Checkbox pop animation
- ✅ Line-through on completion
- ✅ Opacity fade on completion
- ✅ Background color change
- ✅ Smooth transitions
- ✅ Hover effects

---

### 6. Loading State

#### Before Styling
```tsx
// Basic loading text
<div>Loading...</div>
```

#### After Styling
```tsx
// Polished loading state with spinner and skeleton
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    {/* Animated spinner */}
    <div className="
      animate-spin rounded-full h-12 w-12
      border-b-2 border-blue-600 dark:border-blue-400
      mx-auto mb-4
      loading-spinner
    " />
    
    <p className="text-gray-600 dark:text-gray-400">
      Loading deployment guide...
    </p>
  </div>
</div>

{/* Skeleton loaders for content */}
<div className="space-y-4">
  <div className="skeleton h-20 w-full rounded-lg" />
  <div className="skeleton h-32 w-full rounded-lg" />
  <div className="skeleton h-24 w-full rounded-lg" />
</div>
```

**Features Added:**
- ✅ Smooth rotation animation
- ✅ Skeleton loaders with gradient
- ✅ Loading overlay with blur
- ✅ Proper loading states
- ✅ Accessible labels

---

## Animation Examples

### 1. Fade In Up
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.guide-section {
  animation: fade-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2. Checkbox Pop
```css
@keyframes checkbox-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.checkbox-icon.checked {
  animation: checkbox-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 3. Progress Shimmer
```css
@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-bar-fill::after {
  animation: progress-shimmer 2s infinite;
}
```

### 4. Skeleton Loading
```css
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

---

## Responsive Examples

### Mobile Layout (< 640px)
```css
@media (max-width: 640px) {
  /* Single column grid */
  .platform-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* Smaller code blocks */
  .deployment-guide pre {
    font-size: 0.75rem;
    padding: 0.75rem;
  }
  
  /* Touch-friendly buttons */
  .deployment-guide button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Tablet Layout (640px - 1024px)
```css
@media (min-width: 640px) and (max-width: 1024px) {
  /* Two-column grid */
  .platform-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}
```

### Desktop Layout (> 1024px)
```css
@media (min-width: 1024px) {
  /* Three-column grid */
  .platform-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  /* Enhanced hover effects */
  .platform-card:hover {
    transform: translateY(-6px);
  }
}
```

---

## Accessibility Examples

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Remove transforms */
  .platform-card:hover {
    transform: none !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  /* Increase border visibility */
  .deployment-guide button {
    border: 2px solid currentColor !important;
  }
  
  /* Enhance focus indicators */
  *:focus-visible {
    outline-width: 3px !important;
    outline-offset: 3px !important;
  }
}
```

### Focus Indicators
```css
.deployment-guide button:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## Print Examples

### Print Layout
```css
@media print {
  /* Hide interactive elements */
  .no-print,
  button,
  nav {
    display: none !important;
  }
  
  /* Optimize colors */
  * {
    color: black !important;
    background: white !important;
  }
  
  /* Show link URLs */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }
  
  /* Proper page breaks */
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  pre, code {
    page-break-inside: avoid;
  }
}
```

---

## Dark Mode Examples

### Component Styling
```css
/* Light mode */
.platform-card {
  background: white;
  border-color: #e5e7eb;
}

/* Dark mode */
.dark .platform-card {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-color: #374151;
}

.dark .platform-card:hover {
  border-color: #60a5fa;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
}
```

---

## Utility Class Examples

### Glass Card
```tsx
<div className="glass-card p-6 rounded-lg">
  {/* Frosted glass effect with backdrop blur */}
</div>
```

### Gradient Text
```tsx
<h1 className="gradient-text text-4xl font-bold">
  {/* Blue to purple gradient text */}
</h1>
```

### Shine Effect
```tsx
<button className="shine-effect px-6 py-3">
  {/* Moving highlight on hover */}
</button>
```

---

## Performance Tips

### GPU Acceleration
```css
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Efficient Transitions
```css
/* Good - uses composite properties */
.button {
  transition: transform 0.2s, opacity 0.2s;
}

/* Avoid - triggers layout */
.button-bad {
  transition: width 0.2s, height 0.2s;
}
```

---

## Conclusion

These examples demonstrate the comprehensive styling implementation for deployment guide components. Each component has been enhanced with:

- Smooth animations and transitions
- Responsive design
- Accessibility features
- Dark mode support
- Print optimization
- Performance optimizations

The styling provides a polished, professional user experience while maintaining high performance and accessibility standards.
