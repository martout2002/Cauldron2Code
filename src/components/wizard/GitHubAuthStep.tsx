'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface GitHubAuthStepProps {
  onAuthenticate: () => void;
}

export function GitHubAuthStep({ onAuthenticate }: GitHubAuthStepProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    // Check for GitHub session/token
    // This is a placeholder - in production, check actual auth state
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsAuthenticated(true);
            setUsername(data.user.login || data.user.name);
          }
        }
      } catch (error) {
        // Not authenticated
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated) {
    // Show signed-in state
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        {/* GitHub Cat Icon */}
        <div className="mb-8">
          <img 
            src="/github.png" 
            alt="GitHub" 
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Success Message */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 border-2 border-black bg-green-500 flex items-center justify-center rounded">
            <Check size={20} className="text-white stroke-3" />
          </div>
          <p className="text-white font-pixelify text-2xl">
            Signed in as {username}
          </p>
        </div>

        <p className="text-gray-300 font-pixelify text-center max-w-md">
          You're all set! Click Generate to create your repository.
        </p>
      </div>
    );
  }

  // Show sign-in prompt
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      {/* GitHub Cat Icon */}
      <div className="mb-8">
        <img 
          src="/github.png" 
          alt="GitHub" 
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Sign In Message */}
      <p className="text-white font-pixelify text-xl text-center mb-8 max-w-md">
        Connect your GitHub account to create your repository
      </p>

      <p className="text-gray-300 font-pixelify text-center max-w-md">
        Click Next to sign in with GitHub OAuth
      </p>
    </div>
  );
}
