/**
 * Test file for styling system templates
 * This is a manual test file - run with: bun run src/lib/generator/__test-styling.ts
 */

import { ScaffoldGenerator } from './scaffold-generator';
import { ScaffoldConfig } from '@/types';

async function testStylingTemplates() {
  console.log('🧪 Testing styling system templates...\n');

  const stylingOptions: Array<{
    name: string;
    styling: 'tailwind' | 'css-modules' | 'styled-components';
    shadcn?: boolean;
  }> = [
    { name: 'Tailwind CSS', styling: 'tailwind', shadcn: false },
    { name: 'Tailwind CSS + shadcn/ui', styling: 'tailwind', shadcn: true },
    { name: 'CSS Modules', styling: 'css-modules' },
    { name: 'Styled Components', styling: 'styled-components' },
  ];

  for (const option of stylingOptions) {
    console.log(`\n📝 Testing: ${option.name}`);
    console.log('─'.repeat(50));

    const config: ScaffoldConfig = {
      projectName: 'test-project',
      description: 'A test project',
      framework: 'next',
      nextjsRouter: 'app',
      auth: 'none',
      database: 'none',
      api: 'rest-fetch',
      styling: option.styling,
      shadcn: option.shadcn || false,
      colorScheme: 'purple',
      deployment: [],
      aiTemplate: 'none',
      extras: {
        docker: false,
        githubActions: false,
        redis: false,
        prettier: false,
        husky: false,
      },
    };

    try {
      const generator = new ScaffoldGenerator(config);
      const result = await generator.generate();

      console.log(`✓ Generated ${result.files.length} files`);

      // Check for styling-specific files
      const stylingFiles = result.files.filter((f) =>
        f.path.includes('globals.css') ||
        f.path.includes('tailwind.config') ||
        f.path.includes('components.json') ||
        f.path.includes('Button') ||
        f.path.includes('Card') ||
        f.path.includes('Input') ||
        f.path.includes('utils.ts') ||
        f.path.includes('theme') ||
        f.path.includes('global-styles') ||
        f.path.includes('registry') ||
        f.path.includes('styled-components-provider') ||
        f.path.includes('ui/')
      );

      console.log(`✓ Found ${stylingFiles.length} styling-related files:`);
      stylingFiles.forEach((f) => console.log(`  - ${f.path}`));

      // Verify expected files exist
      if (option.styling === 'tailwind') {
        const hasTailwindConfig = result.files.some((f) =>
          f.path.includes('tailwind.config')
        );
        const hasGlobalsCss = result.files.some((f) =>
          f.path.includes('globals.css')
        );

        if (!hasTailwindConfig || !hasGlobalsCss) {
          throw new Error('Missing Tailwind configuration files');
        }

        if (option.shadcn) {
          const hasComponentsJson = result.files.some((f) =>
            f.path.includes('components.json')
          );
          const hasButton = result.files.some((f) =>
            f.path.includes('ui/button')
          );
          const hasCard = result.files.some((f) => f.path.includes('ui/card'));

          if (!hasComponentsJson || !hasButton || !hasCard) {
            throw new Error('Missing shadcn/ui files');
          }
        }
      } else if (option.styling === 'css-modules') {
        const hasButton = result.files.some((f) =>
          f.path.includes('Button.tsx')
        );
        const hasButtonCss = result.files.some((f) =>
          f.path.includes('Button.module.css')
        );
        const hasCard = result.files.some((f) => f.path.includes('Card.tsx'));

        if (!hasButton || !hasButtonCss || !hasCard) {
          throw new Error('Missing CSS Modules component files');
        }
      } else if (option.styling === 'styled-components') {
        const hasTheme = result.files.some((f) => f.path.includes('theme.ts'));
        const hasGlobalStyles = result.files.some((f) =>
          f.path.includes('global-styles.ts')
        );
        const hasButton = result.files.some((f) =>
          f.path.includes('Button.tsx')
        );
        const hasRegistry = result.files.some((f) =>
          f.path.includes('registry.tsx')
        );

        if (!hasTheme || !hasGlobalStyles || !hasButton || !hasRegistry) {
          throw new Error('Missing Styled Components files');
        }
      }

      console.log('✅ All expected files present\n');
    } catch (error) {
      console.error(`❌ Test failed for ${option.name}:`, error);
      process.exit(1);
    }
  }

  console.log('\n✅ All styling template tests passed!');
}

// Run test
testStylingTemplates();
