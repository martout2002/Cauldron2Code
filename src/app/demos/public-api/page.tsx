"use client";

import { useState } from "react";
import Link from "next/link";

const apiEndpoints = [
  {
    method: "POST",
    path: "/api/analyze",
    description: "Analyze a document using AI",
    params: [
      { name: "file", type: "File", required: true, description: "Document to analyze" },
      { name: "prompt", type: "string", required: true, description: "Analysis instructions" },
    ],
    response: {
      analysis: "string",
      confidence: "number",
      metadata: "object"
    }
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Check API health status",
    params: [],
    response: {
      status: "ok",
      database: "connected",
      timestamp: "2024-01-15T10:30:00Z"
    }
  },
  {
    method: "GET",
    path: "/api/docs",
    description: "Get API documentation",
    params: [],
    response: {
      version: "1.0.0",
      endpoints: "array"
    }
  }
];

export default function PublicAPIDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("Summarize the key points in this document");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate API call
    setTimeout(() => {
      setResult(
        `Document Analysis Results:\n\n` +
        `File: ${selectedFile.name}\n` +
        `Size: ${(selectedFile.size / 1024).toFixed(2)} KB\n\n` +
        `Analysis: This is a demonstration of the document analyzer AI template. ` +
        `In a real application, this would use the Anthropic Claude API to analyze the document content ` +
        `based on your prompt: "${prompt}"\n\n` +
        `Key Features:\n` +
        `• File upload and processing\n` +
        `• AI-powered document analysis\n` +
        `• Customizable analysis prompts\n` +
        `• Structured JSON responses\n\n` +
        `Confidence Score: 0.94`
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 animate-pulse" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                API Service Demo
              </span>
            </div>
            <Link
              href="/demos"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Back to Demos
            </Link>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
            AI-Powered Document Analysis API
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A production-ready RESTful API with AI document analysis capabilities
          </p>
        </div>

        {/* Interactive Demo Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Try It Out */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Try It Out
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Upload Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.doc,.docx"
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 file:cursor-pointer cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-cyan-400">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Analysis Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-cyan-500/20 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  placeholder="What would you like to know about this document?"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Document"
                )}
              </button>

              {result && (
                <div className="mt-4 p-4 bg-slate-950/50 border border-cyan-500/20 rounded-lg">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">Response:</h3>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                    {result}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right: API Documentation */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              API Documentation
            </h2>

            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-950/50 border border-slate-700/50 rounded-lg hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        endpoint.method === "GET"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-cyan-400 font-mono">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {endpoint.description}
                  </p>
                  {endpoint.params.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Parameters
                      </h4>
                      <div className="space-y-1">
                        {endpoint.params.map((param, i) => (
                          <div key={i} className="text-xs text-slate-400">
                            <code className="text-purple-400">{param.name}</code>
                            <span className="text-slate-600"> : </span>
                            <span className="text-cyan-400">{param.type}</span>
                            {param.required && (
                              <span className="ml-2 text-red-400">*required</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Response
                    </h4>
                    <pre className="text-xs text-slate-400 font-mono">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-cyan-400 mb-2">AI-Powered</h3>
            <p className="text-slate-400 text-sm">
              Integrated with Anthropic Claude for intelligent document analysis
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-purple-400 mb-2">Secure & Scalable</h3>
            <p className="text-slate-400 text-sm">
              Built with Supabase for reliable data storage and authentication
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">Well Documented</h3>
            <p className="text-slate-400 text-sm">
              Comprehensive API docs with examples and error handling
            </p>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            About This Demo
          </h2>
          <p className="text-slate-300 mb-6">
            This public API service was generated using StackForge with the following configuration:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Framework</div>
              <div className="text-slate-200 font-medium">Next.js (API routes)</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Authentication</div>
              <div className="text-slate-200 font-medium">None (public API)</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Database</div>
              <div className="text-slate-200 font-medium">Supabase</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">API Layer</div>
              <div className="text-slate-200 font-medium">REST with rate limiting</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Color Scheme</div>
              <div className="text-slate-200 font-medium">Futuristic</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Deployment</div>
              <div className="text-slate-200 font-medium">Railway</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 md:col-span-2 lg:col-span-3">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Template</div>
              <div className="text-slate-200 font-medium">Document Analyzer</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/configure"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg shadow-cyan-500/20"
          >
            Build Your Own API
          </Link>
        </div>
      </div>
    </div>
  );
}
