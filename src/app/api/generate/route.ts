import { NextRequest, NextResponse } from 'next/server';
import { scaffoldConfigSchema, addFrameworkProperty } from '@/types';
import { validateConfig } from '@/lib/validation';
import { ScaffoldGenerator } from '@/lib/generator/scaffold-generator';
import {
  createTempDirectory,
  writeFiles,
  cleanupDirectory,
  FileOperationError,
} from '@/lib/generator/file-operations';
import {
  generateDownloadId,
  createZipArchive,
  ensureArchiveStorageDir,
  getArchiveStoragePath,
  ArchiveError,
} from '@/lib/generator/archive-generator';
import {
  progressStore,
  ProgressTracker,
} from '@/lib/generator/progress-tracker';
import { GenerationErrorLogger } from '@/lib/generator/error-logger';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/generate
 * Generates a scaffold based on configuration
 * Returns generation ID for progress tracking and download
 */
export async function POST(request: NextRequest) {
  const generationId = randomBytes(16).toString('hex');
  const tracker = new ProgressTracker(generationId);

  try {
    // Create progress tracker
    progressStore.create(generationId);
    tracker.update('validating', 'Validating configuration...', 5);

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

      tracker.setError('Configuration validation failed');

      return NextResponse.json(
        {
          success: false,
          generationId,
          error: 'Invalid configuration',
          details: zodErrors,
        },
        { status: 400 }
      );
    }

    // Run business logic validation
    const validationResult = validateConfig(schemaValidation.data);

    if (!validationResult.isValid) {
      tracker.setError('Configuration has validation errors');

      return NextResponse.json(
        {
          success: false,
          generationId,
          error: 'Configuration validation failed',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const config = schemaValidation.data;

    // Start generation process asynchronously
    // Don't await - return immediately with generation ID
    generateScaffoldAsync(generationId, config, tracker).catch((error) => {
      console.error('Generation failed:', error);
      tracker.setError(error.message || 'Generation failed');
    });

    // Return generation ID immediately
    return NextResponse.json(
      {
        success: true,
        generationId,
        message: 'Scaffold generation started',
      },
      { status: 202 } // 202 Accepted
    );
  } catch (error) {
    console.error('Generation error:', error);
    tracker.setError('Internal server error');

    return NextResponse.json(
      {
        success: false,
        generationId,
        error: 'Failed to start generation',
        details:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Async scaffold generation function
 * Runs in background after API response is sent
 */
async function generateScaffoldAsync(
  generationId: string,
  config: any,
  tracker: ProgressTracker
): Promise<void> {
  let tempDir: string | null = null;
  const errorLogger = new GenerationErrorLogger(generationId);
  let partialScaffoldCreated = false;

  try {
    // Step 1: Create directory structure
    tracker.update(
      'creating-structure',
      'Creating project structure...',
      15
    );

    try {
      tempDir = await createTempDirectory(`scaffold-${config.projectName}`);
    } catch (error) {
      errorLogger.log('creating-structure', error as Error, {
        projectName: config.projectName,
      });
      throw new Error(
        'Failed to create temporary directory. Please try again.'
      );
    }

    // Step 2: Generate files
    tracker.update('generating-files', 'Generating project files...', 30);

    let result;
    try {
      // Add framework property for backward compatibility with generator
      const configWithFramework = addFrameworkProperty(config);
      const generator = new ScaffoldGenerator(configWithFramework);
      result = await generator.generate();
    } catch (error) {
      const configWithFramework = addFrameworkProperty(config);
      errorLogger.log('generating-files', error as Error, {
        framework: configWithFramework.framework,
        totalSelections: Object.keys(config).length,
      });
      throw new Error(
        'Failed to generate project files. Configuration may be invalid.'
      );
    }

    tracker.update('generating-files', 'Writing files to disk...', 50);

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

    // Step 3: Apply theme
    tracker.update('applying-theme', 'Applying color scheme...', 65);
    // Theme is already applied in file generation

    // Step 4: Generate documentation
    tracker.update('generating-docs', 'Generating documentation...', 75);
    // Documentation is already generated in file generation

    // Step 5: Create archive
    tracker.update('creating-archive', 'Creating download archive...', 85);

    const downloadId = generateDownloadId();
    await ensureArchiveStorageDir();
    const archivePath = getArchiveStoragePath(downloadId);

    try {
      await createZipArchive(tempDir, archivePath, config.projectName);
    } catch (error) {
      errorLogger.log('creating-archive', error as Error, {
        tempDir,
        archivePath,
      });
      throw new Error(
        'Failed to create download archive. Please try again.'
      );
    }

    // Step 6: Complete
    tracker.update('complete', 'Scaffold generation complete!', 100);
    tracker.setDownloadId(downloadId);

    // Cleanup temp directory
    await cleanupDirectory(tempDir);
  } catch (error) {
    console.error('Scaffold generation failed:', error);

    let errorMessage = 'Generation failed';

    if (error instanceof FileOperationError) {
      errorMessage = `File operation failed: ${error.message}`;
    } else if (error instanceof ArchiveError) {
      errorMessage = `Archive creation failed: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    tracker.setError(errorMessage);

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
        tracker.setDownloadId(downloadId);

        // Update error message to indicate partial scaffold is available
        tracker.setError(
          `${errorMessage} - Partial scaffold with error report is available for download.`
        );
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
