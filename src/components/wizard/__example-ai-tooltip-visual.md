# AI Template Tooltip Visual Example

## Standard Option Tooltip (Before)
```
┌─────────────────────────────────┐
│ React framework with SSR        │
└─────────────────────────────────┘
```

## AI Template Tooltip (After)
```
┌──────────────────────────────────────────┐
│ Conversational AI with streaming         │
│ responses                                 │
├──────────────────────────────────────────┤
│ Features:                                 │
│ • Real-time streaming responses           │
│ • Conversation history                    │
│ • Markdown rendering                      │
│ • Copy code blocks                        │
├──────────────────────────────────────────┤
│ Generated Files:                          │
│ • src/app/api/chat/route.ts              │
│ • src/app/chat/page.tsx                  │
└──────────────────────────────────────────┘
```

## Disabled Option Tooltip (Incompatibility)
```
┌──────────────────────────────────────────┐
│ Semantic search requires Next.js         │
│ framework                                 │
└──────────────────────────────────────────┘
```
*Red background (bg-red-900) with red border (border-red-700)*

## Styling Details

### Standard Tooltip
- Background: `bg-gray-900`
- Border: `border-gray-700`
- Max Width: `max-w-xs` (20rem / 320px)
- Padding: `px-4 py-3`
- Text: `text-sm text-gray-200`

### AI Template Tooltip
- Background: `bg-gray-900`
- Border: `border-gray-700`
- Max Width: `max-w-sm` (24rem / 384px) - **Wider for more content**
- Padding: `px-4 py-3`
- Text: `text-sm text-gray-200`
- Section Headers: `text-xs font-semibold text-gray-300`
- Lists: `text-xs text-gray-300 list-disc list-inside`
- Dividers: `border-t border-gray-700`

### Disabled Tooltip
- Background: `bg-red-900`
- Border: `border-red-700`
- Max Width: `max-w-xs` (20rem / 320px)
- Padding: `px-4 py-3`
- Text: `text-sm text-gray-200`

## Animation
- Fade in: `200ms ease-out`
- Show delay: `100ms` (debounced)
- Hide delay: `200ms` (debounced)
- Respects `prefers-reduced-motion`

## Positioning
- Position: Below the option card
- Alignment: Centered horizontally
- Z-index: `z-50` (above other content)
- Arrow: Points up to the option card

## Responsive Behavior
- Mobile: May overflow viewport on very small screens
- Tablet: Full tooltip visible
- Desktop: Full tooltip visible with comfortable spacing

## Accessibility
- Tooltip content is also in `aria-label` of the option button
- Disabled options have `aria-describedby` linking to incompatibility reason
- Screen readers can access all information without hovering
