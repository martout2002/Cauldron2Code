# Deployment System Flow Diagram

## User Journey: From Configuration to Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER CONFIGURATION                         │
│                                                                  │
│  User visits /configure page                                     │
│  ├─ Selects tech stack (Next.js, Express, etc.)                │
│  ├─ Chooses database (PostgreSQL, MongoDB, etc.)               │
│  ├─ Picks authentication (NextAuth, Clerk, etc.)               │
│  └─ ✅ SELECTS DEPLOYMENT TARGETS (NEW!)                       │
│      ├─ [ ] Vercel                                             │
│      ├─ [ ] Railway                                            │
│      ├─ [ ] Render                                             │
│      └─ [ ] EC2                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. VALIDATION                                 │
│                                                                  │
│  Validation Rules Check:                                         │
│  ├─ At least one deployment target selected ✓                  │
│  ├─ Express + Vercel = Error (incompatible)                    │
│  ├─ EC2/Railway + No Docker = Warning                          │
│  └─ All other validations pass                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. SCAFFOLD GENERATION                        │
│                                                                  │
│  ScaffoldGenerator.generate()                                    │
│  ├─ Generate base project files                                │
│  ├─ Generate framework-specific files                          │
│  ├─ Generate auth/database files                               │
│  └─ Generate deployment files ⬇                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. DEPLOYMENT FILES GENERATION                      │
│                                                                  │
│  IF deployment.includes('vercel'):                              │
│    ├─ vercel.json                                              │
│    └─ .github/workflows/ci.yml (with Vercel deploy)           │
│                                                                  │
│  IF deployment.includes('railway'):                             │
│    └─ railway.json                                             │
│                                                                  │
│  IF deployment.includes('render'):                              │
│    └─ ⚠️ render.yaml (MISSING - needs implementation)          │
│                                                                  │
│  IF deployment.includes('ec2'):                                 │
│    ├─ deploy/setup.sh                                          │
│    ├─ deploy/deploy.sh                                         │
│    ├─ deploy/nginx.conf                                        │
│    └─ deploy/${projectName}.service                            │
│                                                                  │
│  IF extras.docker:                                              │
│    ├─ Dockerfile                                               │
│    ├─ docker-compose.yml                                       │
│    └─ .dockerignore                                            │
│                                                                  │
│  IF extras.githubActions:                                       │
│    └─ .github/workflows/ci.yml                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. DOCUMENTATION GENERATION                         │
│                                                                  │
│  IF deployment.length > 0:                                      │
│    └─ DEPLOYMENT.md                                            │
│       ├─ Pre-deployment checklist                             │
│       ├─ Vercel guide (if selected)                           │
│       ├─ Railway guide (if selected)                          │
│       ├─ Render guide (if selected)                           │
│       ├─ EC2 guide (if selected)                              │
│       └─ OAuth callback updates                               │
│                                                                  │
│  README.md:                                                     │
│    ├─ Tech stack (includes deployment targets)                │
│    ├─ Getting started                                          │
│    ├─ Deployment section (links to DEPLOYMENT.md)             │
│    └─ Security best practices                                 │
│                                                                  │
│  SETUP.md:                                                      │
│    ├─ Database setup                                           │
│    ├─ Auth setup                                               │
│    └─ AI setup (if applicable)                                │
│                                                                  │
│  .env.example:                                                  │
│    └─ All required environment variables                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. DOWNLOAD & EXTRACT                         │
│                                                                  │
│  User downloads ZIP file                                         │
│  ├─ Extracts to local directory                                │
│  ├─ Runs: npm install                                          │
│  ├─ Copies: .env.example → .env.local                         │
│  └─ Fills in environment variables                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. DEPLOYMENT PATHS                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┬─────────────┐
                │             │             │             │
                ▼             ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  VERCEL  │  │ RAILWAY  │  │  RENDER  │  │   EC2    │
        └──────────┘  └──────────┘  └──────────┘  └──────────┘
             │             │             │             │
             ▼             ▼             ▼             ▼

┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL PATH                                 │
│                                                                  │
│  1. Push code to GitHub                                         │
│  2. Visit vercel.com/new                                        │
│  3. Import repository                                           │
│  4. Vercel auto-detects vercel.json                            │
│  5. Add environment variables                                   │
│  6. Deploy (2-3 minutes)                                        │
│  7. Update OAuth callbacks                                      │
│                                                                  │
│  ✅ Auto-deploy on push (if GitHub Actions enabled)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      RAILWAY PATH                                │
│                                                                  │
│  1. Push code to GitHub                                         │
│  2. Visit railway.app                                           │
│  3. "Deploy from GitHub repo"                                   │
│  4. Railway auto-detects railway.json                          │
│  5. Add PostgreSQL database (optional)                         │
│  6. Add environment variables                                   │
│  7. Deploy (3-5 minutes)                                        │
│  8. Update OAuth callbacks                                      │
│                                                                  │
│  ✅ Auto-deploy on push (native GitHub integration)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      RENDER PATH                                 │
│                                                                  │
│  1. Push code to GitHub                                         │
│  2. Visit render.com                                            │
│  3. "New Web Service"                                           │
│  4. Connect GitHub repository                                   │
│  5. ⚠️ Manually configure (no render.yaml yet)                 │
│  6. Add PostgreSQL database (optional)                         │
│  7. Add environment variables                                   │
│  8. Deploy (3-5 minutes)                                        │
│  9. Update OAuth callbacks                                      │
│                                                                  │
│  ✅ Auto-deploy on push (native GitHub integration)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EC2 PATH                                    │
│                                                                  │
│  OPTION A: Automated (using scripts)                            │
│  1. Launch EC2 instance                                         │
│  2. SSH into instance                                           │
│  3. Copy deploy/ scripts to server                             │
│  4. Run: ./deploy/setup.sh                                     │
│  5. Clone repository to /var/www/${projectName}                │
│  6. Add .env file with variables                               │
│  7. Run: ./deploy/deploy.sh                                    │
│  8. Configure nginx with domain                                 │
│  9. Run: sudo certbot --nginx -d domain.com                    │
│  10. Update OAuth callbacks                                     │
│                                                                  │
│  OPTION B: Manual (step-by-step)                               │
│  1. Launch EC2 instance                                         │
│  2. Install Node.js, nginx, PM2, certbot                       │
│  3. Clone repository                                            │
│  4. Install dependencies & build                                │
│  5. Start with PM2                                              │
│  6. Configure nginx                                             │
│  7. Set up SSL with certbot                                    │
│  8. Update OAuth callbacks                                      │
│                                                                  │
│  ❌ No auto-deploy (manual git pull + restart)                 │
└─────────────────────────────────────────────────────────────────┘

## File Generation Decision Tree

```
deployment.includes('vercel')?
├─ YES → Generate vercel.json
│         └─ Include env var placeholders
│             ├─ Database URLs
│             ├─ Auth secrets
│             └─ AI API keys
└─ NO → Skip

deployment.includes('railway')?
├─ YES → Generate railway.json
│         └─ Include build/deploy config
│             ├─ Build command
│             ├─ Start command
│             └─ Restart policy
└─ NO → Skip

deployment.includes('render')?
├─ YES → ⚠️ Should generate render.yaml (MISSING)
│         └─ Should include:
│             ├─ Web service config
│             ├─ Database service (if needed)
│             └─ Redis service (if needed)
└─ NO → Skip

deployment.includes('ec2')?
├─ YES → Generate multiple files:
│         ├─ deploy/setup.sh (initial setup)
│         ├─ deploy/deploy.sh (app deployment)
│         ├─ deploy/nginx.conf (reverse proxy)
│         └─ deploy/${projectName}.service (systemd)
└─ NO → Skip

extras.docker?
├─ YES → Generate Docker files:
│         ├─ Dockerfile (multi-stage)
│         ├─ docker-compose.yml (with services)
│         └─ .dockerignore (security)
└─ NO → Skip

extras.githubActions?
├─ YES → Generate .github/workflows/ci.yml
│         ├─ Always: lint + build
│         └─ If Vercel: auto-deploy step
└─ NO → Skip

deployment.length > 0?
├─ YES → Generate DEPLOYMENT.md
│         ├─ Pre-deployment checklist
│         ├─ Platform-specific guides
│         └─ OAuth callback updates
└─ NO → Skip deployment docs
```

## Health Check Flow

```
Framework Type?
├─ Express
│   └─ ✅ Generate /health endpoint
│       └─ Returns: { status: 'ok', timestamp }
│
├─ Next.js
│   └─ ⚠️ Should generate /api/health (MISSING)
│       └─ Docker references it but not created
│
└─ Monorepo
    ├─ Express API: ✅ /health
    └─ Next.js Web: ⚠️ /api/health (MISSING)

Docker Health Check?
├─ Next.js: curl http://localhost:3000/api/health
├─ Express: curl http://localhost:4000/health
└─ Monorepo: curl http://localhost:3000/api/health
```

## Environment Variable Flow

```
Configuration → .env.example → User fills → .env.local → Deployment Platform

Database?
├─ PostgreSQL → DATABASE_URL
├─ Supabase → NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
└─ MongoDB → DATABASE_URL

Auth?
├─ NextAuth → NEXTAUTH_SECRET, NEXTAUTH_URL, GITHUB_ID, GITHUB_SECRET
├─ Clerk → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
└─ Supabase → (uses Supabase vars)

AI Template?
├─ Anthropic → ANTHROPIC_API_KEY
├─ OpenAI → OPENAI_API_KEY
├─ AWS Bedrock → AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
└─ Gemini → GEMINI_API_KEY

Redis?
└─ REDIS_URL

⚠️ Missing: Validation script to check all required vars before deployment
```

## OAuth Callback URL Updates

```
Deployment Platform → Domain → Update OAuth Provider

Vercel:
├─ Production: https://your-app.vercel.app
└─ Callback: https://your-app.vercel.app/api/auth/callback/[provider]

Railway:
├─ Production: https://your-app.up.railway.app
└─ Callback: https://your-app.up.railway.app/api/auth/callback/[provider]

Render:
├─ Production: https://your-app.onrender.com
└─ Callback: https://your-app.onrender.com/api/auth/callback/[provider]

EC2:
├─ Production: https://your-domain.com
└─ Callback: https://your-domain.com/api/auth/callback/[provider]

Update in:
├─ GitHub OAuth App Settings
├─ Google Cloud Console
├─ Clerk Dashboard
└─ Other OAuth providers
```

## Summary

- ✅ UI now includes deployment target selection
- ✅ Comprehensive file generation for most platforms
- ✅ Detailed documentation for all platforms
- ⚠️ Missing: Render config file, Next.js health check
- ⚠️ Limited: GitHub Actions only deploys to Vercel
- ✅ Security: Best practices followed throughout
