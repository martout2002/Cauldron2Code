"use client";

import Link from "next/link";

const demos = [
  {
    id: "saas-dashboard",
    title: "SaaS Dashboard",
    description: "A modern SaaS application with user authentication, dashboard analytics, and data visualization. Perfect for building internal tools or customer-facing platforms.",
    theme: "Purple",
    liveUrl: "https://stackforge-saas-demo.vercel.app",
    features: [
      "User authentication with NextAuth",
      "Dashboard with charts and metrics",
      "Database integration with Prisma",
      "Responsive design with Tailwind CSS",
      "Protected routes and session management"
    ],
    config: {
      framework: "Monorepo (Next.js + Express API)",
      auth: "NextAuth with GitHub",
      database: "Prisma + PostgreSQL",
      styling: "Tailwind + shadcn/ui",
      colorScheme: "Purple",
      deployment: "Vercel"
    },
    tags: ["Authentication", "Dashboard", "Database", "Monorepo"]
  },
  {
    id: "public-api",
    title: "Public API Service",
    description: "An AI-powered document analysis API with comprehensive documentation. Ideal for building public-facing APIs or microservices with AI capabilities.",
    theme: "Futuristic",
    liveUrl: "https://stackforge-api-demo.railway.app",
    features: [
      "RESTful API endpoints",
      "AI document analyzer integration",
      "Supabase database integration",
      "API documentation with examples",
      "Rate limiting and error handling"
    ],
    config: {
      framework: "Next.js (API routes)",
      auth: "None (public API)",
      database: "Supabase",
      api: "REST with rate limiting",
      colorScheme: "Futuristic",
      deployment: "Railway",
      aiTemplate: "Document Analyzer"
    },
    tags: ["API", "AI", "Supabase", "Serverless"]
  }
];

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              StackForge
            </Link>
            <Link
              href="/configure"
              className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Build Your Own
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Live Demos
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Explore real applications built with StackForge. Each demo showcases different use cases and technology combinations—all generated from the same base scaffold.
          </p>
        </div>
      </section>

      {/* Demos Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {demos.map((demo, index) => (
            <div
              key={demo.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-purple-600 dark:hover:border-purple-400 transition-all shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Left Column - Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      Demo {index + 1}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
                      {demo.theme} Theme
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    {demo.title}
                  </h2>
                  
                  <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                    {demo.description}
                  </p>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 uppercase tracking-wide">
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {demo.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={demo.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      View Live Demo
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        const configSection = document.getElementById(`config-${demo.id}`);
                        configSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-400 transition-all"
                    >
                      View Configuration
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Right Column - Configuration */}
                <div id={`config-${demo.id}`} className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Stack Configuration
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(demo.config).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-zinc-900 dark:text-zinc-50 font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                      href="/configure"
                      className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      Use this configuration
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Ready to Build Your Own?
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Create a custom scaffold with your preferred technologies in minutes
          </p>
          <Link
            href="/configure"
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Configuring
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
            ← Back to Home
          </Link>
          <p className="text-zinc-600 dark:text-zinc-400">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
