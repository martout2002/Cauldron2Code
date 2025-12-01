# GitHub Integration - User Guide

## Overview

The GitHub integration allows you to automatically create a GitHub repository and push your generated scaffold code directly from the wizard. This eliminates the need to manually download a ZIP file and push it to GitHub yourself.

## How It Works

### Step 1: Complete the Wizard

Work through the wizard steps to configure your project:
1. Enter your project name and description
2. Select your frontend framework
3. Choose your backend framework
4. Pick your build tool
5. Select database, authentication, styling, and extras
6. Configure AI templates (if selected)
7. Review your configuration in the summary

### Step 2: GitHub Authentication

After the summary step, you'll see the GitHub authentication step:

- **First Time Users**: Click "Sign in with GitHub" to authenticate
- **Returning Users**: If you're already authenticated, you'll see your GitHub username and can proceed
- **Skip Option**: You can skip this step if you prefer to download a ZIP file instead

#### Authentication Process

1. Click "Sign in with GitHub"
2. You'll be redirected to GitHub's authorization page
3. Review the permissions and click "Authorize"
4. You'll be redirected back to the wizard
5. Your authentication status will be saved for future sessions

### Step 3: Generate Your Project

Click the "Generate" button to start the process:

- **With GitHub Authentication**: Your repository will be created automatically
- **Without GitHub Authentication**: A ZIP file will be generated for download

### Step 4: View Your Results

#### GitHub Repository Created

If you authenticated with GitHub, you'll see:
- Your repository URL prominently displayed
- A "View Repository" button to open it in a new tab
- Repository name and description
- Option to create another project

#### ZIP File Generated

If you skipped GitHub authentication, you'll see:
- A download button for your ZIP file
- Links to deployment guides
- Option to generate another project

## Features

### Automatic Repository Creation

- Repository is created with your project name (sanitized for GitHub)
- All scaffold files are included in the initial commit
- Repository description is set from your project description
- Default branch is set to `main`

### Repository Naming

Your project name is automatically sanitized to meet GitHub's requirements:
- Only alphanumeric characters, hyphens, and underscores
- Cannot start with a hyphen
- Maximum 100 characters
- Spaces are converted to hyphens

**Examples:**
- "My Awesome Project" → "my-awesome-project"
- "Project_2024!" → "project_2024"
- "---test---" → "test"

### Authentication Persistence

Your GitHub authentication is remembered across sessions:
- You only need to sign in once
- Authentication persists until you explicitly sign out
- Expired tokens are detected and you'll be prompted to re-authenticate

### Error Handling

If something goes wrong, you'll see a clear error message with options:

#### Authentication Errors
- **Problem**: Your GitHub token expired or is invalid
- **Solution**: Click "Re-authenticate" to sign in again
- **Fallback**: Download ZIP file instead

#### Name Conflict Errors
- **Problem**: A repository with that name already exists
- **Solution**: Change your project name and try again
- **Fallback**: Download ZIP file instead

#### Network Errors
- **Problem**: Connection to GitHub failed
- **Solution**: Check your internet connection and retry
- **Fallback**: Download ZIP file instead

#### Rate Limit Errors
- **Problem**: GitHub API rate limit exceeded
- **Solution**: Wait a few minutes and try again
- **Fallback**: Download ZIP file instead

### Fallback to ZIP

Every error screen includes a "Download ZIP Instead" button, so you can always get your code even if GitHub integration fails.

## Privacy & Security

### What Permissions Are Requested?

The GitHub integration requests the following permissions:
- **repo**: Create and manage repositories
- **user:email**: Access your email address for commit attribution

### How Is Your Token Stored?

- Tokens are stored in secure httpOnly cookies
- Tokens are never exposed to client-side JavaScript
- Tokens are cleared when you sign out
- Tokens expire after a set period for security

### Can I Revoke Access?

Yes! You can revoke access at any time:
1. Go to GitHub Settings → Applications → Authorized OAuth Apps
2. Find "StackForge" in the list
3. Click "Revoke" to remove access

## Troubleshooting

### "Authentication Failed" Error

**Cause**: OAuth flow was interrupted or credentials are invalid

**Solutions**:
1. Try signing in again
2. Clear your browser cookies and retry
3. Check if you have pop-up blockers enabled
4. Use the ZIP fallback option

### "Repository Already Exists" Error

**Cause**: You already have a repository with that name

**Solutions**:
1. Change your project name in the wizard
2. Delete the existing repository on GitHub
3. Use the ZIP fallback and push to the existing repository manually

### "Network Error" Error

**Cause**: Connection to GitHub failed

**Solutions**:
1. Check your internet connection
2. Try again in a few moments
3. Check GitHub's status page (status.github.com)
4. Use the ZIP fallback option

### "Rate Limit Exceeded" Error

**Cause**: Too many requests to GitHub API

**Solutions**:
1. Wait 5-10 minutes before trying again
2. Use the ZIP fallback option
3. If this happens frequently, contact support

### Loading Screen Stuck

**Cause**: Generation process may have stalled

**Solutions**:
1. Wait 2-3 minutes (large projects take time)
2. Refresh the page and try again
3. Check your browser console for errors
4. Use the ZIP fallback option

## Tips & Best Practices

### Choosing Repository Names

- Use descriptive names that indicate the project purpose
- Keep names short and memorable
- Use hyphens to separate words (e.g., "my-api-project")
- Avoid special characters and spaces

### When to Use GitHub Integration

**Use GitHub Integration When:**
- You want to start coding immediately
- You're comfortable with the default repository settings
- You want automatic version control setup

**Use ZIP Download When:**
- You want to review the code before pushing
- You need to customize the repository settings
- You're working offline or have connectivity issues
- You want to push to an existing repository

### Managing Multiple Projects

- Each project creates a new repository
- Repository names must be unique in your account
- Consider using prefixes for related projects (e.g., "myapp-frontend", "myapp-backend")

## FAQ

**Q: Can I make the repository private?**
A: Currently, all repositories are created as public. Private repository support is coming soon.

**Q: Can I choose a different repository name?**
A: The repository name is based on your project name. Change the project name in the wizard to change the repository name.

**Q: What if I want to push to an existing repository?**
A: Use the ZIP download option and push the code manually to your existing repository.

**Q: Can I change the repository settings after creation?**
A: Yes! Go to your repository on GitHub and use the Settings tab to modify any settings.

**Q: Will this overwrite my existing repository?**
A: No. If a repository with the same name exists, you'll get an error and can choose a different name.

**Q: How do I sign out?**
A: Click the "Sign Out" button on the GitHub authentication step in the wizard.

**Q: Is my GitHub token secure?**
A: Yes. Tokens are stored in secure httpOnly cookies and never exposed to client-side code.

## Getting Help

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Try the ZIP fallback option
3. Contact support with details about the error
4. Report bugs on our GitHub repository
