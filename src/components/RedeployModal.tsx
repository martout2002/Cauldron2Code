'use client';

import { useState } from 'react';
import type { EnvironmentVariable } from '@/lib/platforms/types';
import { EnvironmentVariableInput } from './EnvironmentVariableInput';

interface RedeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (envVars?: EnvironmentVariable[]) => void;
  environmentVariables: EnvironmentVariable[];
  projectName: string;
}

export function RedeployModal({
  isOpen,
  onClose,
  onConfirm,
  environmentVariables,
  projectName,
}: RedeployModalProps) {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>(environmentVariables);
  const [updateEnvVars, setUpdateEnvVars] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (updateEnvVars) {
      onConfirm(envVars);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Redeploy Project</h2>
          <p className="text-gray-600 mb-6">
            Redeploy <span className="font-semibold">{projectName}</span> with the same configuration
          </p>

          {/* Option to update environment variables */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateEnvVars}
                onChange={(e) => setUpdateEnvVars(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Update environment variables
              </span>
            </label>
          </div>

          {/* Environment Variables Form */}
          {updateEnvVars && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
              {envVars.length === 0 ? (
                <p className="text-gray-500 text-sm">No environment variables configured</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {envVars.map((envVar) => (
                    <EnvironmentVariableInput
                      key={envVar.key}
                      envVar={envVar}
                      onChange={(value) => {
                        setEnvVars((prev) =>
                          prev.map((v) =>
                            v.key === envVar.key ? { ...v, value } : v
                          )
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Redeploy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
