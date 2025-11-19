# Testing Your Vercel Integration

## Quick Test Checklist

### ✅ Step 1: Verify Environment Variables

Go to https://vercel.com/your-username/cauldron2code/settings/environment-variables

Make sure these are set:
- [ ] `VERCEL_CLIENT_ID` - Should start with `oac_`
- [ ] `VERCEL_CLIENT_SECRET` - Long random string
- [ ] `VERCEL_CALLBACK_URL` - `https://cauldron2code.vercel.app/api/platforms/vercel/auth/callback`
- [ ] `TOKEN_ENCRYPTION_KEY` - 64 character hex string

**If any are missing, add them and redeploy!**

### ✅ Step 2: Test OAuth Connection

1. Open: https://cauldron2code.vercel.app/configure
2. Scroll to the **Deployment** section
3. Look for Vercel connection status

**Expected behavior:**
- You should see a "Connect Vercel" button OR
- If already connected, you'll see "Connected ✓" with a disconnect option

### ✅ Step 3: Test the OAuth Flow

Click "Connect Vercel" (if not connected):

**What should happen:**
1. Redirects to Vercel authorization page
2. Shows your integration name and permissions
3. Click "Authorize"
4. Redirects back to your app
5. Shows "Connected ✓"

**If it fails:**
- Check browser console (F12) for errors
- Check Network tab for failed requests
- See troubleshooting below

### ✅ Step 4: Test API Endpoints Directly

Open these URLs in your browser to test each endpoint:

**1. Check connection status:**
```
https://cauldron2code.vercel.app/api/platforms/vercel/auth/status
```
Expected response:
```json
{
  "connected": false,
  "user": null
}
```
OR if connected:
```json
{
  "connected": true,
  "user": {
    "id": "...",
    "username": "...",
    "email": "..."
  }
}
```

**2. Initiate OAuth (will redirect):**
```
https://cauldron2code.vercel.app/api/platforms/vercel/auth/initiate
```
Expected: Redirects to Vercel authorization page

### ✅ Step 5: Test Full Deployment Flow

1. Go to https://cauldron2code.vercel.app/configure
2. Configure a simple Next.js project:
   - Project name: `test-deployment`
   - Framework: Next.js
   - Select minimal options
3. Make sure Vercel is connected
4. Click "Generate" or "Deploy Now"
5. Select Vercel as deployment target
6. Fill in any required environment variables
7. Click "Deploy"

**Expected behavior:**
- Shows deployment progress
- Creates project on Vercel
- Uploads files
- Starts build
- Shows deployment URL when complete

## Troubleshooting

### Problem: "Connect Vercel" button doesn't appear

**Solution:**
1. Check if `PlatformConnector` component is rendered on the page
2. Open browser console and look for errors
3. Check if the component is filtering out Vercel

**Quick fix:**
Open browser console and run:
```javascript
fetch('/api/platforms/vercel/auth/status')
  .then(r => r.json())
  .then(console.log)
```

### Problem: "Invalid client_id" error

**Solution:**
1. Go to https://vercel.com/integrations/console
2. Copy the Client ID (starts with `oac_`)
3. Update `VERCEL_CLIENT_ID` in Vercel environment variables
4. Redeploy

### Problem: "Redirect URI mismatch"

**Solution:**
1. Check your integration redirect URLs at https://vercel.com/integrations/console
2. Make sure it includes: `https://cauldron2code.vercel.app/api/platforms/vercel/auth/callback`
3. Check `VERCEL_CALLBACK_URL` environment variable matches exactly
4. Redeploy

### Problem: "Token encryption error"

**Solution:**
Generate a new encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add it as `TOKEN_ENCRYPTION_KEY` in Vercel environment variables and redeploy.

### Problem: OAuth works but deployment fails

**Check:**
1. Does your integration have the right permissions?
   - ✅ Read and write access to deployments
   - ✅ Read and write access to projects
   - ✅ Read access to teams
2. Is the access token being stored correctly?
3. Check deployment logs in Vercel dashboard

## Manual Testing with cURL

Test the OAuth callback endpoint:

```bash
# Test status endpoint
curl https://cauldron2code.vercel.app/api/platforms/vercel/auth/status

# Test initiate endpoint (will return redirect)
curl -I https://cauldron2code.vercel.app/api/platforms/vercel/auth/initiate
```

## Checking Logs

### Vercel Deployment Logs

1. Go to https://vercel.com/your-username/cauldron2code
2. Click on the latest deployment
3. Click "Functions" tab
4. Look for logs from:
   - `/api/platforms/vercel/auth/initiate`
   - `/api/platforms/vercel/auth/callback`
   - `/api/platforms/vercel/auth/status`

### Browser Console Logs

1. Open your app: https://cauldron2code.vercel.app/configure
2. Press F12 to open DevTools
3. Go to Console tab
4. Try connecting to Vercel
5. Look for:
   - ✅ Successful API calls
   - ❌ Error messages
   - ⚠️ Warning messages

## Success Indicators

You'll know it's working when:

- ✅ "Connect Vercel" button appears
- ✅ Clicking it redirects to Vercel authorization
- ✅ After authorizing, you're redirected back
- ✅ Status shows "Connected ✓"
- ✅ You can see your Vercel teams/projects
- ✅ You can deploy a test project
- ✅ Deployment completes successfully

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Check the integration exists:**
   - Go to https://vercel.com/integrations/console
   - Verify your integration is listed and active

2. **Verify all environment variables:**
   ```bash
   VERCEL_CLIENT_ID=oac_xxxxx
   VERCEL_CLIENT_SECRET=xxxxx
   VERCEL_CALLBACK_URL=https://cauldron2code.vercel.app/api/platforms/vercel/auth/callback
   TOKEN_ENCRYPTION_KEY=64_char_hex_string
   ```

3. **Check the code:**
   - Verify `/api/platforms/vercel/auth/initiate/route.ts` exists
   - Verify `/api/platforms/vercel/auth/callback/route.ts` exists
   - Check for TypeScript errors

4. **Test locally:**
   - Clone the repo
   - Set up `.env.local` with your credentials
   - Run `npm run dev`
   - Test at `http://localhost:3000/configure`
   - Check if it works locally first

5. **Create a minimal test:**
   - Create a simple test page that just calls the status endpoint
   - See if you can get any response at all

## Need More Help?

Share these details:
- Browser console errors (screenshot)
- Network tab showing failed requests
- Vercel function logs
- Your integration settings (without secrets!)
