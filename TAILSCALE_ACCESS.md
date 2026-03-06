# Tailscale Access Guide

Your GitHub Dashboard is now accessible via your Tailscale VPN!

## 🎯 Access URLs

Choose any of these URLs to access your dashboard:

### Via Tailscale IP (Recommended)
```
http://100.99.47.10:3004
```

### Via Tailscale MagicDNS (if enabled)
```
http://hscheema1979.tailnet-name.ts.net:3004
```

### Via Local Network
```
http://51.81.34.78:3004
```

### Via Localhost (on the server)
```
http://localhost:3004
```

## 🔥 Quick Start

### From Any Device on Your Tailscale Network

1. **Make sure Tailscale is running** on your device
2. **Open browser** and navigate to:
   ```
   http://100.99.47.10:3004
   ```
3. **Done!** You should see your GitHub dashboard

### From Your Phone/Tablet

1. **Install Tailscale** app from App Store/Play Store
2. **Log in** to your Tailscale account
3. **Open browser** and go to: `http://100.99.47.10:3004`

### From Another Computer

1. **Install Tailscale**: https://tailscale.com/download
2. **Log in** to connect to your tailnet
3. **Access dashboard**: `http://100.99.47.10:3004`

## 🔒 Security Status

✅ **Firewall configured**: Only Tailscale network allowed (100.64.0.0/10)
✅ **GitHub App auth**: Uses secure app authentication (not PAT)
✅ **HTTPS ready**: Can add TLS with Tailscale Funnel (optional)
✅ **Private**: Only accessible from devices on your Tailscale network

## 🚀 Server Management

### Start Dashboard (Tailscale Access)
```bash
cd ultrapilot-dashboard
npm run dev:expose
```

### Start Dashboard (Local Only)
```bash
cd ultrapilot-dashboard
npm run dev
```

### Start Production Server (Tailscale Access)
```bash
cd ultrapilot-dashboard
npm run build
npm run start:expose
```

### Stop Dashboard
```bash
# Press Ctrl+C in the terminal where it's running
```

## 🛠️ Troubleshooting

### Can't Access Dashboard

1. **Check Tailscale is connected:**
   ```bash
   tailscale status
   ```

2. **Check if port is open:**
   ```bash
   sudo ufw status | grep 3004
   ```

3. **Check if server is running:**
   ```bash
   curl http://localhost:3004
   ```

4. **Test from Tailscale IP:**
   ```bash
   curl http://100.99.47.10:3004
   ```

### Dashboard Loads But Shows Errors

1. **Check GitHub credentials:**
   ```bash
   cat .env.local
   ```

2. **Verify private key:**
   ```bash
   ls -la ~/.ssh/ultrapilot-app.pem
   ```

3. **Test API endpoints:**
   ```bash
   curl http://100.99.47.10:3004/api/workflows
   ```

### Firewall Issues

```bash
# Add Tailscale network to firewall (if missing)
sudo ufw allow from 100.64.0.0/10 to any port 3004 proto tcp

# Check firewall status
sudo ufw status numbered

# Reload firewall
sudo ufw reload
```

## 🌐 Optional: Public Access with Tailscale Funnel

**⚠️ Warning**: This makes your dashboard publicly accessible!

If you want to access your dashboard from anywhere (even without Tailscale):

```bash
# Enable Tailscale Funnel
tailscale funnel --https=443 --bg=http://localhost:3004

# Or use a custom subdomain
tailscale funnel --https=443 --bg=http://localhost:3004 your-name.tailnet-name.ts.net
```

Then access via: `https://your-name.tailnet-name.ts.net`

**Note**: Funnel requires HTTPS and is recommended only if you add authentication!

## 🔧 Advanced Configuration

### Custom Port

To use a different port (e.g., 3000):

1. **Stop current server** (Ctrl+C)
2. **Kill process on port 3000** (if needed):
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```
3. **Start with custom port**:
   ```bash
   PORT=3000 npm run dev:expose
   ```

### Add Authentication (Recommended for Public Access)

Create `middleware.ts` in `src/`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const validToken = process.env.DASHBOARD_TOKEN

  if (authHeader !== `Bearer ${validToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

Then access with:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://100.99.47.10:3004/api/workflows
```

## 📱 Mobile Access

### iOS (iPhone/iPad)
1. Install Tailscale from App Store
2. Sign in to your account
3. Open Safari
4. Go to: `http://100.99.47.10:3004`
5. Add to Home Screen for easy access

### Android
1. Install Tailscale from Play Store
2. Sign in to your account
3. Open Chrome
4. Go to: `http://100.99.47.10:3004`
5. Add to Home Screen for app-like experience

## 🎉 You're All Set!

Your dashboard is now accessible from any device connected to your Tailscale network. Enjoy monitoring your GitHub workflows, projects, and tasks from anywhere!

## 📚 Quick Reference

| Access Method | URL | Security |
|---------------|-----|----------|
| **Tailscale IP** | http://100.99.47.10:3004 | Private (tailnet only) |
| **Local Network** | http://51.81.34.78:3004 | Private (LAN only) |
| **Localhost** | http://localhost:3004 | Local machine only |
| **Tailscale Funnel** | https://your-name.ts.net | Public (if enabled) |

**Current Status**: ✅ Running on http://100.99.47.10:3004
**Network**: Tailscale (100.64.0.0/10)
**Firewall**: Configured for Tailscale only
