import { ScaffoldConfig } from '@/types';

/**
 * Generate Express server entry point
 */
export function generateExpressIndex(config: ScaffoldConfig): string {
  const hasDatabase = config.database !== 'none';

  return `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
${hasDatabase ? "import { connectDatabase } from './lib/db';" : ''}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to ${config.projectName} API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
${hasDatabase ? `
async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
` : `
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`}
`;
}

/**
 * Generate Express routes example
 */
export function generateExpressRoutes(): string {
  return `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API routes' });
});

export default router;
`;
}

/**
 * Generate Express middleware example
 */
export function generateExpressMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(\`\${req.method} \${req.path}\`);
  next();
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Add authentication logic here
  next();
}
`;
}

/**
 * Generate Express API index for monorepo
 */
export function generateMonorepoExpressIndex(config: ScaffoldConfig): string {
  const hasDatabase = config.database !== 'none';

  return `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
${hasDatabase ? "import { connectDatabase } from './lib/db';" : ''}

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: '${config.projectName} API',
    version: '1.0.0'
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
${hasDatabase ? `
async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(\`API server running on http://localhost:\${PORT}\`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
}

startServer();
` : `
app.listen(PORT, () => {
  console.log(\`API server running on http://localhost:\${PORT}\`);
});
`}
`;
}
