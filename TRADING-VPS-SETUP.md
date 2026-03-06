# 📦 Pull UltraPilot Dashboard into Trading VPS

## Quick Setup (5 minutes)

### On your Trading VPS:

```bash
# 1. Clone the repository
git clone https://github.com/hscheema1979/ultrapilot-dashboard.git
cd ultrapilot-dashboard

# 2. Run the setup script
chmod +x setup.sh
./setup.sh

# 3. Configure environment
nano .env.local
```

Add your GitHub App credentials:
```bash
GITHUB_APP_ID=3009773
GITHUB_APP_INSTALLATION_ID=114494885
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/ultra-team-coordinator.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=trading-at
DATABASE_PATH=./data/cache.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Start the dashboard
npm run dev
```

### Access the Dashboard:
- **Local:** http://localhost:3000
- **After nginx setup:** http://your-trading-vps-ip

---

## UltraPilot Integration for trading-at

The dashboard will automatically monitor the trading-at repo once it's on GitHub.

### Create Trading Workflow Issue:

```bash
# From any VPS with gh CLI installed
gh issue create \
  --repo hscheema1979/trading-at \
  --title "Implement trading strategy" \
  --label "workflow" \
  --label "domain:trading" \
  --label "queue:active" \
  --body "Implement RSI-based trading strategy with backtesting"
```

The autoloop (running on VPS5) will pick it up and spawn agents!

---

## What You Get:

✅ **Real-time monitoring** of trading-at repo
✅ **Workflow supervision** for trading tasks
✅ **GitHub Actions tracking** for trading bots
✅ **Multi-server coordination** via GitHub
✅ **Dashboard access** from anywhere

---

## Next Steps:

1. Push trading-at code to GitHub
2. Create workflow issues in trading-at repo
3. Autoloop on VPS5 monitors and spawns agents
4. Check dashboard for progress

---

**Everything is connected via GitHub - no direct server-to-server setup needed!** 🎉
