# Cauldron2Code API Documentation

## Overview

This directory contains the API routes for the Cauldron2Code scaffold generator.

## Endpoints

### POST /api/validate

Validates a scaffold configuration against schema and business rules.

**Request Body:**
```json
{
  "projectName": "my-project",
  "description": "My project description",
  "framework": "next",
  "auth": "none",
  "database": "none",
  "api": "rest-fetch",
  "styling": "tailwind",
  "shadcn": true,
  "colorScheme": "purple",
  "deployment": ["vercel"],
  "aiTemplate": "none",
  "extras": {
    "docker": false,
    "githubActions": false,
    "redis": false,
    "prettier": true,
    "husky": false
  }
}
```

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": []
}
```

### POST /api/generate

Generates a scaffold based on configuration. Returns immediately with a generation ID for progress tracking.

**Request Body:** Same as `/api/validate`

**Response (202 Accepted):**
```json
{
  "success": true,
  "generationId": "abc123...",
  "message": "Scaffold generation started"
}
```

### GET /api/progress/[id]

Get the current progress of a scaffold generation.

**Response:**
```json
{
  "id": "abc123...",
  "status": "in-progress",
  "currentStep": "generating-files",
  "progress": 50,
  "events": [
    {
      "step": "validating",
      "message": "Validating configuration...",
      "progress": 5,
      "timestamp": 1234567890
    }
  ],
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

**Generation Steps:**
- `validating` - Validating configuration
- `creating-structure` - Creating project structure
- `generating-files` - Generating project files
- `applying-theme` - Applying color scheme
- `generating-docs` - Generating documentation
- `creating-archive` - Creating download archive
- `complete` - Generation complete
- `error` - Generation failed

### GET /api/download/[id]

Download the generated scaffold archive.

**Response:** ZIP file stream

**Headers:**
- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="scaffold-{id}.zip"`

## Usage Flow

1. **Validate Configuration**
   ```typescript
   const response = await fetch('/api/validate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(config)
   });
   const validation = await response.json();
   ```

2. **Start Generation**
   ```typescript
   const response = await fetch('/api/generate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(config)
   });
   const { generationId } = await response.json();
   ```

3. **Poll Progress**
   ```typescript
   const interval = setInterval(async () => {
     const response = await fetch(`/api/progress/${generationId}`);
     const progress = await response.json();
     
     if (progress.status === 'complete') {
       clearInterval(interval);
       // Download is ready
       window.location.href = `/api/download/${progress.downloadId}`;
     }
   }, 500);
   ```

4. **Download Scaffold**
   ```typescript
   window.location.href = `/api/download/${downloadId}`;
   ```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `202` - Accepted (async operation started)
- `400` - Bad Request (validation failed)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

Error responses include:
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": {} // Optional additional details
}
```

## Performance

- **Validation**: Edge Function (<50ms response time)
- **Generation**: Async process (completes within 30 seconds)
- **Progress Polling**: Edge Function (<50ms response time)
- **Download**: Streaming (no memory limits)

## Cleanup

- Temporary directories are cleaned up after archive creation
- Archives are deleted 5 seconds after download
- Progress trackers expire after 30 minutes
