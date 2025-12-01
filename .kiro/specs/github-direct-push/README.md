# GitHub Direct Push Integration

## Overview

This feature integrates GitHub repository creation directly into the scaffold generation workflow. Users can authenticate with GitHub during the wizard, and when they click "Generate", the system automatically creates a repository and pushes the generated code.

## Documentation Index

### For Users

- **[User Guide](./USER_GUIDE.md)** - Complete guide for end users
  - How to use the GitHub integration
  - Authentication process
  - Error troubleshooting
  - FAQ

### For Developers

- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Technical implementation details
  - Architecture overview
  - Component documentation
  - API endpoints
  - State management
  - Testing strategy
  - Security considerations

- **[Integration Flow](./INTEGRATION_FLOW.md)** - Detailed flow documentation
  - User journeys
  - Sequence diagrams
  - State machines
  - Component interactions
  - Data flow

- **[Error Handling](./ERROR_HANDLING.md)** - Comprehensive error reference
  - Error categories and codes
  - Error messages
  - Recovery actions
  - Implementation examples
  - Testing strategies

### Specification Documents

- **[Requirements](./requirements.md)** - Feature requirements using EARS format
- **[Design](./design.md)** - Technical design and correctness properties
- **[Tasks](./tasks.md)** - Implementation task list

## Quick Start

### For Users

1. Complete the wizard configuration
2. Sign in with GitHub (or skip for ZIP download)
3. Click "Generate"
4. View your repository on GitHub

See the [User Guide](./USER_GUIDE.md) for detailed instructions.

### For Developers

1. Read the [Developer Guide](./DEVELOPER_GUIDE.md) for architecture
2. Review the [Integration Flow](./INTEGRATION_FLOW.md) for implementation details
3. Check the [Error Handling](./ERROR_HANDLING.md) for error scenarios
4. Run tests to verify functionality

## Key Features

### Seamless Integration
- GitHub authentication built into wizard flow
- Automatic repository creation on generate
- No manual steps required

### Dual Workflow Support
- **GitHub Path**: Authenticated users get automatic repository creation
- **ZIP Path**: Unauthenticated users get ZIP file download

### Robust Error Handling
- Clear error messages for all scenarios
- Multiple recovery options
- Always provides fallback to ZIP download

### Security First
- OAuth 2.0 authentication
- Secure token storage in httpOnly cookies
- CSRF protection
- Input validation and sanitization

### User Experience
- Loading animation during generation
- Clear success/error states
- Persistent authentication across sessions
- Skip option for users who prefer ZIP

## Architecture Highlights

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                    PixelArtWizard                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │           GitHubAuthStep Component               │  │
│  │  - OAuth sign-in                                 │  │
│  │  - Authentication status                         │  │
│  │  - Skip option                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   ConfigurePage                         │
│  - handleGenerate() - Routes based on auth state        │
│  - Error handling with fallback                         │
│  - Success screen variants                              │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
┌──────────────────────┐  ┌──────────────────────┐
│  GitHub API          │  │  ZIP Generation      │
│  /repos/create       │  │  /generate           │
└──────────────────────┘  └──────────────────────┘
```

### Data Flow

```
User Input → ConfigStore → API Request → GitHub/ZIP → Success Screen
```

### State Management

- **Authentication State**: Managed by GitHubAuthStep, persisted in cookies
- **Generation State**: Managed by ConfigurePage, includes loading/error/success
- **Configuration State**: Managed by Zustand store, persisted in localStorage

## API Endpoints

### Authentication
- `POST /api/github/auth/initiate` - Start OAuth flow
- `GET /api/github/auth/callback` - Handle OAuth callback
- `GET /api/github/auth/status` - Check authentication status
- `POST /api/github/auth/signout` - Sign out user

### Repository Operations
- `POST /api/github/repos/create` - Create repository and push files

### ZIP Generation
- `POST /api/generate` - Generate ZIP file (existing endpoint)

## Error Handling

All errors follow a consistent pattern:

1. **Display Clear Message**: Explain what went wrong
2. **Offer Recovery Actions**: Provide specific next steps
3. **Always Provide Fallback**: ZIP download available for all GitHub errors
4. **Log for Debugging**: Comprehensive error logging

See [Error Handling](./ERROR_HANDLING.md) for complete reference.

## Testing

### Test Coverage

- ✅ Unit tests for components
- ✅ Property-based tests for correctness properties
- ✅ Integration tests for complete flows
- ✅ Error scenario tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- github

# Run with coverage
npm test -- --coverage
```

## Security

### Token Storage
- Tokens stored in httpOnly cookies
- Never exposed to client-side JavaScript
- Secure flag enabled in production
- SameSite=Lax for CSRF protection

### OAuth Security
- State parameter for CSRF protection
- Secure redirect URI validation
- Token expiration after 7 days

### Input Validation
- Repository name sanitization
- Configuration validation
- File size limits
- Path traversal prevention

## Performance

### Optimizations
- Parallel file generation and repository creation
- Immediate loading screen display
- Cached authentication status
- Debounced status checks

### Metrics
- Average generation time: ~5-10 seconds
- Repository creation: ~2-3 seconds
- File push: ~3-7 seconds (depends on project size)

## Troubleshooting

### Common Issues

**Loading screen stuck**
- Wait 2-3 minutes for large projects
- Check browser console for errors
- Try refreshing and regenerating

**Authentication failed**
- Clear browser cookies
- Try signing in again
- Check GitHub status page

**Repository already exists**
- Change project name in wizard
- Delete existing repository on GitHub
- Use ZIP fallback

See [User Guide](./USER_GUIDE.md) for complete troubleshooting guide.

## Contributing

### Making Changes

1. Update relevant documentation files
2. Update tests to match changes
3. Run full test suite
4. Update this README if needed

### Documentation Standards

- Keep user-facing docs simple and clear
- Include code examples in developer docs
- Update diagrams when flow changes
- Add new error codes to error handling doc

## Changelog

### Version 1.0.0 (Current)
- Initial release
- OAuth authentication
- Automatic repository creation
- Error handling with fallback
- Dual workflow support (GitHub/ZIP)

### Planned Features
- Private repository support
- Organization repository support
- Custom branch selection
- Commit message customization

## Support

### Getting Help

1. Check the [User Guide](./USER_GUIDE.md) for common questions
2. Review [Error Handling](./ERROR_HANDLING.md) for error solutions
3. Check browser console for error messages
4. Contact support with error details

### Reporting Issues

When reporting issues, include:
- Error message and code
- Browser and version
- Steps to reproduce
- Configuration used
- Console logs

## License

This feature is part of the StackForge project and follows the same license.

## Related Documentation

- [Wizard Documentation](../../components/wizard/README.md)
- [Configuration Store](../../lib/store/README.md)
- [GitHub API Integration](../../lib/github/README.md)
- [Generation System](../../lib/generator/README.md)

## Maintainers

This feature is maintained as part of the StackForge project.

For questions or contributions, please refer to the main project documentation.
