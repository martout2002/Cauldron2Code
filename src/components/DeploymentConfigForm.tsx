'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Info, Database, HelpCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { EnvironmentVariableInput } from './EnvironmentVariableInput';
import { ProjectNameInput } from './ProjectNameInput';
import type {
  DeploymentConfig,
  EnvironmentVariable,
  PlatformType,
} from '@/lib/platforms/types';
import type { ScaffoldConfig } from '@/types';

interface DeploymentConfigFormProps {
  scaffoldConfig: ScaffoldConfig;
  connectedPlatforms: PlatformType[];
  defaultPlatform?: PlatformType;
  onSubmit: (config: DeploymentConfig) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PLATFORM_NAMES: Record<PlatformType, string> = {
  vercel: 'Vercel',
  railway: 'Railway',
  render: 'Render',
};

const PLATFORM_SUPPORTS_DB: Record<PlatformType, boolean> = {
  vercel: false,
  railway: true,
  render: true,
};

export function DeploymentConfigForm({
  scaffoldConfig,
  connectedPlatforms,
  defaultPlatform,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DeploymentConfigFormProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(
    defaultPlatform || connectedPlatforms[0] || 'vercel'
  );
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [provisionDb, setProvisionDb] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  // Initialize project name from scaffold config
  useEffect(() => {
    if (scaffoldConfig.projectName && !projectName) {
      setProjectName(scaffoldConfig.projectName);
    }
  }, [scaffoldConfig.projectName]);

  // Detect environment variables when scaffold config changes
  useEffect(() => {
    detectEnvironmentVariables();
  }, [scaffoldConfig]);

  const detectEnvironmentVariables = async () => {
    try {
      // In a real implementation, this would call the EnvironmentVariableDetector
      // For now, we'll create a basic set based on the config
      const detected: EnvironmentVariable[] = [];

      // Database variables
      if (scaffoldConfig.database !== 'none') {
        detected.push({
          key: 'DATABASE_URL',
          value: '',
          description: 'PostgreSQL connection string',
          required: !provisionDb, // Not required if provisioning
          sensitive: true,
          example: 'postgresql://user:password@host:5432/dbname',
          validation: {
            pattern: '^postgresql://.+',
          },
        });
      }

      // Authentication variables
      if (scaffoldConfig.auth === 'nextauth') {
        detected.push(
          {
            key: 'NEXTAUTH_SECRET',
            value: '',
            description: 'Secret for NextAuth.js session encryption',
            required: true,
            sensitive: true,
            example: 'generated-secret-key',
            validation: {
              minLength: 32,
            },
          },
          {
            key: 'NEXTAUTH_URL',
            value: '',
            description: 'Canonical URL of your site',
            required: true,
            sensitive: false,
            example: 'https://your-app.vercel.app',
          }
        );
      }

      if (scaffoldConfig.auth === 'clerk') {
        detected.push(
          {
            key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
            value: '',
            description: 'Clerk publishable key',
            required: true,
            sensitive: false,
            example: 'pk_test_...',
          },
          {
            key: 'CLERK_SECRET_KEY',
            value: '',
            description: 'Clerk secret key',
            required: true,
            sensitive: true,
            example: 'sk_test_...',
          }
        );
      }

      if (scaffoldConfig.auth === 'supabase') {
        detected.push(
          {
            key: 'NEXT_PUBLIC_SUPABASE_URL',
            value: '',
            description: 'Supabase project URL',
            required: true,
            sensitive: false,
            example: 'https://xxxxx.supabase.co',
          },
          {
            key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            value: '',
            description: 'Supabase anonymous key',
            required: true,
            sensitive: false,
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          }
        );
      }

      // AI template variables
      if (scaffoldConfig.aiTemplate && scaffoldConfig.aiTemplate !== 'none') {
        if (scaffoldConfig.aiProvider === 'anthropic') {
          detected.push({
            key: 'ANTHROPIC_API_KEY',
            value: '',
            description: 'Anthropic API key for AI features',
            required: true,
            sensitive: true,
            example: 'sk-ant-...',
            validation: {
              pattern: '^sk-ant-',
            },
          });
        } else if (scaffoldConfig.aiProvider === 'openai') {
          detected.push({
            key: 'OPENAI_API_KEY',
            value: '',
            description: 'OpenAI API key for AI features',
            required: true,
            sensitive: true,
            example: 'sk-...',
          });
        }
      }

      // Redis variables
      if (scaffoldConfig.extras.redis) {
        detected.push({
          key: 'REDIS_URL',
          value: '',
          description: 'Redis connection URL',
          required: false,
          sensitive: true,
          example: 'redis://localhost:6379',
        });
      }

      setEnvVars(detected);
    } catch (error) {
      console.error('Failed to detect environment variables:', error);
    }
  };

  // Check project name availability (debounced)
  useEffect(() => {
    if (!projectName || projectName.trim().length === 0) {
      setNameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkProjectNameAvailability(projectName);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [projectName, selectedPlatform]);

  const checkProjectNameAvailability = async (name: string) => {
    setIsCheckingName(true);
    setErrors((prev) => {
      const { projectName, ...rest } = prev;
      return rest;
    });

    try {
      // In a real implementation, this would check with the platform API
      // For now, we'll just validate the format
      const isValid = /^[a-z0-9-]+$/.test(name);
      setNameAvailable(isValid);

      if (!isValid) {
        setErrors((prev) => ({
          ...prev,
          projectName:
            'Project name must be lowercase alphanumeric with hyphens only',
        }));
      }
    } catch (error) {
      console.error('Failed to check name availability:', error);
      setNameAvailable(null);
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVars((prev) =>
      prev.map((v) => (v.key === key ? { ...v, value } : v))
    );

    // Clear error for this field
    setErrors((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleProvisionDbChange = (checked: boolean) => {
    setProvisionDb(checked);

    // Update DATABASE_URL requirement
    setEnvVars((prev) =>
      prev.map((v) =>
        v.key === 'DATABASE_URL' ? { ...v, required: !checked } : v
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate project name
    if (!projectName || projectName.trim().length === 0) {
      newErrors.projectName = 'Project name is required';
    } else if (!/^[a-z0-9-]+$/.test(projectName)) {
      newErrors.projectName =
        'Project name must be lowercase alphanumeric with hyphens only';
    } else if (nameAvailable === false) {
      newErrors.projectName = 'This project name is not available';
    }

    // Validate required environment variables
    for (const envVar of envVars) {
      if (envVar.required && (!envVar.value || envVar.value.trim().length === 0)) {
        newErrors[envVar.key] = `${envVar.key} is required`;
      } else if (envVar.value && envVar.validation) {
        // Validate pattern
        if (
          envVar.validation.pattern &&
          !new RegExp(envVar.validation.pattern).test(envVar.value)
        ) {
          newErrors[envVar.key] = `${envVar.key} format is invalid`;
        }

        // Validate length
        if (
          envVar.validation.minLength &&
          envVar.value.length < envVar.validation.minLength
        ) {
          newErrors[envVar.key] = `${envVar.key} must be at least ${envVar.validation.minLength} characters`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const config: DeploymentConfig = {
      projectName: projectName.trim(),
      platform: selectedPlatform,
      scaffoldConfig,
      environmentVariables: envVars,
      services: [],
    };

    onSubmit(config);
  };

  const hasRequiredVars = envVars.some((v) => v.required);
  const supportsDbProvisioning =
    PLATFORM_SUPPORTS_DB[selectedPlatform] &&
    scaffoldConfig.database !== 'none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configure Deployment
        </h2>
        <p className="text-sm text-gray-600">
          Set up your project for deployment to {PLATFORM_NAMES[selectedPlatform]}
        </p>
      </div>

      {/* Platform Selection (if multiple connected) */}
      {connectedPlatforms.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deployment Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {connectedPlatforms.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => setSelectedPlatform(platform)}
                disabled={isSubmitting}
                className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPlatform === platform
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {PLATFORM_NAMES[platform]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project Name */}
      <ProjectNameInput
        value={projectName}
        onChange={setProjectName}
        platform={selectedPlatform}
        error={errors.projectName}
        onAvailabilityChange={(available) => setNameAvailable(available)}
      />

      {/* Database Provisioning */}
      {supportsDbProvisioning && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={provisionDb}
              onChange={(e) => handleProvisionDbChange(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-blue-600" />
                <span className="font-medium text-blue-900">
                  Provision PostgreSQL Database
                </span>
                <Tooltip content="StackForge will create a new database instance on the platform and automatically configure the DATABASE_URL environment variable.">
                  <HelpCircle size={14} className="text-blue-600 cursor-help" />
                </Tooltip>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Automatically create and configure a database on{' '}
                {PLATFORM_NAMES[selectedPlatform]}. The DATABASE_URL will be set
                automatically.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Environment Variables */}
      {envVars.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Environment Variables
            </h3>
            <Tooltip content="Environment variables are configuration values your application needs to run. Required variables must be provided before deployment.">
              <Info size={16} className="text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {hasRequiredVars
              ? 'Configure required environment variables for your application'
              : 'All environment variables are optional'}
          </p>

          <div className="space-y-4">
            {envVars.map((envVar) => (
              <EnvironmentVariableInput
                key={envVar.key}
                envVar={envVar}
                onChange={(value) => handleEnvVarChange(envVar.key, value)}
                error={errors[envVar.key]}
                disabled={isSubmitting}
              />
            ))}
          </div>
        </div>
      )}

      {/* Warning for missing required vars */}
      {hasRequiredVars && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Make sure to provide all required environment variables. Your
            application may not work correctly without them.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Cancel deployment"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            isCheckingName ||
            nameAvailable === false ||
            !projectName
          }
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isSubmitting ? 'Deploying application' : 'Start deployment'}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Deploying...
            </>
          ) : (
            'Deploy Now'
          )}
        </button>
      </div>
    </form>
  );
}
