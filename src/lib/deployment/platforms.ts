import { Platform } from '@/types/deployment-guides';

/**
 * Platform definitions for deployment guides
 * Each platform includes metadata, features, and documentation links
 */
export const PLATFORMS: Platform[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Best for Next.js and frontend frameworks',
    logo: '/icons/platforms/vercel.svg',
    bestFor: ['Next.js', 'React', 'Vue', 'Svelte'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '100/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://vercel.com/docs',
    pricingUrl: 'https://vercel.com/pricing',
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Best for full-stack apps with databases',
    logo: '/icons/platforms/railway.svg',
    bestFor: ['Full-stack', 'Databases', 'Monorepos'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '$5 free credit',
      easeOfUse: 'intermediate',
    },
    documentationUrl: 'https://docs.railway.app',
    pricingUrl: 'https://railway.app/pricing',
  },
  {
    id: 'render',
    name: 'Render',
    description: 'Best for simple deployments with databases',
    logo: '/icons/platforms/render.svg',
    bestFor: ['Web services', 'Static sites', 'Databases'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '750 hours/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://render.com/docs',
    pricingUrl: 'https://render.com/pricing',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Best for static sites and JAMstack',
    logo: '/icons/platforms/netlify.svg',
    bestFor: ['Static sites', 'JAMstack', 'Serverless functions'],
    features: {
      freeTier: true,
      databaseSupport: false,
      customDomains: true,
      buildMinutes: '300 minutes/month free',
      easeOfUse: 'beginner',
    },
    documentationUrl: 'https://docs.netlify.com',
    pricingUrl: 'https://www.netlify.com/pricing',
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    description: 'Best for AWS ecosystem integration',
    logo: '/icons/platforms/aws.svg',
    bestFor: ['AWS services', 'Full-stack', 'Mobile backends'],
    features: {
      freeTier: true,
      databaseSupport: true,
      customDomains: true,
      buildMinutes: '1000 minutes/month free',
      easeOfUse: 'advanced',
    },
    documentationUrl: 'https://docs.amplify.aws',
    pricingUrl: 'https://aws.amazon.com/amplify/pricing',
  },
];

/**
 * Get platform by ID
 */
export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find(platform => platform.id === id);
}

/**
 * Get recommended platforms based on scaffold configuration
 */
export function getRecommendedPlatforms(config: any): Platform[] {
  const recommended: Platform[] = [];

  // Recommend Vercel for Next.js projects
  if (config.frontendFramework === 'nextjs') {
    const vercel = PLATFORMS.find(p => p.id === 'vercel');
    if (vercel) recommended.push(vercel);
  }

  // Recommend Railway for full-stack monorepos
  if (config.projectStructure === 'fullstack-monorepo') {
    const railway = PLATFORMS.find(p => p.id === 'railway');
    if (railway) recommended.push(railway);
  }

  // Recommend Render for simple deployments
  if (config.database !== 'none' && config.projectStructure !== 'fullstack-monorepo') {
    const render = PLATFORMS.find(p => p.id === 'render');
    if (render) recommended.push(render);
  }

  // Recommend Netlify for static sites
  if (config.backendFramework === 'none' && config.database === 'none') {
    const netlify = PLATFORMS.find(p => p.id === 'netlify');
    if (netlify) recommended.push(netlify);
  }

  return recommended;
}
