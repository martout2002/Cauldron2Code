import { ScaffoldConfig } from '@/types';

/**
 * Step types define the UI component to render for each step
 */
export type StepType = 'text-input' | 'option-grid' | 'checkbox-group' | 'custom';

/**
 * Option configuration for selection steps
 */
export interface StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

/**
 * Configuration for a single wizard step
 */
export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  type: StepType;
  field: keyof ScaffoldConfig;
  options?: StepOption[];
  placeholder?: string;
  columns?: number;
  multiSelect?: boolean;
  validation?: (value: any) => boolean | string;
}

/**
 * Get all wizard step configurations
 * Returns an array of 8 steps for the pixel-art wizard
 */
export function getWizardSteps(): StepConfig[] {
  return [
    // Step 1: Project Name
    {
      id: 'project-name',
      title: 'Naming your Spell',
      subtitle: 'Give your potion a name, young witch!',
      type: 'text-input',
      field: 'projectName',
      placeholder: 'my-project',
    },
    
    // Step 2: Project Description
    {
      id: 'description',
      title: 'Describe your Magic',
      subtitle: 'What enchantment will your potion create?',
      type: 'text-input',
      field: 'description',
      placeholder: 'A magical app...',
    },
    
    // Step 3: Frontend Framework
    {
      id: 'frontend',
      title: 'Choose your Grimoire',
      subtitle: 'Select the ancient texts to guide your spell',
      type: 'option-grid',
      field: 'frontendFramework',
      columns: 3,
      options: [
        { 
          value: 'nextjs', 
          label: 'Next.js',
          icon: '/icons/frameworks/nextjs.svg',
          description: 'React framework with SSR and routing'
        },
        { 
          value: 'react', 
          label: 'React',
          icon: '/icons/frameworks/react.svg',
          description: 'Popular UI library'
        },
        { 
          value: 'vue', 
          label: 'Vue',
          icon: '/icons/frameworks/vue.svg',
          description: 'Progressive JavaScript framework'
        },
        { 
          value: 'angular', 
          label: 'Angular',
          icon: '/icons/frameworks/angular.svg',
          description: 'Full-featured framework'
        },
        { 
          value: 'svelte', 
          label: 'Svelte',
          icon: '/icons/frameworks/svelte.svg',
          description: 'Compile-time framework'
        },
      ],
    },
    
    // Step 4: Backend Framework
    {
      id: 'backend',
      title: 'Select your Cauldron',
      subtitle: 'Where will your potion brew?',
      type: 'option-grid',
      field: 'backendFramework',
      columns: 3,
      options: [
        { 
          value: 'none', 
          label: 'None',
          icon: '/icons/frameworks/placeholder.svg',
          description: 'Frontend only'
        },
        { 
          value: 'nextjs-api', 
          label: 'Next.js API',
          icon: '/icons/frameworks/nextjs.svg',
          description: 'Built-in API routes'
        },
        { 
          value: 'express', 
          label: 'Express',
          icon: '/icons/frameworks/express.svg',
          description: 'Minimal Node.js framework'
        },
        { 
          value: 'fastify', 
          label: 'Fastify',
          icon: '/icons/frameworks/fastify.svg',
          description: 'Fast and low overhead'
        },
        { 
          value: 'nestjs', 
          label: 'NestJS',
          icon: '/icons/frameworks/nestjs.svg',
          description: 'Progressive Node.js framework'
        },
      ],
    },
    
    // Step 5: Database
    {
      id: 'database',
      title: 'Choose your Spell Book',
      subtitle: 'Where will you store your magical knowledge?',
      type: 'option-grid',
      field: 'database',
      columns: 3,
      options: [
        { 
          value: 'none', 
          label: 'None',
          icon: '/icons/frameworks/none.svg',
          description: 'No database'
        },
        { 
          value: 'prisma-postgres', 
          label: 'Prisma + PostgreSQL',
          icon: '/icons/frameworks/prisma.svg',
          description: 'Type-safe ORM with PostgreSQL'
        },
        { 
          value: 'drizzle-postgres', 
          label: 'Drizzle + PostgreSQL',
          icon: '/icons/frameworks/drizzle.svg',
          description: 'Lightweight ORM with PostgreSQL'
        },
        { 
          value: 'supabase', 
          label: 'Supabase',
          icon: '/icons/frameworks/supabase.svg',
          description: 'Open source Firebase alternative'
        },
        { 
          value: 'mongodb', 
          label: 'MongoDB',
          icon: '/icons/frameworks/mongodb.svg',
          description: 'NoSQL document database'
        },
      ],
    },
    
    // Step 6: Authentication
    {
      id: 'auth',
      title: 'Guard your Potions',
      subtitle: 'Who may enter your magical workshop?',
      type: 'option-grid',
      field: 'auth',
      columns: 2,
      options: [
        { 
          value: 'none', 
          label: 'None',
          icon: '/icons/frameworks/none.svg',
          description: 'No authentication'
        },
        { 
          value: 'nextauth', 
          label: 'NextAuth',
          icon: '/icons/frameworks/next-auth.png',
          description: 'Authentication for Next.js'
        },
        { 
          value: 'supabase', 
          label: 'Supabase Auth',
          icon: '/icons/frameworks/supabase.svg',
          description: 'Built-in Supabase authentication'
        },
        { 
          value: 'clerk', 
          label: 'Clerk',
          icon: '/icons/frameworks/clerk.svg',
          description: 'Complete user management'
        },
      ],
    },
    
    // Step 7: Styling
    {
      id: 'styling',
      title: 'Decorate your Workshop',
      subtitle: 'How will your magic appear?',
      type: 'option-grid',
      field: 'styling',
      columns: 3,
      options: [
        { 
          value: 'tailwind', 
          label: 'Tailwind CSS',
          icon: '/icons/frameworks/tailwind.svg',
          description: 'Utility-first CSS framework'
        },
        { 
          value: 'css-modules', 
          label: 'CSS Modules',
          icon: '/icons/frameworks/css-modules.svg',
          description: 'Scoped CSS files'
        },
        { 
          value: 'styled-components', 
          label: 'Styled Components',
          icon: '/icons/frameworks/styled-components.svg',
          description: 'CSS-in-JS library'
        },
      ],
    },
    
    // Step 8: Extras (using option-grid with multiple selections)
    {
      id: 'extras',
      title: 'Final Ingredients',
      subtitle: 'Add the finishing touches to your spell',
      type: 'option-grid',
      field: 'extras',
      multiSelect: true,
      columns: 5,
      options: [
        { 
          value: 'docker', 
          label: 'Docker',
          icon: '/icons/frameworks/docker.svg',
          description: 'Containerization'
        },
        { 
          value: 'githubActions', 
          label: 'GitHub Actions',
          icon: '/icons/frameworks/github-actions.svg',
          description: 'CI/CD workflows'
        },
        { 
          value: 'redis', 
          label: 'Redis',
          icon: '/icons/frameworks/redis.svg',
          description: 'In-memory data store'
        },
        { 
          value: 'prettier', 
          label: 'Prettier',
          icon: '/icons/frameworks/prettier.svg',
          description: 'Code formatter'
        },
        { 
          value: 'husky', 
          label: 'Husky',
          icon: '/icons/frameworks/husky.svg',
          description: 'Git hooks'
        },
      ],
    },
  ];
}

/**
 * Get a specific step configuration by index
 */
export function getStepByIndex(index: number): StepConfig | undefined {
  const steps = getWizardSteps();
  return steps[index];
}

/**
 * Get a specific step configuration by ID
 */
export function getStepById(id: string): StepConfig | undefined {
  const steps = getWizardSteps();
  return steps.find(step => step.id === id);
}

/**
 * Get the total number of wizard steps
 */
export function getTotalSteps(): number {
  return getWizardSteps().length;
}
