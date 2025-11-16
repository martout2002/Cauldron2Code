/**
 * Platform Integration Types
 * Core type definitions for deployment platform integrations
 */

import type { ScaffoldConfig } from '@/types';

export type PlatformType = 'vercel' | 'railway' | 'render';

export interface PlatformConnection {
  id: string;
  userId: string;
  platform: PlatformType;
  accountId: string;
  accountName: string;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  expiresAt: Date;
  scopes: string[];
  createdAt: Date;
  lastUsedAt: Date;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  required: boolean;
  sensitive: boolean;
  example?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface DeploymentService {
  name: string; // e.g., "web", "api"
  type: 'frontend' | 'backend' | 'fullstack';
  buildCommand: string;
  startCommand: string;
  outputDirectory?: string;
  environmentVariables: EnvironmentVariable[];
  dependencies: string[]; // Other services this depends on
}

export interface DeploymentConfig {
  projectName: string;
  platform: PlatformType;
  scaffoldConfig: ScaffoldConfig;
  environmentVariables: EnvironmentVariable[];
  services: DeploymentService[]; // For monorepos
  teamId?: string; // For team deployments
}

export interface PlatformProject {
  id: string;
  name: string;
  url: string;
  platform: PlatformType;
  createdAt: Date;
}

export interface DeploymentStatus {
  state: 'queued' | 'building' | 'deploying' | 'ready' | 'error' | 'canceled';
  url?: string;
  readyAt?: Date;
  error?: string;
  buildLogs?: string[];
}

export interface DatabaseInfo {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DeployedService {
  name: string;
  url: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  platformProjectId: string;
  buildLogs: string[];
}

export interface DeploymentError {
  code: string;
  message: string;
  step: 'auth' | 'create' | 'upload' | 'configure' | 'build' | 'deploy';
  platformError?: any;
  recoverable: boolean;
  suggestions: string[];
}

export interface Deployment {
  id: string;
  userId: string;
  projectName: string;
  platform: PlatformType;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  deploymentUrl?: string;
  previewUrl?: string;
  services: DeployedService[];
  config: DeploymentConfig;
  buildLogs: string[];
  error?: DeploymentError;
  createdAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
}

export interface GeneratedFile {
  path: string;
  content: string;
}
