# GitHub Dashboard Setup Guide

This dashboard integrates with your existing GitHub App authentication to display real-time data from your GitHub repository.

## Prerequisites

You should already have a GitHub App set up from your UltraPilot installation. If not, follow the guide at `.github/GITHUB_APP_SETUP.md`.

## Quick Setup

### 1. Verify Your GitHub App Credentials

Check that your main project's `.env` file has:
```bash
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=789012
GITHUB_APP_PRIVATE_KEY_PATH=/home/ubuntu/.ssh/ultrapilot-app.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=ultra-workspace
```

### 2. Copy Credentials to Dashboard

The dashboard's `.env.local` file should already be configured. If not, create it:

```bash
cd ultrapilot-dashboard
cp ../.env .env.local
```

Or create it manually:
```bash
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=789012
GITHUB_APP_PRIVATE_KEY_PATH=/home/ubuntu/.ssh/ultrapilot-app.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=ultra-workspace
NEXT_PUBLIC_GITHUB_OWNER=hscheema1979
NEXT_PUBLIC_GITHUB_REPO=ultra-workspace
```

### 3. Verify Private Key Access

Make sure the Next.js server can read the private key:

```bash
# Test file access
ls -la ~/.ssh/ultrapilot-app.pem

# Fix permissions if needed
chmod 600 ~/.ssh/ultrapilot-app.pem
```

### 4. Test the API Endpoints

Start the development server:
```bash
npm run dev
```

Test the API endpoints:
```bash
# Test workflows
curl http://localhost:3000/api/workflows

# Test tasks/issues
curl http://localhost:3000/api/tasks

# Test projects
curl http://localhost:3000/api/projects

# Test metrics
curl http://localhost:3000/api/metrics
```

## API Integration Details

### Workflows (`/api/workflows`)
- **Source**: GitHub Actions API
- **Endpoint**: `/repos/{owner}/{repo}/actions/runs`
- **Permissions Required**: `actions:read`
- **Data**: Workflow runs, status, duration, branch, trigger

### Tasks (`/api/tasks`)
- **Source**: GitHub Issues API
- **Endpoint**: `/repos/{owner}/{repo}/issues`
- **Permissions Required**: `issues:read`
- **Data**: Issues, PRs, labels, assignees, status

### Projects (`/api/projects`)
- **Source**: GitHub Projects API
- **Endpoint**: `/user/projects` (requires additional setup)
- **Permissions Required**: `project:read`
- **Note**: Projects must be created manually in GitHub

### Metrics (`/api/metrics`)
- **Source**: Aggregates from above endpoints
- **Calculates**: Success rates, task counts, active projects

## Troubleshooting

### "Missing GitHub configuration"
**Problem**: Environment variables not set
**Solution**: Check `.env.local` file exists and has all required variables

### "Error getting GitHub auth token"
**Problem**: Private key file not accessible
**Solution**:
```bash
# Verify file exists
ls -la ~/.ssh/ultrapilot-app.pem

# Check Next.js can read it
cat ~/.ssh/ultrapilot-app.pem | head -1
```

### "GitHub API error: Resource not accessible"
**Problem**: GitHub App lacks permissions
**Solution**:
1. Go to https://github.com/settings/apps
2. Select your app
3. Check "Repository permissions":
   - Actions: Read & Write
   - Issues: Read & Write
   - Contents: Read & Write
   - Metadata: Read-only
   - Checks: Read & Write

### "Failed to fetch workflows"
**Problem**: No workflow runs exist
**Solution**: Create a GitHub Actions workflow in `.github/workflows/`

### "Failed to fetch projects"
**Problem**: No GitHub Projects set up
**Solution**:
1. Go to https://github.com/users/hscheema1979/projects
2. Create a new project
3. Link it to your repository

## Security Considerations

### ✅ What We Do Right
- Private key stays on server (never exposed to browser)
- Token auto-rotates every hour
- Minimal permissions (only what's needed)
- No personal access tokens

### ⚠️ Important Notes
- Never commit `.env.local` or `.pem` files
- Keep private key file permissions restricted (`chmod 600`)
- Rotate keys every 90 days
- Monitor GitHub App usage logs

## Production Deployment

For production deployment (Vercel, etc.):

1. **Add Environment Variables** in deployment platform:
   ```
   GITHUB_APP_ID
   GITHUB_APP_INSTALLATION_ID
   GITHUB_APP_PRIVATE_KEY (upload the actual key content, not path)
   GITHUB_OWNER
   GITHUB_REPO
   NEXT_PUBLIC_GITHUB_OWNER
   NEXT_PUBLIC_GITHUB_REPO
   ```

2. **Update GitHub Auth** for serverless environments:
   ```typescript
   // In src/lib/github-auth.ts
   const privateKey = process.env.GITHUB_APP_PRIVATE_KEY // Use direct content instead of file path
   ```

3. **Configure CORS** if needed:
   ```javascript
   // next.config.js
   module.exports = {
   async headers() {
     return [
     {
       source: '/api/:path*',
       headers: [
     { key: 'Access-Control-Allow-Origin', value: '*' },
       ],
     },
     ]
   },
   }
   ```

## Next Steps

1. ✅ Set up GitHub App authentication
2. ✅ Configure environment variables
3. ✅ Test API endpoints
4. ✅ Verify dashboard displays real data
5. 🔄 Set up auto-refresh (WebSocket or polling)
6. 🔄 Add webhook support for real-time updates

## Need Help?

- GitHub App Setup: `.github/GITHUB_APP_SETUP.md`
- GitHub API Docs: https://docs.github.com/en/rest
- Octokit.js Docs: https://octokit.github.io/rest.js/
