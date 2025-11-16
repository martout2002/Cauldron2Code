# Cross-Platform Compatibility Testing

This document describes how to test Cauldron2Code's generated scaffolds across different platforms and ensure Node.js 20+ compatibility.

## Overview

The cross-platform test suite verifies that generated scaffolds work correctly on:
- macOS
- Linux
- Windows WSL

It tests three critical aspects:
1. **Dependency Installation**: Verifies `npm install` completes successfully
2. **Development Server**: Tests that `npm run dev` starts without errors
3. **Build Process**: Validates that `npm run build` produces a working build

## Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- Sufficient disk space (at least 2GB free)
- Stable internet connection for dependency downloads

## Running the Tests

### Automated Test Suite

Run the comprehensive cross-platform test suite:

```bash
bun run src/lib/generator/__test-cross-platform.ts
```

This will:
1. Check your Node.js version
2. Generate multiple scaffold configurations
3. Test each scaffold for:
   - Dependency installation
   - Dev server startup
   - Build process
4. Provide a detailed summary of results

### Test Configurations

The test suite includes:

1. **Minimal Configuration**
   - Next.js with App Router
   - Tailwind CSS + shadcn/ui
   - White color scheme
   - Vercel deployment

2. **Full-Featured Configuration**
   - Next.js with App Router
   - Tailwind CSS + shadcn/ui
   - Purple color scheme
   - Docker + GitHub Actions
   - Multiple deployment targets

## Platform-Specific Testing

### macOS Testing

On macOS, the test suite will automatically detect your platform and run all tests.

```bash
# Verify Node.js version
node --version  # Should be v20.0.0 or higher

# Run tests
bun run src/lib/generator/__test-cross-platform.ts
```

### Linux Testing

On Linux distributions, ensure you have Node.js 20+ installed:

```bash
# Check Node.js version
node --version

# If needed, install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run tests
bun run src/lib/generator/__test-cross-platform.ts
```

### Windows WSL Testing

On Windows with WSL (Windows Subsystem for Linux):

```bash
# Open WSL terminal
wsl

# Check Node.js version
node --version

# If needed, install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run tests
bun run src/lib/generator/__test-cross-platform.ts
```

## Manual Testing

If you prefer to test manually:

### 1. Generate a Scaffold

Use the Cauldron2Code UI or API to generate a scaffold with your desired configuration.

### 2. Extract and Navigate

```bash
# Extract the downloaded zip
unzip your-project.zip
cd your-project
```

### 3. Test Dependency Installation

```bash
npm install
```

Expected: All dependencies install without errors.

### 4. Test Development Server

```bash
npm run dev
```

Expected: Server starts and shows "Ready" message. Visit http://localhost:3000 to verify.

### 5. Test Build Process

```bash
npm run build
```

Expected: Build completes successfully and creates `.next` directory.

## Node.js Version Requirements

All generated scaffolds include an `engines` field in `package.json`:

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

This ensures:
- Users are warned if they try to install with an incompatible Node.js version
- CI/CD pipelines can enforce version requirements
- Deployment platforms use the correct Node.js version

## Troubleshooting

### Node.js Version Too Old

**Error**: `Node.js 20+ required, found v18.x.x`

**Solution**: Upgrade Node.js to version 20 or higher:
- macOS: `brew install node@20`
- Linux: Use NodeSource repository (see Linux Testing section)
- Windows: Download from https://nodejs.org/

### Dependency Installation Fails

**Error**: `npm install` fails with network or permission errors

**Solutions**:
- Check internet connection
- Clear npm cache: `npm cache clean --force`
- Try with sudo (Linux/macOS): `sudo npm install`
- Check disk space: `df -h`

### Dev Server Won't Start

**Error**: Port 3000 already in use

**Solution**: Kill the process using port 3000 or use a different port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Build Process Fails

**Error**: Build fails with TypeScript or dependency errors

**Solutions**:
- Ensure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Check for TypeScript errors: `npx tsc --noEmit`

## CI/CD Integration

To run cross-platform tests in CI/CD:

### GitHub Actions Example

```yaml
name: Cross-Platform Tests

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [20.x, 22.x]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm install
      
      - name: Run cross-platform tests
        run: bun run src/lib/generator/__test-cross-platform.ts
```

## Test Results

The test suite provides detailed output:

```
🧪 Cross-Platform Compatibility Test Suite

📌 Node.js version: v20.10.0
✓ Node.js version is compatible (20+)

============================================================
Testing: minimal-next
Platform: macOS
Node.js: v20.10.0
============================================================

⚙️  Generating scaffold...
✓ Generated 42 files

✓ Project created at: /tmp/test-minimal-next-xyz

📦 Testing dependency installation...
   Running npm install...
✓ Dependencies installed successfully

🚀 Testing development server startup...
   Starting dev server...
✓ Development server started successfully

🔨 Testing build process...
   Running npm run build...
✓ Build completed successfully

🧹 Cleaning up...
✓ Cleanup complete

============================================================
TEST SUMMARY
============================================================

Test 1: minimal-next
Platform: macOS
Node.js: v20.10.0
Status: ✅ PASSED
  - Dependency Install: ✓
  - Dev Server Start: ✓
  - Build Process: ✓

✅ All cross-platform tests passed!

Your platform is fully compatible with generated scaffolds.
```

## Continuous Monitoring

Run these tests:
- Before releasing new versions of Cauldron2Code
- After updating dependencies in package.json templates
- When adding new technology options
- On different platforms to ensure compatibility

## Related Files

- `src/lib/generator/__test-cross-platform.ts` - Main test suite
- `src/lib/generator/templates/package-json.ts` - Package.json generator with engines field
- `package.json` - Cauldron2Code's own package.json with Node.js requirements
