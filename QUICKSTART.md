# Quick Start Guide - GitHub Dashboard

Your GitHub Operations Dashboard is ready! Here's how to get started:

## 🚀 Start the Dashboard

```bash
cd ultrapilot-dashboard
npm run dev
```

Open your browser to: **http://localhost:3004** (or the port shown in terminal)

## ✅ What's Included

### 1. Real GitHub Data Integration
- ✅ **Workflows**: Live GitHub Actions runs from your repository
- ✅ **Tasks/Issues**: Real GitHub issues and pull requests
- ✅ **Metrics**: Calculated from your actual GitHub data
- ⚠️ **Projects**: Requires GitHub Projects to be set up (see below)

### 2. Dashboard Features
- 📊 **Overview Metrics**: At-a-glance statistics
- 🔄 **Workflow Monitor**: Real-time workflow status with progress
- 📋 **Projects Board**: Visual project tracking (setup needed)
- ✅ **Tasks List**: Issues and PRs with filtering

### 3. Tech Stack
- Next.js 15 + TypeScript
- shadcn/ui components
- GitHub App authentication (secure, auto-rotating tokens)
- Tailwind CSS v4

## 🔑 Authentication Setup

The dashboard uses your **existing GitHub App** from UltraPilot:

1. Your `.env.local` is already configured with:
   ```bash
   GITHUB_APP_ID=123456
   GITHUB_APP_INSTALLATION_ID=789012
   GITHUB_APP_PRIVATE_KEY_PATH=/home/ubuntu/.ssh/ultrapilot-app.pem
   ```

2. If you see authentication errors, verify:
   ```bash
   # Check private key exists
   ls -la ~/.ssh/ultrapilot-app.pem

   # Update with actual values from your .env
   nano .env.local
   ```

## 📊 Testing the Dashboard

### Test API Endpoints:
```bash
# Workflows
curl http://localhost:3004/api/workflows

# Tasks/Issues
curl http://localhost:3004/api/tasks

# Projects
curl http://localhost:3004/api/projects

# Metrics
curl http://localhost:3004/api/metrics
```

### Expected Behavior:
- ✅ **Workflows**: Shows recent GitHub Actions runs
- ✅ **Tasks**: Shows open/closed issues from your repo
- ⚠️ **Projects**: Empty until you create GitHub Projects
- ✅ **Metrics**: Aggregates workflows and tasks data

## 🎯 Setting Up GitHub Projects (Optional)

If you want to use the Projects feature:

1. **Create a GitHub Project:**
   - Go to: https://github.com/users/hscheema1979/projects
   - Click "New Project"
   - Select "Board" or "Table" view
   - Link it to `hscheema1979/ultra-workspace`

2. **Add Issues to Project:**
   - Drag issues from your repo to the project
   - Set statuses, priorities, and assignees

3. **Refresh Dashboard:**
   - Projects will appear in the "Projects" tab

## 🎨 Customization

### Add More shadcn/ui Components:
```bash
npx shadcn@latest add [component-name]
```

### Modify Dashboard Layout:
- Edit `src/app/page.tsx` for main layout
- Edit components in `src/components/dashboard/`

### Change Styling:
- Edit `src/app/globals.css` for global styles
- Components use Tailwind utility classes

## 📱 What You'll See

### Metrics Cards (Top)
- Total Workflows (with weekly change)
- Currently Running workflows
- Successful Today (with success rate)
- Failed Today (needs attention)

### Workflows Tab
- Table of recent workflow runs
- Status badges (Running, Success, Failed, Pending)
- Progress bars for active runs
- Trigger type and branch
- Duration and last run time

### Projects Tab
- Project cards with progress bars
- Team member avatars
- Priority badges
- Task completion counts
- Due dates

### Tasks Tab
- GitHub issues table
- Status filtering dropdown
- Priority badges
- Assignee avatars
- Color-coded labels
- Due dates

## 🔧 Troubleshooting

### "Failed to fetch workflows"
- No workflow runs exist yet
- Create a `.github/workflows/` file in your repo

### "Failed to fetch projects"
- No GitHub Projects set up
- Create at https://github.com/users/hscheema1979/projects

### "Failed to fetch tasks"
- No issues in repository
- Create an issue to test

### "Missing GitHub configuration"
- Check `.env.local` file exists
- Verify all variables are set

## 📚 Documentation

- **Full Setup**: `GITHUB_SETUP.md` - Detailed GitHub App integration
- **Component Guide**: `README.md` - Project documentation
- **GitHub App**: `.github/GITHUB_APP_SETUP.md` - UltraPilot auth setup

## 🎉 Next Steps

1. ✅ Dashboard is running at http://localhost:3004
2. ✅ Real GitHub data is being fetched
3. ✅ All components are styled with shadcn/ui
4. 🔄 Set up GitHub Projects (optional)
5. 🔄 Customize to your needs
6. 🔄 Deploy to production (Vercel, etc.)

## 💡 Tips

- Click the "Refresh" button to reload data
- Use the status dropdown to filter tasks
- Click "View Details" to see workflow logs
- Projects feature requires manual setup

---

**Built with:** Next.js 15, TypeScript, shadcn/ui, GitHub App Auth
**Status:** ✅ Ready to use
**Data Source:** Real GitHub API (hscheema1979/ultra-workspace)
