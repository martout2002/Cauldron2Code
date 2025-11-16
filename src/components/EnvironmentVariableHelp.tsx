'use client';

/**
 * EnvironmentVariableHelp Component
 * 
 * Displays detailed help information for environment variables including:
 * - Purpose and usage
 * - Where to get values
 * - Step-by-step instructions
 * - Consequences of missing optional variables
 * - Links to service documentation
 * 
 * Requirements 11.3, 11.4: Environment variable help system
 */

import { useState } from 'react';
import { HelpCircle, ExternalLink, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { getEnvVarHelp, type EnvVarHelpInfo } from '@/lib/deployment/environment-variable-help';

interface EnvironmentVariableHelpProps {
  envVarKey: string;
  isRequired: boolean;
}

export function EnvironmentVariableHelp({
  envVarKey,
  isRequired,
}: EnvironmentVariableHelpProps) {
  const [showHelp, setShowHelp] = useState(false);
  const helpInfo = getEnvVarHelp(envVarKey);

  if (!helpInfo) {
    return null;
  }

  return (
    <>
      {/* Help Button */}
      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
      >
        <HelpCircle size={14} />
        Need help?
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{helpInfo.key}</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close help"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Purpose */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">What is this?</h4>
                </div>
                <p className="text-sm text-gray-700">{helpInfo.purpose}</p>
              </div>

              {/* How to Get */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <h4 className="font-semibold text-gray-900">How to get it</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">{helpInfo.whereToGet}</p>
                <ol className="space-y-2">
                  {helpInfo.howToGet.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs shrink-0">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Example */}
              {helpInfo.example && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Example</h4>
                  <div className="p-3 bg-gray-100 rounded font-mono text-sm text-gray-800 overflow-x-auto">
                    {helpInfo.example}
                  </div>
                </div>
              )}

              {/* Consequences */}
              {helpInfo.consequences && (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        {isRequired ? 'Required' : 'What happens without it?'}
                      </h4>
                      <p className="text-sm text-yellow-800">{helpInfo.consequences}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              {helpInfo.tips && helpInfo.tips.length > 0 && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
                  <ul className="space-y-1">
                    {helpInfo.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-blue-800">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documentation Links */}
              {helpInfo.documentationLinks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    📚 Documentation & Resources
                  </h4>
                  <div className="space-y-2">
                    {helpInfo.documentationLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {link.text}
                        </span>
                        <ExternalLink
                          size={16}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Inline help tooltip for quick reference
 */
export function EnvironmentVariableHelpTooltip({
  envVarKey,
}: {
  envVarKey: string;
}) {
  const helpInfo = getEnvVarHelp(envVarKey);

  if (!helpInfo) {
    return null;
  }

  return (
    <div className="text-xs text-gray-600 space-y-2">
      <p>{helpInfo.purpose}</p>
      {helpInfo.example && (
        <div className="p-2 bg-gray-100 rounded font-mono text-xs">
          {helpInfo.example}
        </div>
      )}
      <p className="text-blue-600">Click "Need help?" for detailed instructions</p>
    </div>
  );
}

/**
 * Compact help summary for deployment config form
 */
export function EnvironmentVariableHelpSummary({
  envVarKey,
  isRequired,
}: {
  envVarKey: string;
  isRequired: boolean;
}) {
  const helpInfo = getEnvVarHelp(envVarKey);

  if (!helpInfo) {
    return null;
  }

  return (
    <div className="text-xs space-y-1">
      <p className="text-gray-600">{helpInfo.whereToGet}</p>
      {!isRequired && helpInfo.consequences && (
        <p className="text-yellow-700 italic">
          Optional: {helpInfo.consequences}
        </p>
      )}
    </div>
  );
}
