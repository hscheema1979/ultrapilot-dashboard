import { useRouter, usePathname } from "next/navigation"

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  description?: string
  section?: string  // Add section grouping
  divider?: boolean  // Add divider before this item
}

export const NAV_ITEMS: NavItem[] = [
  // ACTIVE CONTROL - Submit & Monitor
  {
    title: "Control Center",
    href: "/dashboard/control",
    icon: "Activity",
    description: "Submit requests and monitor workflows",
  },

  // WORKFLOW MANAGEMENT
  {
    title: "Active Workflows",
    href: "/dashboard/workflows",
    icon: "GitBranch",
    description: "View all workflow runs and their status",
  },

  // MONITORING & VIEWING
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    description: "Overview and activity feed",
  },
  {
    title: "Traces",
    href: "/dashboard/traces",
    icon: "Eye",
    description: "Full GitHub audit trail",
  },
  {
    title: "Repositories",
    href: "/dashboard/repos",
    icon: "FolderOpen",
    description: "Browse and manage repositories",
  },

  // WORKSPACE LINKS
  {
    title: "Workspaces",
    href: "/dashboard/workspaces",
    icon: "Terminal",
    description: "Relay workspaces (Ubuntu, Dev, Projects)",
    divider: true,
  },

  // Settings
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    description: "Configure dashboard",
  },
]

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const navigate = (href: string) => {
    router.push(href)
  }

  const getCurrentNav = (): NavItem | undefined => {
    return NAV_ITEMS.find((item) => isActive(item.href))
  }

  return {
    isActive,
    navigate,
    getCurrentNav,
    pathname,
  }
}

export function getBreadcrumbs(pathname: string): Array<{ title: string; href: string }> {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: Array<{ title: string; href: string }> = []

  // Always start with Dashboard
  if (segments[0] === "dashboard") {
    breadcrumbs.push({ title: "Dashboard", href: "/dashboard" })
  }

  // Build up the path
  let currentPath = ""
  segments.forEach((segment, index) => {
    if (index === 0) return // Skip first segment (already added)

    currentPath += `/${segment}`
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    breadcrumbs.push({ title, href: currentPath })
  })

  return breadcrumbs
}

export function getQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}
