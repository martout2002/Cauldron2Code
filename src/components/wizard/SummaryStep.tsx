'use client';

import { ScaffoldConfig } from '@/types';
import { Check } from 'lucide-react';

interface SummaryStepProps {
  config: ScaffoldConfig;
}

export function SummaryStep({ config }: SummaryStepProps) {
  // Collect all selected options
  const selectedOptions = [
    config.frontendFramework && { label: config.frontendFramework, category: 'Frontend' },
    config.backendFramework && config.backendFramework !== 'none' && { label: config.backendFramework, category: 'Backend' },
    config.buildTool && { label: config.buildTool, category: 'Build Tool' },
    config.projectStructure && { label: config.projectStructure, category: 'Structure' },
    config.styling && { label: config.styling, category: 'Styling' },
    config.api && { label: config.api, category: 'API' },
    config.auth && config.auth !== 'none' && { label: config.auth, category: 'Auth' },
    config.database && config.database !== 'none' && { label: config.database, category: 'Database' },
    config.colorScheme && { label: config.colorScheme, category: 'Theme' },
    ...(config.deployment || []).map(deploy => ({ label: deploy, category: 'Deployment' })),
    ...(config.aiTemplates || []).map(template => ({ label: template, category: 'AI Template' })),
    config.aiProvider && { label: config.aiProvider, category: 'AI Provider' },
    config.extras?.docker && { label: 'Docker', category: 'Extra' },
    config.extras?.githubActions && { label: 'GitHub Actions', category: 'Extra' },
    config.extras?.redis && { label: 'Redis', category: 'Extra' },
    config.extras?.prettier && { label: 'Prettier', category: 'Extra' },
    config.extras?.husky && { label: 'Husky', category: 'Extra' },
  ].filter(Boolean) as Array<{ label: string; category: string }>;

  return (
    <div className="overflow-hidden">
      {/* Recipe checklist - positioned on the left */}
      <div className="absolute -mt-20 md:mb-10 left-4 top-4 bottom-24 w-72  bg-[#f5f1e8] border-4 border-black rounded-lg p-4 shadow-2xl flex flex-col">
        <h2 className="text-xl font-[family-name:var(--font-pixelify)] text-black mb-3 text-center shrink-0">
          All ingredients
        </h2>
        
        <div className="border-2 border-black rounded p-3  flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
          {selectedOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-1"
            >
              <div className="w-5 h-5 border-2 border-black bg-white flex items-center justify-center shrink-0">
                <Check 
                  size={16} 
                  className="text-black"
                  strokeWidth={3}
                />
              </div>
              <span className="text-sm  text-black font-[family-name:var(--font-pixelify)]">
                {option.label}
              </span>
            </div>
          ))}
        </div>

        {selectedOptions.length === 0 && (
          <p className="text-gray-500 font-[family-name:var(--font-pixelify)] text-center py-8 text-sm">
            No ingredients selected yet
          </p>
        )}
      </div>

    </div>
  );
}
