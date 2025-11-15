'use client';

import { FileText, Package, Clock, Folder, File } from 'lucide-react';
import type { ScaffoldConfig } from '@/types';

interface PreviewPanelProps {
  config: ScaffoldConfig;
  className?: string;
}

export function PreviewPanel({ config, className = '' }: PreviewPanelProps) {
  const estimatedBundleSize = calculateBundleSize(config);
  const estimatedGenerationTime = calculateGenerationTime(config);
  const fileList = generateFileList(config);
  const techSummary = generateTechSummary(config);

  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow fade-in ${className}`}>
      <div className="border-b p-4 md:p-5 bg-gradient-to-r from-purple-50 to-white">
        <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <FileText size={18} className="md:w-5 md:h-5 text-purple-600" />
          Preview
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Summary of your project configuration
        </p>
      </div>

      <div className="p-4 md:p-5 space-y-4 md:space-y-6">
        {/* Estimates */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <EstimateCard
            icon={<Package size={18} className="md:w-5 md:h-5" />}
            label="Bundle Size"
            value={estimatedBundleSize}
            color="blue"
          />
          <EstimateCard
            icon={<Clock size={18} className="md:w-5 md:h-5" />}
            label="Generation Time"
            value={estimatedGenerationTime}
            color="green"
          />
        </div>

        {/* Technology Summary */}
        <div>
          <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <Package size={14} className="md:w-4 md:h-4" />
            Selected Technologies
          </h4>
          <div className="space-y-1.5 md:space-y-2">
            {techSummary.map((tech) => (
              <TechSummaryItem key={tech.category} {...tech} />
            ))}
          </div>
        </div>

        {/* File Structure Preview */}
        <div>
          <h4 className="text-xs md:text-sm font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <Folder size={14} className="md:w-4 md:h-4" />
            Files to be Generated
          </h4>
          <div className="bg-gray-50 rounded-lg p-2 md:p-3 max-h-48 md:max-h-64 overflow-y-auto">
            <FileTree files={fileList} />
          </div>
          <p className="text-xs text-gray-500 mt-1.5 md:mt-2">
            {fileList.length} files will be generated
          </p>
        </div>
      </div>
    </div>
  );
}

interface EstimateCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple';
}

function EstimateCard({ icon, label, value, color }: EstimateCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`border rounded-lg p-2.5 md:p-3 ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">{icon}</div>
      <div className="text-[10px] md:text-xs opacity-80 mb-0.5 md:mb-1">{label}</div>
      <div className="text-base md:text-lg font-bold">{value}</div>
    </div>
  );
}

interface TechSummaryItemProps {
  category: string;
  value: string;
}

function TechSummaryItem({ category, value }: TechSummaryItemProps) {
  return (
    <div className="flex items-center justify-between py-1.5 md:py-2 border-b last:border-b-0">
      <span className="text-xs md:text-sm text-gray-600">{category}</span>
      <span className="text-xs md:text-sm font-medium truncate ml-2">{value}</span>
    </div>
  );
}

interface FileTreeProps {
  files: string[];
}

function FileTree({ files }: FileTreeProps) {
  // Group files by directory
  const tree = buildFileTree(files);

  return (
    <div className="font-mono text-xs space-y-1">
      {tree.map((item, index) => (
        <FileTreeItem key={index} item={item} depth={0} />
      ))}
    </div>
  );
}

interface TreeItem {
  name: string;
  type: 'file' | 'directory';
  children?: TreeItem[];
}

interface FileTreeItemProps {
  item: TreeItem;
  depth: number;
}

function FileTreeItem({ item, depth }: FileTreeItemProps) {
  const indent = depth * 12;

  return (
    <>
      <div
        className="flex items-center gap-1.5 md:gap-2 py-0.5 hover:bg-gray-100 rounded px-1"
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        {item.type === 'directory' ? (
          <Folder size={12} className="md:w-3.5 md:h-3.5 text-blue-500 shrink-0" />
        ) : (
          <File size={12} className="md:w-3.5 md:h-3.5 text-gray-400 shrink-0" />
        )}
        <span className="text-gray-700 text-[11px] md:text-xs truncate">{item.name}</span>
      </div>
      {item.children?.map((child, index) => (
        <FileTreeItem key={index} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

// Helper functions

function calculateBundleSize(config: ScaffoldConfig): string {
  let size = 2.5; // Base Next.js size in MB

  if (config.shadcn) size += 0.3;
  if (config.auth !== 'none') size += 0.5;
  if (config.database !== 'none') size += 0.4;
  if (config.api === 'trpc') size += 0.3;
  if (config.api === 'graphql') size += 0.6;
  if (config.aiTemplate && config.aiTemplate !== 'none') size += 0.8;
  if (config.extras.redis) size += 0.2;

  return `~${size.toFixed(1)} MB`;
}

function calculateGenerationTime(config: ScaffoldConfig): string {
  let time = 5; // Base time in seconds

  if (config.framework === 'monorepo') time += 8;
  if (config.auth !== 'none') time += 3;
  if (config.database !== 'none') time += 4;
  if (config.aiTemplate && config.aiTemplate !== 'none') time += 5;
  if (config.deployment.length > 1) time += config.deployment.length * 2;
  if (config.extras.docker) time += 3;
  if (config.extras.githubActions) time += 2;

  return `~${time}s`;
}

function generateTechSummary(config: ScaffoldConfig): TechSummaryItemProps[] {
  const summary: TechSummaryItemProps[] = [
    { category: 'Framework', value: config.framework },
    { category: 'Authentication', value: config.auth },
    { category: 'Database', value: config.database },
    { category: 'API Layer', value: config.api },
    { category: 'Styling', value: config.styling },
    { category: 'Color Scheme', value: config.colorScheme },
  ];

  if (config.nextjsRouter) {
    summary.splice(1, 0, {
      category: 'Next.js Router',
      value: config.nextjsRouter,
    });
  }

  if (config.aiTemplate && config.aiTemplate !== 'none') {
    summary.push({ category: 'AI Template', value: config.aiTemplate });
  }

  if (config.deployment.length > 0) {
    summary.push({
      category: 'Deployment',
      value: config.deployment.join(', '),
    });
  }

  return summary;
}

function generateFileList(config: ScaffoldConfig): string[] {
  const files: string[] = [
    'package.json',
    'tsconfig.json',
    '.gitignore',
    'README.md',
    '.env.example',
  ];

  // Framework-specific files
  if (config.framework === 'next' || config.framework === 'monorepo') {
    files.push(
      'next.config.ts',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css'
    );
  }

  if (config.framework === 'express' || config.framework === 'monorepo') {
    files.push('server.ts', 'routes/index.ts');
  }

  if (config.framework === 'monorepo') {
    files.push('turbo.json', 'apps/web/package.json', 'apps/api/package.json');
  }

  // Styling files
  if (config.styling === 'tailwind') {
    files.push('tailwind.config.ts', 'postcss.config.mjs');
  }

  if (config.shadcn) {
    files.push('components.json', 'components/ui/button.tsx');
  }

  // Auth files
  if (config.auth === 'nextauth') {
    files.push('app/api/auth/[...nextauth]/route.ts', 'lib/auth.ts');
  }

  if (config.auth === 'clerk') {
    files.push('middleware.ts', 'app/sign-in/page.tsx');
  }

  // Database files
  if (config.database === 'prisma-postgres') {
    files.push('prisma/schema.prisma', 'lib/prisma.ts');
  }

  if (config.database === 'drizzle-postgres') {
    files.push('drizzle.config.ts', 'db/schema.ts');
  }

  if (config.database === 'supabase') {
    files.push('lib/supabase.ts', 'supabase/migrations/001_initial.sql');
  }

  // AI template files
  if (config.aiTemplate && config.aiTemplate !== 'none') {
    files.push('app/api/chat/route.ts', 'components/ChatInterface.tsx');
  }

  // Deployment files
  if (config.deployment.includes('vercel')) {
    files.push('vercel.json');
  }

  if (config.deployment.includes('railway')) {
    files.push('railway.json');
  }

  if (config.extras.docker) {
    files.push('Dockerfile', 'docker-compose.yml', '.dockerignore');
  }

  if (config.extras.githubActions) {
    files.push('.github/workflows/ci.yml');
  }

  if (config.extras.prettier) {
    files.push('.prettierrc', '.prettierignore');
  }

  if (config.extras.husky) {
    files.push('.husky/pre-commit');
  }

  files.push('SETUP.md');

  return files.sort();
}

function buildFileTree(files: string[]): TreeItem[] {
  const root: TreeItem[] = [];
  const dirMap = new Map<string, TreeItem>();

  files.forEach((file) => {
    const parts = file.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;

      if (isFile) {
        currentLevel.push({ name: part, type: 'file' });
      } else {
        let dir = dirMap.get(currentPath);
        if (!dir) {
          dir = { name: part, type: 'directory', children: [] };
          dirMap.set(currentPath, dir);
          currentLevel.push(dir);
        }
        currentLevel = dir.children!;
      }
    });
  });

  return root;
}
