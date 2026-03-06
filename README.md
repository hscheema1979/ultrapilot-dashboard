# GitHub Operations Dashboard

A comprehensive monitoring dashboard built with Next.js 15, TypeScript, and shadcn/ui for tracking GitHub workflows, projects, and tasks.

## Features

- 📊 **Real-time Workflow Monitoring**: Track GitHub Actions workflow runs with live progress updates
- 📋 **Projects Board**: Visual project management with progress tracking and team assignment
- ✅ **Task Management**: GitHub issues tracking with filtering, labels, and priority levels
- 📈 **Metrics Overview**: At-a-glance statistics for workflows, projects, and tasks
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌙 **Dark Mode**: Full dark mode support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the dashboard directory:**
   ```bash
   cd ultrapilot-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# GitHub Personal Access Token (for API access)
NEXT_PUBLIC_GITHUB_TOKEN=your_token_here

# GitHub Repository
NEXT_PUBLIC_GITHUB_OWNER=your_username
NEXT_PUBLIC_GITHUB_REPO=your_repository

# Optional: GitHub API Base URL (for GitHub Enterprise)
NEXT_PUBLIC_GITHUB_API_URL=https://api.github.com
```

## Project Structure

```
ultrapilot-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── header.tsx      # Dashboard header
│   │   │   ├── metrics-cards.tsx    # Overview metrics
│   │   │   ├── workflow-monitor.tsx # Workflow tracking
│   │   │   ├── projects-board.tsx   # Project management
│   │   │   └── tasks-list.tsx       # Task/issue tracking
│   │   └── ui/                 # shadcn/ui components
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
└── package.json
```

## Components

### Dashboard Components

- **DashboardHeader**: Top navigation with repository info and actions
- **MetricsCards**: Overview statistics for workflows and tasks
- **WorkflowMonitor**: Real-time workflow runs with status tracking
- **ProjectsBoard**: Project cards with progress bars and team avatars
- **TasksList**: Comprehensive task table with filtering and labels

### UI Components

All shadcn/ui components are located in `src/components/ui/`:
- Card, Badge, Button, Tabs, Alert, Progress, Skeleton, Avatar, Separator
- Table, Select, Dropdown Menu, Tooltip

## Customization

### Styling

The dashboard uses Tailwind CSS. Customize colors and themes in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... more variables */
}
```

### Adding New Components

Install additional shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## Integration with GitHub

To connect to your actual GitHub repository:

1. Create a GitHub Personal Access Token with `repo` scope
2. Add it to `.env.local` as `NEXT_PUBLIC_GITHUB_TOKEN`
3. Update the owner and repo variables
4. Implement API calls in the components

Example API call structure:

```typescript
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/actions/runs`,
  {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
    },
  }
)
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features

1. Create new components in `src/components/dashboard/`
2. Import and use them in `src/app/page.tsx`
3. Follow the existing component patterns for consistency

## Performance

- Static page generation for fast initial load
- Optimized component rendering with React 18
- Efficient state management for real-time updates
- Responsive design for all screen sizes

## Future Enhancements

- [ ] Real-time WebSocket updates for workflows
- [ ] GitHub OAuth authentication
- [ ] Customizable dashboard layouts
- [ ] Export data as CSV/PDF
- [ ] Mobile app version
- [ ] Notifications and alerts
- [ ] Advanced filtering and search
- [ ] Multi-repository support

## License

MIT

## Support

For issues and questions, please open an issue on the GitHub repository.
