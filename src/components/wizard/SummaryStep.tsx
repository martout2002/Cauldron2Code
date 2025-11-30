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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Recipe checklist - positioned on the left */}
      <div className="absolute left-8 top-0 bottom-4 w-80 bg-[#f5f1e8] border-4 border-black rounded-lg p-6 shadow-2xl flex flex-col">
        
        <div className="border-2 border-black rounded p-4 space-y-1 overflow-y-auto custom-scrollbar-light flex-1">
          {selectedOptions.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-1"
            >
              <div className="w-5 h-5 border-2 border-black bg-white flex items-center justify-center shrink-0">
                <Check 
                  size={16} 
                  className="text-black stroke-3" 
                />
              </div>
              <span className="text-black font-pixelify">
                {option.label}
              </span>
            </div>
          ))}
        </div>

        {selectedOptions.length === 0 && (
          <p className="text-gray-600 font-pixelify text-center py-8 text-sm">
            No ingredients selected yet
          </p>
        )}
      </div>

    </div>
  );
}
