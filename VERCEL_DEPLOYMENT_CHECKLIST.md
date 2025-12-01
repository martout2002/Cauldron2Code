# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables (CRITICAL)
You need to set these in Vercel Dashboard → Settings → Environment Variables:

**Required for GitHub Integration:**
- `GITHUB_CLIENT_ID` - Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - Your GitHub OAuth App Client Secret  
- `GITHUB_CALLBACK_URL` - Set to `https://your-domain.vercel.app/api/github/auth/callback`
- `GITHUB_TOKEN_ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`

**Optional (Rate Limiting):**
- `GITHUB_RATE_LIMIT_MAX` - Default: 5
- `GITHUB_RATE_LIMIT_WINDOW` - Default: 3600000 (1 hour in ms)

### 2. GitHub OAuth App Configuration
1. Go to https://github.com/settings/developers
2. Update your OAuth App or create a new one for production:
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/github/auth/callback`
3. Copy the Client ID and Client Secret to Vercel environment variables

### 3. Build Configuration
✅ Already configured correctly:
- Build Command: `next build` (default)
- Output Directory: `.next` (default)
- Install Command: Auto-detected (uses bun or npm)
- Node Version: >=20.0.0 (specified in package.json)

### 4. File System Operations
✅ Already handled:
- Temp files use `/tmp` directory on Vercel (serverless-compatible)
- Archives stored in `/tmp/archives`
- Automatic cleanup after generation

## ⚠️ Known Limitations on Vercel

### 1. Serverless Function Timeout
- **Free/Hobby**: 10 seconds max
- **Pro**: 60 seconds max
- **Enterprise**: 900 seconds max

**Impact**: Large scaffold generation might timeout on Free tier
**Mitigation**: Already implemented - generation is synchronous and optimized

### 2. Temporary Storage
- `/tmp` directory has 512MB limit
- Files are ephemeral (cleared between invocations)

**Impact**: Multiple concurrent generations could fill /tmp
**Mitigation**: Already implemented - cleanup after each generation

### 3. Memory Limits
- **Free/Hobby**: 1024MB
- **Pro**: 3008MB

**Impact**: Very large scaffolds might hit memory limits
**Mitigation**: Files are streamed to zip archives

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure environment variables
5. Deploy

### Option 3: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure build settings (auto-detected)
4. Add environment variables
5. Click "Deploy"

## 🧪 Post-Deployment Testing

### 1. Test Basic Functionality
- [ ] Homepage loads correctly
- [ ] Wizard navigation works
- [ ] Configuration validation works

### 2. Test GitHub Integration
- [ ] GitHub OAuth login works
- [ ] Repository creation works
- [ ] Files are pushed correctly
- [ ] Success screen shows repository URL

### 3. Test Generation
- [ ] Scaffold generation completes
- [ ] ZIP download works
- [ ] Generated files are correct

### 4. Test Guides
- [ ] Platform selector loads
- [ ] Guide generation works
- [ ] Guide export works

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Run `npm install` or `bun install` locally and commit lock file

### Issue: GitHub OAuth fails
**Solution**: 
1. Check callback URL matches exactly (including https://)
2. Verify environment variables are set in Vercel
3. Check GitHub OAuth app settings

### Issue: Generation timeout
**Solution**: 
- Upgrade to Pro plan for 60s timeout
- Or optimize generation (already done)

### Issue: Files not persisting
**Solution**: This is expected - use `/tmp` for temporary files only

### Issue: Environment variables not working
**Solution**:
1. Redeploy after adding environment variables
2. Check variable names match exactly (case-sensitive)
3. Verify no trailing spaces in values

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Monitor page views, performance, errors

### Vercel Logs
- View in Vercel Dashboard → Deployments → [deployment] → Functions
- Check for errors in API routes

### Error Tracking
- Consider adding Sentry or similar
- Already have console.error logging in place

## 🔒 Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] GitHub token encryption key is strong (32+ bytes)
- [ ] OAuth callback URLs use HTTPS
- [ ] Rate limiting is enabled
- [ ] No sensitive data in logs

## 📝 Environment Variables Template

Copy this to Vercel Dashboard → Settings → Environment Variables:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-domain.vercel.app/api/github/auth/callback
GITHUB_TOKEN_ENCRYPTION_KEY=generate_with_openssl_rand_base64_32
GITHUB_RATE_LIMIT_MAX=5
GITHUB_RATE_LIMIT_WINDOW=3600000
```

## ✅ Final Checklist

Before deploying:
- [ ] All environment variables configured
- [ ] GitHub OAuth app updated with production URLs
- [ ] Code pushed to Git repository
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript checks pass (`npm run typecheck`)
- [ ] No console errors in browser

After deploying:
- [ ] Test all major features
- [ ] Check Vercel function logs for errors
- [ ] Monitor first few user sessions
- [ ] Set up error tracking/monitoring

## 🎉 You're Ready!

Your app is already optimized for Vercel deployment. The main thing you need is to configure the GitHub OAuth environment variables.
