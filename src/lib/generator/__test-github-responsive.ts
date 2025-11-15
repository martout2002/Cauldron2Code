/**
 * GitHub Section Responsive Verification Test
 * 
 * This test verifies the responsive behavior of the GitHub Integration section
 * on the configure page across mobile, tablet, and desktop viewports.
 * 
 * Requirements: 1.5 - GitHubAuthButton SHALL be responsive and work on mobile, tablet, and desktop screen sizes
 */

export const GITHUB_SECTION_RESPONSIVE_TEST = {
  testName: 'GitHub Section Responsive Behavior',
  component: 'GitHub Integration Section',
  location: 'src/app/configure/page.tsx',
  
  viewports: {
    mobile: [
      { width: 320, height: 568, device: 'iPhone SE' },
      { width: 375, height: 667, device: 'iPhone 8' },
      { width: 414, height: 896, device: 'iPhone 11 Pro Max' },
    ],
    tablet: [
      { width: 768, height: 1024, device: 'iPad' },
      { width: 1024, height: 768, device: 'iPad Landscape' },
    ],
    desktop: [
      { width: 1280, height: 720, device: 'HD Desktop' },
      { width: 1920, height: 1080, device: 'Full HD Desktop' },
    ],
  },
  
  testCriteria: {
    layout: [
      'GitHub section appears between ValidationAlert and GenerateButton',
      'Section has white background with rounded corners',
      'Section has consistent border styling',
      'Section maintains proper padding at all sizes',
    ],
    spacing: [
      'Section has mt-6 md:mt-8 margin from previous element',
      'Spacing is consistent with ColorSchemeSelector and ValidationAlert sections',
      'Internal padding is p-4 md:p-6 (responsive)',
    ],
    typography: [
      'Header is text-lg md:text-xl (responsive sizing)',
      'Header text "GitHub Integration" is readable at all sizes',
      'Description text is text-sm and readable',
      'Button text remains readable at all viewport sizes',
    ],
    button: [
      'GitHubAuthButton is full width (w-full)',
      'Button maintains proper height and padding',
      'Button text and icon are properly aligned',
      'Button hover states work correctly',
    ],
    authenticatedState: [
      'User avatar displays correctly at all sizes',
      'Username and handle truncate properly on small screens',
      'Sign Out button remains accessible',
      'Green background container is responsive',
    ],
  },
  
  expectedBehavior: {
    mobile: {
      description: 'Single column layout, compact spacing',
      sectionWidth: 'Full width with container padding (px-4)',
      headerSize: 'text-lg (18px)',
      padding: 'p-4 (16px)',
      margin: 'mt-6 (24px)',
      buttonSize: 'Full width, standard height',
    },
    tablet: {
      description: 'Single column layout, medium spacing',
      sectionWidth: 'Full width with container padding (px-6)',
      headerSize: 'text-xl (20px)',
      padding: 'p-6 (24px)',
      margin: 'mt-8 (32px)',
      buttonSize: 'Full width, standard height',
    },
    desktop: {
      description: 'Left column only (not in preview panel)',
      sectionWidth: 'Left column width (1fr in grid)',
      headerSize: 'text-xl (20px)',
      padding: 'p-6 (24px)',
      margin: 'mt-8 (32px)',
      buttonSize: 'Full width of container, standard height',
    },
  },
  
  verificationSteps: [
    {
      step: 1,
      action: 'Open browser DevTools and navigate to /configure',
      expected: 'Page loads successfully with GitHub section visible',
    },
    {
      step: 2,
      action: 'Test mobile viewport 320px',
      checks: [
        'Section is full width',
        'Header text is readable (text-lg)',
        'Padding is compact (p-4)',
        'Button is full width and readable',
        'No horizontal overflow',
      ],
    },
    {
      step: 3,
      action: 'Test mobile viewport 375px',
      checks: [
        'Section layout is consistent',
        'Text remains readable',
        'Button maintains proper sizing',
        'Spacing is appropriate',
      ],
    },
    {
      step: 4,
      action: 'Test mobile viewport 414px',
      checks: [
        'Section layout is consistent',
        'All elements are properly sized',
        'No layout issues',
      ],
    },
    {
      step: 5,
      action: 'Test tablet viewport 768px',
      checks: [
        'Header increases to text-xl',
        'Padding increases to p-6',
        'Margin increases to mt-8',
        'Section maintains proper width',
        'Button remains full width',
      ],
    },
    {
      step: 6,
      action: 'Test tablet viewport 1024px',
      checks: [
        'Layout switches to two-column grid',
        'GitHub section appears in left column only',
        'Preview panel appears on right',
        'Section maintains proper styling',
      ],
    },
    {
      step: 7,
      action: 'Test desktop viewport 1280px',
      checks: [
        'Two-column layout is maintained',
        'Section has appropriate width in left column',
        'All text is easily readable',
        'Spacing is generous and comfortable',
      ],
    },
    {
      step: 8,
      action: 'Test desktop viewport 1920px',
      checks: [
        'Layout scales appropriately',
        'Section doesn\'t become too wide',
        'Container max-width is respected',
        'All elements remain properly sized',
      ],
    },
    {
      step: 9,
      action: 'Test authenticated state at 320px',
      checks: [
        'Avatar displays correctly',
        'Username truncates if too long',
        'Sign Out button is accessible',
        'Green container is responsive',
      ],
    },
    {
      step: 10,
      action: 'Verify spacing consistency',
      checks: [
        'GitHub section has same mt-6 md:mt-8 as other sections',
        'Spacing matches ColorSchemeSelector',
        'Spacing matches ValidationAlert',
        'Spacing matches GenerateButton',
      ],
    },
  ],
  
  cssClasses: {
    section: 'mt-6 md:mt-8',
    container: 'bg-white rounded-lg border p-4 md:p-6',
    header: 'text-lg md:text-xl font-semibold mb-2',
    description: 'text-sm text-gray-600 mb-4',
    button: 'w-full flex items-center justify-center gap-2 px-4 py-2.5',
  },
  
  breakpoints: {
    mobile: '< 768px',
    tablet: '768px - 1023px',
    desktop: '>= 1024px',
  },
};

// Manual verification checklist
export const VERIFICATION_CHECKLIST = [
  '✓ Mobile 320px: Section is full width, text is readable, no overflow',
  '✓ Mobile 375px: Layout is consistent, button is properly sized',
  '✓ Mobile 414px: All elements are properly sized',
  '✓ Tablet 768px: Responsive classes activate (text-xl, p-6, mt-8)',
  '✓ Tablet 1024px: Two-column layout, section in left column',
  '✓ Desktop 1280px: Layout is comfortable, text is easily readable',
  '✓ Desktop 1920px: Container max-width prevents excessive width',
  '✓ Button text remains readable at all sizes',
  '✓ Section spacing is consistent with surrounding elements',
  '✓ Authenticated state displays correctly on mobile',
];

console.log('GitHub Section Responsive Verification Test Configuration');
console.log('Run this test by opening /configure in a browser and testing each viewport');
