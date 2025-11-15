import archiver from 'archiver';
import { promises as fs } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { randomBytes } from 'crypto';

/**
 * Archive generation for scaffold downloads
 */

/**
 * Generate unique download ID
 */
export function generateDownloadId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Create zip archive from directory
 * Uses streaming to avoid memory issues with large scaffolds
 */
export async function createZipArchive(
  sourceDir: string,
  outputPath: string,
  projectName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create output stream
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle stream events
    output.on('close', () => {
      resolve();
    });

    output.on('error', (err) => {
      reject(new ArchiveError('Failed to write archive', 'WRITE_ERROR', err));
    });

    archive.on('error', (err) => {
      reject(new ArchiveError('Failed to create archive', 'ARCHIVE_ERROR', err));
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        reject(new ArchiveError('Archive warning escalated', 'WARNING', err));
      }
    });

    // Pipe archive to output file
    archive.pipe(output);

    // Add directory contents to archive with project name as root
    archive.directory(sourceDir, projectName);

    // Finalize archive
    archive.finalize();
  });
}

/**
 * Get archive file size
 */
export async function getArchiveSize(archivePath: string): Promise<number> {
  try {
    const stats = await fs.stat(archivePath);
    return stats.size;
  } catch (error) {
    throw new ArchiveError(
      'Failed to get archive size',
      'STAT_ERROR',
      error as Error
    );
  }
}

/**
 * Clean up archive file
 */
export async function cleanupArchive(archivePath: string): Promise<void> {
  try {
    await fs.unlink(archivePath);
  } catch (error) {
    // Log but don't throw - cleanup failures shouldn't break the flow
    console.error(`Failed to cleanup archive ${archivePath}:`, error);
  }
}

/**
 * Get archive storage path
 */
export function getArchiveStoragePath(downloadId: string): string {
  const storageDir = path.join(process.cwd(), 'tmp', 'archives');
  return path.join(storageDir, `${downloadId}.zip`);
}

/**
 * Ensure archive storage directory exists
 */
export async function ensureArchiveStorageDir(): Promise<string> {
  const storageDir = path.join(process.cwd(), 'tmp', 'archives');
  await fs.mkdir(storageDir, { recursive: true });
  return storageDir;
}

/**
 * Custom error class for archive operations
 */
export class ArchiveError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'ArchiveError';
  }
}
