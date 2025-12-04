'use client';

import { useState, useEffect } from 'react';
import { Github, Loader2, LogOut, AlertCircle, Check, X } from 'lucide-react';
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

  // Authenticated state
  if (authStatus.authenticated && authStatus.user) {
    return (
      <div className="flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md space-y-6">
          {/* Success card with pixel art styling */}
          <div 
            className="bg-[#2a2a2a] border-4 border-lime-500 rounded-lg p-6 space-y-4"
            style={{ 
              boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.8)',
              imageRendering: 'pixelated'
            }}
          >
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-lime-500 border-4 border-black rounded-full flex items-center justify-center">
                <Check size={32} className="text-black stroke-3" />
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border-2 border-lime-500 rounded">
              <img
                src={authStatus.user.avatar_url}
                alt={authStatus.user.name}
                className="w-12 h-12 rounded-full border-2 border-lime-500"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-pixelify text-white text-lg font-bold truncate">
                  {authStatus.user.name}
                </p>
                <p className="font-pixelify text-lime-500 text-sm truncate">
                  @{authStatus.user.login}
                </p>
              </div>
            </div>

            {/* Success message */}
            <div className="text-center space-y-2">
              <p className="font-pixelify text-white text-lg" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)' }}>
                Connected to GitHub!
              </p>
              <p className="font-pixelify text-gray-400 text-sm">
                Your repository will be created automatically
              </p>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-pixelify text-sm border-4 border-black rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.8)',
                imageRendering: 'pixelated'
              }}
            >
              {isSigningOut ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  Sign Out
                </>
              )}
            </button>
          </div>

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

  // Not authenticated state - Sign in or skip
  return (
    <div className="flex items-center justify-center px-4 pb-16">
      <div className="w-full max-w-md space-y-6">
        {/* Main card with pixel art styling */}
        <div 
          className="bg-[#2a2a2a] border-4 border-white rounded-lg p-6 space-y-6"
          style={{ 
            boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.8)',
            imageRendering: 'pixelated'
          }}
        >
          {/* GitHub icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center">
              <Github size={40} className="text-black" />
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-2">
            <p className="font-pixelify text-white text-base leading-relaxed">
              Connect your GitHub account to automatically create and push your project to a new repository
            </p>
          </div>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-lime-500 hover:bg-lime-600 text-black font-pixelify text-lg font-bold border-4 border-black rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : (
              <>
                <Github size={24} />
                Sign in with GitHub
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#2a2a2a] font-pixelify text-gray-400 text-sm">
                OR
              </span>
            </div>
          </div>

          {/* Skip info */}
          <div className="text-center space-y-3">
            <p className="font-pixelify text-gray-400 text-sm">
              Skip this step to download a ZIP file instead
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs font-pixelify">
              <X size={14} />
              <span>No repository will be created</span>
            </div>
          </div>
        </div>

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

        {/* Additional info */}
        <div className="text-center">
          <p className="font-pixelify text-gray-500 text-xs">
            You can always download the ZIP file later
          </p>
        </div>
      </div>
    </div>
)}
