# 🎛️ Control Room

> Central command and control dashboard for GitHub-integrated monitoring, multi-org repository management, workflow supervision, and real-time agent orchestration.

![Dashboard](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)

---

## ✨ Features

### 🎯 Dashboard Features
- **Multi-Org Repository Browser** - Monitor repos across multiple organizations
- **GitHub Projects Integration** - Kanban boards for project management
- **Real-Time Workflow Monitoring** - 60-second polling with autoloop status
- **GitHub Actions Tracking** - View recent workflow runs across all repos
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - System-aware theme switching

### 🔧 Technical Features
- **SQLite Cache with WAL Mode** - 10-200x faster than Redis
- **Request Coalescing** - Prevents thundering herd on concurrent requests
- **GitHub App Integration** - Secure JWT-based authentication
- **OAuth2 Authentication** - Google OAuth with email whitelist
- **Type-Safe API** - Full TypeScript strict mode
- **Production Ready** - Deployed on VPS with nginx reverse proxy

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ 
- npm or yarn
- GitHub App credentials (see [GitHub Setup](#github-setup))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hscheema1979/control-room.git
cd control-room
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your GitHub App credentials:
```bash
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_INSTALLATION_ID=your_installation_id
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/your/private-key.pem

# Repository Configuration
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_default_repo

# Database
DATABASE_PATH=./data/cache.db

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🌐 Production Deployment

### Deploy with PM2 (Recommended)

1. **Build the application**
```bash
npm run build
```

2. **Start with PM2**
```bash
pm2 start npm --name "control-room" -- start
pm2 save
pm2 startup
```

### Deploy with Docker

```bash
docker build -t control-room .
docker run -p 3000:3000 \
  -e GITHUB_APP_ID=your_app_id \
  -e GITHUB_APP_INSTALLATION_ID=your_installation_id \
  control-room
```

---

## 🔑 GitHub Setup

### Creating a GitHub App

1. Go to [GitHub Settings > Apps](https://github.com/settings/apps)
2. Click "New GitHub App"
3. Configure:
   - **Name**: UltraPilot Dashboard
   - **Homepage URL**: Your dashboard URL
   - **Callback URL**: `https://your-domain.com/oauth2/callback`
   - **Webhook URL**: `https://your-domain.com/api/webhooks/github`
4. Permissions:
   - ✅ Contents: Read & Write
   - ✅ Issues: Read & Write
   - ✅ Pull Requests: Read & Write
   - ✅ Projects: Read & Write
   - ✅ Workflows: Read & Write
5. Events:
   - ✅ Push
   - ✅ Issues
   - ✅ Pull Request
   - ✅ Workflow Run
6. Create app and download private key

### Installing the GitHub App

1. Go to your app settings page
2. Click "Install App"
3. Select your account or organization
4. Choose "All repositories" or specific repos
5. Note the Installation ID

---

## 📊 Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/dashboard` | Stats, activity feed, quick actions |
| Repositories | `/dashboard/repos` | Multi-org repository browser |
| Projects | `/dashboard/projects` | GitHub Projects kanban boards |
| Workflows | `/dashboard/workflows` | Real-time autoloop monitoring |
| Metrics | `/dashboard/metrics` | Performance and activity metrics |
| Settings | `/dashboard/settings` | User preferences and configuration |

---

## 🔌 API Endpoints

### Repositories
```
GET /api/v1/repos
GET /api/v1/repos?org=organization
GET /api/v1/repos?search=query
```

### Projects
```
GET /api/v1/projects
GET /api/v1/projects?org=organization
```

### Workflows
```
GET /api/v1/workflows
GET /api/v1/workflows?status=active
GET /api/v1/autoloop/heartbeat
```

### GitHub Actions
```
GET /api/v1/actions/runs
GET /api/v1/actions/runs?repo=repo-name
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub (Cloud)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Repositories │  │  Projects    │  │  Workflows   ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
                        ↓
            ┌───────────────────────┐
            │   GitHub App (JWT)    │
            └───────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   Control Room                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Next.js App  │  │ SQLite Cache │  │   API Layer  │ │
│  │  (Port 3000) │  │  (WAL Mode)  │  │  (TypeScript)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↓
              ┌───────────────────────┐
              │    nginx (SSL/OAuth2) │
              └───────────────────────┘
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- cache.test.ts
```

---

## 📈 Performance

- **Cache Hit Rate**: >80% target
- **API Response Time**: <100ms (p95)
- **GitHub API Usage**: ~160 req/hour (5,000 limit)
- **Headroom**: 3,000% buffer

---

## 🔐 Security

- ✅ GitHub App JWT authentication
- ✅ OAuth2 Google authentication
- ✅ No credentials in frontend code
- ✅ SQLite with secure file permissions
- ✅ Environment variables protected
- ✅ Security headers (HSTS, CSP, X-Frame-Options)

---

## 🛠️ Development

### Project Structure
```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Business logic & utilities
├── types/           # TypeScript type definitions
├── contexts/        # React contexts
└── hooks/           # Custom React hooks
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
```

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the [documentation](./docs/)
- Contact: @hscheema1979

---

**Built with ❤️ using [UltraPilot](https://github.com/hscheema1979/ultrapilot)**
