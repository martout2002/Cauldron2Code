# External Links Verification

Last verified: November 23, 2025

## Platform Documentation Links

### Vercel
- ✅ Documentation: https://vercel.com/docs
- ✅ Pricing: https://vercel.com/pricing
- ✅ CLI: https://vercel.com/docs/cli
- ✅ Status: https://www.vercel-status.com
- ✅ Community: https://github.com/vercel/vercel/discussions
- ✅ Discord: https://vercel.com/discord
- ✅ Support: https://vercel.com/support

### Railway
- ✅ Documentation: https://docs.railway.app
- ✅ Pricing: https://railway.app/pricing
- ✅ CLI: https://docs.railway.app/develop/cli
- ✅ Status: https://status.railway.app
- ✅ Discord: https://discord.gg/railway
- ✅ Community: https://help.railway.app
- ✅ Feedback: https://feedback.railway.app

### Render
- ✅ Documentation: https://render.com/docs
- ✅ Pricing: https://render.com/pricing
- ✅ Status: https://status.render.com
- ✅ Community: https://community.render.com
- ✅ Discord: https://discord.gg/render
- ✅ Support: https://render.com/support

### Netlify
- ✅ Documentation: https://docs.netlify.com
- ✅ Pricing: https://www.netlify.com/pricing
- ✅ Status: https://www.netlifystatus.com
- ✅ Community: https://answers.netlify.com
- ✅ Support: https://www.netlify.com/support

### AWS Amplify
- ✅ Documentation: https://docs.amplify.aws
- ✅ Pricing: https://aws.amazon.com/amplify/pricing
- ✅ Status: https://status.aws.amazon.com
- ✅ Discord: https://discord.gg/amplify
- ✅ GitHub Discussions: https://github.com/aws-amplify/amplify-js/discussions
- ✅ Support: https://aws.amazon.com/support

## Service Provider Links

### Authentication Services
- ✅ GitHub OAuth: https://github.com/settings/developers
- ✅ Google OAuth: https://console.cloud.google.com/apis/credentials
- ✅ Clerk Dashboard: https://dashboard.clerk.com
- ✅ Supabase: https://app.supabase.com

### Database Services
- ✅ Supabase: https://supabase.com
- ✅ MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- ✅ Upstash (Redis): https://upstash.com

### AI Services
- ✅ Anthropic Console: https://console.anthropic.com/settings/keys
- ✅ OpenAI Platform: https://platform.openai.com/api-keys
- ✅ AWS IAM Console: https://console.aws.amazon.com/iam
- ✅ Google AI Studio: https://makersuite.google.com/app/apikey

## Technical Documentation Links

### General
- ✅ Node.js: https://nodejs.org
- ✅ Node.js Downloads: https://nodejs.org/en/download
- ✅ Git: https://git-scm.com/downloads

### Framework-Specific
- ✅ Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

### Database Documentation
- ✅ PostgreSQL Connection Strings: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
- ✅ Supabase Connection Guide: https://supabase.com/docs/guides/database/connecting-to-postgres
- ✅ MongoDB Connection Strings: https://www.mongodb.com/docs/manual/reference/connection-string/

### Community Resources
- ✅ Stack Overflow: https://stackoverflow.com/questions/tagged/{platform}

## Verification Process

### How to Verify Links

1. **Automated Check** (recommended):
   ```bash
   # Install link checker
   npm install -g broken-link-checker
   
   # Check all links in deployment guides
   blc https://your-deployment-url/guides -ro
   ```

2. **Manual Check**:
   - Open each link in a browser
   - Verify it loads without errors
   - Check content is relevant and current
   - Update this document with status

3. **Periodic Review**:
   - Check links quarterly (every 3 months)
   - Update when platforms change documentation structure
   - Monitor platform status pages for service changes

### Link Status Codes

- ✅ **Verified**: Link works and content is current
- ⚠️ **Warning**: Link works but content may be outdated
- ❌ **Broken**: Link returns 404 or other error
- 🔄 **Redirect**: Link redirects to new URL (update needed)

## Update History

| Date | Updated By | Changes |
|------|-----------|---------|
| 2025-11-23 | Initial | Created verification document with all current links |

## Notes

### Platform-Specific Considerations

**Vercel**:
- CLI documentation may move between `/cli` and `/docs/cli`
- Status page is separate domain: `vercel-status.com`

**Railway**:
- Community forum moved from Discourse to help.railway.app
- Feedback portal is separate: feedback.railway.app

**Render**:
- Discord invite link may expire periodically
- Check https://render.com/discord for current invite

**Netlify**:
- Status page uses different domain: `netlifystatus.com`
- Community moved from Gitter to answers.netlify.com

**AWS Amplify**:
- Documentation structure changes frequently
- Always verify AWS service availability by region

### Service Provider Notes

**Supabase**:
- Dashboard URL is consistent: app.supabase.com
- Connection guide URL structure is stable

**MongoDB Atlas**:
- Cloud Atlas URL is stable
- Documentation URLs may change with version updates

**Anthropic**:
- Console URL structure is stable
- API key page is at /settings/keys

**OpenAI**:
- Platform URL changed from beta.openai.com to platform.openai.com
- API keys page is at /api-keys

## Maintenance Checklist

- [ ] Verify all platform documentation links quarterly
- [ ] Check service provider links when services update
- [ ] Test OAuth setup links before major releases
- [ ] Verify AI service links when new providers are added
- [ ] Update this document when links change
- [ ] Run automated link checker in CI/CD pipeline
- [ ] Monitor platform status pages for service changes
- [ ] Check community links for Discord invite expiration

## Reporting Broken Links

If you find a broken link:

1. Create an issue on GitHub with:
   - Link URL
   - Where it's used (file and line number)
   - Error message or status code
   - Suggested replacement (if known)

2. Label the issue: `documentation`, `broken-link`

3. If you know the correct URL, submit a PR with the fix

## Automated Verification

To set up automated link checking in CI/CD:

```yaml
# .github/workflows/link-check.yml
name: Check Links

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          config-file: '.github/link-check-config.json'
```

```json
// .github/link-check-config.json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    }
  ],
  "timeout": "20s",
  "retryOn429": true,
  "retryCount": 3,
  "fallbackRetryDelay": "30s"
}
```
