# Deployment API Endpoints

This directory contains the API endpoints for the deployment pipeline feature.

## Endpoints

### POST /api/deploy/initiate

Initiates a deployment to a hosting platform.

**Request Body:**
```json
{
  "projectName": "my-app",
  "platform": "vercel",
  "scaffoldConfig": {
    "projectName": "my-app",
    "projectStructure": "fullstack-monorepo",
    "frontendFramework": "nextjs",
    "backendFramework": "express",
    "database": "postgresql",
    "auth": "nextauth",
    "aiTemplate": "chat-interface"
  },
  "environmentVariables": [
    {
      "key": "DATABASE_URL",
      "value": "postgresql://...",
      "description": "PostgreSQL connection string",
      "required": true,
      "sensitive": true
    }
  ],
  "services": []
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "deploymentId": "deploy_1234567890_abc123",
  "message": "Deployment initiated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid configuration
- `401 Unauthorized` - Platform not connected
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### GET /api/deploy/status/[id]

Streams deployment progress updates via Server-Sent Events (SSE).

**Response (text/event-stream):**
```
data: {"type":"connected","deploymentId":"deploy_123","timestamp":"2024-01-01T00:00:00.000Z"}

data: {"type":"update","deploymentId":"deploy_123","status":"pending","message":"Creating project...","timestamp":"2024-01-01T00:00:01.000Z","buildLogs":[]}

data: {"type":"update","deploymentId":"deploy_123","status":"building","message":"Building application...","timestamp":"2024-01-01T00:00:10.000Z","buildLogs":["Installing dependencies...","Building..."]}

data: {"type":"update","deploymentId":"deploy_123","status":"success","message":"Deployment complete!","timestamp":"2024-01-01T00:01:00.000Z","deploymentUrl":"https://my-app.vercel.app"}

data: {"type":"complete","status":"success","timestamp":"2024-01-01T00:01:00.000Z"}
```

**Usage Example:**
```javascript
const eventSource = new EventSource('/api/deploy/status/deploy_123');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
  
  if (data.type === 'complete') {
    eventSource.close();
  }
};

eventSource.onerror = () => {
  console.error('Connection error');
  eventSource.close();
};
```

## Features

### Platform Connection Verification
All deployment endpoints verify that the user has connected their platform account before allowing deployment.

### Rate Limiting
Deployments are rate-limited to prevent abuse:
- Maximum 10 deployments per hour per user
- Rate limit information included in error responses

### Progress Tracking
Real-time progress updates via Server-Sent Events:
- Connection status
- Deployment status changes
- Build logs streaming
- Completion/failure notifications

### Security
- Environment variables are validated before deployment
- Sensitive values are never logged
- User authentication required for all operations
- Platform tokens stored securely in HTTP-only cookies

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details or array of validation errors"
}
```

Common error codes:
- `PLATFORM_NOT_CONNECTED` - User hasn't connected platform account
- `RATE_LIMIT_EXCEEDED` - Too many deployments in time window
- `INVALID_CONFIG` - Configuration validation failed
- `DEPLOYMENT_FAILED` - Deployment process failed

## Implementation Notes

### User Identification
Currently uses a simple cookie-based or IP-based user identification. In production, this should be replaced with proper authentication integration.

### Deployment Storage
Deployments are stored in-memory using `DeploymentStore`. In production, this should be replaced with a persistent database.

### Platform Services
Platform services (Vercel, Railway, Render) are initialized with empty tokens. Actual tokens are retrieved from cookies at runtime.

