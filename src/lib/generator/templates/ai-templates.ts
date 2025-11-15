import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Generate chatbot API route with streaming support
 */
export function generateChatbotApiRoute(config: ScaffoldConfigWithFramework): string {
  const isMonorepo = config.framework === 'monorepo';
  const importPath = isMonorepo ? '@anthropic-ai/sdk' : '@anthropic-ai/sdk';

  return `import Anthropic from '${importPath}';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta') {
                const data = JSON.stringify(chunk.delta);
                controller.enqueue(
                  new TextEncoder().encode(\`data: \${data}\\n\\n\`)
                );
              }
            }
            controller.enqueue(
              new TextEncoder().encode('data: [DONE]\\n\\n')
            );
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate chatbot UI component
 */
export function generateChatbotPage(_config: ScaffoldConfigWithFramework): string {
  return `'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === 'assistant') {
                      lastMessage.content = assistantMessage;
                    } else {
                      newMessages.push({
                        role: 'assistant',
                        content: assistantMessage,
                      });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="border-b p-4 bg-background">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
        <p className="text-sm text-muted-foreground">
          Powered by Claude AI
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}
          >
            <div
              className={\`max-w-[80%] rounded-lg p-3 \${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }\`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Press Enter to send)"
            className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate document analyzer API route
 */
export function generateDocumentAnalyzerApiRoute(
  _config: ScaffoldConfigWithFramework
): string {
  return `import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const prompt = formData.get('prompt') as string;

    if (!file) {
      return Response.json({ error: 'File is required' }, { status: 400 });
    }

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();

    // Analyze document with Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: \`\${prompt}\\n\\nDocument content:\\n\${text}\`,
        },
      ],
    });

    const analysis = message.content[0];
    const analysisText =
      analysis.type === 'text' ? analysis.text : 'No analysis available';

    return Response.json({
      analysis: analysisText,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Document analysis error:', error);
    return Response.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate document analyzer UI component
 */
export function generateDocumentAnalyzerPage(_config: ScaffoldConfigWithFramework): string {
  return `'use client';

import { useState } from 'react';

interface AnalysisResult {
  analysis: string;
  fileName: string;
  fileSize: number;
}

export default function DocumentAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Summarize this document and extract key insights.');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze document. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Analyzer</h1>
          <p className="text-muted-foreground">
            Upload a document and get AI-powered analysis
          </p>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,.json,.csv,.log"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block"
            >
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <div className="text-sm text-muted-foreground">
                  {file ? (
                    <span className="font-medium text-foreground">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  ) : (
                    'Click to upload a document'
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports: TXT, MD, JSON, CSV, LOG
                </div>
              </div>
            </label>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Analysis Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like to know about this document?"
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeDocument}
            disabled={!file || isAnalyzing}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Analysis Result</h2>
                <span className="text-sm text-muted-foreground">
                  {result.fileName}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{result.analysis}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate semantic search API route
 */
export function generateSemanticSearchApiRoute(
  _config: ScaffoldConfigWithFramework
): string {
  return `import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory vector store (replace with a real vector database in production)
interface Document {
  id: string;
  content: string;
  embedding?: number[];
}

const documents: Document[] = [
  {
    id: '1',
    content: 'Next.js is a React framework for building full-stack web applications.',
  },
  {
    id: '2',
    content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
  },
  {
    id: '3',
    content: 'Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.',
  },
];

// Simple cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate embeddings using Claude (simplified approach)
async function generateEmbedding(text: string): Promise<number[]> {
  // Note: This is a simplified approach. In production, use a dedicated embedding model
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  
  // Generate a simple pseudo-embedding
  const embedding = Array.from({ length: 128 }, (_, i) => {
    return Math.sin(hash * (i + 1)) * 0.5 + 0.5;
  });
  
  return embedding;
}

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 3 } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Generate embeddings for documents if not already done
    for (const doc of documents) {
      if (!doc.embedding) {
        doc.embedding = await generateEmbedding(doc.content);
      }
    }

    // Calculate similarities
    const results = documents
      .map((doc) => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Use Claude to generate a response based on the results
    const context = results.map((r) => r.content).join('\\n\\n');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: \`Based on the following context, answer this query: "\${query}"\\n\\nContext:\\n\${context}\`,
        },
      ],
    });

    const answer = message.content[0];
    const answerText = answer.type === 'text' ? answer.text : 'No answer available';

    return Response.json({
      answer: answerText,
      sources: results.map((r) => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity,
      })),
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return Response.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate semantic search UI component
 */
export function generateSemanticSearchPage(_config: ScaffoldConfigWithFramework): string {
  return `'use client';

import { useState } from 'react';

interface SearchResult {
  answer: string;
  sources: Array<{
    id: string;
    content: string;
    similarity: number;
  }>;
}

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 3 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performSearch();
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Semantic Search</h1>
          <p className="text-muted-foreground">
            AI-powered search with natural language understanding
          </p>
        </div>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or search for information..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={performSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Search Results */}
          {result && (
            <div className="space-y-6">
              {/* Answer */}
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Answer</h2>
                <p className="whitespace-pre-wrap">{result.answer}</p>
              </div>

              {/* Sources */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Sources</h2>
                <div className="space-y-3">
                  {result.sources.map((source) => (
                    <div
                      key={source.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">
                          Document {source.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Relevance: {(source.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate code assistant API route
 */
export function generateCodeAssistantApiRoute(_config: ScaffoldConfigWithFramework): string {
  return `import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { code, language, task } = await req.json();

    if (!code) {
      return Response.json({ error: 'Code is required' }, { status: 400 });
    }

    if (!task) {
      return Response.json({ error: 'Task is required' }, { status: 400 });
    }

    const taskPrompts: Record<string, string> = {
      explain: 'Explain what this code does in simple terms:',
      improve: 'Suggest improvements for this code:',
      debug: 'Help debug this code and identify potential issues:',
      refactor: 'Refactor this code to make it cleaner and more maintainable:',
      document: 'Add comprehensive documentation comments to this code:',
    };

    const prompt = taskPrompts[task] || taskPrompts.explain;
    const languageInfo = language ? \` (Language: \${language})\` : '';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: \`\${prompt}\${languageInfo}\\n\\n\\\`\\\`\\\`\\n\${code}\\n\\\`\\\`\\\`\`,
        },
      ],
    });

    const suggestion = message.content[0];
    const suggestionText =
      suggestion.type === 'text' ? suggestion.text : 'No suggestion available';

    return Response.json({
      suggestion: suggestionText,
      task,
      language: language || 'unknown',
    });
  } catch (error) {
    console.error('Code assistant error:', error);
    return Response.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate code assistant UI component
 */
export function generateCodeAssistantPage(_config: ScaffoldConfigWithFramework): string {
  return `'use client';

import { useState } from 'react';

interface AssistantResult {
  suggestion: string;
  task: string;
  language: string;
}

const TASKS = [
  { value: 'explain', label: 'Explain Code' },
  { value: 'improve', label: 'Suggest Improvements' },
  { value: 'debug', label: 'Debug Code' },
  { value: 'refactor', label: 'Refactor Code' },
  { value: 'document', label: 'Add Documentation' },
];

const LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'Other',
];

export default function CodeAssistantPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [task, setTask] = useState('explain');
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/code-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, task }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze code. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Code Assistant</h1>
          <p className="text-muted-foreground">
            AI-powered code analysis and suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Task</label>
                <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TASKS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={analyzeCode}
              disabled={isAnalyzing || !code.trim()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
            </button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Result Section */}
          <div>
            {result ? (
              <div className="border rounded-lg p-6 h-full">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-1">
                    {TASKS.find((t) => t.value === result.task)?.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Language: {result.language}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap bg-accent/50 p-4 rounded-lg">
                    {result.suggestion}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 h-full flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <div className="text-4xl mb-2">💡</div>
                  <p>Analysis results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate image generator API route
 */
export function generateImageGeneratorApiRoute(_config: ScaffoldConfigWithFramework): string {
  return `import { NextRequest } from 'next/server';

// Note: Anthropic doesn't provide image generation directly.
// This is a placeholder that demonstrates the API structure.
// In production, integrate with services like DALL-E, Midjourney, or Stable Diffusion.

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1024x1024', style = 'natural' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Placeholder response - integrate with actual image generation service
    return Response.json({
      message: 'Image generation endpoint ready for integration',
      prompt,
      size,
      style,
      note: 'Integrate with DALL-E, Midjourney, or Stable Diffusion API',
      imageUrl: null,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
`;
}

/**
 * Generate image generator UI component
 */
export function generateImageGeneratorPage(_config: ScaffoldConfigWithFramework): string {
  return `'use client';

import { useState } from 'react';

interface GenerationResult {
  message: string;
  prompt: string;
  size: string;
  style: string;
  note: string;
  imageUrl: string | null;
}

const SIZES = ['512x512', '1024x1024', '1792x1024', '1024x1792'];
const STYLES = ['natural', 'vivid', 'artistic', 'photographic'];

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('natural');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, style }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Image Generator</h1>
          <p className="text-muted-foreground">
            AI-powered image generation from text prompts
          </p>
        </div>

        <div className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Result</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {result.message}
                </p>
                <div className="bg-accent/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Integration Note:</p>
                  <p className="text-sm">{result.note}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Prompt:</span> {result.prompt}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {result.size}
                </div>
                <div>
                  <span className="font-medium">Style:</span> {result.style}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
}
