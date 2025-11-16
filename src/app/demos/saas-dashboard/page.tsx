"use client";

import { useState } from "react";
import Link from "next/link";

// Mock authentication state
const useMockAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const signIn = () => {
    setIsAuthenticated(true);
    setUser({ name: "Demo User", email: "demo@example.com" });
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, signIn, signOut };
};

// Mock dashboard data
const dashboardData = {
  metrics: [
    { label: "Total Users", value: "2,543", change: "+12.5%", trend: "up" },
    { label: "Revenue", value: "$45,231", change: "+8.2%", trend: "up" },
    { label: "Active Projects", value: "127", change: "-3.1%", trend: "down" },
    { label: "Conversion Rate", value: "3.24%", change: "+0.8%", trend: "up" },
  ],
  recentActivity: [
    { user: "Alice Johnson", action: "Created new project", time: "2 minutes ago" },
    { user: "Bob Smith", action: "Updated dashboard settings", time: "15 minutes ago" },
    { user: "Carol White", action: "Invited team member", time: "1 hour ago" },
    { user: "David Brown", action: "Completed onboarding", time: "2 hours ago" },
  ],
};

export default function SaaSDashboardDemo() {
  const { isAuthenticated, user, signIn, signOut } = useMockAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-zinc-950 dark:to-purple-950/20">
        {/* Header */}
        <header className="border-b border-purple-200 dark:border-purple-900/30 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  SaaS Dashboard Demo
                </span>
              </div>
              <Link
                href="/demos"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ← Back to Demos
              </Link>
            </div>
          </div>
        </header>

        {/* Login Page */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-900/30 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Welcome Back
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Sign in to access your dashboard
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={signIn}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Sign in with GitHub
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-500">or</span>
                  </div>
                </div>

                <button
                  onClick={signIn}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
                >
                  Demo Sign In (No Auth Required)
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                <p className="text-sm text-purple-900 dark:text-purple-300">
                  <strong>Demo Note:</strong> This is a demonstration of a SaaS dashboard built with Cauldron2Code. 
                  In a real application, authentication would be handled by NextAuth with GitHub OAuth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-zinc-950 dark:to-purple-950/20">
      {/* Header */}
      <header className="border-b border-purple-200 dark:border-purple-900/30 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                SaaS Dashboard Demo
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-purple-200 dark:border-purple-900/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">{user?.name}</div>
                  <div className="text-zinc-500 dark:text-zinc-400">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Sign Out
              </button>
              <Link
                href="/demos"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30 hover:border-purple-400 dark:hover:border-purple-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {metric.label}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    metric.trend === "up"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Revenue Overview
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-600 rounded-t-lg transition-all hover:from-purple-700 hover:to-blue-700"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-zinc-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              User Growth
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 55, 48, 70, 65, 82, 90].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all hover:from-green-600 hover:to-emerald-600"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-zinc-500">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {activity.user}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {activity.action}
                  </div>
                </div>
                <div className="text-sm text-zinc-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Info Banner */}
        <div className="mt-8 p-6 bg-purple-100 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-900/30">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2">
            About This Demo
          </h3>
          <p className="text-purple-800 dark:text-purple-400 mb-4">
            This SaaS dashboard was generated using Cauldron2Code with the following configuration:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Framework:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">Monorepo (Next.js + Express API)</span>
            </div>
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Authentication:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">NextAuth with GitHub</span>
            </div>
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Database:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">Prisma + PostgreSQL</span>
            </div>
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Styling:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">Tailwind + shadcn/ui</span>
            </div>
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Color Scheme:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">Purple</span>
            </div>
            <div>
              <strong className="text-purple-900 dark:text-purple-300">Deployment:</strong>{" "}
              <span className="text-purple-800 dark:text-purple-400">Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
