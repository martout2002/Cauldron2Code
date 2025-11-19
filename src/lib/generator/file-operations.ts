import { promises as fs } from 'fs';
import path from 'path';
import { GeneratedFile } from './scaffold-generator';

/**
 * File system operations for scaffold generation
 */

/**
 * Create directory structure
 * Creates all directories in parallel for performance
 */
export async function createDirectories(
  baseDir: string,
  directories: string[]
): Promise<void> {
  const results = await Promise.allSettled(
    directories.map(async (dir) => {
      const fullPath = path.join(baseDir, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
        return { success: true, dir };
      } catch (error) {
        throw new FileOperationError(
          `Failed to create directory: ${dir}`,
          'CREATE_DIR',
          error as Error
        );
      }
    })
  );

  // Collect all failures
  const failures = results
    .filter((result) => result.status === 'rejected')
    .map((result) => (result as PromiseRejectedResult).reason);

  if (failures.length > 0) {
    // Throw the first error with context about total failures
    const firstError = failures[0];
    firstError.message = `${firstError.message} (${failures.length} of ${directories.length} directories failed)`;
    throw firstError;
  }
}

/**
 * Write files to disk
 * Writes files in parallel for performance
 * Returns list of successfully written files and failures
 */
export async function writeFiles(
  baseDir: string,
  files: GeneratedFile[]
): Promise<{ successCount: number; failedFiles: string[] }> {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const fullPath = path.join(baseDir, file.path);
      const dir = path.dirname(fullPath);

      try {
        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });

        // Write file with UTF-8 encoding
        await fs.writeFile(fullPath, file.content, 'utf-8');
        return { success: true, path: file.path };
      } catch (error) {
        throw new FileOperationError(
          `Failed to write file: ${file.path}`,
          'WRITE_FILE',
          error as Error
        );
      }
    })
  );

  // Collect successes and failures
  const successCount = results.filter((r) => r.status === 'fulfilled').length;
  const failedFiles = results
    .filter((r) => r.status === 'rejected')
    .map((r) => {
      const error = (r as PromiseRejectedResult).reason;
      return error instanceof FileOperationError
        ? error.message
        : 'Unknown file';
    });

  // If there are failures, throw with context
  if (failedFiles.length > 0) {
    throw new FileOperationError(
      `Failed to write ${failedFiles.length} of ${files.length} files: ${failedFiles.slice(0, 3).join(', ')}${failedFiles.length > 3 ? '...' : ''}`,
      'WRITE_FILES_BATCH',
      new Error(`${failedFiles.length} files failed`)
    );
  }

  return { successCount, failedFiles };
}

/**
 * Clean up temporary directory
 */
export async function cleanupDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Log but don't throw - cleanup failures shouldn't break the flow
    console.error(`Failed to cleanup directory ${dirPath}:`, error);
  }
}

/**
 * Check if directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Create temporary directory for scaffold generation
 * Uses /tmp on serverless environments (Vercel) or ./tmp locally
 */
export async function createTempDirectory(prefix: string): Promise<string> {
  // Use /tmp for serverless environments (Vercel, AWS Lambda, etc.)
  // Use ./tmp for local development
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const baseTmpDir = isServerless ? '/tmp' : path.join(process.cwd(), 'tmp');
  const tmpDir = path.join(baseTmpDir, `${prefix}-${Date.now()}`);
  
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    return tmpDir;
  } catch (error) {
    throw new FileOperationError(
      'Failed to create temporary directory',
      'CREATE_TEMP_DIR',
      error as Error
    );
  }
}

/**
 * Custom error class for file operations
 */
export class FileOperationError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}
