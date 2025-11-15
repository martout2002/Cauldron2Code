import { NextRequest, NextResponse } from 'next/server';
import { scaffoldConfigSchema, addFrameworkProperty } from '@/types';
import { validateConfig } from '@/lib/validation';
import { ScaffoldGenerator } from '@/lib/generator/scaffold-generator';
import {
  createTempDirectory,
  writeFiles,
  cleanupDirectory,
} from '@/lib/generator/file-operations';
import {
  generateDownloadId,
  createZipArchive,
  ensureArchiveStorageDir,
  getArchiveStoragePath,
} from '@/lib/generator/archive-generator';
import { GenerationErrorLogger } from '@/lib/generator/error-logger';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/generate
 * Generates a scaffold based on configuration
 * Returns download ID immediately (synchronous)
 */
export async function POST(request: NextRequest) {
  const generationId = randomBytes(16).toString('hex');

  try {

    // Parse and validate request body
    const body = await request.json();

    // Validate against Zod schema
    const schemaValidation = scaffoldConfigSchema.safeParse(body);

    if (!schemaValidation.success) {
      const zodErrors = schemaValidation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        ruleId: 'schema-validation',
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid configuration',
          details: zodErrors,
        },
        { status: 400 }
      );
    }

    // Run business logic validation
    const validationResult = validateConfig(schemaValidation.data);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration validation failed',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const config = schemaValidation.data;

    // Generate scaffold synchronously
    const downloadId = await generateScaffold(generationId, config);

    // Return download ID immediately
    return NextResponse.json(
      {
        success: true,
        downloadId,
        message: 'Scaffold generated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate scaffold',
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Synchronous scaffold generation function
 */
async function generateScaffold(
  generationId: string,
  config: any
): Promise<string> {
  let tempDir: string | null = null;
  const errorLogger = new GenerationErrorLogger(generationId);
  let partialScaffoldCreated = false;

  try {
    // Create directory structure
    tempDir = await createTempDirectory(`scaffold-${config.projectName}`);

    // Generate files
    const configWithFramework = addFrameworkProperty(config);
    const generator = new ScaffoldGenerator(configWithFramework);
    const result = await generator.generate();

    // Write files to temp directory
    try {
      await writeFiles(tempDir, result.files);
      partialScaffoldCreated = true;
    } catch (error) {
      errorLogger.log('writing-files', error as Error, {
        totalFiles: result.files.length,
        projectName: config.projectName,
      });

      // Generate partial scaffold with error report
      await generatePartialScaffoldWithErrorReport(
        tempDir,
        result.files,
        errorLogger,
        config.projectName
      );
      partialScaffoldCreated = true;

      throw new Error(
        'Some files failed to write. Partial scaffold created with error report.'
      );
    }

    // Create archive
    const downloadId = generateDownloadId();
    await ensureArchiveStorageDir();
    const archivePath = getArchiveStoragePath(downloadId);

    await createZipArchive(tempDir, archivePath, config.projectName);

    // Cleanup temp directory
    await cleanupDirectory(tempDir);

    return downloadId;
  } catch (error) {
    console.error('Scaffold generation failed:', error);

    // If partial scaffold was created, try to create archive with error report
    if (partialScaffoldCreated && tempDir) {
      try {
        const downloadId = generateDownloadId();
        await ensureArchiveStorageDir();
        const archivePath = getArchiveStoragePath(downloadId);

        // Add error report to partial scaffold
        const errorReportPath = path.join(tempDir, 'ERROR_REPORT.md');
        await fs.writeFile(errorReportPath, errorLogger.generateErrorReport());

        await createZipArchive(tempDir, archivePath, config.projectName);

        // Cleanup and return partial download
        await cleanupDirectory(tempDir);
        return downloadId;
      } catch (archiveError) {
        console.error('Failed to create partial scaffold archive:', archiveError);
      }
    }

    // Cleanup on error
    if (tempDir) {
      await cleanupDirectory(tempDir);
    }

    throw error;
  }
}

/**
 * Generate partial scaffold with error report
 * Writes successfully generated files and adds error report
 */
async function generatePartialScaffoldWithErrorReport(
  tempDir: string,
  _files: any[],
  errorLogger: GenerationErrorLogger,
  projectName: string
): Promise<void> {
  // Write error report
  const errorReportPath = path.join(tempDir, 'ERROR_REPORT.md');
  const errorReport = errorLogger.generateErrorReport();

  try {
    await fs.writeFile(errorReportPath, errorReport);
  } catch (error) {
    console.error('Failed to write error report:', error);
  }

  // Write README explaining the partial scaffold
  const partialReadmePath = path.join(tempDir, 'PARTIAL_SCAFFOLD_README.md');
  const partialReadme = `# Partial Scaffold - ${projectName}

⚠️ **This is a partial scaffold due to generation errors**

Some files failed to generate during the scaffold creation process. This archive contains:

1. All successfully generated files
2. An ERROR_REPORT.md file with detailed error information
3. This README explaining the situation

## What to do next

1. Review the ERROR_REPORT.md file to understand what went wrong
2. Check if the generated files are sufficient for your needs
3. You may need to manually create the missing files
4. Consider adjusting your configuration and regenerating

## Getting Help

If you continue to experience issues:
- Check that all selected technologies are compatible
- Verify your configuration settings
- Try simplifying your configuration (fewer options)
- Report the issue with the ERROR_REPORT.md contents

Generated on: ${new Date().toISOString()}
`;

  try {
    await fs.writeFile(partialReadmePath, partialReadme);
  } catch (error) {
    console.error('Failed to write partial scaffold README:', error);
  }
}
