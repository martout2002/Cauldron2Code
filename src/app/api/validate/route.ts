import { NextRequest, NextResponse } from 'next/server';
import { scaffoldConfigSchema } from '@/types';
import { validateConfig } from '@/lib/validation';

/**
 * POST /api/validate
 * Validates a scaffold configuration
 * Returns structured validation results with errors and warnings
 * Optimized for <50ms response time using Edge runtime
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();

    // First, validate against Zod schema for type safety
    const schemaValidation = scaffoldConfigSchema.safeParse(body);

    if (!schemaValidation.success) {
      const zodErrors = schemaValidation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: `${err.path.join('.')}: ${err.message}`,
        ruleId: 'schema-validation',
      }));

      return NextResponse.json(
        {
          isValid: false,
          errors: zodErrors,
          warnings: [],
          message: `Schema validation failed: ${zodErrors.length} error${zodErrors.length > 1 ? 's' : ''} found`,
        },
        { status: 400 }
      );
    }

    // Run business logic validation rules
    const validationResult = validateConfig(schemaValidation.data);

    // Add helpful message
    let message = 'Configuration is valid';
    if (!validationResult.isValid) {
      message = `Configuration has ${validationResult.errors.length} error${validationResult.errors.length > 1 ? 's' : ''}`;
    } else if (validationResult.warnings.length > 0) {
      message = `Configuration is valid with ${validationResult.warnings.length} warning${validationResult.warnings.length > 1 ? 's' : ''}`;
    }

    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        ...validationResult,
        message,
      },
      {
        status: validationResult.isValid ? 200 : 400,
        headers: {
          // Aggressive caching for Edge Function performance
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          // Add timing header for monitoring (<50ms target)
          'X-Response-Time': `${responseTime}ms`,
          // Enable CORS for client-side validation
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        isValid: false,
        errors: [
          {
            field: 'general',
            message:
              'Failed to validate configuration. Please check your input and try again.',
            ruleId: 'validation-error',
          },
        ],
        warnings: [],
        message: 'Validation service error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/validate
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

// Configure as Edge Function for optimal performance (<50ms response time)
export const runtime = 'edge';
