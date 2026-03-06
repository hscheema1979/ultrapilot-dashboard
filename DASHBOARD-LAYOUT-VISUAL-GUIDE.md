# UltraPilot Mission Control Dashboard - Visual Layout Guide

## Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER (height: 64px)                                                        │
│ ┌──────┐ ┌─────────┐ ┌──────────────────────────────┐ ┌────────────────┐ │
│ │ Logo │ │ Org: ▼ │ │ Search... (⌘K)               │ │ 🔔☀️👤         │ │
│ └──────┘ └─────────┘ └──────────────────────────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR     │ MAIN CONTENT AREA                                             │
│ (width:     │ (padding: 24px)                                              │
│  256px)     │                                                               │
│ ┌─────────┐ │ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ Menu │ │ │                                                         │ │
│ ├─────────┤ │ │  DASHBOARD                                              │ │
│ │ 🏠      │ │ │  Welcome back! Here's what's happening...              │ │
│ │ Dashboard│ │                                                         │ │
│ │ 📁      │ │ │  ┌─────────┬─────────┬─────────┬─────────┬─────────┐ │ │
│ │ Repos   │ │ │  │ Repos   │Workflow │ Issues  │Projects │Autoloop │ │ │
│ │ 📋      │ │ │  │ 47      │ 3       │ 12      │ 5       │ 99.8%   │ │ │
│ │ Projects│ │ │  └─────────┴─────────┴─────────┴─────────┴─────────┘ │ │
│ │ ⚙️      │ │ │                                                         │ │
│ │ Workflows│ │ │  Recent Activity                                        │ │
│ │ 🔄      │ │ │  ┌─────────────────────────────────────────────────┐  │ │
│ │ Autoloop│ │ │  │ • Workflow #123 completed              2m ago  │  │ │
│ │ 📊      │ │ │  │ • New issue: "Fix auth bug"          5m ago  │  │ │
│ │ Metrics │ │ │  │ • Commit: "Add feature X"            10m ago │  │ │
│ │ ⚠️      │ │ │  └─────────────────────────────────────────────────┘  │ │
│ │ Issues  │ │ │                                                         │ │
│ │ 🔧      │ │ │  Quick Actions                                          │ │
│ │ Settings│ │ │  [View All Repos] [View Projects] [New Workflow]      │ │
│ └─────────┘ │ │                                                         │ │
│             │ │  Workflow Performance Chart                             │ │
│ (footer)    │ │  ┌─────────────────────────────────────────────────┐  │ │
│ UltraPilot  │ │  │  [Chart visualization placeholder]              │  │ │
│ v1.0.0      │ │  └─────────────────────────────────────────────────┘  │ │
│ © 2025      │ │                                                         │ │
└─────────────┴─────────────────────────────────────────────────────────────┘
```

## Tablet Layout (768px - 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (height: 64px)                                      │
│ [☰] UltraPilot [Org: ▼] [Search...] [🔔☀️👤]               │
└─────────────────────────────────────────────────────────────┘
┌─────────────┬───────────────────────────────────────────────┐
│ SIDEBAR     │ MAIN CONTENT AREA                             │
│ (width:     │ (responsive grid)                             │
│  collapsed) │                                               │
│ ┌─────────┐ │ ┌─────────────────────────────────────────────┐ │
│ │ 🏠 📁 📋│ │ │ DASHBOARD                                  │ │
│ │ ⚙️ 🔄 📊│ │ │ [Stats Cards - 2 columns]                 │ │
│ │ ⚠️ 🔧   │ │ │                                             │ │
│ └─────────┘ │ │ [Activity Feed - Full Width]               │ │
│ (toggle)    │ │                                             │ │
│             │ │ [Quick Actions]                             │ │
│             │ │                                             │ │
└─────────────┴───────────────────────────────────────────────┘
```

## Mobile Layout (< 768px)

```
┌─────────────────────────────────────┐
│ HEADER (height: 64px)              │
│ [☰] UltraPilot [🔔☀️👤]           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ MAIN CONTENT AREA                  │
│ (padding: 16px, bottom nav space)  │
│                                     │
│ DASHBOARD                          │
│ ┌─────────┐                       │
│ │ Repos   │                       │
│ │ 47      │                       │
│ └─────────┘                       │
│ ┌─────────┐                       │
│ │Workflow │                       │
│ │ 3       │                       │
│ └─────────┘                       │
│ ┌─────────┐                       │
│ │ Issues  │                       │
│ │ 12      │                       │
│ └─────────┘                       │
│                                    │
│ Recent Activity                   │
│ [Scrollable list]                 │
│                                    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ MOBILE NAV (height: 64px)          │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ │ 🏠  │ 📁  │ 📋  │ ⚙️  │ 🔄  │ 📊  │ ⚠️  │
│ │Dash │Repo │Proj │Work │Loop │Metr │Issu │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘
└─────────────────────────────────────┘
```

## Component Specifications

### Header Component
- **Height:** 64px (4rem)
- **Background:** `bg-background/95` with backdrop blur
- **Border:** Bottom border
- **Z-Index:** 50 (sticky)
- **Elements:**
  - Logo: Rocket icon + "UltraPilot" text
  - Org Selector: Dropdown with chevron
  - Search: Input with magnifying glass icon
  - Actions: Theme toggle, notifications, user avatar

### Sidebar Component
- **Width (expanded):** 256px (16rem)
- **Width (collapsed):** 64px (4rem)
- **Background:** `bg-background/95` with backdrop blur
- **Border:** Right border
- **Transition:** 300ms ease
- **Elements:**
  - Header: "Menu" text + collapse button
  - Nav Items: Icon + label + badge (if expanded)
  - Footer: Version info

### Mobile Navigation
- **Height:** 64px (4rem)
- **Position:** Fixed bottom
- **Background:** `bg-background/95` with backdrop blur
- **Border:** Top border
- **Z-Index:** 50
- **Elements:**
  - 7 icons evenly distributed
  - Badge overlays for notifications
  - Labels below icons

### Main Content Area
- **Padding:** 24px (1.5rem) on desktop
- **Padding:** 16px (1rem) on mobile
- **Bottom Padding:** Extra 80px on mobile for nav
- **Background:** `bg-muted/40`
- **Overflow:** Auto (scrollable)

## Color Scheme

### Light Mode
```css
--background: #ffffff
--foreground: #0a0a0a
--muted: #f5f5f5
--muted-foreground: #737373
--accent: #f5f5f5
--accent-foreground: #0a0a0a
--border: #e5e5e5
--primary: #171717
--primary-foreground: #fafafa
```

### Dark Mode
```css
--background: #0a0a0a
--foreground: #fafafa
--muted: #171717
--muted-foreground: #a3a3a3
--accent: #171717
--accent-foreground: #fafafa
--border: #262626
--primary: #fafafa
--primary-foreground: #171717
```

## Typography

### Font Families
- **Body:** Geist Sans (variable)
- **Heading:** Geist Sans (variable)
- **Mono:** Geist Mono (variable)

### Font Sizes
- **H1:** 30px (1.875rem) - Page titles
- **H2:** 24px (1.5rem) - Section headers
- **H3:** 18px (1.125rem) - Card titles
- **Body:** 14px (0.875rem) - Default text
- **Small:** 12px (0.75rem) - Metadata
- **XSmall:** 10px (0.625rem) - Labels

### Font Weights
- **Bold:** 700 - Stats, headers
- **Semibold:** 600 - Navigation, buttons
- **Medium:** 500 - Labels, emphasis
- **Regular:** 400 - Body text

## Spacing Scale

Based on 4px baseline:
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

## Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { /* Mobile styles */ }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { /* Tablet styles */ }

/* Desktop */
@media (min-width: 1024px) { /* Desktop styles */ }

/* XL Desktop */
@media (min-width: 1280px) { /* Extra large styles */ }
```

## Icon Usage

| Icon | Usage | Color |
|------|-------|-------|
| 🏠 LayoutDashboard | Dashboard nav | Inherit |
| 📁 FolderOpen | Repositories | Blue-500 |
| 📋 FolderKanban | Projects | Purple-500 |
| ⚙️ Workflow | Workflows | Green-500 |
| 🔄 RefreshCw | Autoloop | Orange-500 |
| 📊 BarChart3 | Metrics | Indigo-500 |
| ⚠️ AlertCircle | Issues | Red-500 |
| 🔧 Settings | Settings | Gray-500 |
| 🔔 Bell | Notifications | Gray-500 |
| ☀️ Sun | Light mode | Yellow-500 |
| 🌙 Moon | Dark mode | Blue-400 |

## Interactive States

### Buttons
- **Default:** Background color, border
- **Hover:** Darker background (10%)
- **Active:** Even darker (20%)
- **Focus:** Ring outline (2px)
- **Disabled:** Opacity 50%

### Navigation Items
- **Default:** Muted text color
- **Hover:** Accent background
- **Active:** Accent background + accent text
- **Focus:** Ring outline

### Cards
- **Default:** Background, border
- **Hover:** Slight shadow
- **Interactive:** Cursor pointer

## Animation Duration

- **Fast:** 150ms - Hover states
- **Normal:** 300ms - Transitions, sidebar
- **Slow:** 500ms - Page transitions

## Accessibility Features

- **Keyboard Navigation:** All interactive elements accessible via Tab
- **ARIA Labels:** Screen reader descriptions
- **Focus Indicators:** Visible focus rings
- **Color Contrast:** WCAG AA compliant
- **Touch Targets:** Minimum 44x44px on mobile
- **Skip Links:** Jump to main content

This visual guide ensures consistent implementation across all dashboard pages and components.
