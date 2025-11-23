import { ScaffoldConfig } from './index';

// ============================================================================
// Platform Types
// ============================================================================

export type PlatformId = 'vercel' | 'railway' | 'render' | 'netlify' | 'aws-amplify';

export interface Platform {
  id: PlatformId;
  name: string;
  description: string;
  logo: string;
  bestFor: string[];
  features: PlatformFeatures;
  documentationUrl: string;
  pricingUrl: string;
}

export interface PlatformFeatures {
  freeTier: boolean;
  databaseSupport: boolean;
  customDomains: boolean;
  buildMinutes: string;
  easeOfUse: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================================
// Deployment Guide Types
// ============================================================================

export interface DeploymentGuide {
  id: string;
  platform: Platform;
  scaffoldConfig: ScaffoldConfig;
  steps: DeploymentStep[];
  postDeploymentChecklist: ChecklistItem[];
  troubleshooting: TroubleshootingSection;
  estimatedTime: string;
  diagrams?: ArchitectureDiagram[];
}

// ============================================================================
// Diagram Types
// ============================================================================

export interface ArchitectureDiagram {
  type: string;
  diagram: string;
  description: string;
}

// ============================================================================
// Step Types
// ============================================================================

export interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  order: number;
  required: boolean;
  substeps?: DeploymentSubstep[];
  commands?: CommandSnippet[];
  codeSnippets?: CodeSnippet[];
  externalLinks?: ExternalLink[];
  notes?: string[];
  warnings?: string[];
}

export interface DeploymentSubstep {
  id: string;
  title: string;
  description: string;
  commands?: CommandSnippet[];
  externalLinks?: ExternalLink[];
}

// ============================================================================
// Command and Code Types
// ============================================================================

export interface CommandSnippet {
  id: string;
  command: string;
  description: string;
  language: 'bash' | 'powershell' | 'cmd';
  placeholders?: Placeholder[];
}

export interface Placeholder {
  key: string;
  description: string;
  example: string;
  actualValue?: string; // Pre-filled if known
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  filename?: string;
  description?: string;
}

// ============================================================================
// Link Types
// ============================================================================

export interface ExternalLink {
  text: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'service' | 'status';
}

// ============================================================================
// Checklist Types
// ============================================================================

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  commands?: CommandSnippet[];
  externalLinks?: ExternalLink[];
  completed: boolean;
}

// ============================================================================
// Troubleshooting Types
// ============================================================================

export interface TroubleshootingSection {
  commonIssues: TroubleshootingIssue[];
  platformStatusUrl: string;
  communityLinks: ExternalLink[];
}

export interface TroubleshootingIssue {
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  relatedLinks?: ExternalLink[];
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface GuideProgress {
  guideId: string;
  completedSteps: string[]; // Array of step IDs
  completedChecklistItems: string[]; // Array of checklist item IDs
  lastUpdated: Date;
  viewMode: 'quick-start' | 'detailed';
}

// ============================================================================
// Configuration Analysis Types
// ============================================================================

export interface DeploymentRequirements {
  requiresDatabase: boolean;
  databaseType?: string;
  requiresAuth: boolean;
  authProvider?: string;
  requiresAI: boolean;
  requiresRedis: boolean;
  isMonorepo: boolean;
  framework: string;
  buildTool: string;
  environmentVariables: EnvironmentVariable[];
}

export interface EnvironmentVariable {
  key: string;
  description: string;
  required: boolean;
  example?: string;
  howToGet: string;
  link?: string;
}
