'use client';

import { useState, useEffect } from 'react';
import { Github as GithubIcon, Loader2, LogOut, AlertCircle, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useConfigStore } from '@/lib/store/config-store';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface AuthStatus {
  authenticated: boolean;
  user: GitHubUser | null;
}

export function GitHubAuthStep() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const { setGithubEnabled } = useConfigStore();

  // Check authentication status on mount and update config store
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle OAuth callback messages
  useEffect(() => {
    const authSuccess = searchParams.get('github_auth_success');
    const authError = searchParams.get('github_auth_error');

    if (authSuccess) {
      checkAuthStatus();
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (authError) {
      setError(authError);
      setIsAuthenticating(false);
      // Clear URL params after showing error
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }, 100);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/github/auth/status');
      const data = await response.json();

      const newAuthStatus = {
        authenticated: data.authenticated,
        user: data.user,
      };

      setAuthStatus(newAuthStatus);
      
      // Update config store with authentication status
      setGithubEnabled(data.authenticated);
      
      // Show message if token expired
      if (data.expired) {
        setError('Your GitHub session has expired. Please sign in again.');
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setAuthStatus({
        authenticated: false,
        user: null,
      });
      setGithubEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await fetch('/api/github/auth/initiate');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate authentication');
      }

      // Redirect to GitHub OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Failed to initiate GitHub auth:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to start authentication. Please try again.'
      );
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError(null);

    try {
      const response = await fetch('/api/github/auth/signout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      setAuthStatus({
        authenticated: false,
        user: null,
      });
      
      // Update config store to reflect sign-out
      setGithubEnabled(false);
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center pb-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto" 
               style={{ imageRendering: 'pixelated' }} />
          <p className="font-pixelify text-lg text-white" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}>
            Checking your magical credentials...
          </p>
        </div>
      </div>
    );
  }

  const isAuthenticated = authStatus.authenticated && authStatus.user !== null;

  // Always show the same layout, but with different states
  return (
    <div className="flex items-center justify-center px-4 pb-16">
      <div className="w-full max-w-md space-y-6">
        {/* Main card with pixel art styling */}
        <div 
          className={`bg-[#2a2a2a] border-4 rounded-lg p-6 space-y-6 ${
            isAuthenticated ? 'border-lime-500' : 'border-white'
          }`}
          style={{ 
            boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.8)',
            imageRendering: 'pixelated'
          }}
        >
          {/* Icon - GitHub or Success */}
          <div className="flex justify-center">
            {isAuthenticated ? (
              <div className="w-16 h-16 bg-lime-500 border-4 border-black rounded-full flex items-center justify-center">
                <Check size={32} className="text-black stroke-3" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center">
                <GithubIcon size={40} className="text-black" />
              </div>
            )}
          </div>

          {/* User info or description */}
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border-2 border-lime-500 rounded">
                <img
                  src={authStatus.user!.avatar_url}
                  alt={authStatus.user!.name}
                  className="w-12 h-12 rounded-full border-2 border-lime-500"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-pixelify text-white text-lg font-bold truncate">
                    {authStatus.user!.name}
                  </p>
                  <p className="font-pixelify text-lime-500 text-sm truncate">
                    @{authStatus.user!.login}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-pixelify text-white text-xl font-bold" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}>
                  ✓ Signed In Successfully!
                </p>
                <p className="font-pixelify text-gray-400 text-sm">
                  Your repository will be created automatically
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <p className="font-pixelify text-white text-base leading-relaxed">
                Connect your GitHub account to automatically create and push your project to a new repository
              </p>
            </div>
          )}

          {/* Sign in button - always present, disabled when authenticated */}
          <button
            onClick={handleSignIn}
            disabled={isAuthenticated || isAuthenticating}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-pixelify text-lg font-bold border-4 border-black rounded transition-all duration-200 ${
              isAuthenticated
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-lime-500 hover:bg-lime-600 text-black disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            style={{ 
              boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.8)',
              imageRendering: 'pixelated'
            }}
          >
            {isAuthenticating ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Connecting...
              </>
            ) : isAuthenticated ? (
              <>
                <Check size={24} />
                Signed In
              </>
            ) : (
              <>
                <GithubIcon size={24} />
                Sign in with GitHub
              </>
            )}
          </button>

          {/* Sign out button - only show when authenticated */}
          {isAuthenticated && (
            <>
              <div className="border-t-2 border-lime-500/30" />
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-pixelify text-xs border-2 border-gray-600 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.6)',
                  imageRendering: 'pixelated'
                }}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <LogOut size={14} />
                    Sign Out
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Instruction card - only show when authenticated */}
        {isAuthenticated && (
          <div 
            className="bg-linear-to-r from-lime-500 to-green-500 border-4 border-black rounded-lg p-6 text-center space-y-3"
            style={{ 
              boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.8)',
              imageRendering: 'pixelated'
            }}
          >
            <p className="font-pixelify text-black text-lg font-bold" style={{ textShadow: '1px 1px 0px rgba(255, 255, 255, 0.3)' }}>
              Ready to Generate!
            </p>
            <p className="font-pixelify text-black text-sm">
              Click the <span className="font-bold">"Generate"</span> button below to create your boilerplate
            </p>
            <div className="flex justify-center pt-2">
              <div className="text-4xl animate-bounce">↓</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div 
            className="flex items-start gap-3 p-4 bg-red-900 border-4 border-red-500 rounded"
            style={{ 
              boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.8)',
              imageRendering: 'pixelated'
            }}
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-300" />
            <span className="font-pixelify text-red-100 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
