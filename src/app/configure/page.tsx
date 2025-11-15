'use client';

import { ConfigurationWizard } from '@/components/ConfigurationWizard';
import { ValidationAlert } from '@/components/ValidationAlert';
import { PreviewPanel } from '@/components/PreviewPanel';
import { ColorSchemeSelector } from '@/components/ColorSchemeSelector';
import { GenerateButton } from '@/components/GenerateButton';
import { ToastContainer } from '@/components/Toast';
import { useConfigStore } from '@/lib/store/config-store';
import { useValidation } from '@/lib/validation/useValidation';
import { useToast } from '@/lib/hooks/useToast';

export default function ConfigurePage() {
  const { config, updateConfig } = useConfigStore();
  
  // Wire validation engine to configuration changes
  const { validationResult, isValidating } = useValidation(config);
  
  // Toast notifications for user feedback
  const toast = useToast();

  return (
    <>
      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop: 1024px+ - Multi-column layout with side-by-side preview */}
      {/* Tablet: 768px-1023px - Single column with stacked preview */}
      {/* Mobile: <768px - Single column, compact spacing */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,450px] gap-6 md:gap-8 lg:gap-10">
          {/* Main Configuration Area */}
          <div className="w-full">
            <ConfigurationWizard />
            
            {/* Color Scheme Selector */}
            <div className="mt-6 md:mt-8">
              <ColorSchemeSelector
                value={config.colorScheme}
                onChange={(scheme) => updateConfig({ colorScheme: scheme as 'purple' | 'gold' | 'white' | 'futuristic' })}
              />
            </div>
            
            {/* Validation Alerts - Connected to validation engine */}
            <div className="mt-6 md:mt-8">
              <ValidationAlert 
                errors={validationResult.errors}
                warnings={validationResult.warnings}
              />
            </div>
            
            {/* Generate Button - Connected to validation and generation API */}
            <div className="mt-6 md:mt-8">
              <GenerateButton 
                config={config}
                validationResult={validationResult}
                isValidating={isValidating}
                onSuccess={() => toast.success('Scaffold Generated!', 'Your project is ready to download')}
                onError={(error) => toast.error('Generation Failed', error)}
              />
            </div>
          </div>
          
          {/* Preview Panel - Side-by-side on desktop, stacked on tablet/mobile */}
          <div className="w-full lg:order-last order-first">
            {/* Sticky on desktop (1024px+), static on tablet/mobile */}
            <div className="lg:sticky lg:top-8">
              <PreviewPanel config={config} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
