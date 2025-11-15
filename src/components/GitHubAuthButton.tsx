'use client';

import { useState, useEffect } from 'react';
import { Github, Loader2, LogOut, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface AuthStatus {
  authenticated: boolean;
  user: GitHubUser | null;
}

interface GitHubAuthButtonProps {
  onAuthChange?: (authenticated: boolean) => void;
  className?: string;
}

export function GitHubAuthButton({
  onAuthChange,
  className = '',
}: GitHubAuthButtonProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  // Check authentication status on mount
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
      window.history.replaceState({}, '', '/configure');
    }

    if (authError) {
      setError(authError);
      setIsAuthenticating(false);
      // Clear URL params after showing error
      setTimeout(() => {
        window.history.replaceState({}, '', '/configure');
      }, 100);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/github/auth/status');
      const data = await response.json();

      setAuthStatus({
        authenticated: data.authenticated,
        user: data.user,
      });

      if (onAuthChange) {
        onAuthChange(data.authenticated);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setAuthStatus({
        authenticated: false,
        user: null,
      });
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

      if (onAuthChange) {
        onAuthChange(false);
      }
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
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 size={16} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Checking GitHub status...</span>
      </div>
    );
  }

  // Authenticated state
  if (authStatus.authenticated && authStatus.user) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300 hover:shadow-sm">
          <img
            src={authStatus.user.avatar_url}
            alt={authStatus.user.name}
            className="w-8 h-8 rounded-full ring-2 ring-green-200 transition-all duration-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {authStatus.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{authStatus.user.login}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sign out from GitHub"
          >
            {isSigningOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            Sign Out
          </button>
        </div>
        
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Not authenticated state
  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleSignIn}
        disabled={isAuthenticating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 hover:shadow-md active:bg-gray-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isAuthenticating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Connecting to GitHub...
          </>
        ) : (
          <>
            <Github size={18} />
            Sign in with GitHub
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-center text-gray-500 transition-opacity duration-200">
        Sign in to create GitHub repositories directly
      </p>
    </div>
  );
}
